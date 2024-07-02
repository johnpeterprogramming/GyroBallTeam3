export default () => /*html*/`
  <style>
    canvas {
      border: 1px solid black;
    }
  </style>
  <canvas id="mazeCanvas" width="400" height="400"></canvas>
  <script>
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 20;
    const rows = canvas.width / cellSize;
    const cols = canvas.height / cellSize;
    let maze = createMaze(rows, cols);

    // Ball variables
    let ballX = 0.5;
    let ballY = 0.5;
    let ballVelX = 0;
    let ballVelY = 0;
    const ballSize = cellSize / 4; // Radius of the ball
    const acceleration = 0.005;
    const maxSpeed = 0.25;
    const friction = 0.95;

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

    // Event listener for arrow key presses
    let keysPressed = {};
    document.addEventListener('keydown', (event) => {
      keysPressed[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
      keysPressed[event.key] = false;
    });

    // Gyroscope event listener
    window.addEventListener("load", function () {
      window.addEventListener('deviceorientation', handleOrientation);

      function handleOrientation(event) {
        const y_val = event.beta;  // Tilt front-to-back
        const z_val = event.gamma; // Tilt left-to-right

        // Adjust ball velocity based on device orientation
        ballVelY = Math.max(Math.min(y_val / 90 * maxSpeed, maxSpeed), -maxSpeed);
        ballVelX = Math.max(Math.min(z_val / 90 * maxSpeed, maxSpeed), -maxSpeed);
      }
    });

    function gameLoop() {
      updateBallPosition();
      requestAnimationFrame(gameLoop);
    }

    drawMaze(maze);
    gameLoop();
  </script>
`