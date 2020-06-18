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
			log.Printf("recv: %s", message)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	x := 0
	for {
		x = x + 1
		m := make(map[string]string)
		// reader := bufio.NewReader(os.Stdin)
		// fmt.Print("Enter type: ")
		// m["type"], _ = reader.ReadString('\n')
		// m["type"] = strings.TrimSuffix(m["type"], "\n")
		// fmt.Print("Enter user: ")
		// m["user"], _ = reader.ReadString('\n')
		// m["user"] = strings.TrimSuffix(m["user"], "\n")
		// fmt.Print("Enter text: ")
		// m["text"], _ = reader.ReadString('\n')
		// m["text"] = strings.TrimSuffix(m["text"], "\n")
		// data, _ := json.Marshal(m)
		if x == 1 {
			log.Println("...SENDING TEXT...")
			m["type"] = "send-text"
			m["user"] = "GoAgent"
			m["text"] = "Hello From a Go Agent"
		} else if x == 2 {
			log.Println("...FETCHING ALL TEXT...")
			m["type"] = "get-all"
		} else if x == 3 {
			log.Println("...COMPELTE...")
			m["type"] = "agent-exit"

		} else {
			time.Sleep(5 * time.Hour)
			continue
		}
		data, _ := json.Marshal(m)
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
		time.Sleep(5 * time.Second)
	}
}
