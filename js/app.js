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
        center: fortWorth,
        styles: [
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e3ddc4"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#c9c98b"
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#c8c88e"
              },
              {
                "weight": 0.5
              }
            ]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [
              {
                "saturation": -85
              },
              {
                "lightness": 20
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#a5b366"
              }
            ]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry.stroke",
            "stylers": [
              {
                "color": "#88954a"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#afd1c6"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#408080"
              }
            ]
          }
        ]
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
            viewModel.hideAllListAndMarker();
            //show the marker of this element
            marker.setMap(map);
            clearListPanel();
            //show company info section
            viewModel.shouldShowCompanyInfo(true);
            //create company Info Panel
            createCompanyInfoSection(company);
            processGooglePlaceAPI(company);
            viewModel.shouldShowButton(true);

            //create and hide job list panel
            createJobDetailSection(company);
            processIndeedAPI(company);
            viewModel.shouldShowJobList(false);
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

//function to reset show job button under company info section
function resetShowJobButton(){
    //reset the initial status of button text and visibility
    viewModel.shouldShowButton(false);
    viewModel.jobButtonName("Show Jobs");
}

//function to clear no match message under company search list
function clearNoMatchMessage(){
    $(".message").remove();
}

//function to clear company list, previous company info title/job list title
//this function is used in marker/list click event
function clearListPanel(){
    //hide company-list section
    $(".company-list-container").hide();
    //remove the previous company info
    $(".company-info").children().remove();
    //remove the previous job list title and error message
    $(".job-list-title,.error-indeed").remove();
}

//function to create Company info card
//this function is used in marker/list click event
function createCompanyInfoSection(company){
    //create title section
    var companyTitleTag = "<h3 class='company-info-title'>" + company.name +"</h3>";
    var companyAddressTag = "<p>Address: " + company.headquarterAddress + "</p>";
    var employmentTag = "<p>Employment: " + company.employment + "</p>";
    $(".company-info").append(companyTitleTag, companyAddressTag, employmentTag)
}

//use google place API to get company detail information
//this function is used in marker/list click event
function processGooglePlaceAPI(company){
    //AJAX from third party API - google place api
    //form URL request

    //1.search placeID
    var searchRequest = {
        location:company,
        radius: '500',
        query: company.queryName
    };
    var placeService = new google.maps.places.PlacesService(map);
    placeService.textSearch(searchRequest, function(data, status){
        //error handling for google place api place search
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.error(status);
            return;
        }
        var placeId = data[0].place_id;

        //2. use placeId to get place detail
        //this can get website, phone, photo infomartion
        var detailRequest = {
            placeId:placeId
        };
        placeService.getDetails(detailRequest,function(detailData,status){
            //error handling for google place api place detail
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
            }

            var website = detailData.website;
            var phone = detailData.formatted_phone_number;
            var rating = detailData.rating;
            var photoURL = detailData.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 300});
            var photoAttribtions = detailData.photos[0].html_attributions;


            //include the data into DOM
            //add list of source
            var attrList = "<ul class='attribution'>Source: </ul>";
            $(".company-info").prepend(attrList);
            photoAttribtions.forEach(function(photoAttr){
                var attrTag = "<li>" + photoAttr + "</li>";
                $(".company-info ul").append(attrTag);
            });
            //when click on the attribution link, open a new tab
            $(".attribution a").attr("target","_blank");

            //add photo
            var photoTag = "<img src='" + photoURL + "' alt='company photo'>";
            $(".company-info").prepend(photoTag);

            //add phone number/rating
            var phoneTag = "<p>Phone Number: " + phone + "</p>";
            var ratingTag = "<p>Rating: " + rating + "/5</p>";
            $(".company-info").append(phoneTag,ratingTag);

            //some data don't have website
            //include website tag if it has one.
            if(website){
                var websiteTag = "<a href='" + website + "' target='_blank'>Go to Website</p>";
                $(".company-info").append(websiteTag);
            }

            //add logo attribution
            var attrLogoTag = "<img class='google-logo' src='./images/powered_by_google_on_white.png' alt='powered by google'>";
            $(".company-info").append(attrLogoTag);
        })
    });
}

//function to hide company list and create job list section
//this function is used in marker/list click event
function createJobDetailSection(company){
    //insert title for job list section
    var companyTitle = "<h3 class='job-list-title'>Jobs in " + company.name +"</h3>";
    var errorMessageIndeed = "<p class='error-indeed'></p>"
    $(companyTitle).insertBefore("#indeed_at");
    $(errorMessageIndeed).insertAfter("#indeed_at");
}

