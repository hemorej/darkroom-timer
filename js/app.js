function gen_mail_to_link(lhs,rhs,subject)
{
  email = "<a href=\"mailto" + ":" + lhs + "@" + rhs + "?subject=Bug! \"\>" + subject + "<\/a>"; 
  return email;
} 
jQuery.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};
jQuery.fn.visible = function() {
  return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

jQuery.fn.isShown = function() {
    return !this.css('display').localeCompare('none')==0 ;
};

var alertTimer, counter, element, seconds, start, remaining, totalTime, autoPause;
var dev = getUrlParameter('dev') || "";
var invert = getUrlParameter('invert') || "";
var fix = getUrlParameter('fix') || "";
var stop = getUrlParameter('stop') || "";
var wash = getUrlParameter('wash') || "";
var restoredMessage = "";

$("#development").val(dev);
$("#inversion").val(invert);
$("#fix").val(fix);
$("#stop").val(stop);
$("#wash").val(wash);

$("#development").focus();

$("#contact").html(gen_mail_to_link('xxx', 'gmail.com', 'Let me know'));

var running = false;
var steps = new Array();

$("#pause").click(function() {
    togglePause();
});

$(".tiny").click(function(e) {
    operation = $(this).attr('class').replace("tiny", "").trim().split('-');
    var newVal;
    var input = $(this).parent().parent().find('input');
    if (operation[1] == 'less') {
        newVal = input.val() - parseFloat(operation[0]);
        if (newVal < 0) newVal = 0;
    } else if (operation[1] == 'more') {
        newVal = parseFloat(input.val()) + parseFloat(operation[0]);
        if (isNaN(newVal)) newVal = parseFloat(operation[0]);
    }

    input.val(newVal);
    e.preventDefault();
});

$("#resetForm").click(reset);
$("#resetInterval").click(reset);

function reset()
{
    $('input').val("");
    window.clearInterval(counter);
    clearTimeout(alertTimer);
    dev = invert = stop = wash = fix = seconds = totalTime = 0;
    element = null;
    running = false;
    $(".timer").hide();
    $("#minutes").show();
    url = window.location.toString();

    if(url.indexOf('?') == -1){
      window.location.replace( url );
    }
    else{
      window.location.replace( url.substring(0, url.indexOf('?')) );
    }
    return false;
}

function timer() {
    if (!element) {
        next = steps.splice(0, 2);
        seconds = next[1];
        element = next[0];
    }

    seconds = seconds - 1;
    totalTime = totalTime - 1;

    if (seconds < 0) {
        clearInterval(counter);
        next = steps.splice(0, 2);
        $(element).parent()[0].removeAttribute("id");
        totalTime = totalTime + 1;
        seconds = next[1]; 
        element = next[0];
        $(element).parent()[0].setAttribute("id", "runningCounter");

        counter = window.setInterval(timer, 1000);
        running = true;

        //wait between steps, auto resume
        togglePause("timer is paused (press space to resume)");
        return;
    }

    if (seconds % invert == 0 && element.localeCompare("#devTimer") == 0) {
        start = new Date().getTime();
        remaining = 5000;

        // should I prepare the next timer ?
        if(seconds != 0 && dev-seconds > 59){
          invertAlert();
          alertTimer = window.setInterval(clear, remaining);
        }
    }

    if (seconds % invert == 3 && element.localeCompare("#devTimer") == 0 && seconds > 3) {
        if(Modernizr.audio && $("#notice").css('visibility') != 'visible'){
            $("#beep").get(0).play();
        }
        $("#notice").visible();
    }

    var time = Math.floor(seconds / 60).pad() + ":" + (seconds % 60).pad();
    var processTime = Math.floor(totalTime / 60).pad() + ":" + (totalTime % 60).pad();
    document.title = '[ '+processTime+ ' ]';
    $(element).html(time);
    
}

function clear() {
    clearTimeout(alertTimer);
    alertTimer = null;
    $("#notice").invisible();
    $("#notice").html("Get ready");
    $("#notice").removeClass("warning");
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
}

$('#minutes').submit(function(e) {
        e.preventDefault();

        url = window.location.toString();
        url = url.substring(0, url.indexOf('?'));
        url += "?dev=" + $("#development").val() + "&invert=" + $("#inversion").val() + "&stop=" + $("#stop").val() + "&fix=" + $("#fix").val() + "&wash=" + $("#wash").val();
        if (Modernizr.history){
            window.history.pushState("recipe", "dev", url);
        }

        dev = parseFloat($("#development").val()) * 60;
        invert = parseFloat($("#inversion").val()) * 60;
        fix = parseFloat($("#fix").val()) * 60;
        stop = parseFloat($("#stop").val()) * 60;
        wash = parseFloat($("#wash").val()) * 60;
        totalTime = dev + fix + stop + wash;

        $("#minutes").hide();
        $(".timer").show();
        $("#devTimer").html(parseInt(dev / 60).pad() + ":" + (dev % 60).pad());
        $("#stopTimer").html(parseInt(stop / 60).pad() + ":" + (stop % 60).pad());
        $("#fixTimer").html(parseInt(fix / 60).pad() + ":" + (fix % 60).pad());
        $("#washTimer").html(parseInt(wash / 60).pad() + ":" + (wash % 60).pad());

        steps = ["#devTimer", dev, "#stopTimer", stop, "#fixTimer", fix, "#washTimer", wash];
        counter = window.setInterval(timer, 1000);

        invertAlert();
        
        start = new Date().getTime();
        remaining = 30000;
        alertTimer = setTimeout(clear, remaining); //first 30sec

        running = true;

        audio = $("#beep").get(0);
        if (Modernizr.audio.ogg){
            audio.src = "audio/bell.ogg";
        }
        else if(Modernizr.audio.mp3){
            audio.src = "audio/bell.mp3";
        }
        audio.load();
    });


$("html").keyup(function(e) {
    if(e.keyCode == 32 && $(".timer").isShown()){
      togglePause();
      e.preventDefault();
      return false;
    }
    else if(e.keyCode == 70 && screenfull.enabled){
      screenfull.toggle();
      e.preventDefault();
      return false;
    }
});

function togglePause(message){

    // is the timer finished ? no need to do anything
    if(totalTime <= 0){ return false; }

    // are we pausing during inversion ? need to restore state
    if($("#notice").hasClass("warning")){
        $("#notice").removeClass("warning");
        restoredMessage = $("#notice").html();
    }

    // auto pause has a different message than a user initiated pause
    message = typeof message !== 'undefined' ? message : "timer is paused";
    $("#notice").html(message);

    if (running == true) {
        clearInterval(counter);
        clearTimeout(alertTimer);
        running = false;
        $("#pause").html("Resume");

        // remaining time to show notice if we paused during an alert/notice
        remaining = remaining - (new Date().getTime() - start);

        $("#notice").visible();
    } else {
        counter = window.setInterval(timer, 1000);
        if (alertTimer != null) {
            start = new Date().getTime();
            alertTimer = setTimeout(clear, remaining);
        }
        running = true;

        $("#pause").html("Pause");

        if(restoredMessage.length){
            $("#notice").html(restoredMessage);
            $("#notice").addClass("warning");
            restoredMessage = "";
        }
        else{
            $("#notice").html("Get Ready");
            $("#notice").visibilityToggle();
        }
    }
}

function invertAlert(){
  $("#notice").toggleClass("warning");
  $("#notice").html("inversion...");
  $("#notice").visible();
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}