
// function to initialize the map
function initMap() {
  //store the center point in a variable
  var fortWorth = {lat: 32.7554883, lng: -97.3307658};
  //use a constructor to create a new map JS object.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: fortWorth
  });

  //loop through companyList to create marker&infowindow
  companyList.forEach(function(company){
    var contentString =
      '<h4>'+ company.name +'</h4>'+
      '<p>employment:' + company.employment + '</p>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    var marker = new google.maps.Marker({
      position: company,
      map: map
    });

    //add method to open/close infowindow
    marker.addListener('mouseover', function() {
      infowindow.open(map, marker);
    });
    marker.addListener('mouseout', function() {
      infowindow.close(map, marker);
    });
  });

}