/*
* document.ready only once the entire page has finished loading
*/

// Used to keep track of the locationid
var locationidSaved;

$(document).ready(function() {
	apikey = localStorage.getItem("apikey");
	console.log(apikey);
	username = localStorage.getItem("username")
	$('#userdisp').html("Logged in as: " + username);
	gottenidSaved = localStorage.getItem("gottenidSaved");

	locationidSaved = gottenidSaved;
	// If the local storage apikey has not been set, redirect the user to the login page
	if (apikey === null) {
		window.location = "index.html";
	} else {
		getSeminarDetails(gottenidSaved);
	}
});

var apikey;
var apiurl = "*URLOFAPI*";

// When the button is clicked it takes you to the page for this location where questions can be created, etc
$(document).on('click', '#createsurveybutton', function(e){
	e.preventDefault();
	gottenidSaved = localStorage.setItem("locationidSaved", locationidSaved);
	window.location = "createsurvey.html";
});

// When the button is clicked it takes you to the page for this location where questions can be edited/deleted, etc
$(document).on('click', '#editsurveybutton', function(e){
	e.preventDefault();
	gottenidSaved = localStorage.setItem("locationidSaved", locationidSaved);
	window.location = "editsurvey.html";
});

// When the button is clicked it takes you to the page for this location where the results can be viewed
$(document).on('click', '#viewresultsbutton', function(e){
	e.preventDefault();
	gottenidSaved = localStorage.setItem("locationidSaved", locationidSaved);
	window.location = "viewresults.html";
});

// This is used to get the full details about a location using the locationid - returns the start time, end time, question, potential answers, etc that the exhibitor has set (if they've set any)
function getSeminarDetails(locationid) {
	// var eventInformation = [];
	var params = "apikey="+apikey+"&action=getlocationdetails&locationid="+locationid;
	$.ajax({
		url: apiurl,
		data: params,
		dataType: "json",
		type: "POST"
	}).done(function(response) {
		// Display the relevant information or state that it's not available
		if (response.data.location.name) {
			$('#eventname').text(response.data.location.name);
			eventname = localStorage.setItem("eventname", response.data.location.name);
		}
		else {
			$('#eventname').text("*** No event name found ***");
		}

		if (response.data.location.location) {
			$('#location').text(response.data.location.location);
		}
		else {
			$('#location').text("*** No event location found ***");
		}

		if (response.data.location.start_time) {
			$('#starttime').text(response.data.location.start_time);
		}
		else {
			$('#starttime').text("*** No event start time found ***");
		}

		if (response.data.location.end_time) {
			$('#endtime').text(response.data.location.end_time);
		}
		else {
			$('#endtime').text("*** No event end time found ***");
		}

		if (response.data.location.seminar_question) {
			$('#questionset').text(response.data.location.seminar_question);
		}
		else {
			$('#questionset').text("*** No question has been created yet! ***");
		}

		// Pass the array to this function to check which buttons should be displayed
		checkButtons(response);

	}).fail(function(jqXHR, textStatus, errorThrown) {
		$('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
	});
}

// This function is used to check which buttons should be displayed using the information that is passed to it
function checkButtons(eventInformation) {

	// If the seminar question is not null display the create survey button, else display the edit survey button
	// Also hide the TURN INTO A SURVEY DEVICE button unless a question has been created
	if (eventInformation.data.location.seminar_question !== null && eventInformation.data.location.seminar_question) {
		console.log(eventInformation.data.location.seminar_question);

		console.log("editsurv1");
		// If question has been created:

		// If the survey has been STARTED, display text to show that it is currently running
		// If the survey is not currently running, then show text that informs that it is not currently running
		// ALSO if the survey has been started, hide the manual start button and show the manual stop button
		if (eventInformation.data.location.questions_open) {
			$('#eventCheckIfSurveyStarted').text('Question survey is currently running.');
			document.getElementById("startsurveybutton").style.display = "none";
		} else if (!eventInformation.data.location.questions_open) {
			// Otherwise if the survey has NOT been started, hide the manual stop button instead and display text to say survey is running
			$('#eventCheckIfSurveyStarted').text('Question survey is not currently running.');
			document.getElementById("stopsurveybutton").style.display = "none";
		}

		// Hide the create survey button if the question has already been created
		document.getElementById("createsurveybutton").style.display = "none";

	} else if (eventInformation.data.location.seminar_question == null || !eventInformation.data.location.seminar_question) {
		console.log("editsurv");
		// If the question has NOT been created:

		// Hide the edit survey button
		document.getElementById("editsurveybutton").style.display = "none";

		// Hide the TURN INTO A SURVEY DEVICE button
		document.getElementById("turnintosurveydevicebutton").style.display = "none";

		// Hide the manual start and stop buttons
		document.getElementById("startsurveybutton").style.display = "none";
		document.getElementById("stopsurveybutton").style.display = "none";

		// Hide the view results button
		document.getElementById("viewresultsbutton").style.display = "none";
	}

	// Once all buttons have been calculated (if they should be shown or not), display the div for all of the buttons
	document.getElementById("displayallbuttons").style.visibility = "visible";
}

// Confirm clicking to transform the device into a survey device
function transformIntoSurveyDevice() {
	var r = confirm("Are you sure you want to turn this device into a survey device? \nBy doing so you will no longer have manager features until the survey session has finished.");
	if (r == true) {
		// If OK is clicked: Take the user to the device survey page (turning the device into a survey device)
		window.location="devicesurveypage.html";
	} else {
		// If Cancel is clicked: Do nothing
	}
}

// Manually START the survey running
function startSurveyManually() {
	var r = confirm("Are you sure you want to manually start the survey right now?");
	// If OK is clicked: Manually START the survey and set the flag to true
	var flagSet = false;
	if (r == true) {
		// If OK is clicked: Take the user to the device survey page (turning the device into a survey device)
		var params = "apikey="+apikey+"&action=setquestiondetails&overridestart=1&overrideend=0&locationid="+locationidSaved;
		flagSet = true;
		$.ajax({
			url: apiurl,
			data: params,
			dataType: "json",
			type: "POST"
		});
	}
	// If the OK button was clicked then inform the user and reload the page so they can see the changes
	if (flagSet) {
		$('#surveyStartedManuallyOrNot').text('Survey started manually. Reloading page in 3 seconds.');
		setTimeout(function(){location.reload();},3000);
	}
}

// Manually STOP the survey running
function stopSurveyManually() {
	var r = confirm("Are you sure you want to manually stop the survey right now?");
	// Flag to see if the OK button has been clicked and reload the page after running the stop command for the survey
	var flagSet = false;
	if (r == true) {
		// If OK is clicked: Manually STOP the survey and set the flag to true
		var params = "apikey="+apikey+"&action=setquestiondetails&overridestart=0&overrideend=1&locationid="+locationidSaved;
		flagSet = true;
		$.ajax({
			url: apiurl,
			data: params,
			dataType: "json",
			type: "POST"
		});
	}
	// If the OK button was clicked then inform the user and reload the page so they can see the changes
	if (flagSet) {
		$('#surveyStartedManuallyOrNot').text('Survey stopped manually. Reloading page in 3 seconds.');
		setTimeout(function(){location.reload();},3000);
	}
}
