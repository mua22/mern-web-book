printLog("Script Started");
// callDelayedFunctions();

async function fetchDataAsync(callback) {
  let response = await fetch("https://usmanlive.com/wp-json/api/stories");
  callback();
  let data = await response.json();
  console.log(data);
}

function fetchData() {
  fetch("https://usmanlive.com/wp-json/api/stories").then((response) => {
    console.log(response);
    response.json().then((data) => {
      console.log(data);
    });
    printLog("Response Received");
  });
}
printLog("Fetch Data Called");
fetchDataAsync(() => {
  printLog("Callback Called");
});
printLog("Fetch Data Call Ended");
function printLog(message) {
  let li = document.createElement("li");
  li.textContent = message;
  let ul = document.getElementById("logs");
  ul.appendChild(li);
}

function callDelayedFunctions() {
  setTimeout(
    () => {
      printLog("First Time Out");
    },
    Math.floor(Math.random() * 2000),
  );

  setTimeout(
    () => {
      printLog("Second Time Out");
    },
    Math.floor(Math.random() * 2000),
  );
}
// printLog("calling third timeout promise");
// thirdTimeOut().then(() => printLog("third time out resolved"));
// printLog("third time out call ended");
printLog("script ended");

function thirdTimeOut() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve(), 600);
  });
}
