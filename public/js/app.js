function changeRoute(new_route) {
    if (new_route == "new_player") {
        import('../views/new_player_view.js').then(new_player => {
            document.title = "New Player";
            document.body.innerHTML = new_player.default();
        });
    } else if (new_route == "lobby") {
        import('../views/lobby_view.js').then(lobby => {
            document.title = "Lobby";
            document.body.innerHTML = lobby.default();
        });
    } else if (new_route == "game") {
        import('../views/game.js').then(game => {
            document.title = "Game";
            document.body.innerHTML = game.default();
        });
    }
    
};

// const routes = ['setup', 'lobby', 'game'];

// Initial page is for creating a new username
changeRoute('new_player');

window.onload = function () {
    const socket = io();
    
    let usernameInput = document.getElementById('username');
    let button = document.getElementById('enterLobbyButton');
    
    
    button.onclick = function() {
        changeRoute('lobby');
        // alert("Entering lobby with username: " + usernameInput.value);
        socket.emit('enter_lobby', usernameInput.value);
    }
    
    // LOBBY PAGE CODE
    
    socket.on("player_added", (players_map) => {
        let players_ul_element = document.getElementById("players_in_lobby");
        
        if (!players_ul_element) {
            setTimeout(handleLobbyPage, 500, players_map);

            return;
        }
        
    });
}

handleLobbyPage = function(players_map) {
    // maby add check to see if current page is lobby later
    // alert("Received signal from server!");
    players_ul_element = document.getElementById("players_in_lobby");

    players_ul_element.innerHTML = '';
    for (let playerKey in players_map) {
        // The playerKey is the socket id
        let player_username = players_map[playerKey];
        players_ul_element.innerHTML += `<li>${player_username} : ${playerKey}</li>`
    }
}