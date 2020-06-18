# Cluster Connect POC

## Setup

### Setup GQL Server

```bash
cd GQLServer
docker-compose up
```

### Setup Dummy UI

```bash
cd DummyUI
npm i
GQL_SERVER=localhost:8080/graphql npm start
```

### Setup Subscriber

1. Setup Master GQL-Client

```bash
cd Subscriber/master
npm i
GQL_SERVER=localhost:8080/graphql npm start
```

2. Setup Go Agent

```bash
cd Subscriber/agent
go run main.go
```

As soon as the agent is started automated messages should pop up in the UI, after the the automated commands are completed(20secs) try sending JSON data through the UI (package.lock would be a good example). Once the JSON is sent it should appear in the `Go Agent` terminal it is in JSON.stringify() format but if you look in the `Node Master` terminal you should see a `VALID JSON DATA` msg with the json being printed. This can be tested with an invalid JSON too and it shouldn't show up in the `Node Master` terminal
