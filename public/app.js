window.addEventListener("load", function () {

    var y = document.getElementById("y");
    var z = document.getElementById("z");
    z.innerText = "Testing";

    window.addEventListener('deviceorientation', handleOrientation);

    function handleOrientation(event) {
        const y_val = event.beta;
        const z_val = event.gamma;
        y.innerText = Math.round(y_val);
        z.innerText = Math.round(z_val);
}

});

