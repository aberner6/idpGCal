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
var color = d3.scale.ordinal();//linear();
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

	color
		.domain([0,maxColors])
		.range(["aquamarine","pink","blue","purple","blueviolet","deeppink","lightblue","red"]);
	basicSVG = d3.select("#viz")
		.append("svg")
		.attr("width",width)
		.attr("height",height)
		.attr("transform", "translate(0,50)");
}
var rects;
function drawData(){
	rects = basicSVG.selectAll("rectIng")
		.data(nestThis)
		.enter().append("g")
		.selectAll("g.rectIng")
		.data(function(d, i) { return d.values; })
		.enter().append("rect")
		.style("fill", function(d,i){ 
	    	return color(d.colorId);
	    })
	    .style("stroke", "white")
	    .attr("opacity",opacity)
	    .attr("x",function(d,i){
	        return timeX(new Date(d.start)); 
	    })
	    .attr("width",function(d,i){
	        return 1+timeX(new Date(d.end))-timeX(new Date(d.start));
	    })
	    .attr("y",function(d,i){
	    	return height/2+mapDiff(d.diff);
	    })
	    .attr("height",segHeight)
	    .attr("transform", "rotate(0)");
	d3.selectAll("rect")
		.transition()
		.delay(2000)
		.duration(2000)
		.attr("transform", function(d,i){
			return "rotate("+ i*-10 + ")"
		})
		.transition()
		.delay(3500)
		.duration(2000)
		.attr("transform", "rotate(0)")
		.attr("x",width/2)
		.attr("y",height/2)
		.attr("width",1)
		.attr("height",1);


	$('rect').tipsy({ 
	    gravity: 'ne', 
	    html: true, 
	    title: function() {
	      var d = this.__data__;
	      return d.what;
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

	var map1Pie = d3.scale.linear()
		.domain([timeMin, timeMax])
		.range([0, 6.5]); 
//OR
	var arc = d3.svg.arc()
		.innerRadius(function(d){
			console.log(d.what+d.diff+"start"+d.start+"end"+d.end);
    		return mapInnerPie(parseInt(d.diff));
		})
		.outerRadius(function(d){
			return mapOuterPie(parseInt(d.diff));
		})
		.startAngle(function(d){
	    	return map1Pie(new Date(d.start));
	    })
	    .endAngle(function(d,i){
	    	return .05+map1Pie(new Date(d.end));
	    });

	var arc0 = d3.svg.arc()
		.innerRadius(0)
		.outerRadius(1)
		.startAngle(0)
	    .endAngle(.05)

	var paths = basicSVG.selectAll("pathIng")
			.data(nestThis)
			.enter().append("g")
			.attr("transform", "translate("+width/2+","+height/2+")")
    		.selectAll("g.pathIng")
    		.data(function(d, i) { return d.values; })
			.enter().append("path")
			.style("fill", function(d,i){ 
		    	return color(d.colorId);
		    })
		    .style("stroke", "white")
		    .attr("opacity",opacity)
			.attr("d", arc0)
			// .transition()
			// .delay(1000)
			// .duration(2000)
			// .attr("d", arc)


	$('path').tipsy({ 
	    gravity: 'ne', 
	    html: true, 
	    title: function() {
	      var d = this.__data__;
	      return d.what;
	    }
	  });
}





//with data
	// var arc = d3.svg.arc()
	// 	.innerRadius(function(d,i){
	//       var length = d.values.length;
	//     	for(var n = 0; n<length; n++){
	//     		// console.log(length+"length");
	//     		console.log(n+"n"+length+"length")
	//     		return mapInnerPie(parseInt(d.values[n].diff));
	//     	}
	// 	})
	// 	.outerRadius(function(d,i){
	//     	for(k=0; k<d.values.length; k++){
	// 			return mapOuterPie(parseInt(d.values[k].diff));
	// 		}
	// 	})
	// 	.startAngle(function(d, i){
	//     	for(k=0; k<d.values.length; k++){
	// 	    	return map1Pie(new Date(d.values[k].start));
	//     	}
	//     })
	//     .endAngle(function(d, i){
	//     	for(k=0; k<d.values.length; k++){
	// 	    	return .05+map1Pie(new Date(d.values[k].end));
	//     	}
	//     });