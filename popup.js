document.getElementById("submitBtn").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) {
    alert("질문을 입력해주세요.");
    return;
  }
  const apiKey = "YOUR_API_KEY";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
      document.getElementById("response").innerText =
        data.candidates[0].content.parts[0].text;
    } else {
      document.getElementById("response").innerText =
        "응답을 받을 수 없습니다.";
    }
  } catch (error) {
    console.error("에러 발생:", error);
    document.getElementById("response").innerText =
      "응답을 가져오는 중 오류가 발생했습니다.";
  }
});
