const express = require('express');
const { createServer } = require('node:http');
// const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});

// states: waiting for players to join(lobby), playing game(game)
// pages: register, lobby, game
let state = 'MENU';
let players_map = {};
let player_count = 0;



io.on("connection", (socket) => {
  socket.on('enter_lobby', (username) => {
    if (players_map.length >= 4) {
      console.log("Max of 4 players allowed");
    } else {
      console.log("User with socket id: " + socket.id + " and username: " + username + "has entered the lobby");
      players_map[socket.id] = username;
      player_count++;
  
      // all players should see updated players list when a new player joins lobby
      io.emit('player_added', players_map);
    }

  })

  socket.on("disconnect", () => {
    if (players_map[socket.id])
      console.log("Player: " + players_map[socket.id] + " disconnected.");

    // Remove player from players map
    delete players_map[socket.id];
    player_count--;
  });

  console.log("User connected!");
})
