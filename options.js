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
    //console.log($("#userCSS").val() );
    localStorage.setItem("userCSS", $("#userCSS").val());
}

function loadSettings()
{
    var css = localStorage.getItem("userCSS");
    $("#userCSS").val(css);
}