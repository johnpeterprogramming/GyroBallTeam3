// Gyroscope event listener
window.addEventListener('deviceorientation', handleOrientation);

function handleOrientation(event) {
    const y_val = event.beta;  // Tilt front-to-back
    const z_val = event.gamma; // Tilt left-to-right

    const player_state = {"x": ballX, "y":ballVelY, "velX":ballVelX, "velY":ballVelY, "orientY":y_val, "orientZ":z_val};
    socket.emit("player_state_update", player_state);
}
