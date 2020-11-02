/*
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history

WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index

WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe

WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity

WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city

WHEN I open the weather dashboard
THEN I am presented with the last searched city forecast
*/

var api = '5b4ffa60539e06714e2f431edfcd0ba0';
var city = '';
var cityForm = $("#city-form");
var cityInput = $("#city-input");
var cityName = $("#city-name");
var date = new Date();



cityForm.on("submit", function(event) {
    event.preventDefault();
    city = cityInput.val();

    getWeather(city);
});

function getWeather(thisCity) {
    var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + thisCity + '&appid=' + api;

    $.ajax({
        url,
        method: "GET",
        statusCode: {
            404: function() {
                cityName.html('City not found - please try again.');
            }
        }
    }).then(function(response) {
        var fullDate = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
        console.log(response.weather[0].id);
        cityName.html(response.name + ' ' + fullDate + ' ' + getEmoji(response.weather[0].id));
    });
}

function getEmoji(weatherId) {
    var id = parseInt(weatherId);
    // thunderstorm
    if (id >= 200 && id <= 232) {
        return '🌩️';
    
    // drizzle
    } else if ((id >= 300 && id <= 321) || (id >= 520 && id <= 531)) {
        return '🌧️';

    // rain
    } else if (id >= 500 && id <= 504) {
        return '🌦️';

    // snow
    } else if (id === 511 || (id >= 600 && id <= 622)) {
        return '❄️';

    // atmosphere
    } else if (id >= 701 && id <= 781) {
        return '🌫️';
    
    // clear
    } else if (id === 800) {
        return '☀️';
    
    // clouds
    } else if (id === 801) {
        return '⛅';

    // clouds
    } else if (id >= 802 && id <= 804) {
        return '☁️';
    }
}

/*
statusCode: {
    404: function() {
      alert( "page not found" );
    }
  }
success: function(returnData){
         var res = JSON.parse(returnData);
     },
     error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         alert('Error - ' + errorMessage);
     }
*/

/*
<div class="card" style="width: 18rem;">
  <ul class="list-group list-group-flush">
    <li class="list-group-item">Cras justo odio</li>
    <li class="list-group-item">Dapibus ac facilisis in</li>
    <li class="list-group-item">Vestibulum at eros</li>
  </ul>
</div>
*/