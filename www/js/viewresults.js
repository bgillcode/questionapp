/*
document.ready only once the entire page has finished loading
*/

// Used to keep track of the locationid
var locationidSaved;
var countOfFieldsAdded = 1;

// Used for the timer on checking for updates to the data at a set interval (when new votes come through)
var myChart;
var chartCreated = false;
var timerForChart;

$(document).ready(function() {
  username = localStorage.getItem("username");
  $('#userdisp').html("Logged in as: " + username);
  eventname = localStorage.getItem("eventname");
  $('#eventdisp').html(eventname);
  apikey = localStorage.getItem("apikey");
  console.log(apikey);
  gottenidSaved = localStorage.getItem("gottenidSaved");
  locationidSaved = gottenidSaved;

  // Get the details for this event - the questions, answers, images
  getSeminarDetails(locationidSaved);

  // Get the results for the answers that were clicked on by people
  getAnswers(locationidSaved);

  // If the local storage apikey has not been set, redirect the user to the login page
  if (apikey === null) {
    window.location = "index.html";
  }
  if (chartCreated == true) {
    timerForChart = setInterval(updateChartFromAnswers, 5000);
  }
});

var apikey;
var apiurl = "*URLOFAPI*";

// This is used to get the full details about a location using the locationid
// In this case it's only needed for the question to be displayed though on the page
function getSeminarDetails(locationid) {
  var params = "apikey="+apikey+"&action=getlocationdetails&locationid="+locationid;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    // Display the question in the input box
    // document.getElementById("quefieldspan").text = response.data.location.seminar_question;
    $("#quefieldspan").text(response.data.location.seminar_question);

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });
}

// This is used to get the full details about a location using the locationid - returns the start time, end time, question, potential answers, etc that the exhibitor has set (if they've set any)
function getAnswers(locationid) {
  var params = "apikey="+apikey+"&action=getanswers&locationid="+locationid;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    // Save the object that contains all of the answers
    var theseAnswers = response.data.data;

    // Loop through the object and get the total number of votes first
    var countOfFirst = 1;
    var totalVotes = 0;
    for (var key in theseAnswers) {
      if (theseAnswers[key].answer !== null && theseAnswers[key].answer.length > 1) {
        // Parse the numbers as integers first
        totalVotes = parseInt(totalVotes) + parseInt(theseAnswers[key].total);
        countOfFirst = countOfFirst + 1;
      }
    }

    var arrayForChart = [];
    var arrayForChartLabels = [];
    // Loop through the object and append the values for the images and text to the appropriate html elements on the page for that particular question
    var countOf = 1;
    var countFromZero = 0;
    for (var key in theseAnswers) {
      if (theseAnswers[key].answer !== null && theseAnswers[key].answer.length > 1) {
        if (theseAnswers[key].total > 0 && totalVotes > 0) {

          // Display total percentage of each answer to 2 decimal places
          $("#answertotalpercentage" + countOf).text("(" + (parseInt(theseAnswers[key].total)/parseInt(totalVotes)*100).toFixed(2) + "% of total votes)");
        } else {
          $("#answertotalpercentage" + countOf).text("(0% of total votes)");
        }
        $("#field" + countOf).text(theseAnswers[key].answer + ": ");
        $("#answertotal" + countOf).text(theseAnswers[key].total + " votes");
        $("#totalnumberofvotescast").text(totalVotes + " total votes cast overall");
        arrayForChart.push(theseAnswers[key].total);
        arrayForChartLabels.push(theseAnswers[key].answer);
        countOf = countOf + 1;
        countFromZero = countFromZero + 1;
      }
    }

    generateChartFromAnswers(arrayForChart, arrayForChartLabels);

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });
}


