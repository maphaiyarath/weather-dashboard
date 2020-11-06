var api = '5b4ffa60539e06714e2f431edfcd0ba0';
var cities = [];
var cityForm = $("#city-form");
var cityInfo = $(".city-info");
var cityInput = $("#city-input");
var futureForecast = $("#future-forecast");
var date = new Date();
var searchList = $(".search-list");

// WHEN I search for a city
cityForm.on("submit", function(event) {
    event.preventDefault();
    city = cityInput.val().trim();
    
    // THEN I am presented with current and future conditions for that city
    getWeather(city);
    cityInput.val('');
});

// WHEN I view current weather conditions for that city
function getWeather(thisCity) {
    var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + thisCity + '&appid=' + api;

    $.ajax({
        url,
        method: "GET",
        statusCode: {
            404: function() {
                cityInfo.empty();
                futureForecast.empty();

                var cityName = $("<h2>");
                cityName.addClass("card-title");
                cityName.html('City not found - please try again.');
                cityInfo.append(cityName);
            }
        }
    }).then(function(response) {
        cityInfo.empty();

        // the city name, the date, and an icon representation of weather conditions
        var cityName = $("<h2>");
        cityName.addClass("card-title");
        var city = response.name;
        var fullDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        var emoji = getEmoji(response.weather[0].id);
        cityName.html(city + ' (' + fullDate + ') ' + emoji);
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
        
        if (!cities.includes(city)) {
            addToSearchList(city);
        }
        
        generateFutureForecast(city);
    });
}

// WHEN I view future weather conditions for that city, THEN I am presented with a 5-day forecast
function generateFutureForecast(thisCity) {
    var url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + thisCity + '&appid=' + api;
    futureForecast.empty();
    $.ajax({
        url,
        method: "GET"
    }).then(function(res) {
        var forecastTitle = $("<h3>");
        forecastTitle.addClass("card-title");
        forecastTitle.html('5-Day Forecast:');
        futureForecast.append(forecastTitle);

        var deck = $("<div>");
        deck.addClass("row no-gutters justify-content-start");
        futureForecast.append(deck);
        
        for (var i = 7; i < res.list.length; i += 8) {
            var dayCard = $("<div>");
            dayCard.addClass("card bg-future");
            dayCard.attr("style", "width: 155px;");
            deck.append(dayCard);
            
            var dayContent = $("<div>");
            dayContent.addClass("card-body text-center");
            dayCard.append(dayContent);

            // the date
            var dayDate = $("<h5>");
            dayDate.addClass("card-title");
            var fullDate = res.list[i].dt_txt;
            fullDate = fullDate.split(' ');
            fullDate = fullDate[0].split('-');
            dayDate.html(fullDate[1] + '/' + fullDate[2] + '/' + fullDate[0]);
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

// WHEN I view the UV index, THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
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

// WHEN I click on a city in the search history, THEN I am again presented with current and future conditions for that city
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

    cities.push(thisCity);
    
    localStorage.setItem('cities', JSON.stringify(cities));
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

// WHEN I open the weather dashboard, THEN I am presented with the last searched city forecast
function init() {
    var storedCities = JSON.parse(localStorage.getItem('cities'));

    if (storedCities !== null) {
        cities = storedCities;

        for (var i = 0; i < cities.length; i++) {
            var newCity = $("<li>");
            newCity.addClass("list-group-item");
            newCity.attr("data-city", cities[i]);
            newCity.html(cities[i]);
            searchList.prepend(newCity);
        }

        getWeather(cities[cities.length - 1]);
    }
}

init();