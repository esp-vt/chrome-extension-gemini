// popup.js

// 버튼 클릭 이벤트 리스너 설정
document.getElementById("submitBtn").addEventListener("click", async () => {
  // 사용자 입력값 가져오기
  const userInput = document.getElementById("userInput").value.trim();

  // 입력값이 비어있을 경우 알림
  if (!userInput) {
    alert("질문을 입력해주세요.");
    return;
  }

  // API 키 설정
  const apiKey = "AIzaSyCjHNvWNz9T4aNtV7pQah_zIrzWCv6abJs";

  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  //URL이 잘못 됐나?????

  try {
    // API 요청 보내기
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: userInput,
        maxTokens: 150,
      }),
    });

    // 응답 데이터 파싱
    const data = await response.json();

    // 응답 텍스트가 존재하면 화면에 표시
    if (data && data.text) {
      document.getElementById("response").innerText = data.text;
    } else {
      //텍스트가 없을 시 에러
      document.getElementById("response").innerText =
        "응답을 받을 수 없습니다.";
      //계속 이게 뜬단 말이죠....
    }
  } catch (error) {
    console.error("에러 발생:", error);
    document.getElementById("response").innerText =
      "응답을 가져오는 중 오류가 발생했습니다.";
  }
});
