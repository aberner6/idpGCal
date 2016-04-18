var pushHere = [];
var timeData = [];
var firstdate = "Jan 1 2016 12:00:00 GMT+0200 (CEST)";
var lastdate = "Dec 31 2016 12:00:00 GMT+0200 (CEST)";
var oneWhen;
// client id
// 587005751584-pkhavkfl3bvs0iii1fin7pcvkbmqs1gr.apps.googleusercontent.com
//client secret
// EwSHsCCNxbcEP6JSvs4VLNRh

// GET https://www.googleapis.com/calendar/v3/calendars/primary/events?alwaysIncludeEmail=false&key={YOUR_API_KEY}
   // <script type="text/javascript">
      // Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com
      var CLIENT_ID = '587005751584-pkhavkfl3bvs0iii1fin7pcvkbmqs1gr.apps.googleusercontent.com';
      // 587005751584-pkhavkfl3bvs0iii1fin7pcvkbmqs1gr.apps.googleusercontent.com


      var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadCalendarApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Google Calendar client library. List upcoming events
       * once client library is loaded.
       */
      function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
      }

      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      function listUpcomingEvents() {
        var request = gapi.client.calendar.events.list({
          'calendarId': 'ciid.dk_i93ju4obca5f1sc1jfro41m03c@group.calendar.google.com', //'primary'
          'timeMin': (new Date(firstdate)).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 2000,
          'orderBy': 'startTime'
        })





        request.execute(function(resp) {
          var events = resp.items;

          if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
              	var event = events[i];
    	        var when = event.start.dateTime;
    	        // oneWhen = events[0].start;
	    	if(events[i].colorId==undefined){
	    		console.log(events[i].summary);
	    	}
    	        // console.log(events[i].colorId)
				if(when){
					pushHere[i]=({
							"who": event.attendees,
							"what": event.summary,
							"how": event.description,
							"start": new Date(event.start.dateTime),
							"end": new Date(event.end.dateTime),
							"colorId": event.colorId
						})
				}
	            if (!when) {
					pushHere[i]=({
							"who": event.attendees,
							"what": event.summary,
							"how": event.description,
							"start": new Date(event.start.date),
							"end": new Date(event.end.date),
							"colorId": event.colorId
						})
	            }

	              // if(event.attendees!=undefined){
		             //  for(j=0; j<event.attendees.length; j++){
		             //  	// console.log(i+event.attendees[j].displayName);
		             //  }
	              // }
              // var when = event.start.dateTime;
              // if (!when) {
              //   when = event.start.date;
              // }
            }
          } 
          else {
          }

        });
      }

function drawData(){
	var width = 1200;
	var height = 600;
	var segHeight = 20;
	var basicSVG = d3.select("#viz")
		.append("svg")
		.attr("width",width)
		.attr("height",height);
	var timeMin = new Date(firstdate);
	var timeMax = new Date(lastdate);
	var timeX = d3.scale.linear()
		.domain([timeMin, timeMax])
		.range([10, width-10]);
	var color = d3.scale.category20c();

	var levels = 0;
    //draw a rectangle for each key
	var rectPhase = basicSVG.selectAll(".t")
	    .data(pushHere)
	    .enter()
	    .append("rect")
	    .attr("class","t")
	    .attr("x",function(d,i){
	        return timeX(d.start); 
	    })
	    .attr("y",function(d,i){
	    	levels = 0;
	    	// if(i<pushHere.length-2){
	    		//some tasks had different start dates but occur together every week once they start
	    		//account for same day of week somehow?
	    		//if same day of week and end date is not yet
	    	if(d.start.getDate()==d.end.getDate()){
		    	// if(pushHere[i+1].start.getDate()==pushHere[i].start.getDate()){
		    		levels++;
		    		return height/2+segHeight*levels;
		    	}
		    	else{
		    		return height/2;
		    	}
	    	// }
	    	// else {
	    	// 	return height/2;
	    	// }
	    })
	    .attr("width",function(d,i){
	        return 20+timeX(d.end)-timeX(d.start);
	    })
	    .attr("height",segHeight)
	    .attr("fill", function(d,i){
	    	if(d.start.getDate()==d.end.getDate()){
	    		return "yellow";
	    	} 
	    	else{
	    		// console.log(d.colorId)
	    		return color(parseInt(d.colorId));
	    	}
	    })
	    // .attr("opacity",.3)
	    .attr("stroke","pink")	
	    .attr("stroke-width",1)
	    .attr("stroke-opacity",.5);
	$('rect').tipsy({ 
	    gravity: 'nw', 
	    html: true, 
	    title: function() {
	      var d = this.__data__;
	      return d.what;
	    }
	  });
}
