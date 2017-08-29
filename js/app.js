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
        styles: [{
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e3ddc4"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#c9c98b"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
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
                "stylers": [{
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
                "stylers": [{
                    "color": "#a5b366"
                }]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#88954a"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#afd1c6"
                }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#408080"
                }]
            }
        ]
    });

    //set variables and attach to global
    this.markers = [];
    //create a new instance of infowindow
    this.infowindow = new google.maps.InfoWindow({
    });

    this.redDot = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        strokeColor: 'white',
        strokeWeight: 3,
        fillColor: '#cc0159',
        fillOpacity: 1
    };

    this.orangeDot = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        strokeColor: 'white',
        strokeWeight: 3,
        fillColor: 'orange',
        fillOpacity: 1
    };

    //loop through companyList to create marker&infowindow
    companyList.forEach(function(company) {

        var marker = new google.maps.Marker({
            position: company,
            map: map,
            icon: redDot
        });

        //store created marker/infowindow into list
        markers.push(marker);

        //mouseover/mouseout event
        marker.addListener('mouseover', function() {
            //create infowindow content
            var contentString = '<h4>' + company.name + '</h4>' +
            '<p>employment:' + company.employment + '</p>';
            infowindow.setContent(contentString);
            //show infowindow & change color
            infowindow.open(map, marker);
            marker.setIcon(orangeDot);
        });

        marker.addListener('mouseout', function() {
            marker.setIcon(redDot);
        });

        //add eventlister to show detail
        marker.addListener('click', function() {
            //change  map scale for company and center
            map.setZoom(14);
            map.setCenter(company);
            //show the marker of this element
            marker.setMap(map);

            //change marker color
            marker.setIcon(orangeDot);
            //animate the marker
            marker.setAnimation(google.maps.Animation.DROP);
            //open infowindow
            infowindow.open(map, marker);

            //clean list view
            //hide company-list section
            viewModel.shouldShowCompanyList(false);
            //clean indeed error message
            viewModel.indeedError("");

            //show company info section
            viewModel.shouldShowCompanyInfo(true);
            //create company Info Panel
            viewModel.createCompanyInfoSection(company);
            processGooglePlaceAPI(company);
            viewModel.shouldShowButton(true);

            //create and hide job list panel
            viewModel.createJobDetailSection(company);
            processIndeedAPI(company);
            viewModel.shouldShowJobList(false);
        });
    });

    //add markers to companyArray
    //idea comes from Udacity forums Karol's comment - https://discussions.udacity.com/t/infowindow-not-opening-when-clicking-on-list-item-markers-name/305720/2
    for (var i = 0; i < markers.length; i++) {
        viewModel.companyArray()[i].marker = markers[i];
    }
}

//functions to trigger marker events
function triggerMarkerMouseover(data) {
    google.maps.event.trigger(data.marker, 'mouseover');
}

function triggerMarkerMouseout(data) {
    google.maps.event.trigger(data.marker, 'mouseout');
}

function triggerMarkerClick(data) {
    google.maps.event.trigger(data.marker, 'click');
}

//function to reset map to its original scale and center
function resetMap() {
    //reset map center
    var fortWorth = {
        lat: 32.7554883,
        lng: -97.3307658
    };
    map.setCenter(fortWorth);
    map.setZoom(10);

    //reset map marker
    markers.forEach(function(marker) {
        marker.setIcon(redDot);
    });
    //
    infowindow.close();
}

