var html = document.getElementById("html");
var locationDisplay = document.getElementById("location");
var temp = document.getElementById("current_temp");
var summary = document.getElementById("summary");
var output = document.getElementById("out");
var weatherIcon = document.getElementById("icon");
var city = document.getElementById("city");
var time = document.getElementById("time");
var searchIcon = document.getElementById("search-icon");
var searchForm = document.getElementById("search-form");
var closeButton = document.getElementById("close");
var searchDiv = document.getElementById("search-div");
var dailyForecastTable = document.getElementById("daily-forecast");
var responseIcon;
var icons = { "clear-day" : "B", 
            "clear-night" : "C", 
            "rain" : "R", 
            "snow" : "G", 
            "sleet" : "X", 
            "wind" : "S", 
            "fog" :"N", 
            "cloudy" : "Y",
            "partly-cloudy-day" : "H", 
            "partly-cloudy-night" : "I"
          };
var weekDays = {
              0: "Sunday",
              1: "Monday",
              2: "Tuesday",
              3: "Wednesday",
              4: "Thursday",
              5: "Friday",
              6: "Saturday",
              7: "Sunday"
            };

// cut off decimal from temperature string
function formatTemp(temperature) {
  return Math.round(temperature);
}

// Handle JSONP response from forecast.io
function parseResponse(response) {
  var unformattedTemp = response.currently.temperature;
  var formattedTemp = formatTemp(unformattedTemp);
  temp.innerHTML = formattedTemp + "&#176;F";
  summary.innerHTML = response.currently.summary;
  responseIcon = response.currently.icon;
  weatherIcon.setAttribute('data-icon', icons[responseIcon]);
  // create and append daily forecast table 
  var forecastList = response.daily.data;
  forecastList.forEach(function(day, i) {
    var timeStamp = new Date(day.time * 1000);
    var dayName = weekDays[timeStamp.getDay()];
    var tableRow = document.createElement('tr');
    var dayCell =  document.createElement('td');
    var iconCell = document.createElement('td');
    var highCell = document.createElement('td');
    var lowCell = document.createElement('td');
    dayCell.innerHTML = dayName;
    iconCell.setAttribute('data-icon', icons[day.icon]);
    iconCell.setAttribute('class', 'forecast-icon');
    highCell.innerHTML = formatTemp(day.temperatureMax) + "&#176;F";
    lowCell.innerHTML = formatTemp(day.temperatureMin) + "&#176;F";
    tableRow.appendChild(dayCell);
    tableRow.appendChild(iconCell);
    tableRow.appendChild(highCell);
    tableRow.appendChild(lowCell);
    dailyForecastTable.appendChild(tableRow);
  });
}

// JSONP request to forecast.io
function requestForecast(latitude, longitude) {
  var url = "https://api.forecast.io/forecast/1cf8712c70131073e00c15e5380852cd/" + latitude + "," + longitude + "?callback=parseResponse";
  var script = document.createElement('script');
  script.setAttribute('src', url);

  document.getElementsByTagName('head')[0].appendChild(script);
}

