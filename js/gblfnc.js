/*----------------------*/
/*	evsdrp beta			*/
/*	Global JavaScript 	*/
/*	Version 0.0.7		*/
/*	Alex Saraydarian	*/
/*----------------------*/

/* Function to Refresh Page */
function RefreshPage(){
	$('#popupRefresh').html('Refreshing...');
	$('#popupRefresh').popup('open');
	window.location.reload(true);
}

/* Retreive Current Location */
function getLocation(){
	if (navigator.geolocation) 
	{
		navigator.geolocation.getCurrentPosition
		(
			// get current position
			function (position) { 
			$('#hidLat').val(position.coords.latitude);
			$('#hidLng').val(position.coords.longitude);
		}, 
		// next function is the error callback
		function (error)
		{
			switch(error.code) 
			{
				case error.TIMEOUT:
				alert ('Timeout');
				break;
						case error.POSITION_UNAVAILABLE:
				alert ('Position unavailable');
				break;
						case error.PERMISSION_DENIED:
				alert ('Permission denied');
				break;
						case error.UNKNOWN_ERROR:
				alert ('Unknown error');
				break;
			}
		});
	}
	else // finish the error checking if the client is not compliant with the spec
	{
		alert ('Browser does not support geolocation');
	}
}

/*Parse Text for URLs and transition to that URL */
 function linkparser(val) {
    var transitionType = 'slide';
    var spaces = val.split(' ');
	
	//Find 'http' in each chunk, broken by spaces
	for (i = 0; i < spaces.length; i++) {
		if ( spaces[i].indexOf('http') != -1 || spaces[i].indexOf('www.') != -1 ) {
			spaces[i] = '<a href="' + spaces[i] + '" data-transition="' + transitionType + '">' + spaces[i] + '</a>'
		}
	}

    var toReturn = "";

	for (j = 0; j < spaces.length; j++) {
		toReturn += spaces[j] + ' ';
	}
			 
	return toReturn;
}

/* Where/What Button Event Handler for index.html */
function getData(ctrl, range) {
	//Get Current Location
	getLocation();
	
	//Hide All Divs
	$('#dv4sqr').hide();
	$('#dv4sqrHdr').hide();
	$('#dvPopup').hide();
	$('#dvtwtr').hide();
	$('#dvinsta').hide();
	
	if (ctrl == 'btn4sqr') {
		$('#dv4sqr').show();
		//Call function to retreive trending foursquare venues
		getTrending();
	}
	else if (ctrl == 'btntwtr') {
		$('#dvPopup').show();
		$('#mnuRange').text(range);
		$('#dvtwtr').show();
		//Call function to retreive tweets from twitter
		getTweets(range);
	}
	else if (ctrl == 'btninsta') {
		$('#dvinsta').show();
		//Call function retreive pictures from instagram
		getPics();
	}
}

//Function to convert a DateTime into "how long ago"
function getHowLongAgo(sDateTime) {
	var system_date = new Date(Date.parse(sDateTime));
    var user_date = new Date();
    
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return 'just now';}
    if (diff < 20) {return diff + ' seconds ago';}
    if (diff < 40) {return 'half a minute ago';}
    if (diff < 60) {return 'less than a minute ago';}
    if (diff <= 90) {return 'one minute ago';}
    if (diff <= 3540) {return Math.round(diff / 60) + ' minutes ago';}
    if (diff <= 5400) {return '1 hour ago';}
    if (diff <= 86400) {return Math.round(diff / 3600) + ' hours ago';}
    if (diff <= 129600) {return '1 day ago';}
    if (diff < 604800) {return Math.round(diff / 86400) + ' days ago';}
    if (diff <= 777600) {return '1 week ago';}
    return 'on ' + system_date;
}