//use google place API to get company detail information
//this function is used in marker/list click event
function processGooglePlaceAPI(company) {
    //AJAX from third party API - google place api
    //form URL request

    //1.search placeID
    var searchRequest = {
        location: company,
        radius: '500',
        query: company.queryName
    };
    var placeService = new google.maps.places.PlacesService(map);
    placeService.textSearch(searchRequest, function(data, status) {
        //error handling for google place api place search
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.error(status);
            return;
        }
        var placeId = data[0].place_id;

        //2. use placeId to get place detail
        //this can get website, phone, photo infomartion
        var detailRequest = {
            placeId: placeId
        };
        placeService.getDetails(detailRequest, function(detailData, status) {
            //error handling for google place api place detail
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
            }

            //get data from response
            var website = detailData.website;
            var phone = detailData.formatted_phone_number;
            var rating = detailData.rating;
            var photoURL;
            var photoAttributions;

            //check if the data has a photo
            if (detailData.photos) {
                //if has, show the photo/attribution DOM
                viewModel.shouldShowPhoto(true);
                viewModel.shouldShowAttr(true);
                //get the data
                photoURL = detailData.photos[0].getUrl({
                    'maxWidth': 300,
                    'maxHeight': 300
                });
                photoAttributions = detailData.photos[0].html_attributions;
            } else {
                //if not, hide the photo/attribution DOM
                viewModel.shouldShowPhoto(false);
                viewModel.shouldShowAttr(false);
            }

            //update company info viewModel with data from google place
            viewModel.googlePhotoURL(photoURL);
            viewModel.googlePhone("Phone Number: " + phone);
            viewModel.googleRating("Rating: " + rating + "/5");
            if (website) {
                viewModel.shouldShowWebsite(true);
                viewModel.googleWebsite(website);
            } else {
                viewModel.shouldShowWebsite(false);
            }
            viewModel.googleAttributionArray(photoAttributions);

            //use code to adjust the data from api
            //when click on the attribution link, open a new tab
            $(".attribution a").attr("target", "_blank");
        });
    });
}

