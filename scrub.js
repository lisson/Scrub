/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var isOpen = false;
var simpleTags = /(P|IMG|H[2-9]|CODE|DFN|Q|TABLE)/i;
var inlineTags = /(A|EM|STRONG)/;

$('body').click(function(e) {
	var iframe = $('#scrubextensionif');
	iframe.removeClass("slidedownClass");
	iframe.addClass("slideupClass");
	$('#scruboverlay-shadow').hide();
	isOpen = false;
	document.body.style.overflowY = "visible";
});

$('body').on("webkitAnimationEnd oanimationend msAnimationEnd animationend", "#scrubextensionif", function(e){
	if (e.target.getAttribute("class") === "slideupClass") {
		e.target.setAttribute("style", "display: none");
	}
})

chrome.runtime.onMessage.addListener( function(message, sender, sendResponse){
	//console.log(message.data);
	if(message.command === 'scrub.InitDialog' && isOpen === false)
	{
		initDialog(message.data);
		//console.log(message.data);
		isOpen = true;
		document.body.style.overflowY = "hidden";
	}
});

function initDialog(data)
{
	var iframe = $("#scrubextensionif");
	var overlay = $('#scruboverlay-shadow');
	var container = $("<div></div>");
	var	article = findMainDiv( $('body') );
	for(var i = 0;i<article.length;i++)
	{
		container.append(article[i]);
	}
	if (iframe.length === 0) {
		iframe = $('<iframe id="scrubextensionif"></iframe>');
		overlay = $('<div id="scruboverlay-shadow"></div>');
		$('body').append(overlay);
		$('body').append(iframe);
	}
	applySettings(iframe, data);
	iframe.ready(function(){
		iframe.contents().find('body').empty();
		iframe.contents().find('body').append(container);
		iframe.show();
		overlay.show();
	});
	iframe.removeClass("slideupClass");
	iframe.addClass("slidedownClass");
}

//Find the div within the given node. Pass body for whole document
function findMainDiv(node)
{
	//Cloning the node so the script doesn't get removed in the original DOM
	var text = getAllTextNodes(node.clone()[0]);
	var target = findCluster(text, 5);
	//printNode(target);
	var maindiv = findArticleTags(target);
	return maindiv;
}

function applySettings(container, data)
{
	var style = $("<style></style>");
	style.text(data);
	//console.log(data);
	//insert into the iframe
	container.contents().find("head").find("style").remove();
	container.contents().find("head").append(style);
}

//recursively float up the dom tree from the target element
//Looking for the closest <h1> element
function findRelevantHeading(startnode)
{
	var heading = startnode.find('h1');
	if (heading.length > 0) {
		return heading.first();
	}
	heading = null;
	var parent = startnode;
	var current = null;
	//console.log("Number of h1: " + parent.find("h1").length);
	var h1count=0;
	var i;
	//Some sites have imgs in H1 tag. So we look for h1, h2, h3.
	for(i=1;i<4;i++)
	{
		//Would eventually bubble up to body if no <h1> is used.
		while(h1count === 0 && parent.prop("nodeName") != "BODY")
		{
			h1count = parent.find("h" + i).length;
			current = parent;
			parent = parent.parent();
		}
		if (h1count > 0) {
			break;
		}
		else
		{
			parent = startnode;
			current = null;
		}
	}
	if (current === null) {
		return null;
	}
	var h = current.find("h1").first();
	h.find("img").remove();
	var e = h.clone();
	h.remove();
	return e;
}

//Saves all p and img elements into an array
//Takes jQuery object
function findArticleTags(startNode)
{
	var article = new Array();
	var title = findRelevantHeading(startNode);
	if(title != null && title.prop("nodeName") != "BODY")
	{
		article.push(title.clone());
	}
	//console.log("Found starting node:");
	//printNode(startNode);
	var elements = extractNode(startNode);
	return article.concat(elements);
}

