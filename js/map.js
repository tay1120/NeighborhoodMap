var map;
function initialize() {

  var locations;
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(37.6616, -77.6267)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
};


  function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbCXLj3v6Z41i97C54y9w_CLuAYN8Pz0A' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;