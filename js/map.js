//Initiate Google Maps//
var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 16,
    center: new google.maps.LatLng(37.652510,-77.614619),
  disableDefaultUI: true
});

//Google Map error defined//
if (typeof google != ('object')) {
  $('#map-canvas').append("<h1>Unable to load the map. Please try again.</h1>");
}

//Add Info Window to map//
var infoWindow = new google.maps.InfoWindow({ content: "contentString" });


//Defined location variables for Map markers//
function mapPoint(name, type, lat, long, show, venueId) {
  'use strict';
  var self = this;
  self.name = name;
  self.type = type;
  self.show = ko.observable(show);
  self.venueId = venueId;
  self.lat = ko.observable(lat);
  self.long = ko.observable(long);
  self.latLng = new google.maps.LatLng(lat, long);

  self.marker = new google.maps.Marker({
    position: self.latLng,
    title: name,
    map: map,
    draggable: false
  });

  //Implements JSON to input location info via Info windows//
  self.openInfoWindow = function(){
    infoWindow.setContent("<div id='content'></div>");
    infoWindow.open(map,self.marker);
    //Implements marker animation when a location is clicked//
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){self.marker.setAnimation(null);}, 1400);
    getInfoWindowContent(self.marker);
  };

  google.maps.event.addListener(self.marker, 'click', self.openInfoWindow);

  self.updateShow = function(show){
    self.show(show);
    if(show){
      self.marker.setMap( map );
    }else{
      self.marker.setMap( null );
    }
  };


  //Initiate Foursquare JSON request//
  function getInfoWindowContent(){
    var $windowContent = $('#content');
    var foursquareUrl = 'https://api.foursquare.com/v2/venues/'+ venueId+
    '?client_id=CU4IM4HQF2OMOP1LRQ21FX2TQHX2GAUUHY5VJYZGAUX3YIFU'+
    '&client_secret=VJ3PCTKOCFFA4302RFK2CX2FYD0NS3BAEW1OGIMPNFBVXTKJ'+
    '&v=20130815';
    //Definied information requested from Foursquare JSON//
    $.getJSON(foursquareUrl, function(response) {
      var venue = response.response.venue;
        var venueName = venue.name;
        var address = venue.location.formattedAddress;
        var phone = venue.contact.formattedPhone;

        //Added error message to info window if information is not available for a specific location//
        if(venueName) {$windowContent.append('<p>' + venueName + '</p>');
       } else {
        $windowContent('<p> Unable to find location name</p>');
      }
        if(address) {$windowContent.append('<p>' + address + '</p>');
       } else {
          $windowContent.append('<p> address unlisted </p>');
        }
        if(phone) {$windowContent.append('<p>' + phone + '</p>');
       } else {
          $windowContent.append('<p> Phone number unlisted </p>');
        }

    }).error(function(e) {
      $windowContent.text('Oops! I think foursquare is not talking at this time.');
    });
  }
}

//Added View Model function//
function myViewModel() {
  'use strict';
  var self = this;
  //Defined locations and information via Map Point array//
  self.mapPoints = ko.observableArray([
        new mapPoint('Short Pump Town Center', 'Mall', 37.6562031,-77.6195394, true, '4adb637df964a520d52621e3'),
        new mapPoint('Tropical Smoothie Cafe', 'Restaurant', 37.641403,-77.6441381, true,'4b9fcefff964a5209f4037e3'),
        new mapPoint('Genghis Grill', 'Restaurant', 37.6537995,-77.623402, true, '503ba374e4b0c6f1942322d9'),
        new mapPoint('Bar Louie', 'Bar', 37.6548786,-77.6229067, true , '4adc9493f964a520842d21e3'),
        new mapPoint('Richmond Funny Bone Comedy Club & Restaurant', 'Bar', 37.6569158, -77.6197992, true, '4b5baac5f964a520c60e29e3'),
        new mapPoint('Regal Cinemas Short Pump 14 & IMAX', 'Entertainment', 37.653334,-77.613919, true, '4ada7814f964a520d72221e3'),
        new mapPoint('Dave & Busters', 'Entertainment', 37.648689,-77.604355, true, '4b5ce3d4f964a5208d4929e3'),
        new mapPoint('Bonefish Grill', 'Restaurant', 37.649016,-77.602475, true, '4ee93b5cd3e3a60af2a1b629'),
        new mapPoint('Anokha Cuisine Of India', 'Restaurant', 37.6513807,-77.6212882, true, '4b638a54f964a52003822ae3'),
        new mapPoint('Bowl America', 'Entertainment', 37.6566072,-77.6132862, true, '4aff64bdf964a5201f3822e3'),
        new mapPoint('SkateNation Plus', 'Entertainment', 37.6551323,-77.6138216, true, '4b3a7c09f964a5205e6825e3'),
        new mapPoint('Peter Changs China Cafe', 'Restaurant', 37.653137,-77.608441, true, '4f32b1bee4b08a0e6ed3fc55'),
        new mapPoint('Spirited Art', 'Entertainment', 37.6483963,-77.6019451, true, '4ec842576da1d1092f9165ec'),
        new mapPoint('Keagans Irish Pub & Restaurant', 'Bar', 37.6474516,-77.6018018, true, '4d76bacb882354814c4e6e8c'),
        new mapPoint('Short Pump Park', 'Park', 37.6474055,-77.6120835, true, '4bc3ae1274a9a59398edd4f6'),
        new mapPoint('Mexico Restaurant', 'Restaurant', 37.6518794, -77.6172758, true, '4b300985f964a520ddf424e3'),
        new mapPoint('Kona Grill', 'Entertainment', 37.6486302,-77.6003853, true, '4b566923f964a520410f28e3'),
        new mapPoint('Pour House', 'Restaurant', 37.6483608,-77.6166373, true, '4b566923f964a520410f28e3'),
        ]);

  self.filterText = ko.observable('');

  //Initiates Info Window when a location on the list is clicked//
  self.listClick = function(mapPoint) {
    mapPoint.openInfoWindow();
  };

  //Show/hide markers when map locations are filtered//
  self.filterMapPoints = ko.computed(function() {
    var filterTextClean = self.filterText().toLowerCase();

    for (var i=0; i < self.mapPoints().length; i++) {
      if(self.mapPoints()[i].name.toLowerCase().indexOf(filterTextClean) !== -1){
        self.mapPoints()[i].updateShow(true);
      }else{
        self.mapPoints()[i].updateShow(false);
      }
    }
  }, myViewModel);
}

ko.applyBindings(new myViewModel());