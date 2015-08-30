var globals = {
    current_id : null,
    markers : [],
    latLngList : []
};

/* Marker Class */
var Marker = function(data, id, map) {

    var self = this;
    this.clickable = ko.observable(true);
    var latitude = data.businesses[obj].location.coordinate.latitude;
    var longitude = data.businesses[obj].location.coordinate.longitude;

    /* Get latitude and longitude then push to latLngList array */
    this.Latlng = new google.maps.LatLng(latitude, longitude);
    this.marker = new google.maps.Marker({ position : self.Latlng, map : map });
    globals.latLngList.push(new google.maps.LatLng(latitude, longitude));

    /* Assign marker id and add event listener */
    this.attachData = ko.computed(function() {

        self.id = id;
        google.maps.event.addListener(self.marker, 'click', function() {
        self.toggleBounce();
        /* Center to this marker */
        map.panTo(self.marker.position);
        /* Set global current id */
        globals.current_id = self.id;
        /* Get details of location passing its id */
        vm.setDetails(self.id);
        });
    });

    this.setAllMap = function(map) {

        for (marker in globals.markers) {
            globals.markers[marker].marker.setMap(map);
        }
    };

    this.removeMarkers = function() {
        self.setAllMap(null);
    };
};

var setMarker = function(data, map) {

    //console.log(data);
    /* Push each marker into markers array */
    for (obj in data.businesses) {
        globals.markers.push(new Marker(data, obj, map));
    }
    vm.fitAllBounds();
};

