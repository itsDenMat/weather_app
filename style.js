function init() {
	// Variable to store all searched city
	var cityHistory = [];

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

	// Displays error message when city name entered does not match 
	function handleErrorResult(response) {
		console.log("here", response);
		$errorMessage.show();
		$errorMessage.text("City is not available. Please try again");
		$todayForecastContainer.hide();
		$historybox.hide();
	}

	// API call to get current weather
	function getCurrentWeather(cityName) {
		var queryURL =
			"https://api.openweathermap.org/data/2.5/weather?q=" +
			cityName +
			"&appid=" +
			apiKey +
			"&units=imperial";

		$.ajax({
			url: queryURL,
			method: "GET",
		}).then(handleSearchResult, handleErrorResult);
	}

	// API call to get 5 day forecast
	function get5DayForcast(cityName) {
		var url =
			"https://api.openweathermap.org/data/2.5/forecast?q=" +
			cityName +
			"&units=imperial&appid=" +
			apiKey;

		$.ajax({
			url: url,
			method: "GET",
		}).then(handleForcastResult);
	}

	// API call to get UV index
	function getUV(lat, lon, handleUVResult) {
		var url =
			"https://api.openweathermap.org/data/2.5/uvi?lat=" +
			lat +
			"&lon=" +
			lon +
			"&appid=" +
			apiKey;

		$.ajax({
			url: url,
			method: "GET",
		}).then(handleUVResult);
	}

	function handleForcastResult(response) {
		console.log("forecast result", response);

		var forcastBox = "";
		response.list.forEach(function (forcast) {
			if (forcast.dt_txt.indexOf("00:00:00") !== -1) {
				forcastBox +=
					"<div class='forcast'>" +
					new Date(forcast.dt * 1000).toLocaleDateString() +
					" <br/><img src='http://openweathermap.org/img/wn/" +
					forcast.weather[0].icon +
					"@2x.png'/>" +
					"<br>" +
					"Temp: " +
					forcast.main.temp +
					"&#8457;" +
					"<br>" +
					"Humidity: " +
					forcast.main.humidity +
					"%" +
					"</div>";
			}
		});

		$forcastList.html(forcastBox);
	}

	// Reloading previous city from local storage
	function loadRecentHistory() {
		// get data out of the local storage and set cityHistory
		var storage = localStorage.getItem("cityHistory");

		if (storage) {
			cityHistory = JSON.parse(storage);
			getCityWeater(cityHistory[cityHistory.length - 1]);

			var cityHtml = "";
			cityHistory.forEach(function (city) {
				cityHtml += "<li>" + city + "</li>";
			});
			$historyList.html(cityHtml);

			$historybox.show();
		}
	}

	function getCityWeater(cityName) {
		$errorMessage.hide();
		$welcome.empty();
		$todayForecastContainer.show();

		$welcome.hide();
		$forcastList.show();
		getCurrentWeather(cityName);
		get5DayForcast(cityName);
	}

	// Function to clear search history by clearing local storage
	function attachEvent() {
		$("#clear-history").on("click", function (event) {
			// clear local storage
			localStorage.clear("cityHistory");
			// update the UI city list
			$historyList.empty();
			cityHistory = [];
			$historybox.hide();
			$errorMessage.hide();
		});

		$historyList.on("click", "li", function (event) {
			getCityWeater($(this).text());
		});

		$("#search-button").on("click", function (event) {
			// Welcome message will be removed
			var cityName = $("#city-input").val().toLowerCase();

			console.log("what is cityName", cityName);

			// If search bar is left blank, error message will be displayed.
			if (cityName === "") {
				$errorMessage.show();
				$errorMessage.text("Please enter a city name.");
				$welcome.hide();
				$todayForecastContainer.hide();
				return;
			}

			// Reviewing if city name is in history
			if (cityHistory.indexOf(cityName) === -1) {
				$historyList.append("<li>" + cityName + "</li>");
				cityHistory.push(cityName);
			}
			// Store search name to local storage
			localStorage.setItem("cityHistory", JSON.stringify(cityHistory));

			// Checks if there is currently a list of history
			if (cityHistory.length > 0) {
				//Show history
				$historybox.show();
			}

			getCityWeater(cityName);
		});
	}

	// Change the WELCOME greeting to good morning, afternoon, or evening
	function getGreeting(hourNow, session) {
		if (session === "AM") {
			return "Good morning";
		} else {
			if (hourNow > 12 || hourNow < 7) {
				return "Good afternoon";
			}
			return "Good Evening";
		}
	}

	// Update time in left column/container
	function updateTime() {
		var currentTime = moment();
		var greeting = getGreeting(
			currentTime.format("hh"),
			currentTime.format("A")
		);

		//Update time with format requested
		$digitalClock.text(currentTime.format("hh:mm:ss A"));
		$greeting.text(greeting);
	}

	$(document).ready(function() {
		$.ajax({
			url: "https://api.nasa.gov/planetary/apod?api_key=gYo6aP2v2kURjJFrRdzO4eOvx79sGG3ngPwy2USO"
		}).then(function(data) {
			console.log(data.hdurl);
			$('#img').append('<img src="' + data.hdurl + '">');
			console.log(data.hdurl);
		});
	});
	
	// Display greeting and current time
	setInterval(updateTime, 1000);

	// Load recent search history
	loadRecentHistory();

	// Clear history event
	attachEvent();

}
$(init);