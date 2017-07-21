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
    //use a constructor to create a new map JS object.
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
    }

    //show all the list/marker
    //this function is attacted to viewModel
    this.showAllList = function(){
        this.companyArray().forEach(function(company){
            //show all the lists
            company.shouldShowMessage(true);
            //show all the markers
            company.marker.setMap(map);
        });
    }
}

var viewModel = new AppViewModel();

// Activates knockout.js
ko.applyBindings(viewModel);