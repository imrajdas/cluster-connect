package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:8000", "http service address")

type createCluster struct {
	ID   int    `json:"id"`
	Data string `json:"data"`
}

func main() {
	time.Sleep(5 * time.Second)
	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/"}
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			log.Printf("raw recv : ")
			log.Printf(string(message))
			var data createCluster
			if err := json.Unmarshal(message, &data); err != nil {
				panic(err)
			}
			log.Printf("parsed recv: id=%d data=%s", data.ID, data.Data)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	m := make(map[string]string)
	data, _ := json.Marshal(createCluster{ID: 203, Data: "{type:'Create',value:'hello'}"})
	m["type"] = "create-cluster"
	m["data"] = string(data)
	data, _ = json.Marshal(m)
	select {
	case <-done:
		return
	case t := <-ticker.C:
		err := c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Println("write:", err, t)
			return
		}
	case <-interrupt:
		log.Println("interrupt")

		// Cleanly close the connection by sending a close message and then
		// waiting (with timeout) for the server to close the connection.
		err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		if err != nil {
			log.Println("write close:", err)
			return
		}
		select {
		case <-done:
		case <-time.After(time.Second):
		}
		return
	}
	time.Sleep(1 * time.Hour)
}
