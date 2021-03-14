// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require ('path');
const fs = require('fs');
const os = require('os');

var request = require("request")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 720})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
 
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


function requestTransfer(paymentId, sendAmount, sendAddress) {
  var sendAmountBig = sendAmount * 100000000
  var fee = 0.01 * 100000000

  console.log(sendAmount)
  console.log(sendAddress)


  // JSON Passed to JSON RPC
  var requestTransfer = {
    "jsonrpc" : "2.0",
    "id": "testTransfer", 
    "method": "transfer", 
    "destinations": {
      "type" : "array",
      "items" : {
        "amount" : sendAmountBig,
        "address" : sendAddress
      },
      "minItems" : 1
    },
    "payment_id" : paymentId,
    "fee" : fee,
    "mixin" : 0,
  }

  // URL for json RPC
  url = "http://localhost:8069/json_rpc"

  request({
  url: url,
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  json: requestTransfer
  },
  function (error, response, body) {
    if(!error && response.statusCode === 200) {
      var transactionHash = body.result.tx_hash
      responseMessage = "Successfully Sent!"
      return transactionHash

    }
    else{
      console.log("error:" + error)
      console.log("response.statusCode: " + response.statusCode)
      console.log("response.statusText: " + response.statusText)
      responseMessage = response.statusText
    }
  })
}

// exports.handleForm = function handleForm(targetWindow, paymentId, amount, address) {
//     var hash = requestTransfer(paymentId, amount, address);
//     targetWindow.webContents.send('form-received', "we got it", hash);
// };

ipcMain.on('form-submission', function (event, transDetails) {
    console.log("IPC main got the form")
    var responseMessage;
    var hash = requestTransfer(transDetails.paymentId, transDetails.amount, transDetails.address);
    event.sender.send('form-received', responseMessage, hash)
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
