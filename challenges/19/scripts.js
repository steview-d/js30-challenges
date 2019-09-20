const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            console.error("Webcam disabled or not found", err);
        });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        // take the pixels out
        let pixels = ctx.getImageData(0, 0, width, height);

        // do something with them
        // pixels = redEffect(pixels);
        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.3; // ghosting effect
        // pixels = greenScreen(pixels);
        pixels = scanLines(pixels);

        // then put them back
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto() {
    // play sound
    snap.currentTime = 0;
    snap.play();

    // take data from canvas
    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");
    link.href = data;
    link.setAttribute("download", "pic");
    link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i] += 200;
        pixels.data[i + 1] -= 50;
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5;
    }
    return pixels;
}

function rgbSplit(pixels) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i];
        pixels.data[i + 100] = pixels.data[i + 1];
        pixels.data[i - 150] = pixels.data[i + 2];
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll(".rgb input").forEach(input => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (
            red >= levels.rmin &&
            green >= levels.gmin &&
            blue >= levels.bmin &&
            red <= levels.rmax &&
            green <= levels.gmax &&
            blue <= levels.bmax
        ) {
            // take it out!
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

function scanLines(pixels) {
    const numPixels = pixels.data.length / 4;
    const vidWidthPixels = video.videoWidth * 4;
    const vidHeight = video.videoHeight;
    const lineFrequency = 2; // draw a scan line every n lines
    const scanLineHeight = 1; // height in px of each scanline
    const scanLineColor = [80, 80, 80];

    // outer loop, line by line
    for (let i = 1; i < vidHeight; i += lineFrequency) {
        // inner loop, each pixel in current line
        for (let j = 0; j < vidWidthPixels * scanLineHeight; j += 4) {
            pixels.data[i * (vidWidthPixels * scanLineHeight) + j] =
                scanLineColor[0];
            pixels.data[i * (vidWidthPixels * scanLineHeight) + j + 1] =
                scanLineColor[1];
            pixels.data[i * (vidWidthPixels * scanLineHeight) + j + 2] =
                scanLineColor[2];
        }
    }
    return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
