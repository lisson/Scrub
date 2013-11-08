$(document).ready(function(){
    $("#add").click(function(e) {
        e.preventDefault();
        var rule = $('<p>CSS tag<input class="csstag" type="text"/> CSS value<input class="cssvalue" type="text"><a href="#">remove</a></p>');
        $("#rules").append(rule);
    });
    
    $("#rules").on("click", "a", function(e){ e.preventDefault(); $(this).parent().remove() });
    $("#save").click(function(e){
        e.preventDefault();
        saveSettings();
    });
    loadSettings();
});

function saveSettings()
{
    localStorage.clear();
    var rules = new Array();
    var tag, value;
    $("#rules").children("p").each(function() {
        tag = $(this).children(".csstag").val();
        console.log(tag);
        value = $(this).children(".cssvalue").val();
        console.log(value);
        rules.push( [tag, value] );
    });
    localStorage["Settings"] = JSON.stringify(rules);
}

function loadSettings()
{
    var rules = new Array();
    rules = JSON.parse(localStorage["Settings"]);
    for(var i=0;i<rules.length;i++)
    {
        var rule = $('<p>CSS tag<input class="csstag" type="text"/> CSS value<input class="cssvalue" type="text"><a href="#">remove</a></p>');
        rule.children(".csstag").val(rules[i][0]);
        rule.children(".cssvalue").val(rules[i][1]);
        $("#rules").append(rule);
    }
}