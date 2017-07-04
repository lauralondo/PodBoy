var feed = "http://adventurezone.libsyn.com/rss";
var player = $('#player');
var currentEpisode;


$(document).ready( function() {

    //get rss feed information for this podcast
    $.ajax(feed, {
	accepts: {
	    xml:"application/rss+xml"
	},
	dataType:"xml",
	success: function(data) {

	    var eps = $("#episode-list") //place to put episode list items
	    $(data).find("item").each(function () { //for each list item,
		var el = $(this); //the list element
		var title = el.find("title").text(); //get episode title
		var pubDate = new Date(el.find("pubDate").text()); //get episode date published
		//format the published date
		var dateString = pubDate.getFullYear()+"-"+pubDate.getMonth()+"-"+pubDate.getDate();
		var fileUrl = el.find("enclosure").attr('url'); //get episode audio url
		//append episode to list
		eps.append(
		    "<div class='row list-episode-row' data-file-url="+fileUrl+">"
			+"<div class='list-episode-title col-sm-10'>"+title+"</div>"
			+"<div class='list-episode-date col-sm-2'>"+dateString+"</div>"
		    +"</div>"
		);
	    });//end for each list item


	    //on click for list episode
	    $(".list-episode-row").on('click', function() {
		console.log('clicked ' + $(this).find(".list-episode-title").html());
		playEpisode($(this));
	    });
	}//end success function
    });//end ajax call


});//end document ready function






//Audio Player Button Click Events=========================================

// play or pause audio when play or pause button is clicked
$("#play-pause").on('click', function() {
    togglePause();
});
$("#step-backward").on('click', function() {
    stepBackward(10);
});
$("#step-forward").on('click', function() {
    stepForward(20);
});
$("#previous").on('click', function() {
    previous();
});
$("#next").on('click', function() {
    next();
});


$(document).keydown(function(e) {
    console.log(e.which);
    if(e.which == 32) { //spacebar (pause)
	e.preventDefault();
	togglePause();
    }
    else if(e.which == 37) { //left arrow (step backward)
	e.preventDefault();
	stepBackward();
    }
    else if(e.which == 39) { //right arrow (step forward)
	e.preventDefault();
	stepForward();
    }
    else if(e.which == 38) { //up arrow (volume up)
	e.preventDefault();
	volumeUp();
    }
    else if(e.which == 40) { //down arrow (volume down)
	e.preventDefault();
	volumeDown();
    }
    

});








//player functions =================================================

//play the given episode (given jquery episode object)
function playEpisode(episode) {
    currentEpisode = episode; //set current episode
    var url = episode.attr("data-file-url"); //get audio source url
    //change episode background color
    $('.list-episode-row').removeClass('playing'); //remove playing class from other eps
    episode.addClass('playing'); //add playing class to this episode
    setSource(url); //set audio source
    play(); //play audio  
}

//set audio source url
function setSource(url) {
    player.attr('src', url); //set audio source url
    console.log("set source url");
}
//play audio
function play() {
    player[0].play();
    console.log("play");
}
//play or pause audio depending on current state
function togglePause() {
    if(player[0].paused) { //if paused, play
	player[0].play();
	console.log("play")
    }
    else { //else, not paused, so pause
	player[0].pause();
	console.log("pause")
    }
}

//step backwards by the given number of seconds
function stepBackward(seconds=10) {
    //if(seconds == null) seconds = 10;
    player[0].currentTime -= seconds
    console.log("step backward " + seconds + " seconds");
}

//step forward by the given number of seconds
function stepForward(seconds=30) {
    player[0].currentTime += seconds;
    console.log("step forward " + seconds + " seconds");
}

//NOTE: how do we deal with prev & next if the dom list changes? episode no longer in dom...
//play next episode if there is one
function next() {
    var next = currentEpisode.next();
    if(next.length != 0) {
	playEpisode(currentEpisode.next());
	console.log("next episode");
	return next;
    }
    console.log("no next episode");
    return null;
}

//play previous episode if there is one
function previous() {
    var prev = currentEpisode.prev();
    if(prev.length != 0) {
	playEpisode(currentEpisode.prev());
	console.log("previous episode");
	return prev;
    }
    console.log("no previous episode");
    return null;
}

function volumeUp() {
    player[0].volume += 0.1;
}
function volumeDown() {
    player[0].volume -= 0.1;
}





//player events =================================================

//when player plays, change button to "pause"
player[0].onplay = function() {
    $("#play-pause").removeClass("glyphicon-play");
    $("#play-pause").addClass("glyphicon-pause");
};
//when player pauses, change button to "play"
player[0].onpause = function() {
    $("#play-pause").removeClass("glyphicon-pause");
    $("#play-pause").addClass("glyphicon-play");
};

//when player metadata loaded, display total time in player
player[0].onloadedmetadata = function() {
    $("#time-total").html(secondsToTimeString(player[0].duration));
};
//when player finishes the current media, play the next in the list
player[0].onended = function() {
    next();
};

//on time update, display current time in player
player[0].ontimeupdate = function() {
    var currentSeconds = player[0].currentTime;
    //display current time    
    var stringTime = secondsToTimeString(currentSeconds);
    $("#time-current").html(stringTime);
    //move progress bar
    var percent = (currentSeconds / player[0].duration)*100;
    $('#progress').width(percent + '%');
};

//as media is downloaded (buffered), update buffer bar
player[0].onprogress = function() {
    //var bufferEnd = player[0].buffered.end( player[0].buffered.length-1 );
    var bufferEnd = player[0].buffered.end(player[0].buffered.length-1);
    var percent = (bufferEnd / player[0].duration) * 100;
    //move buffer bar
    $('#buffer').width(percent + '%');
};   

//when volume is changed, update volume display
player[0].onvolumechange = function() {
    //TODO: move volube slider
};






//other functions================================================================

//change time in seconds into string format (hh:)mm:ss (hours only if  hours > 0) 
function secondsToTimeString(totalSeconds) {
    totalSeconds = Math.floor(totalSeconds);
    var hours = Math.floor(totalSeconds/60/60);
    var minutes = Math.floor(totalSeconds/60) - hours*60;
    var seconds = totalSeconds - hours*60*60 - minutes*60;
    
    //pad minutes and seconds with 0 if single digit
    if(minutes<10) minutes = "0"+minutes;
    if(seconds<10) seconds = "0"+seconds;

    //put in string format (hh:)mm:ss
    var timeString = "";
    if(hours>0) timeString += hours + ":"; //add hours only if hours > 0
    timeString += minutes + ":" + seconds; //add minutes and seconds
    
    return timeString;
}
