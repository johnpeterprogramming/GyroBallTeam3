window.addEventListener("load", function () {

    var y = document.getElementById("y");
    var z = document.getElementById("z");
    z.innerText = "Testing";

    window.addEventListener('deviceorientation', handleOrientation);

    function handleOrientation(event) {
        const y = event.beta;
        const z = event.gamma;
        y.innerText = Math.round(y);
        z.innerText = Math.round(z);
}

});