//function to request, get and process data from indeed api
//this function is used in marker/list click event
function processIndeedAPI(company) {
    //AJAX from third party API - indeed api
    //form URL request
    var indeedURL = "http://api.indeed.com/ads/apisearch?publisher=4001111316373962&format=json&q=" + company.queryName + "&l=" + company.location + " tx&sort=&radius=&st=&jt=&start=&limit=&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2";

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
            //update the data list into view model array
            var jobResults = data.results;
            viewModel.jobResultArray(jobResults);
        },

        error: function() {
            // handle an error response.
            viewModel.indeedError("Cannot load Jobs. An ERROR has occurred...");
        }
    });
}

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;

    //control section show/hide
    //set initial visibility for company list/company info/job list sections
    this.shouldShowCompanyList = ko.observable(true);
    this.shouldShowCompanyInfo = ko.observable(false);
    this.shouldShowJobList = ko.observable(false);

    //no match message
    this.noMatchMessage = ko.observable();

    //indeed error message
    this.indeedError = ko.observable();

    //===================
    //autocomplete function
    //search box value set and data source
    //use knockout-jqAutocomplete library - source: https://github.com/rniemeyer/knockout-jqAutocomplete
    this.companySearch = ko.observable();
    this.myOptions = companyList;

    //====================
    //function to use enter key to control search box
    //this function is attacted to viewModel
    this.enterKeyEvent = function(data, e) {
        if (e.keyCode === 13) {
            this.matchSearch();
        }
    };

    //==============================================
    //company list data
    //save companyList data into an observable array
    this.companyArray = ko.observableArray([]);
    companyList.forEach(function(oneCompany) {
        self.companyArray.push(new Company(oneCompany));
    });

    //===============
    //search function
    //add shouldShowCompanyName variable to data
    this.companyArray().forEach(function(company) {
        company.shouldShowCompanyName = ko.observable(true);
    });

    //function to search matched result
    //this function is attacted to viewModel
    this.matchSearch = function() {
        //get value of search box
        var searchName = this.companySearch();
        //show company list
        this.shouldShowCompanyList(true);
        //come back to the company list status
        this.hideAllListAndMarker();
        //reset map to its original scale;
        resetMap();
        //reset show job button to its original status(text and visibility)
        this.shouldShowButton(false);
        this.jobButtonName("Show Jobs");
        //hide company info section
        this.shouldShowCompanyInfo(false);
        //hide job list section
        this.shouldShowJobList(false);

        //set an indicator to see if there is any match.
        //the no match found, value = false
        //if one match found, value = true
        var checkShow = false;
        //loop through the list to find out the matched one
        this.companyArray().forEach(function(company) {
            //if the search name match list name,
            //show list/marker
            if (company.name === searchName) {
                company.shouldShowCompanyName(true);
                company.marker.setVisible(true);
                checkShow = true;
            }
        });

        if (checkShow === false) {
            //show no match message
            this.noMatchMessage("Sorry, No Match found...");
        }
    };

    //=========================
    //company info observables
    this.companyName = ko.observable();
    this.companyAddress = ko.observable();
    this.companyEmployment = ko.observable();
    this.googlePhotoURL = ko.observable();
    this.shouldShowPhoto = ko.observable(true);
    this.shouldShowAttr = ko.observable(true);
    this.googlePhone = ko.observable();
    this.googleRating = ko.observable();
    this.googleWebsite = ko.observable();
    this.shouldShowWebsite = ko.observable(true);
    this.googleAttributionArray = ko.observableArray([]);

    //job list observables
    this.jobListTitle = ko.observable();
    this.jobResultArray = ko.observableArray([]);

    //function to create Company info card
    //this function is used in marker/list click event
    this.createCompanyInfoSection = function(company) {
        //create title section
        this.companyName(company.name);
        this.companyAddress("Address: " + company.headquarterAddress);
        this.companyEmployment("Employment: " + company.employment);
    };

    //function to create job list section
    //this function is used in marker/list click event
    this.createJobDetailSection = function(company) {
        //insert title for job list section
        this.jobListTitle("Jobs in " + company.name);
    };

    //================================================
    //mouseover/mouseout list to trigger marker events
    this.enableInfowindow = function(company) {
        triggerMarkerMouseover(company);
    };
    this.disableInfowindow = function(company) {
        triggerMarkerMouseout(company);
    };

    //=========================
    //show all the list/marker
    //this function is attacted to viewModel
    this.showAllListAndMarker = function() {
        //set the value of search box to be blank
        this.companySearch("");
        //show company list
        this.shouldShowCompanyList(true);
        //reset map to initial bounds
        resetMap();
        //clean no match message
        this.noMatchMessage("");
        //reset show job button to its original status(text and visibility)
        this.shouldShowButton(false);
        this.jobButtonName("Show Jobs");
        //hide company info section
        this.shouldShowCompanyInfo(false);
        //hide job list section
        this.shouldShowJobList(false);

        //this shows the list/markers
        this.companyArray().forEach(function(company) {
            //show all the lists
            company.shouldShowCompanyName(true);
            //show all the markers
            // company.marker.setMap(map);
            company.marker.setVisible(true);
        });
    };

    //hide all the list/marker
    //use in marker click event/showDetail function
    this.hideAllListAndMarker = function() {
        //clean no match message
        this.noMatchMessage("");

        this.companyArray().forEach(function(company) {
            //hide all the lists
            company.shouldShowCompanyName(false);
            //hide all the markers
            // company.marker.setMap(null);
            company.marker.setVisible(false);
        });
    };

    //click on the list to show its detail information
    //trigger marker click event to achieve
    this.showDetail = function(company) {
        //trigger click event for marker
        triggerMarkerClick(company);
    };

    //=====================================
    //control button to show/hide job lists
    //set the initial status of button text and visibility
    this.shouldShowButton = ko.observable(false);
    this.jobButtonName = ko.observable("Show Jobs");
    //add toggle function to the button
    this.toggleJobList = function(company) {
        if (this.jobButtonName() === "Show Jobs") {
            this.shouldShowJobList(true);
            this.jobButtonName("Hide Jobs");
        } else {
            this.shouldShowJobList(false);
            this.jobButtonName("Show Jobs");
        }
    };

    //=========================================
    //Map view/list view change button function
    //set and store the initial button name
    this.viewButtonName = ko.observable("List/Info View");
    this.changeViews = function() {
        if (this.viewButtonName() === "Map View") {
            $(".list-view").hide();
            $(".map-view").show();
            this.viewButtonName("List/Info View");
        } else {
            $(".list-view").show();
            $(".map-view").hide();
            this.viewButtonName("Map View");
        }
    };
}

var viewModel = new AppViewModel();

// Activates knockout.js
ko.applyBindings(viewModel);