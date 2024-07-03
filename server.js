const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let host = null;
let clients = {};
let gameStarted = false;
//let leaderboard = [];

const playerColors = ['red', 'blue', 'green', 'yellow'];
const ballPositions = [
  { x: 0.5, y: 0.5 },
  { x: 16.5, y: 0.5 },
  { x: 0.5, y: 16.5 },
  { x: 16.5, y: 16.5 }
];

function sendClientCount() {
  if (host) {
    host.send(JSON.stringify({ type: 'clientCount', count: Object.keys(clients).length }));
  }
}

function assignPlayerData(clientId) {
  const playerIndex = Object.keys(clients).length - 1;
  clients[clientId].playerData = {
    number: playerIndex + 1,
    color: playerColors[playerIndex],
    position: ballPositions[playerIndex] 
  };
  clients[clientId].socket.send(JSON.stringify({
    type: 'playerData',
    number: playerIndex + 1,
    color: playerColors[playerIndex],
    position: ballPositions[playerIndex]
  }));
}

wss.on('connection', (socket) => {
  if (Object.keys(clients).length >= 4) {
    socket.close();
    return;
  }

  const id = Math.random().toString(36).substring(2, 15);

  if (!host) {
    host = socket;
    console.log('Host connected');
  } else {
    clients[id] = { socket: socket, gyroData: { beta: 0, gamma: 0 } };
    assignPlayerData(id);
    console.log('Client connected:', id);
    sendClientCount();
  }

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    if (clients[id]) {
      clients[id].gyroData = data;
      if (data.type === 'reachedCenter') {
        handlePlayerReachedCenter(data.playerID);
      }
    } else if (data.type === 'startGame') {
      gameStarted = true;
      console.log('Game started');
      startGame();
    }
  });

  socket.on('close', () => {
    if (socket === host) {
      host = null;
      gameStarted = false;
      console.log('Host disconnected');
    } else {
      delete clients[id];
      console.log('Client disconnected:', id);
      sendClientCount();
      if (Object.keys(clients).length < 2 && gameStarted) {
        gameStarted = false;
        if (host) {
          host.send(JSON.stringify({ type: 'stop' }));
        }
      }
    }
  });

  sendClientCount();
});

function startGame() {
  if (!host) return;
  //leaderboard = [];
  
  const players = Object.entries(clients).map(([id, client]) => ({
    id,
    ...client.playerData
  }));

  host.send(JSON.stringify({ type: 'start', players }));
}

function broadcastGyroData() {
  if (!host || !gameStarted) return;

  for (let id in clients) {
    const playerGyro = {
      id: id,
      beta: clients[id].gyroData.beta,
      gamma: clients[id].gyroData.gamma
    };

    host.send(JSON.stringify(playerGyro));
  }
}

setInterval(broadcastGyroData, 50);

app.use(express.static('public'));

// start server
const PORT = 80;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
