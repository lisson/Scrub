chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(tab.id, { file: "jquery-2.0.3.js" }, function(){
			chrome.tabs.executeScript(tab.id, {file: "scrub.js" }, function(){
					var display = chrome.extension.getURL("display.css");
					chrome.tabs.sendMessage(tab.id, {command: "scrub.InitDialog", data: display});
			})
		});
	chrome.tabs.insertCSS(
		{ file: "iframe.css" } );
	//console.log(display);
});

function getTabStatus(url){
	var key = "scrub." + url;
	var val = localStorage[key];
	if(val != null)
	{
		console.log("getTabStatus return value: " + val);
		return val;
	}
	localStorage[key] = false;
	console.log("getTabStatus did not find key.");
	return false;
}


//The page already has reader enabled.
function setTabStatus(url, val){
	var key = "scrub." + url;
	localStorage[key] = val;
}

