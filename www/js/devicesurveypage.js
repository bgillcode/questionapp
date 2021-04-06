/*
* document.ready only once the entire page has finished loading
*/

// Used to keep track of the locationid
var locationidSaved;
// Switch for checking if question has been started or not
var startedQuestionSwitch = false;
var startedQuestionSwitchSecondChecker = false;

var timerForButtons;
var timerNew;

$(document).ready(function() {
  $("#displayonlyifquestionstarted").hide();
  apikey = localStorage.getItem("apikey");
  console.log(apikey);
  gottenidSaved = localStorage.getItem("gottenidSaved");
  locationidSaved = gottenidSaved;

  // If the local storage apikey has not been set, redirect the user to the login page
  if (apikey === null) {
    window.location = "index.html";
  } else {
    getSeminarDetails(locationidSaved);
  }
});

// This function will remove the popup display after the time that's been set from where it's run (currently 1500 milliseconds)
function myTimer() {
  $(".popup-overlay, .popup-content").removeClass("active");
  $('.open').prop('disabled', false);
  clearInterval(timerForButtons);
}

var apikey;
var apiurl = "*URLOFAPI*";


// This function is used to check which buttons should be displayed using the information that is passed to it
function checkIfSurveyStarted(locationdetailswithanswers) {

  // Display the question start time
  $('#timeforquestiontostart').text(locationdetailswithanswers.data.location.start_time);

  // If the question has started, show the question and answers
  if (locationdetailswithanswers.data.location.questions_open) {
    startedQuestionSwitch = true;
    $("#displayonlyifquestionstarted").show();
  }
  // If it hasn't started hide the question and answers
  else if (!locationdetailswithanswers.data.location.questions_open) {
    startedQuestionSwitch = false;
    $("#displayonlyifquestionstarted").hide();
  }

  if (startedQuestionSwitch == true) {
    $("#waitingtostart").hide();
    $('#questiontodisplay').text(locationdetailswithanswers.data.location.seminar_question);
    // Get the answers to be looped through below
    var theseAnswers = locationdetailswithanswers.data.location.question_answers;

    // If the seminar question is not null display the create survey button, else display the edit survey button
    // Also hide the TURN INTO A SURVEY DEVICE button unless a question has been created
    if (locationdetailswithanswers.data.location.seminar_question !== null && locationdetailswithanswers.data.location.seminar_question.length > 0) {
      // Loop through the object and append the values for the images and text to the appropriate html elements on the page for that particular question
      var countOf = 1;
      // Count from zero for the image (that's how it's stored from the API)
      var countFromZero = 0;
      for (var key in theseAnswers) {
        if (theseAnswers[key].answer !== null && theseAnswers[key].answer.length > 1) {
          // Parse to string
          var answeridvar = theseAnswers[key].id.toString();
          // Button for clicking on for the answer with the image that was uploaded for that answer
          var variableshow = '<span class="col-xs-2" id="p' + countOf + '">' + '<button id="button' + countOf + '" class="open" onclick="voteFor(' + answeridvar + ')" ><span id="answer1text">' + theseAnswers[key].answer + '</span><br>'
          $("#displaytheseanswers").append(variableshow + '<img id="imageAnswer1" src="*URLOFAPI*/images/questions/4/'+ locationidSaved + "/" + countFromZero + ".jpg" + '" width="150" height="150"></img></span>');
          countOf = countOf + 1;
          countFromZero = countFromZero + 1;
        }
      }
    }
    // Show the question and answers if the question has been started (manually or automatically)
    $("#displayonlyifquestionstarted").show();
    startedQuestionSwitchSecondChecker = true;
  }

  setInterval(function() {
    getSeminarDetails(locationidSaved);
  }, 5000);
}

function voteFor(buttonid) {
  // var eventInformation = [];
  var params = "apikey="+apikey+"&action=saveanswer&locationid="+locationidSaved+"&answerid="+buttonid;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    console.log("voted");

    // Appends an "active" class to .popup and .popup-content when the "Open" button is clicked
    $(".popup-overlay, .popup-content").addClass("active");
    // Disable button while popup is active
    $('.open').prop('disabled', true);
    timerForButtons = setInterval(myTimer, 1500);

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });
}

// This is used to get the full details about a location using the locationid - returns the start time, end time, question, potential answers, etc that the exhibitor has set (if they've set any)
function getSeminarDetails(locationid) {
  var params = "apikey="+apikey+"&action=getlocationdetails&locationid="+locationid;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    // Only check to see if the question has been started if the switch hasn't been set to true
    if (startedQuestionSwitch == false) {
      checkIfSurveyStarted(response);
    }

    // Logout if the event has BEEN STARTED and THEN ENDED (either automatically ended or manually ended by clicking the End Survey button on the Individual Event Page)
    // This is to prevent access to the app by someone other than the exhibitor after the survey has finished
    if (startedQuestionSwitchSecondChecker == true && !response.data.location.questions_open) {
      localStorage.clear();
      window.location = "index.html";
    }

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });

}