// Request image from flickr api
function getBackground(latitude, longitude) {
  var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=bb36c5c8725d730ec9591a6dc0dba95d&group_id=1463451%40N25&lat=" + latitude + "&lon=" + longitude + "&extras=url_o&format=json";
  var script = document.createElement('script');
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function pickDefaultPicture() {
  var backgroundPictures = { "clear-day" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/clear_d-e618500.jpg", 
            "clear-night" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/clear_n-e618500.jpg", 
            "rain" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/rain_d-e618500.jpg", 
            "snow" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/snow_d-e618500.jpg", 
            "sleet" : "https://i.ytimg.com/vi/AhBFanbd6Ng/maxresdefault.jpg", 
            "wind" : "http://www.iea.org/media/pams/rewebsites/wind.jpg", 
            "fog" :"https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/foggy_d-e618500.jpg", 
            "cloudy" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/cloudy_n-e618500.jpg",
            "partly-cloudy-day" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/cloudy_d-e618500.jpg", 
            "partly-cloudy-night" : "https://s.yimg.com/os/mit/media/m/weather/images/fallbacks/lead/cloudy_n-e618500.jpg"
          };
  return backgroundPictures[responseIcon];
}

// Handle flickr response to set background image
function jsonFlickrApi(data) {
  var photoUrl;
  var photoArray = data.photos.photo;
  var photoIndex = randomInteger(0, photoArray.length-1);
  while (photoUrl === undefined && photoArray.length > 0) {
    photoIndex = randomInteger(0, photoArray.length-1);
    photoUrl = photoArray[photoIndex]["url_o"];
  }
  if (photoUrl === undefined) {
    photoUrl = pickDefaultPicture();
  }
  html.style.background = 'url(' + photoUrl + ') no-repeat center center/cover fixed';
}

(function currentTime() {
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var timeOfDay = '';

  if (hour >= 12 ) {
    timeOfDay = 'PM';
  } else {
    timeOfDay = 'AM';
  }

  if (hour > 12) {
    hour -= 12;
    hour = hour.toString();
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  if (hour === 0) {
    hour = 1;
  }

  var formattedTime = hour + ":" + minutes + timeOfDay;
  time.innerHTML = formattedTime;

  setTimeout(currentTime, 30000);
})();

// Find forecast for current location
(function geoLocate() {
  if (!navigator.geolocation) {
    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
    return;
  }

  city.innerHTML = "<p>Locating...</p>";

  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    findCityName(latitude, longitude);
    requestForecast(latitude, longitude);
    getBackground(latitude, longitude);
  }

  function error() {
    output.innerHTML = "Unable to retrieve your location";
  }

  navigator.geolocation.getCurrentPosition(success, error);
})();

// CORS Request to geocod.io to find current city name by coordinates
function findCityName(latitude, longitude) {
  var xhr = new XMLHttpRequest();
  var url = "https://api.geocod.io/v1/reverse?q=" + latitude + "," + longitude + "&api_key=85398294409f986452468553469f70f38428948";
  xhr.open('GET', url);
  xhr.onload = function() {
    var searchResponse = JSON.parse(xhr.response);
    city.innerHTML = searchResponse.results[0].address_components.city;
  };
  xhr.send();
}

// Hide search form
function hideSearch() {
  searchForm.setAttribute('style', 'display:none');
  searchIcon.setAttribute('style', 'display:block');
  locationDisplay.setAttribute('style', 'display:inline');
  searchDiv.setAttribute('style', 'margin-top:-60px');
}

// Show search form
function showSearch() {
  searchForm.setAttribute('style', 'display:block');
  searchIcon.setAttribute('style', 'display:none');
  locationDisplay.setAttribute('style', 'display:none');
  searchDiv.setAttribute('style', 'margin-top:12px');
}


searchIcon.onclick = showSearch;
closeButton.onclick = hideSearch;

// CORS request to geocod.io to find coordinates by city name
function searchForecast(searchString, cityString) {
  var xhr = new XMLHttpRequest();
  var url = "https://api.geocod.io/v1/geocode?city=" + searchString + "&api_key=85398294409f986452468553469f70f38428948";
  xhr.open('GET', url);
  xhr.onload = function() {
    var searchResponse = JSON.parse(xhr.response);
    var latitude = searchResponse.results[0].location.lat;
    var longitude = searchResponse.results[0].location.lng;
    requestForecast(latitude, longitude);
    getBackground(latitude, longitude);
    city.innerHTML = cityString;
  };
  xhr.send();
}

// Submit search form
searchForm.addEventListener("submit", function(event) {
  while (dailyForecastTable.hasChildNodes()) {  // Remove forecast table if one exists
    dailyForecastTable.removeChild(dailyForecastTable.firstChild);
  }
  hideSearch();
  city.innerHTML = "Loading...";
  var cityString = searchForm.elements[0].value;
  var searchString = cityString.replace(/\s/g, "+");  // Format search box input for CORS request
  searchForecast(searchString, cityString);
  event.preventDefault();
});


