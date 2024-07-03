const socket = io();
let current_route = 'new_player';
let players_map = {};

// Ball variables
let ballX = 0.5;
let ballY = 0.5;
let ballVelX = 0;
let ballVelY = 0;

const ballSize = cellSize / 4; // Radius of the ball
const acceleration = 0.005;
const maxSpeed = 0.25;
const friction = 0.95;

// Initial page is for creating a new username
changeRoute('lobby');

function changeRoute(new_route) {
    if (new_route == "lobby") {
        import('../views/lobby_view.js').then(lobby => {
            document.title = "Lobby";
            document.body.innerHTML = lobby.default();

            let startGameButton = document.getElementById('startGameButton');
            
            // Only the host has the start game button
            startGameButton.setAttribute('style', 'true');
        
            startGameButton.addEventListener('click', () => {
                socket.emit("start_game");
            });
        });
        current_route = 'lobby';
    } else if (new_route == "game") {
        import('../views/game_host_view.js').then(game => {
            document.title = "Game";
            document.body.innerHTML = game.default();
            setTimeout(() => {
                const canvas = document.getElementById('mazeCanvas');
                const ctx = canvas.getContext('2d');
                const cellSize = 20;
                const rows = canvas.width / cellSize;
                const cols = canvas.height / cellSize;
                let maze = createMaze(rows, cols);

                function gameLoop() {
                    updateBallPosition();
                    requestAnimationFrame(gameLoop);
                }

                drawMaze(maze);
                gameLoop();
        }, 500);
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

        socket.on("player_state_update", (player_state) => {
            players_map[socket.id]['state'] = player_state;
        });
        socket.on("maze_update", () => {

        });

        // MAZE UPDATE
        if (playing) {
            setInterval(() => {
            // Remember to CANCEL this interval when game is over----TODO
            const net_orient_Y = 0;
            const net_orient_Z = 0;

            for (let player in players_map) {
                // Defaults to 0 -> meaning the phone is perfectly facing up
                net_orient_Y += player['orientY'] ?? 0;
                net_orient_Y += player['orientZ'] ?? 0;
            }

            net_orient_Y /= player_count;
            net_orient_Z /= player_count;

            // Calculate update in velocity based net orientation
            canvas.style.transform = `rotateY(${orientZ/2}deg) rotateX(${-orientY/2}deg)`;

            // Adjust ball velocity based on device orientation
            ballVelY = Math.max(Math.min(y_val / 90 * maxSpeed, maxSpeed), -maxSpeed);
            ballVelX = Math.max(Math.min(z_val / 90 * maxSpeed, maxSpeed), -maxSpeed);

            // 50 is +-20fps for maze update
            }, 50);
        }

    });

}


// Function to update ball position based on velocity
function updateBallPosition() {

    let newBallX = ballX + ballVelX;
    let newBallY = ballY + ballVelY;

    let x = 0;
    let y = 0;

    if (ballVelX > 0) {
        x = ballSize / cellSize;
    } else if (ballVelX < 0) {
        x = -ballSize / cellSize;
    }

    if (ballVelY > 0) {
        y = ballSize / cellSize;
    } else if (ballVelY < 0) {
        y = -ballSize / cellSize;
    }

    // Check for collisions with walls
    let currentCellX = Math.floor(ballX);
    let currentCellY = Math.floor(ballY);
    let nextCellX = Math.floor(newBallX + x);
    let nextCellY = Math.floor(newBallY + y);

    if (currentCellX !== nextCellX) {
        if (ballVelX > 0 && maze[currentCellY][currentCellX].east) {
        newBallX = currentCellX + 1 - ballSize / cellSize;
        ballVelX = 0;
        } else if (ballVelX < 0 && maze[currentCellY][currentCellX].west) {
        newBallX = currentCellX + ballSize / cellSize;
        ballVelX = 0;
        }
    }

    if (currentCellY !== nextCellY) {
        if (ballVelY > 0 && maze[currentCellY][currentCellX].south) {
        newBallY = currentCellY + 1 - ballSize / cellSize;
        ballVelY = 0;
        } else if (ballVelY < 0 && maze[currentCellY][currentCellX].north) {
        newBallY = currentCellY + ballSize / cellSize;
        ballVelY = 0;
        }
    }

    ballX = newBallX;
    ballY = newBallY;

    drawMaze(maze);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawMaze(maze) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw the ball
    ctx.fillStyle = 'red';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ballX * cellSize, ballY * cellSize, ballSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw maze walls
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
        let cell = maze[x][y];
        let startX = y * cellSize;
        let startY = x * cellSize;

        ctx.beginPath();
        if (cell.north) ctx.moveTo(startX, startY), ctx.lineTo(startX + cellSize, startY);
        if (cell.south) ctx.moveTo(startX, startY + cellSize), ctx.lineTo(startX + cellSize, startY + cellSize);
        if (cell.east) ctx.moveTo(startX + cellSize, startY), ctx.lineTo(startX + cellSize, startY + cellSize);
        if (cell.west) ctx.moveTo(startX, startY), ctx.lineTo(startX, startY + cellSize);
        ctx.stroke();
        }
    }

}

function createMaze(rows, cols) {
    // create maze grid and potential edges
    let maze = [];
    let edges = [];

    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
        row.push({ parent: null, north: true, south: true, east: true, west: true });
        // add all possible edges
        if (i > 0) edges.push({ u: { x: i, y: j }, v: { x: i - 1, y: j } }); // north
        if (j > 0) edges.push({ u: { x: i, y: j }, v: { x: i, y: j - 1 } }); // west
        }
        maze.push(row);
    }

    // Shuffle edges randomly
    edges = shuffle(edges);

    // Disjoint-set (Union-Find) data structure
    function find(node) {
        if (node.parent === null) return node;
        return find(node.parent);
    }

    function union(u, v) {
        let rootU = find(u);
        let rootV = find(v);
        if (rootU !== rootV) {
        rootU.parent = rootV;
        return true;
        }
        return false;
    }

    // Kruskal's algo
    for (let edge of edges) {
        let u = maze[edge.u.x][edge.u.y];
        let v = maze[edge.v.x][edge.v.y];
        if (union(u, v)) {
        // Remove wall between u and v
        if (edge.u.x > edge.v.x) {
            u.north = false;
            v.south = false;
        } else if (edge.u.x < edge.v.x) {
            v.north = false;
            u.south = false;
        } else if (edge.u.y > edge.v.y) {
            u.west = false;
            v.east = false;
        } else if (edge.u.y < edge.v.y) {
            v.west = false;
            u.east = false;
        }
        }
    }

    return maze;
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