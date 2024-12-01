//AIzaSyCjHNvWNz9T4aNtV7pQah_zIrzWCv6abJs
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyInputContainer = document.getElementById("apiKeyInputContainer");

  const birthYearInput = document.getElementById("birthYear");
  const birthMonthInput = document.getElementById("birthMonth");
  const birthDayInput = document.getElementById("birthDay");
  const saveBirthdayBtn = document.getElementById("saveBirthdayBtn");
  const birthdayContainer = document.getElementById("birthdayContainer");

  const userInput = document.getElementById("userInput");
  const submitBtn = document.getElementById("submitBtn");
  const questionContainer = document.getElementById("questionContainer");

  const responseDiv = document.getElementById("response");

  // Check if API key and birthday are stored
  chrome.storage.sync.get(["apiKey", "birthday"], (data) => {
    if (!data.apiKey) {
      // Show API key input if not saved
      apiKeyInputContainer.style.display = "block";
    } else if (!data.birthday) {
      // Show birthday input if not saved
      birthdayContainer.style.display = "block";
    } else {
      // Show question container if all data is saved
      questionContainer.style.display = "block";
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
      questionContainer.style.display = "block";
    });
  });

  // Submit Question
  submitBtn.addEventListener("click", async () => {
    const question = userInput.value.trim();
    if (!question) {
      alert("질문을 입력해주세요.");
      return;
    }

    // Retrieve API key and birthday from storage
    chrome.storage.sync.get(["apiKey", "birthday"], async (data) => {
      const apiKey = data.apiKey;
      const birthday = data.birthday;

      if (!apiKey || !birthday) {
        alert("API 키와 생일 정보가 모두 설정되어야 합니다.");
        return;
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      responseDiv.textContent = "질문을 처리 중입니다...";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: {
              role: "user",
              parts: [
                {
                  text: `사용자의 생일은 ${birthday.year}년 ${birthday.month}월 ${birthday.day}일입니다. 질문: ${question}`,
                },
              ],
            },
            generationConfig: {
              maxOutputTokens: 150,
            },
          }),
        });

        const data = await response.json();
        if (
          data &&
          data.candidates &&
          data.candidates[0].content.parts[0].text
        ) {
          responseDiv.textContent = data.candidates[0].content.parts[0].text;
        } else {
          responseDiv.textContent = "응답을 받을 수 없습니다.";
        }
      } catch (error) {
        console.error("에러 발생:", error);
        responseDiv.textContent = "응답을 가져오는 중 오류가 발생했습니다.";
      }
    });
  });
});