/*----FOURSQUARE API ACCESS----*/
/* Function to get Trending Locations */
function getTrending(){
	var sLat = $('#hidLat').val();
	var sLong = $('#hidLng').val();
	var sToken = 'XBVXMKRO5NMD0X0KHFEWBEOXPCBN1PNQF0A40WNP0OCWYSY5';
	var sDate = buildDate();
	var sURL = 'https://api.foursquare.com/v2/venues/trending?ll=' + sLat + ',' + sLong + '&oauth_token=' + sToken + '&v=' + sDate;
	//Ensure Results Div is visible		
	$('#dv4sqr').show();
	$('#lblVenue').removeClass('spNavCurrent').addClass('spNav');
	$('#lblTrend').removeClass('spNav').addClass('spNavCurrent');
	$('#popupRefresh').html('Loading...');
	$('#popupRefresh').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			var arItems = data.response.venues;
			var sRowClass;
			var sEvent;
			var i;
			
			//Sort Array By Most Users Checked In
			arItems.sort(function(a,b) { return parseFloat(b.hereNow.count) - parseFloat(a.hereNow.count)});
			
			//Clear Div
			$('#dv4sqr').text('');

			//If no Trending are found, notify user and get all venues
			if(arItems.length == 0)
			{
				$('#dv4sqr').html("<div style='background-color: #3373A5; border-bottom: solid 5px #404040; font-style: italic;font-size: 11pt; font-weight: bold; padding-top: 5px; padding-bottom: 5px; text-align: center;'>No Trending Places Found :(</div>");
				getVenues();
			}
			else
			{
				//Loop through results and display them to the screen
				for(i=0; i<arItems.length; i++)
					{
						//Create OnClick Event
						sEvent = "popSearch(&quot;" + arItems[i].name.replace("'","&#39;") + "&quot;,&quot;" + arItems[i].location.lat + "&quot;,&quot;" + arItems[i].location.lng + "&quot;)";

					//Alternate Row Colour
					if(i%2==0)	
						sRowClass = 'dvAltRow';
					else
						sRowClass= 'dvRow';
						
					//Build Div
					$('#dv4sqr').append("<div class='" + sRowClass + "' id='dv" + i + "' onclick='" + sEvent + "'><div class='dvHereNow'>" + arItems[i].hereNow.count + "</div><div class='dvVenue'>" + arItems[i].name + "</div><div class='dvVenue'>" + arItems[i].location.distance +"m</div></div>");
				}
							
				$('#dv4sqrHdr').show();
			}
		})
	.error(function(error) { 
		//console.log(error);
		//Parse JSON Error
		var strError = jQuery.parseJSON(error.responseText);
		//Display Error
		$('#dv4sqr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Venues<br />Code: ' + strError.meta.code + '<br />Type: ' + strError.meta.errorType + '<br />Detail: ' + strError.meta.errorDetail + '</p></div>');
	})
	.complete(function() { 
		$('#popupRefresh').popup('close'); 
	});
}

/* Function to retreive foursquare venues based on current location */
function getVenues(){
	var sLat = $('#hidLat').val();
	var sLong = $('#hidLng').val();
	var sToken = 'XBVXMKRO5NMD0X0KHFEWBEOXPCBN1PNQF0A40WNP0OCWYSY5';
	var sDate = buildDate();
	var sURL = 'https://api.foursquare.com/v2/venues/search?ll=' + sLat + ',' + sLong+ '&oauth_token=' + sToken + '&v=' + sDate;
	//Ensure Results Div is visible		
	$('#dv4sqr').show();
	$('#dv4sqrHdr').hide();
	$('#popupRefresh').html('Loading...');
	$('#popupRefresh').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			//console.log(data);
			var arItems = data.response.venues;
			var sRowClass;
			var sEvent;
			var i;

			//Sort Array By Most Users Checked In
			arItems.sort(function(a,b) { return parseFloat(b.hereNow.count) - parseFloat(a.hereNow.count)});

			//Loop through results and display them to the screen
			for(i=0; i<arItems.length; i++)
			{
				//Create OnClick Event
				sEvent = "popSearch(&quot;" + arItems[i].name.replace("'","&#39;") + "&quot;,&quot;" + arItems[i].location.lat + "&quot;,&quot;" + arItems[i].location.lng + "&quot;)";
				
				//Alternate Row Colour
				if(i%2==0)	
					sRowClass = 'dvAltRow';
				else
					sRowClass= 'dvRow';
					
				//Build Div
				$('#dv4sqr').append("<div class='" + sRowClass + "' id='dv" + i + "' onclick='" + sEvent + "'><div class='dvHereNow'>" + arItems[i].hereNow.count + "</div><div class='dvVenue'>" + arItems[i].name + "</div><div class='dvVenue'>" + arItems[i].location.distance +"m</div></div>");
			}
		})
	.error(function(error) { 
		//console.log(error);
		//Parse JSON Error
		var strError = jQuery.parseJSON(error.responseText);
		//Display Error
		$('#dv4sqr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Venues<br />Code: ' + strError.meta.code + '<br />Type: ' + strError.meta.errorType + '<br />Detail: ' + strError.meta.errorDetail + '</p></div>');
	})
	.complete(function() {
		$('#popupRefresh').popup('close');
	});
}