// This is used to update the data on the page at the interval set within the generateChartFromAnswers(arrayForChart, arrayForChartLabels) function
// Also updates the rest of the page and not just the chart so the figures are accurate across the whole page
function updateChartFromAnswers() {
  var params = "apikey="+apikey+"&action=getanswers&locationid="+locationidSaved;
  $.ajax({
    url: apiurl,
    data: params,
    dataType: "json",
    type: "POST"
  }).done(function(response) {
    // Save the object that contains all of the answers
    var theseAnswers = response.data.data;

    // Loop through the object and get the total number of votes first
    var countOfFirst = 1;
    var totalVotes = 0;
    for (var key in theseAnswers) {
      if (theseAnswers[key].answer !== null && theseAnswers[key].answer.length > 1) {
        // Parse the numbers as integers first
        totalVotes = parseInt(totalVotes) + parseInt(theseAnswers[key].total);
        countOfFirst = countOfFirst + 1;
      }
    }

    var arrayForChart = [];
    var arrayForChartLabels = [];
    // Loop through the object and append the values for the images and text to the appropriate html elements on the page for that particular question
    var countOf = 1;
    var countFromZero = 0;
    for (var key in theseAnswers) {
      if (theseAnswers[key].answer !== null && theseAnswers[key].answer.length > 1) {
        if (theseAnswers[key].total > 0 && totalVotes > 0) {

          // Display total percentage of each answer to 2 decimal places
          $("#answertotalpercentage" + countOf).text("(" + (parseInt(theseAnswers[key].total)/parseInt(totalVotes)*100).toFixed(2) + "% of total votes)");
        } else {
          $("#answertotalpercentage" + countOf).text("(0% of total votes)");
        }
        $("#field" + countOf).text(theseAnswers[key].answer + ": ");
        $("#answertotal" + countOf).text(theseAnswers[key].total + " votes");
        $("#totalnumberofvotescast").text(totalVotes + " total votes cast overall");
        arrayForChart.push(theseAnswers[key].total);
        arrayForChartLabels.push(theseAnswers[key].answer);
        countOf = countOf + 1;
        countFromZero = countFromZero + 1;
      }
    }

    // The data in the chart will be updated with the new figures from the data for the votes
    myChart.data.datasets[0].data = arrayForChart;
    myChart.update();

    console.log("updated");

  }).fail(function(jqXHR, textStatus, errorThrown) {
    $('#feedback').html("Sometihng went very wrong: "+textStatus+", "+errorThrown);
  });
}

// Chart is generated with different colours for each of the bars in the bar chart and the number of votes placed above each bar
// At the end of this function there is an update run at a set interval for checking for new data and updating the page and the bar chart and the rest of the page
function generateChartFromAnswers(arrayForChart, arrayForChartLabels) {
  aDatasets1 = arrayForChart;
  var ctx = document.getElementById("myChart");
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: arrayForChartLabels,
      datasets: [ {
        label: 'Result',
        fill:false,
        data: aDatasets1,
        backgroundColor: ["red", "blue", "green", "orange", "purple"],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(255,99,132,1)',
          'rgba(255,99,132,1)',
          'rgba(255,99,132,1)',
          'rgba(255,99,132,1)',
        ],
        borderWidth: 1
      },
    ]
  },
  options: {
    animation:{
      duration: 1,
      onComplete: function() {
        // This is for viewing the vote numbers for the answers to the seminars above each bar in the bar chart
        var chartInstance = this.chart,
        ctx = chartInstance.ctx;

        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.data.datasets.forEach(function(dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);

          meta.data.forEach(function(bar, index) {
            var data = dataset.data[index];
            ctx.fillText(data, bar._model.x, bar._model.y - 5);
          });
        });
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero:true
        }
      }]
    },
    title: {
      display: true,
      text: 'Votes for the answers'
    },
    responsive: true,

    legend: {
      display: false
    },
  },
  showTooltips: false
});

// Set this to run the updates for the chart and the rest of the page too with data being checked at the set interval, in this case it's 10 seconds
chartCreated = true;
if (chartCreated == true) {
  timerForChart = setInterval(updateChartFromAnswers, 10000);
}
}
