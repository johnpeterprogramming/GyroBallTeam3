const socket = io();
let current_route = 'new_player';

// Initial page is for creating a new username
changeRoute('new_player');

function changeRoute(new_route) {
    if (new_route == "new_player") {
        import('../views/new_player_view.js').then(new_player => {
            document.title = "New Player";
            document.body.innerHTML = new_player.default();

            let usernameInput = document.getElementById('username');
            let enterLobbyButton = document.getElementById('enterLobbyButton');

            enterLobbyButton.addEventListener("click", function() {
                changeRoute('lobby');
                // alert("Entering lobby with username: " + usernameInput.value);
                socket.emit('enter_lobby', usernameInput.value);

            });

        });
        current_route = 'new_player';
    } else if (new_route == "lobby") {
        import('../views/lobby_view.js').then(lobby => {
            document.title = "Lobby";
            document.body.innerHTML = lobby.default();

            let startGameButton = document.getElementById('startGameButton');
            startGameButton.addEventListener('click', () => {
                socket.emit("start_game");
            });
        });
        current_route = 'lobby';
    } else if (new_route == "game") {
        import('../views/game_player_view.js').then(game => {
            document.title = "Game";
            document.body.innerHTML = game.default();
            setTimeout(() => {
                const script = document.createElement('script');
                script.src = '/js/game.js';
                document.body.appendChild(script);
                // script.onload = () => {
                //     alert("game script has been loaded");
                // }
            }, 1000);
        });
        current_route = 'game';
    }
    
};

// const routes = ['setup', 'lobby', 'game'];
window.onload = function () {
    let players_ul_element = document.getElementById("players_in_lobby");
    
    // LOBBY PAGE CODE
    socket.on("update_lobby", (players_map) => {
        if (current_route == 'lobby') {
            players_ul_element = document.getElementById("players_in_lobby");
            
            if (players_ul_element) {
                handleLobbyPage(players_map);
            }

        }
    });

    socket.on('start_game', () => {
        changeRoute('game');
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
        players_ul_element.innerHTML += `<p class="player">${player_username}</p>`
    }
}