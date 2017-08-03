//constructor function for one company
var Company = function(data) {
    this.name = data.name;
    this.location = data.location;
    this.employment = data.employment;
    this.headquarterAddress = data.headquarterAddress;
    this.lat = data.lat;
    this.lng = data.lng;
};

// function to initialize the map
function initMap() {
    //store the center point in a variable
    var fortWorth = {
        lat: 32.7554883,
        lng: -97.3307658
    };
    //use a constructor to create a new map JS object. This is a map for all
    //the "this" keyword attach map to global scope for use
    this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: fortWorth
    });

    this.markers = [];
    this.infowindows = [];

    //loop through companyList to create marker&infowindow
    companyList.forEach(function(company) {
        var contentString =
            '<h4>' + company.name + '</h4>' +
            '<p>employment:' + company.employment + '</p>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: company,
            map: map
        });

        //store created marker/infowindow into list
        markers.push(marker);
        infowindows.push(infowindow);

        //add method to open/close infowindow
        marker.addListener('mouseover', function() {
            infowindow.open(map, marker);
        });
        marker.addListener('mouseout', function() {
            infowindow.close(map, marker);
        });

        //add eventlister to show detail
        marker.addListener('click', function(){
            //change  map scale for company and center
            map.setZoom(14);
            map.setCenter(company);
            //hide all lists and markers
            viewModel.hideAllMarker();
            //show the marker of this element
            marker.setMap(map);
            createJobDetailSection(company);
            processIndeedAPI(company);

        });
    });

    //add markers/infowindows to companyArray
    //idea comes from Udacity forums Karol's comment - https://discussions.udacity.com/t/infowindow-not-opening-when-clicking-on-list-item-markers-name/305720/2
    for (var i = 0; i < markers.length; i++) {
        viewModel.companyArray()[i].marker = markers[i];
    }
}


//functions to trigger marker events
function triggerMarkerMouseover(data) {
    new google.maps.event.trigger(data.marker, 'mouseover');
}

function triggerMarkerMouseout(data) {
    new google.maps.event.trigger(data.marker, 'mouseout');
}

function triggerMarkerClick(data) {
    new google.maps.event.trigger(data.marker, 'click');
}

//function to reset map to its original scale and center
function resetMap(){
    var fortWorth = {lat: 32.7554883,lng: -97.3307658};
    map.setCenter(fortWorth);
    map.setZoom(10);
}

//function to hide company list and create job list section
//this function is used in marker/list click event
function createJobDetailSection(company){
    //hide company-list section
    $(".company-list-container").hide();
    //insert title for job list section
    var companyTitle = "<h3 class='job-list-title'>Jobs in " + company.name +"</h3>";
    $(".job-list-container").prepend(companyTitle);
}

//function to request, get and process data from indeed api
//this function is used in marker/list click event
function processIndeedAPI(company){
    //AJAX from third party API - indeed api
    //form URL request
    var indeedURL = "http://api.indeed.com/ads/apisearch?publisher=4001111316373962&format=json&q=" + company.name + "&l=" +company.location + "&sort=&radius=&st=&jt=&start=&limit=&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2";

    //get response
    //to avoid CORS problem, need to use .ajax method, use jsonp data type
    //tutorial: https://www.html5rocks.com/en/tutorials/cors/#toc-cors-from-jquery
    //reference: http://hayageek.com/cross-domain-ajax-request-jquery/
    $.ajax({
      type: 'GET',
      // The URL to make the request to.
      url: indeedURL,
      dataType: "jsonp",

      success: function(data) {
        // handle a successful response.
        //loop through the json results
        for (var i = 0; i < data.results.length; i++) {
            //get result from json
            var jobTitle = data.results[i].jobtitle;
            var jobCompany = data.results[i].company;
            var jobLocation = data.results[i].formattedLocationFull;
            var jobURL = data.results[i].url;
            var jobSnippet = data.results[i].snippet;
            var jobDate = data.results[i].formattedRelativeTime;

            //form DOM element
            var jobTitleTag = "<h4> Job Title: "+ jobTitle +"</h4>";
            var jobDetailTag = "<p>" + jobCompany + " - " + jobLocation + ", " +jobDate + "</p>"
            var jobDescriptionTag = "<p>Description:"+ jobSnippet +"</p>";
            var jobLinkTag = "<a href='"+ jobURL +"'>Link to Job</a>";

            //append DOM to the app
            $(".job-list").append("<li></li>");
            $(".job-list li").last().append(jobTitleTag, jobDetailTag, jobDescriptionTag, jobLinkTag);
        }
      },

      error: function() {
        // handle an error response.
      }
    });
}

//autocomplete function
//use jQuery autocomplete plugin - source: http://easyautocomplete.com/guide
var options = {
    //use data. if want to use json, need to run local server.
    data: companyList,
    //choose which property to show
    getValue: "name",
    //achieve better match.
    list: {
        match: {
            enabled: true
        }
    }
};
//call the easyAutocomplete method
$("#search-box").easyAutocomplete(options);



// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;

    //save companyList data into an observable array
    this.companyArray = ko.observableArray([]);
    companyList.forEach(function(oneCompany) {
        self.companyArray.push(new Company(oneCompany));
    });

    //mouseover/mouseout list to trigger marker events
    this.enableInfowindow = function(company) {
        triggerMarkerMouseover(company);
    }
    this.disableInfowindow = function(company) {
        triggerMarkerMouseout(company);
    }

    //search function
    //add shouldShowMessage variable to data
    this.companyArray().forEach(function(company){
        company.shouldShowMessage = ko.observable(true);
    });
    //function to search matched result
    //this function is attacted to viewModel
    this.matchSearch = function() {
        var searchName = $("#search-box").val();
        this.companyArray().forEach(function(company){
            company.shouldShowMessage(true);
            company.marker.setMap(map);
            //if the search name does not match list name,
            //hide list/marker
            if(company.name !== searchName){
               company.shouldShowMessage(false);
               company.marker.setMap(null);
            }
        });
    };

    //function to show company list and remove job list
    this.showCompanyListDOM = function(){
        //clear job list and title
        $(".job-list li,.job-list-title").remove();
        //show company list
        $(".company-list-container").show();
    }

    //show all the list/marker
    //this function is attacted to viewModel
    this.showAllListAndMarker = function(){
        //show the company list DOM element
        this.showCompanyListDOM();
        //reset map to initial bounds
        resetMap();
        //this shows the list/markers
        this.companyArray().forEach(function(company){
            //show all the lists
            company.shouldShowMessage(true);
            //show all the markers
            company.marker.setMap(map);
        });
    };

    //hide all the list/marker
    //use in showDetail function
    this.hideAllMarker = function(){
        this.companyArray().forEach(function(company){
            //hide all the markers
            company.marker.setMap(null);
        });
    }

    //click on the list to show its detail information
    this.showDetail = function(company){
        //trigger click event for marker
        triggerMarkerClick(company);
    }
}

var viewModel = new AppViewModel();

// Activates knockout.js
ko.applyBindings(viewModel);