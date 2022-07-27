	// JQuery element to link HTML
	var $temp = $("#temperature");
	var $humd = $("#humidity");
	var $wind = $("#wind-speed");
	var $feels = $("#feels-like");
	var $CityName = $("#city-name");
	var $forcastList = $("#forcast-list");
	var $historyList = $("#history");
	var $welcome = $(".welcomeContainer");
	var $errorMessage = $("#errorMessage");
	var $todayForecastContainer = $("#todayForecastContainer");
	var $historybox = $("#historybox");
	var $uvIndex = $("#index-uv");
	var $digitalClock = $("#DigitalCLOCK");
	var $greeting = $("#greeting");

		// OpenWeather API Key
		var apiKey = "e24a0294880f87d49bcf79296ca7e391";

		// Function to display values for humidity, wind speed, and feels like
		function handleSearchResult(response) {
			console.log(response);
			var temp = response.main.temp;
			var humidity = response.main.humidity;
			var speed = response.wind.speed;
			var feelsLike = response.main.feels_like;
			var cityName = response.name;
			var unixTime = response.dt * 1000;
			console.log("unix time", unixTime);
			// Displays the result for the following item
			$temp.html(Math.round(temp) + "<span class='temp'>&#8457; </span>");
			$humd.text("Humidity: " + humidity + "%");
			$wind.text("Wind Speed: " + speed + " mph");
			$feels.html("Feels like: " + Math.round(feelsLike) + " &#8457;");
	
			// Display name of searched city in forecast column
			$CityName.html(
				"<span class='messageCity'>Today's Forecast for </span>" +
					cityName +
					'<img class= "imgHeader" src="http://openweathermap.org/img/wn/' +
					response.weather[0].icon +
					'@2x.png"/>'
			);
	
			// UV Index API
			getUV(response.coord.lat, response.coord.lon, function (response) {
				$uvIndex.html('UV Index: <span id="uv">' + response.value + "</span>");
	
				console.log(response.value);
				if (response.value < 3) {
					//Low UV index
					$("#uv").addClass("uvLow");
				} else if (response.value > 2 || response.value < 6) {
					//Moderate UV index
					$("#uv").addClass("uvModerate");
				} else if (response.value === 6 || response.value === 7) {
					//High UV index
					$("#uv").addClass("uvHigh");
				} else if (response.value > 7 || response.value < 11) {
					//Very high UV index
					$("#uv").addClass("uvVeryHigh");
				} else {
					//Extreme UV index
					$("#uv").addClass("uvExtremelyHigh");
				}
			});
		}