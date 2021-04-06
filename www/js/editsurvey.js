/*
document.ready only once the entire page has finished loading
*/

// Used to keep track of the locationid
var locationidSaved;
var countOfFieldsAdded = 1;

$(document).ready(function() {
  username = localStorage.getItem("username");
  $('#userdisp').html(username);
  eventname = localStorage.getItem("eventname");
  $('#eventdisp').html(eventname);
  apikey = localStorage.getItem("apikey");
  console.log(apikey);
  gottenidSaved = localStorage.getItem("gottenidSaved");
  locationidSaved = gottenidSaved;

  // Get the details for this event - the questions, answers, images
  getSeminarDetails(locationidSaved);
  // If the local storage apikey has not been set, redirect the user to the login page
  if (apikey === null) {
    window.location = "index.html";
  }
});

var apikey;
var apiurl = "*URLOFAPI*";

// This is used to get the full details about a location using the locationid - returns the start time, end time, question, potential answers, etc that the exhibitor has set (if they've set any)
function getSeminarDetails(locationid) {
  var params = "apikey="+apikey+"&action=getlocationdetails&locationid="+locationid;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {

    // Display the question in the input box
    document.getElementById("quefield").value = response.data.location.seminar_question;

    // Save the object that contains all of the answers
    var theseAnswers = response.data.location.question_answers;

    // Loop through the object and append the values for the images and text to the appropriate html elements on the page for that particular question
    var countOf = 1;
    var countFromZero = 0;
    for(var key in theseAnswers) {
      document.getElementById("field" + countOf).value = theseAnswers[key].answer;
      document.getElementById("imageAnswer" + countOf).src = "*URLOFAPI*/images/questions/4/" + locationidSaved + "/" + countFromZero + ".jpg";
      countOf = countOf + 1;
      countFromZero = countFromZero + 1;
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });
}

// This function takes the location id as a paramter when an image is selected and then converts the image to base64 encoded so it can be used on the API
// Base64 for images is a requirement for the API
// The base64 string is saved to a hidden input field on the page which can be retrieved later, this is so that multiple images at once can be sent for example
function fileLoad(id) {
  document.querySelector('input[id="file'+id+'"]').addEventListener('change', function() {
    if (this.files && this.files[0]) {
      var imgselect = document.getElementById('file' + id).files[0];

      reader = new FileReader();

      reader.onloadend = function () {
        // Because it contains the header for the data URI, remove the prefix and keep the main base64 string part only (another requirement of the API)
        var b64 = reader.result.replace(/^data:.+;base64,/, '');
        $("#base64-"+id).val(b64);
      };

      reader.readAsDataURL(imgselect);

      $("#base64-"+id).val(b64);
    }
  });
}


// When the button is clicked it will get all of the information that's currently available on the page and send it to the API
// This will update the questions and answers on the page as well as the images
$(document).on('click', '#createsurveybutton', function(e) {
  e.preventDefault();
  // Set the survey questions
  var surveyquestions = $('#quefield').val();

  // Set the survey answers
  var surveyanswers = [];

  // Loop through and push each answer text field to the answers
  for (var i = 1; i < 6; i++) {
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

  // Check to see if the survey has been typed in or not
  if (surveyquestions.length < 1) {
    // Display an alert if it hasn't been typed in and ask the user to type in a question
    alert("Please enter a survey question into the textbox");
  } else {
    // If it has been typed in, run the runCreateQuestion function which will call the API and add the question
    runCreateQuestion(params);
  }
});

// AJAX query is run if there is a value typed in for the question at least (should not have empty questions being put through),
// The parameters are sent to the function
function runCreateQuestion(params) {
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    // Will display a message and then redirect the user back now to the individual event page for that event, now that the question and answers have been edited
    $('#createdQuestionDisplayMessage').text('Question created. Redirecting back to event page in 3 seconds.');
    setTimeout(function(){window.location = "individualevent.html";},3000);
  });
}
