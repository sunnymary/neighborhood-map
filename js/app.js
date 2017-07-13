
//constructor function for one company
var Company = function(data){
    this.name = data.name;
    this.location = data.location;
    this.employment = data.employment;
    this.headquaterAddress = data.headquaterAddress;
};

// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    this.company1 = ko.observable(companyList[0].name);

    var self = this;
    this.companyArray = ko.observableArray([]);
    companyList.forEach(function(oneCompany){
        self.companyArray.push(new Company(oneCompany));
    });

    this.openInfowindowByClickListName = function(){

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

// Activates knockout.js
ko.applyBindings(new AppViewModel());

