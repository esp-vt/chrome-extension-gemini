//AIzaSyCjHNvWNz9T4aNtV7pQah_zIrzWCv6abJs
document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyInputContainer = document.getElementById("apiKeyInputContainer");
  const questionContainer = document.getElementById("questionContainer");
  const submitBtn = document.getElementById("submitBtn");
  const responseDiv = document.getElementById("response");

  // Check if API key is stored
  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey) {
      // If API key exists, hide API key input and show question input
      apiKeyInputContainer.style.display = "none";
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
      questionContainer.style.display = "block";
    });
  });

  // Submit Question
  submitBtn.addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) {
      alert("질문을 입력해주세요.");
      return;
    }

    // Retrieve API key from storage
    chrome.storage.sync.get("apiKey", async (data) => {
      const apiKey = data.apiKey;
      if (!apiKey) {
        alert("API 키가 설정되지 않았습니다.");
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
                  text: userInput,
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