/* Function to build popup buttons */
function popSearch(sName, sLat, sLng){
	var sTwtrGeo = "geocode:" + sLat + "," + sLng + ",0.5km";
	var sInstaGeo = "lat=" + sLat + "&lng=" + sLng;
	
	$('#aboutVenue').one('click', { query: sName, type: 'ByName' }, getVenueTweets);
	$('#atVenue').one('click', { query: sTwtrGeo, type: 'ByLocation' }, getVenueTweets);
	$('#imgVenue').one('click', { query: sInstaGeo }, getVenuePics);
	$('#popupSearch').popup('open');
}

/* Function to build version date */
function buildDate(){
	var dtFullDate = new Date();
	var tempDay = dtFullDate.getDate();
	var tempMonth = dtFullDate.getMonth() + 1;
	var dtDay;
	var dtMonth;
	var dtYear;
	
	//Get Day
	if (tempDay < 10)
		dtDay = '0' + tempDay;
	else
		dtDay = tempDay;
		
	//Get Month
	if (tempMonth < 10)
	{
		dtMonth = '0' + tempMonth.toString();
		}
	else
		dtMonth = tempMonth;
		
	//Get Year
	dtYear = dtFullDate.getFullYear();
	
	return dtYear.toString() + dtMonth.toString() + dtDay.toString()
}
/*----END OF FOURSQUARE API ACCESS----*/

/*----TWITTER API ACCESS----*/
/* Function to retreive Tweets based on current location */
function getTweets(sKM){
	var iTweets = 0;
	var sLat = $('#hidLat').val();
	var sLong = $('#hidLng').val();
	var iMaxTweets = 50;
	var sURL = 'https://search.twitter.com/search.json?q=geocode:' + sLat + ',' + sLong + ',' + sKM + '&show_user=true&result_type=mixed&callback=?';
	//Ensure Results Div is visible
	$('#dvtwtr').show();
	$('#popupRefresh').html('Loading...');
	$('#popupRefresh').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			//Load Twitter Results
			var arItems = data.results;
			//Clear Div
			$('#dvtwtr').text('');
			//Loop through results and display them to the screen
			var i;
			var sCreated;
			for(i=0; i<arItems.length; i++)
			{
				//Only display tweets in which the geolocation is the searched location
				if (arItems[i].geo != null)
				{
					//Parse Date
					sCreated =  getHowLongAgo(arItems[i].created_at);
					$('#dvtwtr').append("<div class='dvTwtDT'><div style='position: relative; float: left;'><span>@" + arItems[i].from_user + "</span></div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</span></div></div>");
					$('#dvtwtr').append("<div class='dvTweet'>" + linkparser(arItems[i].text) + "</div>");
					iTweets = iTweets + 1;
				}
				else if (parseFloat(sKM) >=10)
				{
					//Parse Date
					sCreated =  getHowLongAgo(arItems[i].created_at);
					$('#dvtwtr').append("<div class='dvTwtDT'><div style='color: Yellow; position: relative; float: left;'><span style='font-style: italic;'>@" + arItems[i].from_user + "</span></div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</span></div></div>");
					$('#dvtwtr').append("<div class='dvTweet'>" + linkparser(arItems[i].text) + "</div>");
					iTweets = iTweets + 1;
				}
				
				if (iTweets == iMaxTweets)
					break;
			}
				
			//If there are less then MAX tweets retreived get the next page
			if (iTweets < iMaxTweets){
				getNextPage(data.next_page, iTweets, sKM);
			}
		}
	)
	.error(function(error) { 
		//console.log(error);
		//Parse JSON Error
		var strError = jQuery.parseJSON(error);
		//Display Error
		$('#dvtwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Code: ' + strError.status + '<br />Type: ' + strError.statusText + '<br />Detail: ' + strError.meta.errorDetail + '</p></div>');
	})
	.complete(function(status, text){
		if (status == 0) {
			$('#dvtwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Error: ' + text + '</p></div>'); 
		}
		
		$('#popupRefresh').popup('close');
	});	
}

