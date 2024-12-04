//
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyInputContainer = document.getElementById("apiKeyInputContainer");

  const birthYearInput = document.getElementById("birthYear");
  const birthMonthInput = document.getElementById("birthMonth");
  const birthDayInput = document.getElementById("birthDay");
  const saveBirthdayBtn = document.getElementById("saveBirthdayBtn");
  const birthdayContainer = document.getElementById("birthdayContainer");

  const resultContainer = document.getElementById("resultContainer");
  const horoscopeElement = document.getElementById("horoscope");
  const weatherElement = document.getElementById("weather");
  const quoteElement = document.getElementById("quote");

// 위치 정보 가져오기 실패 처리
function showError(error) {
  switch (error.code) {
      case error.PERMISSION_DENIED:
          document.getElementById("weather").innerHTML = "User denied the request for Geolocation.";
          break;
      case error.POSITION_UNAVAILABLE:
          document.getElementById("weather").innerHTML = "Location information is unavailable.";
          break;
      case error.TIMEOUT:
          document.getElementById("weather").innerHTML = "The request to get user location timed out.";
          break;
      case error.UNKNOWN_ERROR:
          document.getElementById("weather").innerHTML = "An unknown error occurred.";
          break;
  }
}

  // Zodiac Sign Calculation
  function getZodiacSign(month, day) {
    const zodiacSigns = [
      { sign: "Capricorn", start: "01-01", end: "01-19" },
      { sign: "Aquarius", start: "01-20", end: "02-18" },
      { sign: "Pisces", start: "02-19", end: "03-20" },
      { sign: "Aries", start: "03-21", end: "04-19" },
      { sign: "Taurus", start: "04-20", end: "05-20" },
      { sign: "Gemini", start: "05-21", end: "06-20" },
      { sign: "Cancer", start: "06-21", end: "07-22" },
      { sign: "Leo", start: "07-23", end: "08-22" },
      { sign: "Virgo", start: "08-23", end: "09-22" },
      { sign: "Libra", start: "09-23", end: "10-22" },
      { sign: "Scorpio", start: "10-23", end: "11-21" },
      { sign: "Sagittarius", start: "11-22", end: "12-21" },
      { sign: "Capricorn", start: "12-22", end: "12-31" },
    ];

    const formattedDate = `${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    for (const zodiac of zodiacSigns) {
      if (formattedDate >= zodiac.start && formattedDate <= zodiac.end) {
        return zodiac.sign;
      }
    }
    return null;
  }

  // Check if API key and birthday are stored
  chrome.storage.sync.get(["apiKey", "birthday"], (data) => {
    if (!data.apiKey) {
      apiKeyInputContainer.style.display = "block";
    } else if (!data.birthday) {
      birthdayContainer.style.display = "block";
    } else {
      // Fetch today's horoscope, weather, and quote
      const birthday = data.birthday;
      const zodiacSign = getZodiacSign(birthday.month, birthday.day);
      fetchResults(data.apiKey, zodiacSign);
    }
  });

  // Save API Key
  saveApiKeyBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert("API 키를 입력해주세요.");
      return;
    }
    chrome.storage.sync.set({ apiKey }, () => {
      alert("API 키가 저장되었습니다!");
      apiKeyInputContainer.style.display = "none";
      birthdayContainer.style.display = "block";
    });
  });

  // Save Birthday
  saveBirthdayBtn.addEventListener("click", () => {
    const birthYear = birthYearInput.value.trim();
    const birthMonth = birthMonthInput.value.trim();
    const birthDay = birthDayInput.value.trim();

    if (!birthYear || !birthMonth || !birthDay) {
      alert("출생 연도, 월, 일을 모두 입력해주세요.");
      return;
    }

    const birthday = { year: birthYear, month: birthMonth, day: birthDay };
    chrome.storage.sync.set({ birthday }, () => {
      alert("생일이 저장되었습니다!");
      birthdayContainer.style.display = "none";

      const zodiacSign = getZodiacSign(birthMonth, birthDay);
      chrome.storage.sync.get("apiKey", (data) => {
        if (data.apiKey) {
          fetchResults(data.apiKey, zodiacSign);
        }
      });
    });
  });

  // Fetch today's results
  async function fetchResults(apiKey, zodiacSign) {
    if (!zodiacSign) {
      alert("유효하지 않은 생일입니다.");
      return;
    }

    resultContainer.style.display = "block";
    horoscopeElement.textContent = "운세를 가져오는 중...";
    weatherElement.textContent = "날씨를 가져오는 중...";
    quoteElement.textContent = "명언을 가져오는 중...";
    try {
      // Fetch Horoscope
      const horoscopeResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: {
              role: "user",
              parts: [
                {
                  text: `당신은 훌륭한 점성술사입니다. 당신은 모든 점성술에 능하며 매일의 운세를 알려주는 역할을 합니다. 오늘의 ${zodiacSign} 운세를 알려주세요.`,
                },
              ],
            },
            generationConfig: {
              maxOutputTokens: 100,
            },
          }),
        }
      );
      const horoscopeData = await horoscopeResponse.json();
      horoscopeElement.textContent =
        horoscopeData.candidates?.[0]?.content.parts[0]?.text ||
        "운세를 가져올 수 없습니다.";

      // Fetch Weather
      getLocation(); // Fetch the weather based on location
      //
      // Weather Functions
  const API_KEY = 'a8103c3ccfec81daceab535bd4b3c839'; // OpenWeatherMap API Key

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getWeather, showError);
    } else {
      weatherElement.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  function getWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const location = data.name;
        const celsiusTemperature = Number(data.main.temp) - 273.15; // Convert to Celsius
        const fahrenheitTemperature = (celsiusTemperature * 1.8) + 32; // Convert to Fahrenheit
        const formattedTemperature = fahrenheitTemperature.toFixed(2);
        const weatherDescription = data.weather[0].description;
        const icon = data.weather[0].icon;

        weatherElement.innerHTML = `
          <h2>${location}</h2>
          <p><img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDescription}"></p>
          <p>Temperature: ${formattedTemperature}°F</p>
          <p>Condition: ${weatherDescription}</p>
        `;
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        weatherElement.innerHTML = "Unable to fetch weather data.";
      });
  }
      
      // Fetch Quote
      const quoteResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: {
              role: "user",
              parts: [
                {
                  text: `당신은 격려의 조언과 명언을 제대로 전달합니다. 무조건 명언과 출처만 전달합니다. 예를 들어 "실패는 성공의 어머니이다." - 에디슨. 이렇게 작성해 줘. 오늘의 ${zodiacSign}에게 필요한 명언을 알려주세요.`,
                },
              ],
            },
            generationConfig: {
              maxOutputTokens: 100,
            },
          }),
        }
      );
      const quoteData = await quoteResponse.json();
      quoteElement.textContent =
      quoteData.candidates?.[0]?.content.parts[0]?.text ||
        "날씨를 가져올 수 없습니다.";

    } catch (error) {
      console.error("Error fetching results:", error);
    }
  }
});
