
//constructor function for one company
var Company = function(data){
    this.name = data.name;
    this.location = data.location;
    this.employment = data.employment;
    this.headquarterAddress = data.headquarterAddress;
    this.lat = data.lat;
    this.lng = data.lng;
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;
    this.companyArray = ko.observableArray([]);
    companyList.forEach(function(oneCompany){
        self.companyArray.push(new Company(oneCompany));
    });

    //click to show data
    this.enableInfowindow = function(company){
        new google.maps.event.trigger( company.marker, 'mouseover' );
    }
    this.disableInfowindow = function(company){
        new google.maps.event.trigger( company.marker, 'mouseout' );
    }

    // this.firstName = ko.observable("Bert");
    // this.lastName = ko.observable("Bertington");
    // this.fullName = ko.computed(function(){
    //     return this.firstName() + " " + this.lastName();
    // }, this);
    // this.capitalizeLastName = function(){
    //     var currentVal = this.lastName();
    //     this.lastName(currentVal.toUpperCase());
    // };
}

var appViewModel = new AppViewModel();

// Activates knockout.js
ko.applyBindings(appViewModel);

