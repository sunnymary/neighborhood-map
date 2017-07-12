
// function to initialize the map
function initMap() {
  //store the center point in a variable
  var fortWorth = {lat: 32.7554883, lng: -97.3307658};
  //use a constructor to create a new map JS object.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: fortWorth
  });

  // var marker = new google.maps.Marker({
  //   position:
  //   map: map
  // });
}