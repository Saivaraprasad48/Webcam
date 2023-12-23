// DOM element references
let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");

// Flag to manage recording state
let recordFlag = false;

// Initializations for recording
let transparentColor = "transparent";
let recorder;
let chunks = []; // Stores media data in chunks

// Constraints for accessing user media (video and audio)
let constraints = {
  video: true,
  audio: true,
};

// Get user media (video and audio) from the browser
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  video.srcObject = stream;

  // Set up MediaRecorder for recording
  recorder = new MediaRecorder(stream);
  recorder.addEventListener("start", (e) => {
    chunks = []; // Reset chunks when recording starts
  });
  recorder.addEventListener("dataavailable", (e) => {
    chunks.push(e.data); // Store recorded chunks of media data
  });
  recorder.addEventListener("stop", (e) => {
    // Combine recorded media chunks into a video file (blob)
    let blob = new Blob(chunks, { type: "video/mp4" });

    // Store recorded video in IndexedDB if available
    if (db) {
      let videoID = shortid();
      let dbTransaction = db.transaction("video", "readwrite");
      let videoStore = dbTransaction.objectStore("video");
      let videoEntry = {
        id: `vid-${videoID}`,
        blobData: blob,
      };
      videoStore.add(videoEntry);
    }
  });
});

// Event listener for record button
recordBtnCont.addEventListener("click", (e) => {
  if (!recorder) return; // Ensure recorder is available

  recordFlag = !recordFlag; // Toggle recordFlag

  if (recordFlag) {
    // Start recording
    recorder.start();
    recordBtn.classList.add("scale-record");
    startTimer(); // Start timer for recording duration
  } else {
    // Stop recording
    recorder.stop();
    recordBtn.classList.remove("scale-record");
    stopTimer(); // Stop recording timer
  }
});

// Event listener for capture button
captureBtnCont.addEventListener("click", (e) => {
  captureBtn.classList.add("scale-capture"); // Highlight capture button

  // Create a canvas to capture a snapshot of the video
  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let tool = canvas.getContext("2d");
  tool.drawImage(video, 0, 0, canvas.width, canvas.height);
  tool.fillStyle = transparentColor;
  tool.fillRect(0, 0, canvas.width, canvas.height);

  // Convert canvas snapshot to a data URL (image)
  let imageURL = canvas.toDataURL();

  // Store captured image in IndexedDB if available
  if (db) {
    let imageID = shortid();
    let dbTransaction = db.transaction("image", "readwrite");
    let imageStore = dbTransaction.objectStore("image");
    let imageEntry = {
      id: `img-${imageID}`,
      url: imageURL,
    };
    imageStore.add(imageEntry);
  }

  // Remove capture button highlight after a short delay
  setTimeout(() => {
    captureBtn.classList.remove("scale-capture");
  }, 500);
});

// Variables and functions for timer display during recording
let timerID;
let counter = 0;
let timer = document.querySelector(".timer");

// Start timer function
function startTimer() {
  timer.style.display = "block";
  function displayTimer() {
    let totalSeconds = counter;

    let hours = Number.parseInt(totalSeconds / 3600);
    totalSeconds = totalSeconds % 3600;

    let minutes = Number.parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;

    let seconds = totalSeconds;

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timer.innerText = `${hours}:${minutes}:${seconds}`;

    counter++;
  }

  timerID = setInterval(displayTimer, 1000);
}

// Stop timer function
function stopTimer() {
  clearInterval(timerID);
  timer.innerText = "00:00:00";
  timer.style.display = "none";
}

// Event listeners for filter selection
let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem) => {
  filterElem.addEventListener("click", (e) => {
    transparentColor =
      getComputedStyle(filterElem).getPropertyValue("background-color");
    filterLayer.style.backgroundColor = transparentColor;
  });
});
