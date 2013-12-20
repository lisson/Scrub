/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var isOpen = false;
var simpleTags = /(IMG|H[2-9]|CODE|DFN|Q)/i;
var inlineTags = /(A|EM|STRONG)/;

$('body').click(function(e) {
	$('#scrubextensionif').remove();
	$('#scruboverlay-shadow').remove();
	isOpen = false;
	document.body.style.overflowY = "visible";
});

$('body').keyup(function(e) {
	if (e.keyCode == 27) {
		$('#scrubextensionif').remove();
		$('#scruboverlay-shadow').remove();
		isOpen = false;
		document.body.style.overflowY = "visible";
	}
});

chrome.runtime.onMessage.addListener(messageHandler);

function messageHandler(message, sender, sendResponse){
	//console.log(message.data);
	if(message.command === 'scrub.InitDialog' && isOpen === false)
	{
		initDialog(message.data);
		//console.log(message.data);
		isOpen = true;
		document.body.style.overflowY = "hidden";
	}
}

function initDialog(data)
{
	var container = $("<div></div>");
	var article = findMainDiv( $('body') );
	for(var i = 0;i<article.length;i++)
	{
		container.append(article[i]);
	}
	var iframe = $('<iframe id="scrubextensionif"></iframe>');
	var overlay = $('<div id="scruboverlay-shadow"></div>');
	$('body').append(overlay);
	$('body').append(iframe);
	applySettings(iframe, data);
	iframe.ready(function(){
		iframe.contents().find('body').append(container);
	});
	iframe.addClass("slidedownClass");
}

//Find the div within the given node. Pass body for whole document
function findMainDiv(node)
{
	var target = findContentTagRatio(node);
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
//var simpleTags = /(IMG|H[2-9]|CODE|DFN|Q)/;
//var inlineTags = /(A|EM|STRONG)/;
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

function findContentTagRatio(node)
{
	var highestCT = 0;
	var targetNode = null;
	var c;
	var body2 = node.clone();
	//divs called comment, widget etc. will be ignored.
	var comment = /.*(comment|advertisement|navigation|menu|disqus_thread|footer|side|reply|respond).*/i;
	body2.find('div').each(function() {
		if(checkRegex(comment, $( this ) ) )
		{
			$(this).remove();
		}
	});
	body2.find("script, style, noscript, iframe, input, textarea").remove();
	body2.find("*").each(function() {
		c = $( this );

		var content = $.trim(c.text()).replace(/\s\s/g, '');
		
		var tags = c.find("*").length;
		var CT;
		if (tags === 0)
		{
			//If no other nested tags, all text is considered distributed over 1 tag.
			//CT = content.length;
			CT = content.length;
		}
		else
		{
			CT = content.length/tags;
		}
		if (CT > highestCT)
		{
				targetNode = this;
				highestCT = CT;
		}
		if (CT > 50)
		{
			printNode( $( this ) );
			console.log(" " + CT);
			//console.log( c.text());
		}
	});
	console.log("Highest CT: " + highestCT);
	printNode($(targetNode));
	console.log(targetNode.textContent);
	//console.log( $( targetNode).text());
	//Take the grand parent of the text
	return $( targetNode ).parent().parent();
}

//Prints id, class and name for the given jQuery object
function printNode(node)
{
	console.log("NODE TYPE " + node.prop("nodeName") +
				" ID: " + node.attr("id") +
				" NAME: " + node.attr("name") +
				" CLASS: " + node.attr("class") );
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