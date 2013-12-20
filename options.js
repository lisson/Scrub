$(document).ready(function(){
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