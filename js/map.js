var bank = [
  {
  "name" : "Capital One Bank",
  "location" : "10700 Capitol One Way, Glen Allen, VA 23060"
  },
  {
  "name" : "Wells Fargo Bank",
  "location" : "11290 Nuckols Road, Glen Allen, VA 23060"
  },
  {
  "name" : "SunTrust Bank",
  "location" : "10170 Brook Road, Glen Allen, VA 23059"
  },
  {
  "name" : "Bank Of America",
  "location" : "3901 Stillman Parkway, Glen Allen, VA 23060"
  },
  {
  "name" : "BB&T",
  "location" : "10000 West Broad Street, Glen Allen, VA 23060"
  },
  {
  "name" : "Union First Market Bank",
  "location" : "10250 Staples Mill Road, Glen Allen, VA 23060"
  },
]

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