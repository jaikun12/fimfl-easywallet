// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var request = require("request")



// JSON Passed to JSON RPC
var requestBalance = {
	"jsonrpc": "2.0",
	"id": "test", 
	"method": "getbalance", 
	"params": []
}

// URL for json RPC
url = "http://localhost:8069/json_rpc"

//fire the request
request({
	url: url,
	method: "POST",
	headers: {
		"content-type": "application/json",
	},
	json: requestBalance
},
function (error, response, body) {
	if(!error && response.statusCode === 200) {
		var avail_bal_big = body.result.available_balance
		var locked_bal_big = body.result.locked_amount
		var avail_bal
		var locked_bal
		if(avail_bal_big != 0) {
			avail_bal = avail_bal_big / 100000000
			avail_bal_rounded = Math.round(avail_bal * 100) / 100
		}
		else{
			avail_bal = avail_bal_big
		}
		
		if(locked_bal_big != 0) {
			locked_bal = locked_bal_big / 100000000
		}
		else {
			locked_bal = locked_bal_big
		}

		document.getElementById("availBal").innerHTML = avail_bal.toFixed(8);
		document.getElementById("lockedBal").innerHTML = body.result.locked_amount / 100000000
	}
	else{
		console.log("error:" + error)
		console.log("response.statusCode: " + response.statusCode)
		console.log("response.statusText: " + response.statusText)
	}
})

const ipcRenderer = require('electron').ipcRenderer;

// const submitFormButton = document.querySelector("#send-container");
// const responseParagraph = document.getElementById('response');

// submitFormButton.addEventListener("submit", function(event){
//         event.preventDefault();   // stop the form from submitting
//         let paymentId = document.getElementById("paymentId").value;
//         let amount = document.getElementById("sendAmount").value;
//         let address = document.getElementById("sendAddress").value;
//         handleForm(currentWindow, paymentId, amount, address)
// });


function requestTransfer(paymentId, sendAmount, sendAddress) {
  var sendAmountBig = sendAmount * 100000000
  var fee = 0.01 * 100000000

  console.log(sendAmount)
  console.log(sendAddress)


  // JSON Passed to JSON RPC
  var requestTransfer = {
    "jsonrpc" : "2.0",
    "method": "transfer", 
    "params" : {
    	"destinations": [{
        	"amount" : sendAmountBig,
        	"address" : sendAddress

    	}],
    	"payment_id" : paymentId,
    	"fee" : fee,
    	"mixin" : 0,
    	"unlock_time" : 0
    }
    
  }

  console.log(requestTransfer)

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
    console.log(body)
      var transactionHash = body.result.tx_hash

      window.alert("Transaction Complete! Transaction Hash: " + transactionHash);
      responseMessage = "Successfully Sent!"

    }
    else{
      console.log("error:" + error)
      console.log("response.statusCode: " + response.statusCode)
      console.log("response.statusText: " + response.statusText)
      responseMessage = response.statusText
    }
  })
}

function sendForm(event) {
    event.preventDefault() // stop the form from submitting
    let paymentId = document.getElementById("paymentId").value;
    let amount = document.getElementById("sendAmount").value;
    let address = document.getElementById("sendAddress").value;
    console.log(paymentId);
    console.log(amount);
    console.log(address);
    var transDetails = {
    	"paymentId" : paymentId,
    	"amount" : amount,
    	"address" : address,
    };
    console.log(transDetails);
    requestTransfer(paymentId, amount, address);
}

ipcRenderer.on('form-received', function(event, responseMsg, transactionHash){
    responseParagraph.innerHTML = responseMsg
    
});