var viewModel = function() {

    var self = this;
    var map;
    var bounds;
    var currentID;
    var dataCache; // Use for getting details instead of reconnecting to Yelp
    var index = ko.observable(0);
    var koData = {
        name : ko.observable(),
        img : ko.observable(),
        phone : ko.observable(),
        rating_img_url : ko.observable(),
        review_count : ko.observable(),
        url : ko.observable(),
        address : ko.observable(),
        city : ko.observable(),
        state_code : ko.observable(),
        postal_code : ko.observable(),
        term : ko.observable(),
    }

    this.categories = ko.observableArray([]);
    this.categories.push('Banks');


    /* Page count for pagination */
    this.pageIndex = ko.observable(0);
    this.onPage = ko.observable(5);
    this.pages = ko.observable(5);

    /* OAuth - Retrieve from Yelp with the variable, terms. */
    this.getPlaces = function(term, map) {

        var auth = {

            consumerKey: "FkkDc_bfzRcY4bh5ckaSPQ",
            consumerSecret: "M-JWPZ3AXGHK8hD5Lyd0DV2v5ZY",
            accessToken: "o5f6Z7-Z8o9TKb7H76ikDJGkaMnbQMAO",
            accessTokenSecret: "he1ssPqWEuh-HOtbAQqiC8N8Xf4",
            serviceProvider: {
                signatureMethod: "HMAC-SHA1"
            }
        };

        var terms = term;
        var q = "";
        var inCategory = false;

        for (category in self.categories()) {
            if (self.categories()[category].toLowerCase() === terms.toLowerCase()) {
                inCategory = true;
                break;
            }
        }

        if (!inCategory) {
            q = '"';
        }

        if (term === "") {
            term = "Back";
            q = "";
        }

        koData.term(q+term+q);
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };
        parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', 23060]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

        index(0);
        self.pageIndex(0);
        self.onPage(5);

        $('#list-overlay').css('margin-top', '-550px');
        $('#back-overlay').css('margin-top', '-238px');
        $('#error-overlay').css('margin-top', '-45px');

        setTimeout(function() {

            $.ajax({
                url: message.action,
                data: parameterMap,
                cache: true,
                dataType: 'jsonp',
                jsonpCallback: 'cb',
                success: function(data, textStats, XMLHttpRequest) {

                    if (globals.markers.length) {
                        globals.current_id = null;
                        globals.markers[0].removeMarkers();
                        globals.markers = [];
                        $('#previous').hide();
                        $('#next').hide();
                        if (data.businesses.length > 5) {
                            $('#next').show();
                        }
                    }

                    if (data.businesses.length) {

                        /* Place markers to each location */
                        setMarker(data, map);
                        /* Set to number of results for pagination */
                        self.pages(20);
                        /* Clear then populate ul element "list" */
                        self.list(data);

                        $("#list-overlay").css("margin-top", "1px");

                    }else{
                        self.errorMessage("No results found.");
                    }
                },
                error: function() {
                    self.errorMessage("Could not load API. Try again later.");
                }
            });
        }, 1000);
    };

    /* initialize */
    var init = ko.computed(function() {

        /* Search form */
        $('#search-form').submit(function() {

            var term = $('#search').val();
            $("#select-category").val("");
            self.getPlaces(term, map);
            $('#search').val("");
            return false;
        });

        /* When li class item-place is clicked, set current id, get details, center to marker */
        $(document).on('click', '.item-place', function() {

            var id = $(this).attr("data");
            self.setDetails(id);
            globals.markers[id].toggleBounce(globals.markers[id]);
            globals.current_id = id;
            map.panTo(globals.markers[id].marker.position);
        });

        /* Selected Category */
        $(document).on('change', '#select-category', function(category) {
            self.getPlaces(category.currentTarget.selectedOptions[0].value, map);
        });

        /* Google Maps JavaScript API v3 */
        var myLatlng = new google.maps.LatLng(32.6829115, -96.8741051,12);
        var mapOptions = {
            center: myLatlng,
            zoom: 12
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        bounds = new google.maps.LatLngBounds();
    });

    /* Clear then populate ul element "list" */
    this.list = function(data) {

        dataCache = data;

        if (self.pages() + 5 > 5) {

            $('#list').empty(); // Clear ul element "list"

            /* Append places to ul element "list" */
            for (self.pageIndex(); self.pageIndex() < self.onPage(); self.pageIndex(self.pageIndex()+1)) {

                var categorySecondary = !("categories" in data.businesses[self.pageIndex()]) ? "" : " - " + data.businesses[self.pageIndex()].categories[0][0];
                var subtitle = data.businesses[self.pageIndex()].review_count + " reviews" + categorySecondary;

                var address = data.businesses[self.pageIndex()].location.address[0] + " " + data.businesses[self.pageIndex()].location.city + " " +
                data.businesses[self.pageIndex()].location.state_code + " " + data.businesses[self.pageIndex()].location.postal_code;

				var image = data.businesses[self.pageIndex()].image_url;
                if (image === undefined) {
                    image = '/front-end-nanodegree-neighborhood-map/img/no_image.png';
                }

                $('#list').append('<li class="item-place" data="'+index()+'">'+
                                       '<div class="list-thumbnail"><img src="'+image+'" width="100%"></div>'+
                                       '<h2>'+data.businesses[self.pageIndex()].name+'</h2>'+
                                       '<div class="list-subtitle"><span style="color: #ff6600;">'+data.businesses[self.pageIndex()].rating+'</span>'+
                                       '<img class="rating-img" src="'+data.businesses[self.pageIndex()].rating_img_url_small+'">'+
                                       '<span>'+subtitle+'</span></div>'+
                                       '<p class="list-info">'+data.businesses[self.pageIndex()].snippet_text+'<p class="list-address">'+address+'</p>'+
                                  '</li>');
                index(index()+1);
            }
            $('.item-place').fadeIn(500);
        }
    };

    /* Pagination next */
    this.next = function() {
        if (self.pages() + 5 > 5) {
            self.onPage(self.onPage()+5);
            self.pages(self.pages()-5);
            $('#previous').show();
        }
        if (self.pages() - 5 <= 0) {
            $('#next').hide();
        }
        $('.item-place').hide();
        self.list(dataCache);
        $('#list').scrollTop(0);
    };

    /* Pagination previous */
    this.previous = function() {
        self.pageIndex(self.pageIndex()-10);
        self.onPage(self.onPage()-5);
        self.pages(self.pages()+5);
        if (self.pageIndex() == 0) {
            $('#previous').hide();
        }
        if (self.pages() - 5 > 0) {
            $('#next').show();
        }
        $('.item-place').hide();
        index(index()-10);
        self.list(dataCache);
        $('#list').scrollTop(0);
    };

    /* Update details of chosen place */
    this.setDetails = function(id) {
        $('#list-overlay').css("margin-top", "-510px");
        setTimeout(function(){
            $('#back-overlay').css("margin-top", "1px");
        }, 1000);
        koData.name(dataCache.businesses[id].name);
        var image = dataCache.businesses[id].image_url;
        if (image === undefined) {
            image = '/front-end-nanodegree-neighborhood-map/img/no_image.png';
        }
        koData.img(image);
        koData.rating_img_url(dataCache.businesses[id].rating_img_url);
        koData.review_count(dataCache.businesses[id].review_count);
        koData.phone(dataCache.businesses[id].display_phone);
        koData.phone(dataCache.businesses[id].display_phone);
        koData.url(dataCache.businesses[id].url);
        koData.address(dataCache.businesses[id].location.address[0]);
        koData.city(dataCache.businesses[id].location.city);
        koData.state_code(dataCache.businesses[id].location.state_code);
        koData.postal_code(dataCache.businesses[id].location.postal_code);
    };

    /* Go back to place list */
    this.back = function() {
        $('#back-overlay').css("margin-top", "-238px");
        setTimeout(function(){
            $('#list-overlay').css("margin-top", "1px");
        }, 1000);
        self.fitAllBounds();
    };

    this.fitAllBounds = function() {
        if (globals.current_id) {
            globals.markers[globals.current_id].clickable(true);
            globals.markers[globals.current_id].marker.setAnimation(null);
		}
        for (i in globals.markers) {
            bounds.extend(globals.markers[i].marker.position);
        }
        map.fitBounds(bounds);
    };

    /* Update details */
    this.setName = ko.pureComputed(function() {
        return koData.name;
    });
    this.setImg = ko.pureComputed(function() {
        return koData.img;
    });
    this.setNumberReviews = ko.pureComputed(function() {
        var reviewNum = koData.review_count() > 1 ? " reviews" : " review";
        return koData.review_count() + reviewNum;
    });
    this.setReviewImg = ko.pureComputed(function() {
        return koData.rating_img_url;
    });
    this.setPhone = ko.pureComputed(function() {
        return koData.phone;
    });
    this.setURL = ko.pureComputed(function() {
        return koData.url;
    });
    this.setAddress = ko.pureComputed(function() {
        return koData.address;
    });
    this.setCity = ko.pureComputed(function() {
        return koData.city;
    });
    this.setState = ko.pureComputed(function() {
        return koData.state_code;
    });
    this.setPostal = ko.pureComputed(function() {
        return koData.postal_code;
    });
    this.setTerm = ko.pureComputed(function() {
        return koData.term;
    });
    this.errorMessage = function(message) {
        $('#error-overlay').text(message);
        $('#error-overlay').css('margin-top', '1px');
    }
}

var vm = new viewModel();

ko.applyBindings(vm);