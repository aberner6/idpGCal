var pushHere = [];
var timeData = [];
var nestThis;
var oneWhen;
var format = d3.time.format("%x");
var width = window.innerWidth;
var height = window.outerHeight;
var segHeight = 20;
var theseDiffs = [];

var that;
var levels = 0;

var maxColors, maxDiff, timeMin, timeMax;
var theseColors = [];
var timeX = d3.scale.linear();
var color = d3.scale.linear();
var basicSVG, mapDiff;
var opacity = .6;
var firstDate = new Date("Jan 1 2016 12:00:00 GMT+0200 (CEST)");
var lastDate = new Date("Dec 31 2016 12:00:00 GMT+0200 (CEST)");
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
          'timeMin': (new Date(firstDate)).toISOString(),
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
					var when = new Date(event.start.dateTime);
					var whenEnd = new Date(event.end.dateTime);
					pushHere[i]=({
							"who": event.attendees,
							"what": event.summary,
							"how": event.description,
							"start": format(when),//new Date(event.start.dateTime),
							"end": format(whenEnd),//new Date(event.end.dateTime),
							"colorId": event.colorId,
							"diff": parseInt(new Date(format(whenEnd)) - new Date(format(when)))						
						})
				}
	            if (!when) {
					var when = new Date(event.start.date);
					var whenEnd = new Date(event.end.date);
					pushHere[i]=({
							"who": event.attendees,
							"what": event.summary,
							"how": event.description,
							"start": format(when),//new Date(event.start.date),
							"end": format(whenEnd),//new Date(event.end.date),
							"colorId": event.colorId,
							"diff": parseInt(new Date(format(whenEnd)) - new Date(format(when)))						
						})
	            }

	            nestThis = d3.nest()
					.key(function(d) { return d.start; })
					.entries(pushHere);


				// if(nestThis.length>0){
				// 	for(i=0; i<nestThis.length; i++){
				// 		drawData(nestThis[i].values)
				// 	}
				// }
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

function prepData(){
    for(i=0; i<pushHere.length; i++){
    	theseDiffs.push(pushHere[i].diff);
    	theseColors.push(pushHere[i].colorId);
    }
    maxColors = d3.max(theseColors);
    maxDiff = d3.max(theseDiffs);
	timeMin = new Date(firstDate);
	timeMax = new Date(lastDate);
	timeX = d3.scale.linear()
		.domain([timeMin, timeMax])
		.range([10, width-10]);

	mapDiff = d3.scale.linear()
		.domain([maxDiff,0])
		.range([10, height/3]);

	color = d3.scale.linear()
		.domain([0,maxColors])
		.range(["aquamarine",
			"pink","blue","purple","blueviolet","deeppink","lightblue","red"]);
	basicSVG = d3.select("#viz")
		.append("svg")
		.attr("width",width)
		.attr("height",height)
		.attr("transform", "translate(0,50)");
}
function drawData(){
    //draw a rectangle for each key
	var rectPhase = basicSVG.selectAll(".t")
	    .data(nestThis)
	    .enter()
	    .append("rect")
	    .attr("class","t")
	    .attr("x",function(d,i){
	        return timeX(new Date(d.key)); 
	    })
	    .attr("width",function(d,i){
	    	for(k=0; k<d.values.length; k++){
		        return 2+timeX(new Date(d.values[k].end))-timeX(new Date(d.key));
	    	}
	    })
	    .attr("y",function(d,i){
	    	for(k=0; k<d.values.length; k++){
		    	return height/2+mapDiff(d.values[k].diff);
		    }
	    	// var l = d.values.length;
	    	// return height/2+l*segHeight;
	    })
	    .attr("height",segHeight)
	    .attr("fill", function(d,i){
	    	for(j=0; j<d.values.length; j++){
		    	return color(parseInt(d.values[j].colorId));
	    	}
	    })
	    .attr("opacity", opacity)

	$('rect').tipsy({ 
	    gravity: 'nw', 
	    html: true, 
	    title: function() {
	      var d = this.__data__;
	      console.log(d)
	    	for(j=0; j<d.values.length; j++){
		      return d.values[j].what;
			}
	    }
	  });
}
function makePieChart(){


	var mapInnerPie = d3.scale.linear()
		.domain([0, maxDiff])
		.range([100,height/2]);
	var mapOuterPie = d3.scale.linear()
		.domain([0, maxDiff])
		.range([140,height/2]);
	// var mapInnerPie = d3.scale.linear()
	// 	.domain([0,parseInt(maxColors)])
	// 	.range([40,height/3]);
	// var mapOuterPie = d3.scale.linear()
	// 	.domain([0,parseInt(maxColors)])
	// 	.range([100,height/3]);


	var map1Pie = d3.scale.linear()
		.domain([timeMin, timeMax])
		// .range([1, 40]); //16:13
		.range([0, 6.5]); //12

			// .innerRadius(function(d,i){
		 //    	for(k=0; k<d.values.length; k++){
			// 		return mapInnerPie(parseInt(d.values[k].colorId));
			// 	}
			// })
			// .outerRadius(function(d,i){
		 //    	for(k=0; k<d.values.length; k++){
			// 		return mapOuterPie(parseInt(d.values[k].colorId));
			// 	}
			// })


//with data
		var arc = d3.svg.arc()
			.innerRadius(function(d,i){
		    	for(k=0; k<d.values.length; k++){
					return mapInnerPie(parseInt(d.values[k].diff));
				}
			})
			.outerRadius(function(d,i){
		    	for(k=0; k<d.values.length; k++){
					return mapOuterPie(parseInt(d.values[k].diff));
				}
			})
			.startAngle(function(d, i){
		    	for(k=0; k<d.values.length; k++){
			    	return map1Pie(new Date(d.values[k].start));
		    	}
		    })
		    .endAngle(function(d, i){
		    	for(k=0; k<d.values.length; k++){
			    	return map1Pie(new Date(d.values[k].end));
		    	}
		    });

	basicSVG.selectAll("path")
			.data(nestThis)
			.enter().append("svg:path")
			.attr("transform", "translate("+width/2+","+height/2+")")
			.style("fill", function(d,i){ 
		    	for(j=0; j<d.values.length; j++){
			    	return color(parseInt(d.values[j].colorId));
		    	}
		    })
		    .style("stroke",function(d,i){ 
		    	for(j=0; j<d.values.length; j++){
			    	return "white";
		    	}
		    })
		    .attr("opacity",opacity)
			.attr("d", arc);
	$('path').tipsy({ 
	    gravity: 'ne', 
	    html: true, 
	    title: function() {
	      var d = this.__data__;
	      console.log(d)
	    	for(j=0; j<d.values.length; j++){
		      console.log(d.values[j])
		      return d.values[j].what;
			}
	    }
	  });
}