/* Function retreive Tweets based on Foursquare Venue Name/Location */
function getVenueTweets(event){
	var iTweets = 0;
	var iMaxTweets = 50;
	var sURL = 'https://search.twitter.com/search.json?q=' + event.data.query + '&show_user=true&result_type=mixed&callback=?';
	
	//Change Page
	$.mobile.changePage('#dvSearch', { transition: 'slide' });
	//Show Loading Screen
	$('#popupLoading').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			console.log(data);
			//Load Twitter Results
			var arItems = data.results;
			var blDisplay;
			//Clear Div
			$('#dvVenuetwtr').text('');
			
			if(arItems.length == 0)
			{
				$('#dvVenuetwtr').html('<center><div data-role="header" data-theme="e" class="ui-corner-all ui-header ui-bar-e" style="margin-top: 5px; padding: 5px 5px 5px 5px; text-align: center; max-width: 350px;" role="banner">' + sQuery + ' tweets returned 0 results.</div></center>');
			}
			else
			{
				//Loop through results and display them to the screen
				var i;
				var sCreated;
				for(i=0; i<arItems.length; i++)
				{
					if (event.data.type == "ByLocation"){
						if (!arItems[i].geo) 
							blDisplay = false;
						else
							blDisplay = true;
					}
					else{
						blDisplay = true;
					}
							
					if (blDisplay) {
						//Parse Date
						sCreated =  getHowLongAgo(arItems[i].created_at);
						$('#dvVenuetwtr').append("<div class='dvTwtDT'><div style='position: relative; float: left;'><span>@" + arItems[i].from_user + "</span></div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</span></div></div>");
						$('#dvVenuetwtr').append("<div class='dvTweet'>" + linkparser(arItems[i].text) + "</div>");
						iTweets = iTweets + 1;
								
						if (iTweets == iMaxTweets)
							break;
					}
				}
			}
		}
	)
	.error(function(error) { 
		//console.log(error);
		//Parse JSON Error
		var strError = jQuery.parseJSON(error);
		//Display Error
		$('#dvVenuetwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Code: ' + strError.status + '<br />Type: ' + strError.statusText + '<br />Detail: ' + strError.meta.errorDetail + '</p></div>');
	})
	.complete(function(status, text){
		if (status == 0) {
			$('#dvVenuetwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Error: ' + text + '</p></div>'); 
		}
		
		$('#popupLoading').popup('close');
	});	
}

//Get next page of Tweets
function getNextPage(sNextPage, itweetCount, sKM){
	var sLat = $('#txtLat').val();
	var sLong = $('#txtLong').val();
	var iMaxTweets = 50;
	var sURL = 'https://search.twitter.com/search.json' + sNextPage + '&callback=?';
	var strNextPage;
				
	//Ensure itweetCount is a numeric value
	if(itweetCount != '')
		itweetCount = parseInt(itweetCount);
	
	//Make API Call and Parse JSON Data		
	$.getJSON(sURL, 
		function(data){
			//Load Twitter Results
			var arItems = data.results;
			//Set Next page
			strNextPage = data.next_page;
			
			var i;
			//Loop through results and display them to the screen
			for(i=0; i<arItems.length; i++)
			{
				//Only display tweets in which the geolocation is the searched location
				if (arItems[i].geo != null)
				{
					//Parse Date
					sCreated = getHowLongAgo(arItems[i].created_at);
					$('#dvtwtr').append("<div class='dvTwtDT'><div style='position: relative; float: left;'><span>@" + arItems[i].from_user + "</span></div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</span></div></div>");
					$('#dvtwtr').append("<div class='dvTweet'>" + linkparser(arItems[i].text) + "</div>");
					itweetCount = itweetCount + 1;
				}
				else if (parseFloat(sKM) >=10)
				{
					//Parse Date
					sCreated =  getHowLongAgo(arItems[i].created_at);
					$('#dvtwtr').append("<div class='dvTwtDT'><div style='position: relative; float: left;'><span style='font-style: italic;'>@" + arItems[i].from_user + "</span></div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</span></div></div>");
					$('#dvtwtr').append("<div class='dvTweet'>" + linkparser(arItems[i].text) + "</div>");
					itweetCount = itweetCount + 1;
				}
				
				if (itweetCount == iMaxTweets)
					break;
			}						
		}
	)
	.success(function() { 
		//Check if a next page exists
		if (strNextPage != undefined)
		{
			//If there are less then the MAX tweets retreived get the next page
			if (itweetCount < iMaxTweets)
				getNextPage(strNextPage,itweetCount);
		}
	})
	.error(function(error) { 
		//Parse JSON Error
		var strError = jQuery.parseJSON(error);
		if (strError != null)
		{
			//Display Error
			$('#dvtwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Code: ' + strError + '<br /></div>');
		}
	})
	.complete(function(xhr, text){
		if (xhr.status == 0) {
			$('#dvtwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Search<br />Error: ' + text + '</p></div>'); 
		}
	});
}
/*----END OF TWITTER API ACCESS----*/

