/*
WHEN I open the weather dashboard
THEN I am presented with the last searched city forecast
*/

var api = '5b4ffa60539e06714e2f431edfcd0ba0';
var cityForm = $("#city-form");
var cityInfo = $(".city-info");
var cityInput = $("#city-input");
var futureForecast = $("#future-forecast");
var date = new Date();
var searchList = $(".search-list");

cityForm.on("submit", function(event) {
    event.preventDefault();
    city = cityInput.val();

    getWeather(city);
});

// current conditions for that city
function getWeather(thisCity) {
    var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + thisCity + '&appid=' + api;

    $.ajax({
        url,
        method: "GET",
        statusCode: {
            404: function() {
                cityInfo.empty();

                var cityName = $("<h2>");
                cityName.addClass("card-title");
                cityName.html('City not found - please try again.');
                cityInfo.append(cityName);
            }
        }
    }).then(function(response) {
        cityInfo.empty();

        // the city name, the date, and the corresponding emoji
        var cityName = $("<h2>");
        cityName.addClass("card-title");
        var city = response.name;
        var fullDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        var emoji = getEmoji(response.weather[0].id);
        cityName.html(city + ' ' + fullDate + ' ' + emoji);
        cityInfo.append(cityName);

        // the temperature, converted from kelvin to fahrenheit
        var temp = $("<p>");
        var tempCalc = parseInt(response.main.temp) * 9 / 5 - 459.67;
        temp.addClass("card-text");
        temp.html('Temperature: ' + tempCalc.toFixed(2) + '°F');
        cityInfo.append(temp);

        // the humidity
        var humidity = $("<p>");
        humidity.addClass("card-text");
        humidity.html('Humidity: ' + response.main.humidity + '%');
        cityInfo.append(humidity);
        
        // the wind speed
        var windSpeed = $("<p>");
        windSpeed.addClass("card-text");
        windSpeed.html('Wind Speed: ' + response.wind.speed + ' MPH');
        cityInfo.append(windSpeed);
        
        // the UV index - conditions are either favorable, moderate, or severe
        var uvEl = $("<p>");
        uvEl.addClass("card-text");
        uvEl.html('UV Index: ');
        cityInfo.append(uvEl);

        var uvSpan = $("<span>");
        uvSpan.addClass("badge badge-primary");
        var uvIndex = getUV(response.coord.lat, response.coord.lon);
        uvEl.append(uvSpan);
        
        addToSearchList(city);
        generateFutureForecast(city);
    });
}

// a 5-day forecast w/ conditions like temp and humidity
function generateFutureForecast(thisCity) {
    var url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + thisCity + '&appid=' + api;
    futureForecast.empty();
    $.ajax({
        url,
        method: "GET"
    }).then(function(res) {
        var titleRow = $("<div>");
        titleRow.addClass("row");
        futureForecast.append(titleRow);

        var forecastTitle = $("<h3>");
        forecastTitle.addClass("card-title");
        forecastTitle.html('5-Day Forecast:');
        titleRow.append(forecastTitle);
        
        var daysRow = $("<div>");
        daysRow.addClass("row card-text");
        futureForecast.append(daysRow);

        for (var i = 7; i < res.list.length; i += 8) {
            var dayCard = $("<div>");
            dayCard.addClass("card bg-future col-7 col-sm-6 col-md-6 col-lg-4");
            daysRow.append(dayCard);
            
            var dayContent = $("<div>");
            dayContent.addClass("card-body text-center");
            //dayContent.attr("style", "background-color: lightskyblue; color: white;");
            dayCard.append(dayContent);

            // the date
            var dayDate = $("<h5>");
            dayDate.addClass("card-title");
            // var fullDate = date.getMonth() + '/' + (date.getDate() + i + 1) + '/' + date.getFullYear();
            var fullDate = res.list[i].dt_txt;
            fullDate = fullDate.split(' ');
            dayDate.html(fullDate[0]);
            dayContent.append(dayDate);
            
            // an icon representation of weather conditions
            var dayEmoji = $("<p>");
            dayEmoji.addClass("card-text");
            var emoji = getEmoji(res.list[i].weather[0].id);
            dayEmoji.html(emoji);
            dayContent.append(dayEmoji);

            // the temperature, converted from kelvin to fahrenheit
            var temp = $("<p>");
            var tempCalc = parseInt(res.list[i].main.temp) * 9 / 5 - 459.67;
            temp.addClass("card-text");
            temp.html('Temp: ' + tempCalc.toFixed(2) + '°F');
            dayContent.append(temp);

            // the humidity
            var humidity = $("<p>");
            humidity.addClass("card-text");
            humidity.html('Humidity: ' + res.list[i].main.humidity + '%');
            dayContent.append(humidity);
        }
    })
}

function getUV(lat, lon) {
    var url = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=' + api;

    $.ajax({
        url,
        method: "GET",
        statusCode: {
            404: function() {
                $("span").html('n/a');
                $("span").addClass("badge-light");
            }
        }
    }).then(function(res) {
        var theUV = res.value;
        $("span").html(theUV);
        if (theUV < 3) {
            $("span").addClass("uv-low");
        } else if (theUV < 6) {
            $("span").addClass("uv-mod");
        } else if (theUV < 8) {
            $("span").addClass("uv-high");
        } else if (theUV < 11) {
            $("span").addClass("uv-vHigh");
        } else {
            $("span").addClass("uv-extreme");
        }
    });
}

// when the user clicks on a city in the search history, then they are presented w/ current and future conditions for that city
searchList.on("click", function(event) {
    getWeather($(event.target).data('city'));
});

// that city is added to the search history
function addToSearchList(thisCity) {
    var newCity = $("<li>");
    newCity.addClass("list-group-item");
    newCity.attr("data-city", thisCity);
    newCity.html(thisCity);

    searchList.prepend(newCity);
}

// display an icon representation of weather conditions
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