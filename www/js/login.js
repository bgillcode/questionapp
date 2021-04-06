var apiurl = "*URLOFAPI*";

$(document).on('ready', function(){
});

$(document).on('click', '#loginbutton', function(e){
	e.preventDefault();
	var eventref = $('#eventref').val();
	var username = $('#username').val();
	var password = $('#password').val();
	var params = "action=login&username="+username+"&password="+password+"&eventref="+eventref;  //build the parameters to be sent to the api

	$.ajax({
		url: apiurl,
		data: params,
		dataType: "json",
		type: "POST"
	}).done(
		function(response) {
			//if the actual connection itself was succesful
			if(response.success){
				//if the response shows the user succesfully logged in
				if(response.data.loggedin){
					//save the apikey in local storage for use on other pages
					localStorage.setItem("apikey", response.data.apikey);
					localStorage.setItem("username", username);
					localStorage.setItem("eventref", eventref);
					window.location = "events.html";
				}else{
					// Error with logging in because of incorrect details
					$('#feedback').html("Unable to login: "+response.data.error);
				}

			}else{
				// Error with the actual API - possibly parameters being sent
				$('#feedback').html("Error with api: "+response.error);
			}

		}).fail(function(jqXHR, textStatus, errorThrown) {
			// If it completely fails display the full error message
			$('#feedback').html("Something went very wrong: "+textStatus+", "+errorThrown);
		});
	});
