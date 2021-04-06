/*
* document.ready only once the entire page has finished loading
*/

$( document ).ready(function() {
	username = localStorage.getItem("username")
	$('#userdisp').html("Logged in as: " + username);
	apikey = localStorage.getItem("apikey");
	console.log(apikey);
	//If the local storage apikey has not been set, redirect the user to the login page
	if(apikey===null){
		window.location = "index.html";
	} else {
		getSeminars(true);
	}
});

// When the button is clicked it takes you to the page for this location where questions can be created/edited/deleted/results viewed, etc
$(document).on('click', '.viewedit', function(e){
	e.preventDefault();
	var gottenid = $(this).attr("id");
	gottenidSaved = localStorage.setItem("gottenidSaved", gottenid);
	window.location = "individualevent.html";
});

var apikey;
var apiurl = "*URLOFAPI*";

// For storing the locationids to be used in looking up details such as the questions and answers for a seminar
var seminarids = [];

// For storing the FULL seminar details, such as the start time, end time, questions, answers, etc that have been set by the exhibitor. Stored in an array which can be used later if needed
var seminardetailsarray = [];

// The table which will be populated with each of the results
var tabledata = "";

function getSeminars(display){
	var params = "apikey="+apikey+"&action=getlocationlist&type=seminar";

	$.ajax({
		url: apiurl,
		data: params,
		dataType: "json",
		type: "POST"
	}).done(function(response) {
		$('#feedback').html(response.data.total+" locations found");
		if(response.success){
			$( response.data.list ).each(function( index, item ) {
				// Loop through and add all of the locationids to the seminarids array
				seminarids.push(item.id);
			}
		);
		// Now loop through and get all of the seminar details including start and stop times/questions/answers, etc using the location ids
		$(seminarids).each(function( index, item ) {
			getSeminarDetails(item);
		}
	);

}else{
	$('#feedback').html("Error with api: "+response.error);
}
}).fail(function(jqXHR, textStatus, errorThrown) {
	$('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
});
}

// This is used to get the full details about a location using the locationid - returns the start time, end time, question, potential answers, etc that the exhibitor has set (if they've set any)
function getSeminarDetails(locationid) {
	var seminars = [];
	var params = "apikey="+apikey+"&action=getlocationdetails&locationid="+locationid;
	$.ajax({
		url: apiurl,
		data: params,
		dataType: "json",
		type: "POST"
	}).done(function(response) {
		// Display the results in the table, will display each one as it gets the results instead of having to wait for all of them to load
		// is it possible to sort the table by start date, also to have the time written dd/mm/yyyy

		var name;
		var start_time;
		var end_time;
		var locationidfrom;
		var seminar_question;
		console.log(response);

		if (response.data.location.name == null || response.data.location.name.length < 1) {
			name = "** No name found **";
		} else {
			name = response.data.location.name;
		}

		if (response.data.location.start_time == null || response.data.location.start_time.length < 1) {
			start_time = "** No start time set **";
		} else {
			start_time = response.data.location.start_time;
		}

		if (response.data.location.end_time == null || response.data.location.end_time.length < 1) {
			end_time = "** No end time set **";
		} else {
			end_time = response.data.location.end_time;
		}

		if (response.data.location.location == null || response.data.location.location.length < 1) {
			locationfrom = "** Location not set **";
		} else {
			locationfrom = response.data.location.location;
		}

		if (response.data.location.seminar_question == null) {
			seminar_question = "** Question not set **";
		} else if (response.data.location.seminar_question.length < 1) {
			seminar_question = "** Question not set **";
		}
		else {
			seminar_question = response.data.location.seminar_question;
		}

		tabledata += "<tr id=" +response.data.location.id + ">";
		tabledata += "<td>"+name+"</td>";
		tabledata += "<td>"+start_time+"</td>";
		tabledata += "<td>"+end_time+"</td>";
		tabledata += "<td>"+locationfrom+"</td>";
		tabledata += "<td>"+seminar_question+"</td>";
		tabledata += "<td>"+"<button id=" + response.data.location.id + " type='button' class='btn btn-primary btn-lg viewedit' id='loginbutton' value='view-edit'>View/Edit</button>"+"</td>";
		tabledata += "</tr>";
		$('#eventbody').html(tabledata);

	}).fail(function(jqXHR, textStatus, errorThrown) {
		$('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
	});
}
