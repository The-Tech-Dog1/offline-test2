let setTab = null


let browserID;
const localStorageKey = null;

if (localStorage.getItem(localStorageKey) !== null) {
  // the variable exists in local storage, so retrieve its value
  browserID = localStorage.getItem(localStorageKey);
} else {
  // generate a random string of 10 characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // store the random string in local storage and set the BrowserID variable
  localStorage.setItem(localStorageKey, result);
  browserID = result;
}

// Spoof title and favicon

// function spoofFavicon(file) {
//   $("link[rel='icon']").attr("href", `/static/favicon/spoof/${file}`);
// }

// var spoofed = {
//     "Google Docs": "docs.ico",
//     "Home - Google Drive": "drive.ico",
//     "Google Slides": "slides.ico",
//     "Document.docx": "word.ico"
// };

// var keys = Object.keys(spoofed);
// var randomKey = keys[Math.floor(Math.random() * keys.length)];

// if (Math.random() < 0.7) {

//     $(document).ready(function() {
//       $("title").text(randomKey);
//     });

//     spoofFavicon(spoofed[randomKey])
// }