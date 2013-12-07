/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

var isOpen = false;

$('body').click(function(e) {
	$('#scrubextensionif').remove();
	$('#scruboverlay-shadow').remove();
	isOpen = false;
});

$('body').keyup(function(e) {
	if (e.keyCode == 27) {
		$('#scrubextensionif').remove();
		$('#scruboverlay-shadow').remove();
		isOpen = false;
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
}

//Find the div within the given node. Pass body for whole document
function findMainDiv(node)
{
	var target = findContentTagRatio($('body'));
	printNode(target);
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
	var parent = startnode;
	var current = null;
	console.log("Number of h1: " + parent.find("h1").length);
	var h1count=0;
	//Would eventually bubble up to body if no <h1> is used.
	while(h1count === 0)
	{
		h1count = parent.find("h1").length;
		current = parent;
		parent = parent.parent();
	}
	return current.find("h1");
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
	startNode.find("*").each(function(){
		var clone = $( this ).clone();
		if(clone.prop("nodeName") === "P")
		{
			//Remove the images inside paragraphs, or later img tags will be duplicated
			clone.find('img').each(function() { $(this).remove() });
			clone.find('script').each(function() { $(this).remove() });
			clone.find('style').each(function() { $(this).remove() });
			article.push(clone);
		}
		else if(clone.prop("nodeName") === "IMG")
		{
			article.push(clone);
		}
		else if(clone.prop("nodeName") === "H2")
		{
			article.push(clone);
		}
		//printNode(clone);
	});
	return article;
}

function findContentTagRatio(node)
{
	var highestCT = 0;
	var targetNode = null;
	var c;
	var comment = /.*comment.*/i;
	node.find("div").each(function() {
		//We skip comment divs
		if(checkRegex(comment, $( this ) ) === false )
		{
			c = $( this ).clone();
			c.find('script').each(function() { $(this).remove() });
			c.find('style').each(function() { $(this).remove() });
			c.find('img').each(function() { $(this).remove() });
			c.find('iframe').each(function() { $(this).remove() });
			c.find('a').each(function() { $(this).remove() });
			//Remove the divs that become empty after remove script, style,
			c.find('div').each(function() {
				if ( $.trim($( this ).text()) === ''){
					$( this ).remove();
				}
			})
			var content = $.trim(c.text());
			//remove the ptags and span because we don't want to include it in calcuation.
			c.find('p').each(function() { $(this).remove() });
			c.find('span').each(function() { $(this).remove() });
			c.find('ins').each(function() { $(this).remove() });
			c.find('em').each(function() { $(this).remove() });
			
			var tags = c.find("*").length;
			var CT;
			if (tags === 0)
			{
				//If no other nested tags, all text is considered distributed over 1 tag.
				CT = content.length;
			}
			else
			{
				CT = content.length/tags;
			}
			if (CT > highestCT) {
					targetNode = this;
					highestCT = CT;
			}
			if (CT > 0) {
				printNode( $( this ) );
				console.log(" " + CT);
			}
		}
	});
	console.log("Highest CT: " + highestCT);
	console.log( $( targetNode).text());
	return $( targetNode );
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