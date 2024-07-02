window.addEventListener("load", function () {

    var y = document.getElementById("y");
    var z = document.getElementById("z");


    
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {

        window.addEventListener('deviceorientation', handleOrientation);

        function handleOrientation(event) {
            const y_val = event.beta;
            const z_val = event.gamma;
            y.innerText = "Y: " + Math.round(y_val);
            z.innerText = "Z: " + Math.round(z_val);
        }

    } else {
        y.innerText = "Not supported";
        z.hidden = true;
    }

});

