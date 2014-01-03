/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var JScontent = null;
loadJS();

function loadRules(){
	var Settings = localStorage.getItem("userCSS");
	if(Settings === null)
	{
		console.log("No settings found. Loading default");
		Settings = "p { line-height: 2em; }";
		localStorage.setItem('userCSS', Settings);
	}
	return Settings;
}

chrome.browserAction.onClicked.addListener(function(tab) {
	var Settings = loadRules();
	console.log(Settings);
	chrome.tabs.sendMessage(tab.id, {command: "scrub.InitFrame", data: Settings, js:JScontent}, function(response) {	
		if (response) {
			//Message is received, do nothing.
			console.log(response);
		}
		else {
			chrome.tabs.executeScript(tab.id, { file: "jquery-2.0.3.js" }, function(){
				chrome.tabs.executeScript(tab.id, {file: "scrub.js" }, function(){
						//Order is important here, thus keeping the message nested
						chrome.tabs.sendMessage(tab.id, {command: "scrub.InitFrame",
															data: Settings,
															js: JScontent});
				})
			});
		}
		chrome.tabs.insertCSS( { file: "iframe.css" } );
	});
});

//Loads the js file to be inserted into the reader frame
function loadJS() {
	var path = chrome.extension.getURL("inFrame.js");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			JScontent = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", path, true);
	xmlhttp.send();
}