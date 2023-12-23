let db;
// Open or create a database named "myDataBase"
let openRequest = indexedDB.open("myDataBase");

// Successful database opening
openRequest.addEventListener("success", (e) => {
  console.log("DB Success");
  db = openRequest.result; // Assign the database reference on success
});

// Database opening error
openRequest.addEventListener("error", (e) => {
  console.log("DB error");
});

// Database upgrade or initial creation
openRequest.addEventListener("upgradeneeded", (e) => {
  console.log("DB upgraded and also for initial DB creation");
  db = openRequest.result; // Assign the database reference

  // Create object stores for different types of data (video and image)
  db.createObjectStore("video", { keyPath: "id" }); // Store for video data
  db.createObjectStore("image", { keyPath: "id" }); // Store for image data
});
