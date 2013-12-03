/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

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
	chrome.tabs.sendMessage(tab.id, {command: "scrub.InitDialog", data: Settings}, function(response) {	
		if (response) {
			//Message is received, do nothing.
			console.log(response);
		}
		else {
			chrome.tabs.executeScript(tab.id, { file: "jquery-2.0.3.js" }, function(){
				chrome.tabs.executeScript(tab.id, {file: "scrub.js" }, function(){
						//Order is important here, thus keeping the message nested
						chrome.tabs.sendMessage(tab.id, {command: "scrub.InitDialog", data: Settings});
				})
			});
		}
		chrome.tabs.insertCSS( { file: "iframe.css" } );
	});
});
