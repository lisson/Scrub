/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var tabsOpened = new Array();

chrome.runtime.onMessage.addListener(messageHandler);

function messageHandler(message, sender, sendResponse){
	//console.log(sender.tab);
	if (message.command === "scrub.close") {
		console.log("Closing tab: " + sender.tab.id);
		var index = findTab(sender.tab.id);
		tabsOpened.splice(index, 1);
	}
}

//indexOf is convenient but not all browsers support it atm.
function findTab(target) {
	for(var i = 0;i<tabsOpened.length;i++)
	{
		if (tabsOpened[i] === target) {
			return i;
		}
	}
	return -1;
}

chrome.browserAction.onClicked.addListener(function(tab) {
	//Already opened, do nothing
	if (findTab(tab.id) != -1 ) {
		console.log("tab " + tab.id + " already opened, return.");
		return;
	}
	chrome.tabs.executeScript(tab.id, { file: "jquery-2.0.3.js" }, function(){
			chrome.tabs.executeScript(tab.id, {file: "scrub.js" }, function(){
					//var display = chrome.extension.getURL("display.css");
					var Settings = localStorage.getItem("Settings");
					if(Settings === null)
					{
						console.log("No settings found. Loading default");
						var rules = new Array();
						rules.push(["line-height", "2em"]);
						Settings = JSON.stringify(rules);
						localStorage.setItem('Settings', Settings);
					}
					tabsOpened.push(tab.id);
					chrome.tabs.sendMessage(tab.id, {command: "scrub.InitDialog", data: Settings});
			})
		});
	chrome.tabs.insertCSS(
		{ file: "iframe.css" } );
	//console.log(display);
});
