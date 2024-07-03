const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

app.use(express.static('public'));

app.get('/host', (req, res) => {
  res.sendFile(join(__dirname, 'public/host.html'))
});
  
server.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

// states: waiting for players to join(lobby), playing game(game)
// pages: register, lobby, game
// let game_state = {'done': true, winner: null, player_coords: {}};

let playing = false;

// Has structure: {'username', 'state':{x, y, velx, vely, orientY, orientZ}}
let players_map = {};
let player_count = 0;


io.on("connection", (socket) => {
  socket.on('enter_lobby', (username) => {
    if (players_map.length >= 4) {
      console.log("Max of 4 players allowed");
    } else {
      // console.log("User with socket id: " + socket.id + " and username: " + username + " has entered the lobby");
      players_map[socket.id]['username'] = username;
      player_count++;

      // all players should see updated players list when a new player joins lobby
      // io.emit('players_map', players_map);
    }

  })

  // socket.on('start_game', () => {
  //   // Only host can start game ---ADD THIS LATER
  //   io.emit('start_game', players_map);
  // });

  socket.on("disconnect", () => {
    if (players_map[socket.id]) {
      console.log("Player: " + players_map[socket.id] + " disconnected.");

      // Remove player from players map
      delete players_map[socket.id];
      player_count--;
    }
  });

  // Updates players in lobby every second for all users
  setInterval(() => {
    io.emit('update_lobby', players_map);
  }, 1000);

})
