document.addEventListener("DOMContentLoaded", function () {

    const startButton = document.getElementById("startButton");
    const startScreen = document.getElementById("startScreen");
    const memoryPage = document.getElementById("memory-page");
    const cakePage = document.getElementById("cake-page");
    const letterPage = document.getElementById("letter-page");
    const filmStrip = document.querySelector(".film-strip");
    const music = document.getElementById("backgroundMusic");
    const blowHint = document.getElementById("blowHint");
    const blowButton = document.getElementById("blowButton");

    let blowDetected = false;
    let blowStartTime = null;
    let microphoneStream = null;
    let analyser = null;
    let microphone = null;

    let lastAcceleration = {
        x: null,
        y: null,
        z: null
    };

    let shakeTime = 0;

    startButton.onclick = function () {

        if (blowDetected) {
            return;
        }

        startButton.disabled = true;

        startScreen.classList.add("hidden");

        const songMessage = document.createElement("div");

        songMessage.id = "songMessage";
        songMessage.textContent = "The song that reminds me of you ♡";

        document.body.appendChild(songMessage);

        setTimeout(function () {

            if (music) {
                music.play().catch(function () {});
            }

            songMessage.style.opacity = "0";

            setTimeout(function () {

                songMessage.remove();
                memoryPage.classList.add("active");

            }, 600);

        }, 5000);
    };


    filmStrip.addEventListener("animationend", function (event) {

        if (event.animationName !== "filmMoveVertical") {
            return;
        }

        memoryPage.classList.remove("active");

        setTimeout(function () {

            cakePage.classList.add("show");

            startBlowDetection();
            startShakeDetection();

        }, 200);

    });


    async function startBlowDetection() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            blowHint.textContent =
                "✦ Blow or shake your phone ✦";

            return;
        }

        try {

            microphoneStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const audioContext = new AudioContext();

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;

            microphone =
                audioContext.createMediaStreamSource(
                    microphoneStream
                );

            microphone.connect(analyser);

            blowHint.textContent =
                "✦ Blow on the candle ✦";

            detectBlow();

        } catch (error) {

            blowHint.textContent =
                "✦ Blow or shake your phone ✦";

        }
    }


    function detectBlow() {

        if (blowDetected || !analyser) {
            return;
        }

        const dataArray =
            new Uint8Array(analyser.fftSize);

        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;

        for (let i = 0; i < dataArray.length; i++) {

            const value =
                (dataArray[i] - 128) / 128;

            sum += value * value;
        }

        const volume =
            Math.sqrt(sum / dataArray.length);

        if (volume > 0.12) {

            if (blowStartTime === null) {
                blowStartTime = Date.now();
            }

            if (Date.now() - blowStartTime >= 250) {

                blowDetected = true;
                candleBlownOut();

                return;
            }

        } else {

            blowStartTime = null;
        }

        requestAnimationFrame(detectBlow);
    }


    function startShakeDetection() {

        if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof DeviceMotionEvent.requestPermission === "function"
        ) {

            document.body.addEventListener(
                "click",
                requestMotionPermission,
                { once: true }
            );

        } else {

            window.addEventListener(
                "devicemotion",
                detectShake
            );
        }
    }


    function requestMotionPermission() {

        DeviceMotionEvent.requestPermission()
            .then(function (permission) {

                if (permission === "granted") {

                    window.addEventListener(
                        "devicemotion",
                        detectShake
                    );
                }

            })
            .catch(function () {});
    }


    function detectShake(event) {

        if (blowDetected) {
            return;
        }

        const acceleration =
            event.accelerationIncludingGravity;

        if (!acceleration) {
            return;
        }

        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;

        if (lastAcceleration.x === null) {

            lastAcceleration = { x, y, z };
            return;
        }

        const movement =
            Math.abs(x - lastAcceleration.x) +
            Math.abs(y - lastAcceleration.y) +
            Math.abs(z - lastAcceleration.z);

        lastAcceleration = { x, y, z };

        if (movement > 22) {

            const now = Date.now();

            if (now - shakeTime > 800) {

                shakeTime = now;
                blowDetected = true;
                candleBlownOut();
            }
        }
    }


    blowButton.onclick = function () {

        if (blowDetected) {
            return;
        }

        blowDetected = true;
        candleBlownOut();
    };


    function candleBlownOut() {

        const flames =
            document.querySelectorAll(".flame");

        flames.forEach(function (flame) {

            flame.style.animation = "none";
            flame.style.opacity = "0";
            flame.style.transform =
                "translateX(-50%) scale(0.1)";
        });

        blowHint.textContent =
            "✦ Wish made ♡ ✦";

        const smoke =
            document.createElement("div");

        smoke.classList.add("smoke");

        cakePage.appendChild(smoke);

        createConfetti();

        if (microphoneStream) {

            microphoneStream
                .getTracks()
                .forEach(function (track) {
                    track.stop();
                });
        }

        window.removeEventListener(
            "devicemotion",
            detectShake
        );

        setTimeout(function () {

            cakePage.classList.remove("show");

            setTimeout(function () {

                letterPage.classList.add("show");

            }, 300);

        }, 5000);
    }


    function createConfetti() {

        const colors = [
            "#A8E6CF",
            "#FFB7A5",
            "#FFFDF7"
        ];

        for (let i = 0; i < 80; i++) {

            const confetti =
                document.createElement("div");

            confetti.style.position = "fixed";
            confetti.style.width = "8px";
            confetti.style.height = "8px";

            confetti.style.background =
                colors[
                    Math.floor(
                        Math.random() * colors.length
                    )
                ];

            confetti.style.left =
                Math.random() * 100 + "vw";

            confetti.style.top = "-10px";

            confetti.style.zIndex = "9999";
            confetti.style.pointerEvents = "none";

            const duration =
                2 + Math.random() * 2;

            confetti.style.transition =
                "top " +
                duration +
                "s linear, transform " +
                duration +
                "s linear";

            document.body.appendChild(confetti);

            setTimeout(function () {

                confetti.style.top = "110vh";

                confetti.style.transform =
                    "rotate(" +
                    Math.random() * 1000 +
                    "deg)";

            }, 50);

            setTimeout(function () {

                confetti.remove();

            }, duration * 1000 + 500);
        }
    }

});