//need to write our own depth first content extraction function
//Because jquery doesn't include textnodes in find()
function extractNode(node)
{
	var elements = new Array();
	node.contents().each(function(){
		if ( this.nodeType === 3) {
			//console.log(this.textContent );
			if (elements.length === 0) {
				var tn = $("<p></p>");
				tn.text($.trim(this.textContent));
				elements.push(tn);
			}
			else
			{
				var last = elements[elements.length -1];
				last.append(this);
			}
		}
		else if (inlineTags.test(this.nodeName)) {
			//elements.push($("<p>" + this.nodeName + "</p>"));
			if (elements.length === 0) {
				var tn = $("<p></p>");
				elements.push(tn);
			}
			var last = elements[elements.length -1];
			last.append(" ");
			last.append($(this));
			last.append(" ");
		}
		else if (simpleTags.test(this.nodeName)) {
			elements.push( $(this ) );
		}
		else {
			//elements.push($("<p>" + this.nodeName + "</p>"));
			var tn = $("<p></p>");
			elements.push(tn);
			elements = elements.concat( extractNode( $(this) ) );
		}
	});
	return elements;
}

//Returns all textnode reference in an array
function getAllTextNodes(root)
{
	removeHiddenTags(root);
	var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	
	var node;
    var textNodes = new Array();

    while(node = walker.nextNode()) {
		if (node.textContent.trim().length > 0) {
			textNodes.push(node);
			console.log(node.textContent);
		}
    }
	
	return textNodes;
}

//r specifies the size of the cluster.
function findCluster(textNodes, radius)
{
	if (textNodes.length === 0) {
		return null;
	}
	if (textNodes.length < radius) {
		return textNodes[0];
	}
	
	var r = parseInt(radius/2);
	
	var highestC = 0;
	var center = textNodes[0];
	var c;
	var index = 0;
	var cStart, cEnd;
	for(i=0;i<textNodes.length;i++)
	{
		cStart = i-r;
		cEnd = i+r;
		if (cStart < 0) {
			cEnd = cEnd - cStart;
			cStart = 0;
		}
		if (cEnd > textNodes.length-1) {
			cStart = cStart - cEnd + textNodes.length+1;
			cEnd = textNodes.length-1;
		}
		c = 0;
		//console.log("Cluster: " + cStart + " to " + cEnd);
		for(var j = cStart; j<=cEnd;j++)
		{
			c = c + textNodes[j].textContent.replace(/\s\s/g, '').trim().length;
		}
		if (c > highestC) {
			highestC = c;
			center = textNodes[i];
			index = i;
		}
	}
	cStart = index-r;
	cEnd = index+r;
	var lcp = textNodes[cStart];
	for(i=cStart;i<cEnd;i++)
	{
		lcp = findLCP(lcp,textNodes[i+1]);
	}
	return $(lcp);
}

function removeHiddenTags(node) {
	var node1 = $(node);
	var comment = /.*(comment|advertisement|menu|disqus|reply|respond|hide).*/i;
	node1.find('div').each(function() {
		if(checkRegex(comment, $( this ) ) )
		{
			$(this).remove();
		}
	});
	node1.find("script, style, noscript, iframe, input, textarea, aside").remove();
}

function findLCP(node1, node2) {
	var visited = new Array();
	var found = false;
	var n1 = node1;
	var n2 = node2;
	var parent;
	console.log("n1:\n" + node1.textContent + "\n\n");
	console.log("n2:\n" + node2.textContent + "\n\n");
	while(found === false)
	{
		
		//console.log(n1.nodeName + " " + n2.nodeName);
		if (n1 === n2) {
			parent = n1;
			found = true;
		}
		else if (exist(visited, n1)) {
			parent = n1;
			found = true;
		}
		else if (exist(visited, n2)) {
			parent = n2;
			found = true;
		}
		visited.push(n1);
		visited.push(n2);
		if (n1.nodeName != "BODY") {
			n1 = n1.parentNode;
		}
		if (n2.nodeName != "BODY") {
			n2 = n2.parentNode;
		}
	}
	return parent;
}

function exist(arr, target)
{
	var i;
	for(i=0;i<arr.length;i++)
	{
		if (target === arr[i]) {
			return true;
		}
	}
	return false;
}

//Prints id, class and name for the given jQuery object
function printNode(node)
{
	console.log("NODE TYPE " + node.prop("nodeName") +
				" ID: " + node.attr("id") +
				" NAME: " + node.attr("name") +
				" CLASS: " + node.attr("class") );
	console.log("\n");
}

function checkRegex(expr, node){
	if(expr.test(node.attr("id")))
	{
	  return true;
	}
	else if (expr.test(node.attr("class")))
	{
	  return true;
	}
	else if (expr.test(node.attr("name")))
	{
	  return true;
	}
	return false;
}