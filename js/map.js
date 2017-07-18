
// function to initialize the map
function initMap() {
  //store the center point in a variable
  var fortWorth = {lat: 32.7554883, lng: -97.3307658};
  //use a constructor to create a new map JS object.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: fortWorth
  });

  // //loop through companyList to create markers and store in markers variable
  // var markers = companyList.map(function(company){
  //   return new google.maps.Marker({
  //     position: company,
  //     map: map
  //   });
  // });

  // var infowindows = companyList.map(function(company){
  //   var contentString =
  //     '<h4>'+ company.name +'</h4>'+
  //     '<p>employment:' + company.employment + '</p>';

  //   return new google.maps.InfoWindow({
  //     content: contentString
  //   });
  // })

  // // markers[0].addListener('click', function() {
  // //     infowindows[0].open(map, markers[0]);
  // // });

  // //TODO: problem with event CLOSURE
  // for (var i = 0; i < markers.length; i++) {
  //   markers[i].addListener('click', function() {
  //     infowindows[i].open(map, markers[i]);
  //   }(i));
  // }



  this.markers = [];
  this.infowindows = [];


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
    appViewModel.companyArray()[i].marker = markers[i];
  }

}

