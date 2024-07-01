window.addEventListener("load", function () {
    document.body.style.background = 'light-blue';

    var x = document.getElementById("x");
    var y = document.getElementById("y");
    var z = document.getElementById("z");
    z.innerText = "Testing";

    window.addEventListener('deviceorientation', handleOrientation);

    function handleOrientation(event) {
        const alpha = event.alpha;
        const beta = event.beta;
        const gamma = event.gamma;
        x.innerText = alpha;
        y.innerText = beta;
        z.innerText = gamma;
}

});

