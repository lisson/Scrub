/*
The MIT License (MIT)

Copyright (c) 2013 Yi LI <yili604@gmail.com>
*/

$('body').click(function(e) {
	$('#scrubextensionif').remove();
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

function initDialog(url)
{
	var container = $("<div></div>");
	var article = findMainDiv( $('body') );
	//console.log(container.html());
	for(var i = 0;i<article.length;i++)
	{
		container.append(article[i]);
	}
	applySettings(container);
	var iframe = $('<iframe id="scrubextensionif"></iframe>');
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
	var target = findArticleTags(paragraphs[0]);
	console.log("Found - DIV ID: " + paragraphs[0].attr("id") +
					" NAME: " + paragraphs[0].attr("name") +
					" CLASS: " + paragraphs[0].attr("class") );
	return target;
}

function crossCheckResults(divnames, divp)
{
}

function applySettings(container)
{
	container.find('p').css("line-height", "2em");
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
			if(count > 1)
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

function checkRegex(expr, node)
{
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

//Saves all p and img elements into an array
//Takes jQuery object
function findArticleTags(startNode)
{
	var article = new Array();
	var par;
	var image;
	var title = $('body').find("h1");
	article.push(title.clone());
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
	});
	return article;
}

