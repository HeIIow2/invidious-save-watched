console.log("hippies");

const audioPlay = HTMLAudioElement.prototype.play
HTMLAudioElement.prototype.audioPlay = audioPlay;
HTMLAudioElement.prototype.play = function() {
    sendElement("load", this);
    this.audioPlay();
}

const videoPlay = HTMLVideoElement.prototype.play;
HTMLVideoElement.prototype.videoPlay = videoPlay;
HTMLVideoElement.prototype.play = function() {
    sendElement("load", this);
    this.videoPlay();
}


async function sendMessageAsync(message) {
    return await chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
        });
    // });
}


function sendElement(action, mediaElement) {
    let src = mediaElement.src;
    if (src == "") {
        var source = mediaElement.querySelector("source");
        if (source) src = source.src;
    }

    if (!src) return;

    const message = {
        "action": action,
        "src": src,
        "currentTime": mediaElement.currentTime,
        "duration": mediaElement.duration,
        "ended": mediaElement.ended,
    };

    chrome.runtime.sendMessage(message, (response) => {
        console.log("response", response);
        
        if (!response) return;
        if (!response.success) return;
    
        if (action === "load") {
            console.log(response)
            mediaElement.currentTime = response.time;
        }
    });
}


document.querySelectorAll("video, audio").forEach(mediaElement => {
    sendElement("load", mediaElement);
    
    mediaElement.onplay = function(event) {
        event.preventDefault()
        mediaElement.play();
    }

    mediaElement.addEventListener("play", event => {
        event.preventDefault();
        mediaElement.play();
    })

    mediaElement.addEventListener("timeupdate", function(event) {
        if (mediaElement.paused) return;
        sendElement("save", event.currentTarget);
    });
});

