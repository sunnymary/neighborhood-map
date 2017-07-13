var data = [
  {
    "name": "AMR/American Airlines",
    "location": "Fort Worth",
    "employment": 25000,
    "headquarterAddress": "4255 Amon Carter Blvd, Fort Worth, TX 76155"
  },
  {
    "name": "GameStop",
    "location": "Grapevine",
    "employment": 20000,
    "headquarterAddress": "625 Westport Pkwy, Grapevine, TX 76051"
  }
]

function geocodeAddress(data){
    var address = data[0].headquarterAddress;
    var geocoderRequestLink = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDNAFe7q02E2UM1muRwckmBaNg7bheFr_o";

    var geoLocation = "abc"
    data[0].geoLocation = geoLocation;
    return data;
}

geocodeAddress(data);