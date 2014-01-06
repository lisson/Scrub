var isMouseDown = false;

$(document).ready(function(){
    $("#save").click(function(e){
        e.preventDefault();
        saveSettings();
    });
    $("#sliderContainer").on("mousedown", function(e) {
        isMouseDown = true;
    });
    $("#sliderContainer").on("mousemove", function(e) {
        if (isMouseDown) {
            relX = e.pageX - $(this).parent().offset().left - 7;
            if (relX < 300 && relX >= 0) {                
                $("#sliderTab").css("left", relX+"px");
                var sz = parseInt(relX/290*18 + 12)
                $("#textSize").text(sz);
                $('body').addClass("hideHighlight");
            }
        }
    });
    $('body').on("mouseup", function(e) {
        isMouseDown = false;
        $('body').removeClass("hideHighlight");
    });
    $('iframe').load(function() {
        loadSettings();
    });
});

function saveSettings()
{
    localStorage.clear();
    var settings = collectSettings();
    localStorage.setItem("settings", JSON.stringify(settings));
    preview(settings);
}

function loadSettings()
{
    var settings = JSON.parse(localStorage.getItem("settings"));
    $("#userCSS").val(settings["userCSS"]);
    $("#fontFamily").val(settings["font-family"]);
    var sz = settings["font-size"];
    $("#textSize").text(sz);
    var relX = parseInt((sz-12)/18*290);
    $("#sliderTab").css("left", relX+"px");
    
    $("#doublespace").prop("checked", settings["line-height"]);
    $("#bgcolor").val(settings["background-color"]);
    preview(settings);
}

//Collect all the settings into an array
function collectSettings()
{
    var settings = {};
    settings["userCSS"] = $("#userCSS").val();
    settings["font-size"] = $("#textSize").text();
    settings["font-family"] = $("#fontFamily").val();
    settings["line-height"] = $("#doublespace").prop("checked");
    settings["background-color"]=$("#bgcolor").val();
    return settings;
}

function preview(options) {
    var style = $("<style></style>");
    css = options["userCSS"];
    style.text(css);
    var cssString = "p { ";
    if (/p[\s\S]*{[\s\S]*font\-family[\s\S]*\}/.test(css) === false){
        //User did not specify font family in custom css
        cssString += "font-family: " + options["font-family"] + ", sans-serif;\n";
    }
    if (/p[\s\S]*{[\s\S]*font\-size[\s\S]*\}/.test(css) === false){
        cssString += "font-size: " + options["font-size"] + "px;\n";
    }
    if (/p[\s\S]*{[\s\S]*line\-height[\s\S]*\}/.test(css) === false){
        if (options["line-height"]) {
            cssString += "line-height: 2em;\n";
        }
    }
    cssString += " }";
    style.append(cssString);
    if (/body[\s\S]*{[\s\S]*background\-color[\s\S]*\}/.test(css) === false){
        cssString = "body{ background-color: " + options["background-color"] + "};"
    }
    style.append(cssString);
	var head = $("iframe").contents().find("head");
	head.find("style").remove();
	head.append(style);
}