//function to request, get and process data from indeed api
//this function is used in marker/list click event
function processIndeedAPI(company){
    //AJAX from third party API - indeed api
    //form URL request
    var indeedURL = "https://api.indeed.com/ads/apisearch?publisher=4001111316373962&format=json&q=" + company.queryName + "&l=" +company.location + " tx&sort=&radius=&st=&jt=&start=&limit=&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2";

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
            var jobTitleTag = "<h4 class='job-title'>"+ jobTitle +"</h4>";
            var jobDetailTag = "<p class='job-info'>" + jobCompany + " - " + jobLocation + ", " +jobDate + "</p>"
            var jobDescriptionTag = "<p class='job-description'>Description:"+ jobSnippet +"</p>";
            var jobLinkTag = "<a href='"+ jobURL +"' target='_blank'>Link to Jobs</a>";

            //append DOM to the app
            $(".job-list").append("<li></li>");
            $(".job-list li").last().append(jobTitleTag, jobDetailTag, jobDescriptionTag, jobLinkTag);
        }
      },

      error: function() {
        // handle an error response.
        $(".error-indeed").text("Cannot load Jobs. An ERROR has occurred...");
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
        //auto match
        match: {
            enabled: true
        },
        //click on a list item to trigger event
        onClickEvent: function() {
            viewModel.matchSearch();
        },
        //enter on a list item to trigger event
        onKeyEnterEvent: function() {
            viewModel.matchSearch();
        }
    }
};
//call the easyAutocomplete method
$("#search-box").easyAutocomplete(options);



// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;
    //search box value set
    this.companySearch = ko.observable("");

    this.onEnter = function(data,e) {
        if(e.keyCode === 13){
            this.matchSearch();
        }
    }

    //control section show/hide
    //set initial visibility for company list/company info/job list sections
    this.shouldShowCompanyList = ko.observable(true);
    this.shouldShowCompanyInfo = ko.observable(false);
    this.shouldShowJobList = ko.observable(false);

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
        //show the company list DOM element
        this.showCompanyListDOM();
        //come back to the company list status
        this.hideAllListAndMarker();
        //reset map to its original scale;
        resetMap();
        //reset show job button to its original status
        resetShowJobButton();
        //hide company info section
        this.shouldShowCompanyInfo(false);
        //hide job list section
        this.shouldShowJobList(false);


        //set an indicator to see if there is any match.
        //the no match found, value = false
        //if one match found, value = true
        var checkShow = false;
        //loop through the list to find out the matched one
        this.companyArray().forEach(function(company){
            //if the search name match list name,
            //show list/marker
            if(company.name === searchName){
               company.shouldShowMessage(true);
               company.marker.setMap(map);
               checkShow = true;
            }
        });

        if(checkShow === false){
            var noMatchMessageTag = "<p class='message'>Sorry, No Match found...</p>";
            $(".company-list-container").append(noMatchMessageTag);
        }
    };

    //function to show company list and remove job list
    this.showCompanyListDOM = function(){
        //clear job list, title and error message
        $(".job-list li,.job-list-title,.error-indeed").remove();
        //clear company info section
        $(".company-info").children().remove();
        //show company list
        $(".company-list-container").show();
    }

    //show all the list/marker
    //this function is attacted to viewModel
    this.showAllListAndMarker = function(){
        //set the value of search box to be blank
        this.companySearch("");
        //show the company list DOM element
        this.showCompanyListDOM();
        //reset map to initial bounds
        resetMap();
        //clear no match message
        clearNoMatchMessage();
        //reset show job button
        resetShowJobButton();
        //hide company info section
        this.shouldShowCompanyInfo(false);
        //hide job list section
        this.shouldShowJobList(false);


        //this shows the list/markers
        this.companyArray().forEach(function(company){
            //show all the lists
            company.shouldShowMessage(true);
            //show all the markers
            company.marker.setMap(map);
        });
    };

    //hide all the list/marker
    //use in marker click event/showDetail function
    this.hideAllListAndMarker = function(){
        //clear no match message
        clearNoMatchMessage();

        this.companyArray().forEach(function(company){
            //hide all the lists
            company.shouldShowMessage(false);
            //hide all the markers
            company.marker.setMap(null);
        });
    }


    //click on the list to show its detail information
    //trigger marker click event to achieve
    this.showDetail = function(company){
        //trigger click event for marker
        triggerMarkerClick(company);
    }


    //control button to show/hide job lists
    //set the initial status of button text and visibility
    this.shouldShowButton = ko.observable(false);
    this.jobButtonName = ko.observable("Show Jobs");
    //add toggle function to the button
    this.toggleJobList = function(company){
        if(this.jobButtonName()==="Show Jobs"){
            this.shouldShowJobList(true);
            this.jobButtonName("Hide Jobs");
        } else {
            this.shouldShowJobList(false);
            this.jobButtonName("Show Jobs");
        }
    }

    //Map view/list view change button function
    //set and store the initial button name
    this.viewButtonName = ko.observable("List/Info View");
    this.changeViews = function(){
        if(this.viewButtonName()==="Map View"){
            $(".list-view").hide();
            $(".map-view").show();
            this.viewButtonName("List/Info View");
        } else {
            $(".list-view").show();
            $(".map-view").hide();
            this.viewButtonName("Map View");
        }
    }
}

var viewModel = new AppViewModel();

// Activates knockout.js
ko.applyBindings(viewModel);