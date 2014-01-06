/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var framehtml = null;
loadHTML();

function loadRules(){
	var Settings = localStorage.getItem("settings");
	if(Settings === null)
	{
		console.log("No settings found. Loading default");
		Settings = {};
		Settings["userCSS"]="body { margin: 40px 100px 40px 20px; }";
		Settings["font-size"] = 16;
		Settings["font-family"] = "Ubuntu";
		Settings["line-height"] = true;
		Settings["background-color"]= "DFFFCC";
		Settings = JSON.stringify(Settings);
		localStorage.setItem("settings", Settings);
	}
	return Settings;
}

chrome.browserAction.onClicked.addListener(function(tab) {
	var Settings = loadRules();
	console.log(Settings);
	chrome.tabs.sendMessage(tab.id, {command: "scrub.InitFrame", data: Settings, html:framehtml}, function(response) {	
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
															html: framehtml});
				})
			});
		}
		chrome.tabs.insertCSS( { file: "iframe.css" } );
	});
});

//Loads the HTML file for reader frame
function loadHTML() {
	var path = chrome.extension.getURL("frame.html");
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			framehtml = xmlhttp.responseText;
		}
	}
	xmlhttp.open("GET", path, true);
	xmlhttp.send();
}