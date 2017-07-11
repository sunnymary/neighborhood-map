
var companyList = [
    {
        "name": "AMR/American Airlines",
        "location": "Fort Worth",
        "employment": 25000,
        "headquaterAddress": "4255 Amon Carter Blvd, Fort Worth, TX 76155"
    },
    {
        "name": "GameStop",
        "location": "Grapevine",
        "employment": 20000,
        "headquaterAddress": "625 Westport Pkwy, Grapevine, TX 76051"
    },
    {
        "name": "Lockheed Martin",
        "location": "Fort Worth",
        "employment": 13690,
        "headquaterAddress": "1 Lockheed Boulevard, Fort Worth, TX 76108"
    },
    {
        "name": "NAS - Fort Worth - JRB",
        "location": "Fort Worth",
        "employment": 10000,
        "headquaterAddress": "1510 Chennault Ave, Fort Worth, TX 76113"
    },
    {
        "name": "Sabre",
        "location": "Southlake",
        "employment": 9100,
        "headquaterAddress": "3150 Sabre Dr, Southlake, TX 76092"
    }
]

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


    this.firstName = ko.observable("Bert");
    this.lastName = ko.observable("Bertington");
    this.fullName = ko.computed(function(){
        return this.firstName() + " " + this.lastName();
    }, this);
    this.capitalizeLastName = function(){
        var currentVal = this.lastName();
        this.lastName(currentVal.toUpperCase());
    };
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());

