/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

$('body').click(function(e) {
	$('#scrubextensionif').remove();
	$('#scruboverlay-shadow').remove();
});

chrome.runtime.onMessage.addListener(messageHandler)

function messageHandler(message, sender, sendResponse){
	//console.log(message.data);
	if(message.command === 'scrub.InitDialog')
	{
		initDialog(message.data);
	}
	//If we don't remove handlers everytime then they will stay alive
	//and receive messages and call init n times.
	chrome.runtime.onMessage.removeListener(messageHandler);
}

function initDialog(data)
{
	var container = $("<div></div>");
	var article = findMainDiv( $('body') );
	//console.log(container.html());
	for(var i = 0;i<article.length;i++)
	{
		container.append(article[i]);
	}
	applySettings(container, data);
	var iframe = $('<iframe id="scrubextensionif"></iframe>');
	var overlay = $('<div id="scruboverlay-shadow"></div>');
	$('body').append(overlay);
	$('body').append(iframe);
	iframe.ready(function(){
		/*fuck this shit.
		var cssfile = $('<link/>');
		cssfile.attr("type", "text/css");
		cssfile.attr("rel", "stylesheet");
		cssfile.attr("href", url);
		iframe.contents().find('head').append(cssfile);
		*/
		iframe.contents().find('body').append(container);
	});
}

//Find the div within the given node. Pass body for whole document
function findMainDiv(node)
{
	//find div containing the names.
	var divnames = checkDivNameId(node.find('div'));
	//var divp = findpDivs(node.find('div'));
	var paragraphs = findpDivs(divnames);
	var par = findHighestCharCount(paragraphs);
	var target = findArticleTags(par);
	//findRelevantHeading(par);
	console.log("Found - DIV ID: " + par.attr("id") +
					" NAME: " + par.attr("name") +
					" CLASS: " + par.attr("class") );
	return target;
}

function applySettings(container, data)
{
	var Settings = JSON.parse(data);
	for(var i=0;i<Settings.length;i++)
	{
		container.find('p').css(Settings[i][0], Settings[i][1]);
	}
	//container.find('p').css("line-height", "2em");
	
}

function findHighestCharCount(nodes)
{
	if(Array.isArray(nodes) === false)
	{
		return undefined;
	}
	var count = 0;
	var highest = 0;
	var highestP;
	var clone;
	for(var i=0;i<nodes.length;i++)
	{
		count = 0;
		nodes[i].find("p").each(function(){
			clone = $(this).clone();
			clone.find("*").remove();
			count = count + clone.html().length;
		});
		if(count > highest)
		{
			highest = count;
			highestP = nodes[i];
		}
		console.log(count);
	}
	return highestP;
}

//Find the div with more than 2 <p> descendent
//I hope no one writes an article with 1 <p>.
function findpDivs(node)
{
	var target = new Array();
	var count;
	for(var i=0;i<node.length;i++)
	{
		node[i].find("*").each(function(){
			count = $(this).children('p').length;
			if(count > 3)
			{
				target.push( $(this) );
			}
		});
	}
	//If divs found nothing.
	if(target.length === 0)
	{
		$('body').find("*").each(function(){
			count = $(this).children('p').length;
			if(count > 3)
			{
				target.push( $(this) );
			}
		});
	}
	/*
	node.find("*").each(function(){
		count = $(this).children('p').length;
		if(count > 1)
		{
			target.push( $(this) );
		}
	});
	*/
	return target;
}

//find divs that has id containing "content/main"
function checkDivNameId(nodes){
	var results = new Array();
	var content = /.*(content|main|article).*/i;
	nodes.each(function(){
		if(checkRegex(content, $(this) ) )
		{
			results.push($(this));
		}
		/*
		console.log("DIV ID: " + $(this).attr("id") +
					" NAME: " + $(this).attr("name") +
					" CLASS: " + $(this).attr("class") );
		*/			
	});
	return results;
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
	var par;
	var image;
	var title = findRelevantHeading(startNode);
	if(title != null && title.prop("nodeName") != "BODY")
	{
		article.push(title.clone());
	}
	startNode.find("*").each(function(){
		if($(this).prop("nodeName") === "P")
		{
			par = $(this).clone();
			//Remove the images inside paragraphs, or later img tags will be duplicated
			par.find('img').each(function() { $(this).remove() });
			//console.log($(this).html());
			article.push(par);
		}
		else if($(this).prop("nodeName") === "IMG")
		{
			image = $(this).clone();
			article.push(image);
		}
		else if($(this).prop("nodeName") === "H2")
		{
			image = $(this).clone();
			article.push(image);
		}
	});
	return article;
}