/*----INSTAGRAM API ACCESS----*/
/* Function to retreive Instagram imaged based on current location */
function getPics() {
	var sLat = $('#hidLat').val();
	var sLong = $('#hidLng').val();
	var sToken = '46d913874b44477c905f67665ba52ec7';
	var sURL = 'https://api.instagram.com/v1/media/search?lat=' + sLat + '&lng=' + sLong + '&client_id=' + sToken + '&callback=?';
	//Ensure Results Div is visible		
	$('#dvinsta').show();
	$('#popupRefresh').html('Loading...');
	$('#popupRefresh').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			//console.log(data.meta);
			if (data.meta.error_type == 'APIError')
			{
				$('#dvinsta').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Media Search<br />Code: ' + data.meta.code + '<br />Detail: ' + data.meta.error_message + '</p></div>');
			}
			else
			{
				var arItems = data.data;
				var sCreated;
				
				//Clear Div
				$('#dvinsta').text('');
				//Loop through results and display them to the screen
				for(i=0; i<arItems.length; i++)
				{
					//Convert Unix Timestamp to readable date
					sCreated = getHowLongAgo(new Date(arItems[i].created_time * 1000));
					//Display User and Date/Time
					$('#dvinsta').append("<div class='dvInstaCap'><div style='position: relative; float: left;'>" + arItems[i].user.username + "</div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</div></div>");
					//Display Picture
					$('#dvinsta').append("<div class='dvInsta'><img class='dvInstaImg' src='" + arItems[i].images.low_resolution.url + "' height='" + arItems[i].images.low_resolution.height + "' width='" + arItems[i].images.low_resolution.width + "' /></div>");
				}
			}
		})
	.error(function(error) { 
		//console.log(error);
		//Display Error
		$('#dvinsta').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Media Search<br />Code: ' + error.status + '<br />Detail: ' + error.statusText + '</p></div>');
	})
	.complete(function() {
		$('#popupRefresh').popup('close');
	});
}

/* Function to retreive Instagram imaged based on location of Foursquare Venue */
function getVenuePics(event) {
	var sToken = '46d913874b44477c905f67665ba52ec7';
	var sURL = 'https://api.instagram.com/v1/media/search?' + event.data.query + '&client_id=' + sToken + '&callback=?';
	
	//Change Page
	$.mobile.changePage('#dvSearch', { transition: 'slide' });
	//Show Loading Screen
	$('#popupLoading').popup('open');
	//Make API Call and Parse JSON Data
	$.getJSON(sURL, 
		function(data){
			console.log(sURL);
			if (data.meta.error_type == 'APIError')
			{
				$('#dvVenuetwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Media Search<br />Code: ' + data.meta.code + '<br />Detail: ' + data.meta.error_message + '</p></div>');
			}
			else
			{
				var arItems = data.data;
				var sCreated;
				
				//Clear Div
				$('#dvVenuetwtr').text('');
				//Loop through results and display them to the screen
				for(i=0; i<arItems.length; i++)
				{
					//Convert Unix Timestamp to readable date
					sCreated = getHowLongAgo(new Date(arItems[i].created_time * 1000));
					//Display User and Date/Time
					//$('#dvVenuetwtr').append("<div class='dvInstaCap'><div style='position: relative; float: left;'>" + arItems[i].user.username + "</div>&nbsp;&nbsp;<div style='position: relative; float: right;'><span style='font-size: 7pt;'>" + sCreated + "</div></div>");
					//Display Picture
					//$('#dvVenuetwtr').append("<div class='dvInsta'><img class='dvInstaImg' src='" + arItems[i].images.low_resolution.url + "' height='" + arItems[i].images.low_resolution.height + "' width='" + arItems[i].images.low_resolution.width + "' /></div>");
				}
			}
		})
	.error(function(error) { 
		//console.log(error);
		//Display Error
		$('#dvVenuetwtr').html('<div class="dvError">An error has occurred.<p style="padding-left: 50px;">API: Media Search<br />Code: ' + error.status + '<br />Detail: ' + error.statusText + '</p></div>');
	})
	.complete(function() {
		$('#popupLoading').popup('close');
	});
}
/*----END OF INSTAGRAM API ACCESS----*/