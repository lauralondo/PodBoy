

$(document).ready( function() {
    var feed = "http://adventurezone.libsyn.com/rss";
    var player = $('#player');


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
		var url = $(this).attr("data-file-url"); 
		console.log('clicked ' + $(this).find(".list-episode-title").html());
		$('.list-episode-row').removeClass('playing'); //remove playing class from other episodes
		$(this).addClass('playing'); //add playing class to this episode
		player.attr('src', url); //set audio source url

		player[0].play(); //play audio		
		
	    });
	}//end success function
    });//end ajax call



    //when player metadata loaded, display total time in player
    player[0].onloadedmetadata = function() {
	$("#time-total").html(secondsToTimeString(player[0].duration));
    };
    
    

    //on time update, display current time in player
    player[0].ontimeupdate = function() {
	var currentSeconds = player[0].currentTime;
	
	//display current time    
	var stringTime = secondsToTimeString(currentSeconds);
	$("#time-current").html(stringTime);
	
	//move progress bar
	var percent = (currentSeconds / player[0].duration)*100;
	$('#progress').width(percent + "%");
    };

    
    // play or pause audio when play or pause button is clicked
    $("#play-pause").on('click', function() {
	if(player[0].paused) player[0].play(); //if paused, play
	else player[0].pause(); //else, pause
    });


    //when player plays, change button to "pause"
    player[0].onplay = function() {
	$("#play-pause").removeClass("glyphicon-play");
	$("#play-pause").addClass("glyphicon-pause");
    }
    
    //when player pauses, change button to "play"
    player[0].onpause = function() {
	$("#play-pause").removeClass("glyphicon-pause");
	$("#play-pause").addClass("glyphicon-play");
    }
    
});//end document ready function







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


