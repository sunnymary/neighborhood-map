
// function to initialize the map
function initMap() {
  //store the center point in a variable
  var fortWorth = {lat: 32.7554883, lng: -97.3307658};
  //use a constructor to create a new map JS object.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: fortWorth
  });

  //map(javascript method) the companyList to show them as markers on the map
  var markers = companyList.map(function(company){
    return new google.maps.Marker({
      position: company,
      map: map
    });
  });
}