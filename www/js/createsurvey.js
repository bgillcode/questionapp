/*
document.ready only once the entire page has finished loading
*/

// Used to keep track of the locationid
var locationidSaved;
var countOfFieldsAdded = 1;

$(document).ready(function() {
	username = localStorage.getItem("username")
	$('#userdisp').html("Logged in as: " + username);
	eventname = localStorage.getItem("eventname")
	$('#eventdisp').html(eventname);
	apikey = localStorage.getItem("apikey");
	console.log(apikey);
	gottenidSaved = localStorage.getItem("gottenidSaved");
	locationidSaved = gottenidSaved;
	// If the local storage apikey has not been set, redirect the user to the login page
	if (apikey === null) {
		window.location = "index.html";
	}
});

var apikey;
var apiurl = "*URLOFAPI*";

// Creates new fields for each answer
$(document).on('click', '.add-field', function(e){
	e.preventDefault();
	// This fixes an error and limits the number of answers that can be created to 5 (counter starts at 1)
	if (countOfFieldsAdded > 5) {
		return;
	}

	// Create the fields
	var addto = "#field" + countOfFieldsAdded;
	var addRemove = "#field" + (countOfFieldsAdded);

	var addtoFile = "#file" + countOfFieldsAdded;
	var addRemoveFile = "#file" + (countOfFieldsAdded);

	countOfFieldsAdded = countOfFieldsAdded + 1;

	var newIn = '<input class = "answer-field" id = "field' + countOfFieldsAdded + '" name = "answer' + countOfFieldsAdded + '" type = "text">';
	var newInput = $(newIn);

	// Fixes the count of the number of fields
	if (countOfFieldsAdded == 1) {
		countOfFieldsAdded = 2;
	}

	// Function fileLoad() is run that takes the id as a parameter when the page is button for uploading images is clicked
	var newInFile = '<input id = "file' + countOfFieldsAdded + '" onclick="fileLoad(' + countOfFieldsAdded + ')" type = "file" /><br>';
	var newInputFile = $(newInFile);

	var newBase64 = '<input id = "base64-' + countOfFieldsAdded + '" type="hidden"/><br>';
	var newBase64Code = $(newBase64);

	var removeBtn = '<button id = "removefile' + (countOfFieldsAdded - 1) + '" class = "btn btn-sm btn-danger remove-field"> - </button> </div><div id = "field">';
	var removeButton = $(removeBtn);

	// Add the fields to the page
	$(addto).after(newInput);
	$(addto).after(newBase64Code);
	$(addto).after(newInputFile);
	$(addRemove).after(removeButton);
});

// This function takes the location id as a paramter when an image is selected and then converts the image to base64 encoded so it can be used on the API
// Base64 for images is a requirement for the API
// The base64 string is saved to a hidden input field on the page which can be retrieved later, this is so that multiple images at once can be sent for example
function fileLoad(id) {
	// Event listener looking for when the image has been selected by the user
	document.querySelector('input[id="file'+id+'"]').addEventListener('change', function() {
		var b64 = "";
		if (this.files && this.files[0]) {
			var imgselect = document.getElementById('file' + countOfFieldsAdded).files[0];

			reader = new FileReader();

			reader.onloadend = function () {
				// Since it contains the Data URI, we should remove the prefix and keep only Base64 string
				var b64 = reader.result.replace(/^data:.+;base64,/, '');
				$("#base64-"+id).val(b64);
			};

			reader.readAsDataURL(imgselect);

			$("#base64-"+id).val(b64);
		}
	});
}

// Removes fields when the remove button is clicked
$(document).on('click', '.remove-field', function(e){
	e.preventDefault();
	var fieldNum = this.id.charAt(this.id.length-1);

	// Reloads the page if the counter is low and the user clicks remove, this addresses and fixes a bug with it
	countOfFieldsAdded = countOfFieldsAdded - 1;
	if (countOfFieldsAdded == 0 || countOfFieldsAdded == 1) {
		location.reload();
	}

	// Removes the input box and file selector (for uploading images) for individual answers
	var fieldID = "#field" + fieldNum;
	var fileID = "#file" + fieldNum;
	$(this).remove();
	$(fieldID).remove();
	$(fileID).remove();
	if (fieldNum == 1) {
		countOfFieldsAdded = 1;
	}
});

// When the button is clicked it will get all of the information that's currently available on the page and send it to the API
// This will take the questions and answers on the page as well as the images and create the question
$(document).on('click', '#createsurveybutton', function(e) {
	e.preventDefault();
	// Set the survey questions
	var surveyquestions = $('#quefield').val();

	// Set the survey answers
	var surveyanswers = [];

	// Loop through and push each answer text field to the answers
	for (var i = 1; i < countOfFieldsAdded+1; i++) {
		var fieldthis = '#field' + i;
		var surveyindividualanswer = $(fieldthis).val();
		var imgselect = document.getElementById('base64-' + i).value;

		// Pushes each answer with the image if one has been selected to the answers array
		surveyanswers.push({"answer": surveyindividualanswer, "image": imgselect});

	}
	// Stringify the answer array
	surveyanswers = JSON.stringify(surveyanswers);

	// Build the parameters to be sent to the API
	var params = "apikey="+apikey+"&action=setquestiondetails&question="+surveyquestions+"&locationid="+locationidSaved+"&answers="+surveyanswers;

	// Check to see if the survey question has been typed in or not
	if (surveyquestions.length < 1) {
		// Display an alert if it hasn't been typed in and ask the user to type in a question
		alert("Please enter a survey question into the textbox");
	} else {
		// If it has been typed in, run the runCreateQuestion function which will call the API and add the question
		runCreateQuestion(params);
	}
});

// Create the question if a value has been typed into the question field and the create survey button has been clicked, otherwise this function will not run (should not have empty questions being put through)
// The parameters are sent to the function
function runCreateQuestion(params) {
	$.ajax({
		url: apiurl,
		data: params,
		dataType: "json",
		type: "POST"
	}).done(function(response) {
		$('#createdQuestionDisplayMessage').text('Question created. Redirecting back to event page in 3 seconds.');
		setTimeout(function(){window.location = "individualevent.html";},3000);
	});
}
