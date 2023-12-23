setTimeout(() => {
  if (db) {
    // Retrieving videos from database
    let videoDBTransaction = db.transaction("video", "readonly");
    let videoStore = videoDBTransaction.objectStore("video");
    let videoRequest = videoStore.getAll(); // Retrieve all videos

    videoRequest.onsuccess = (e) => {
      let videoResult = videoRequest.result;
      let galleryCont = document.querySelector(".gallery-cont");

      // Displaying retrieved videos
      videoResult.forEach((videoObj) => {
        // Creating video element
        let mediaElem = document.createElement("div");
        mediaElem.setAttribute("class", "media-cont");
        mediaElem.setAttribute("id", videoObj.id);

        let url = URL.createObjectURL(videoObj.blobData);

        mediaElem.innerHTML = `
          <div class="media">
            <video autoplay loop src="${url}"></video>
          </div>
          <div class="delete action-btn">DELETE</div>
          <div class="download action-btn">DOWNLOAD</div>
        `;

        galleryCont.appendChild(mediaElem);

        // Adding listeners for delete and download buttons
        let deleteBtn = mediaElem.querySelector(".delete");
        deleteBtn.addEventListener("click", deleteListener);
        let downloadBtn = mediaElem.querySelector(".download");
        downloadBtn.addEventListener("click", downloadListener);
      });
    };

    // Retrieving images from database
    let imageDBTransaction = db.transaction("image", "readonly");
    let imageStore = imageDBTransaction.objectStore("image");
    let imageRequest = imageStore.getAll(); // Retrieve all images

    imageRequest.onsuccess = (e) => {
      let imageResult = imageRequest.result;
      let galleryCont = document.querySelector(".gallery-cont");

      // Displaying retrieved images
      imageResult.forEach((imageObj) => {
        // Creating image element
        let mediaElem = document.createElement("div");
        mediaElem.setAttribute("class", "media-cont");
        mediaElem.setAttribute("id", imageObj.id);

        let url = imageObj.url;

        mediaElem.innerHTML = `
          <div class="media">
            <img src="${url}" />
          </div>
          <div class="delete action-btn">DELETE</div>
          <div class="download action-btn">DOWNLOAD</div>
        `;

        galleryCont.appendChild(mediaElem);

        // Adding listeners for delete and download buttons
        let deleteBtn = mediaElem.querySelector(".delete");
        deleteBtn.addEventListener("click", deleteListener);
        let downloadBtn = mediaElem.querySelector(".download");
        downloadBtn.addEventListener("click", downloadListener);
      });
    };
  }
}, 100);

// Handling deletion of media (videos/images) from UI and database
function deleteListener(e) {
  let id = e.target.parentElement.getAttribute("id");
  let type = id.slice(0, 3);

  // Deleting from database
  if (type === "vid") {
    let videoDBTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDBTransaction.objectStore("video");
    videoStore.delete(id);
  } else if (type === "img") {
    let imageDBTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDBTransaction.objectStore("image");
    imageStore.delete(id);
  }

  // Removing the media element from UI
  e.target.parentElement.remove();
}

// Handling download of media (videos/images)
function downloadListener(e) {
  let id = e.target.parentElement.getAttribute("id");
  let type = id.slice(0, 3);

  // Downloading from database
  if (type === "vid") {
    let videoDBTransaction = db.transaction("video", "readwrite");
    let videoStore = videoDBTransaction.objectStore("video");
    let videoRequest = videoStore.get(id);

    videoRequest.onsuccess = (e) => {
      let videoResult = videoRequest.result;
      let videoURL = URL.createObjectURL(videoResult.blobData);

      // Triggering download of video
      let a = document.createElement("a");
      a.href = videoURL;
      a.download = "stream.mp4";
      a.click();
    };
  } else if (type === "img") {
    let imageDBTransaction = db.transaction("image", "readwrite");
    let imageStore = imageDBTransaction.objectStore("image");
    let imageRequest = imageStore.get(id);

    imageRequest.onsuccess = (e) => {
      let imageResult = imageRequest.result;

      // Triggering download of image
      let a = document.createElement("a");
      a.href = imageResult.url;
      a.download = "image.jpg";
      a.click();
    };
  }
}
