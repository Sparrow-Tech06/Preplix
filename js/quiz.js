document.addEventListener("DOMContentLoaded", () => {
  // 1. Extract dynamic ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');

  if (!targetId) {
    document.getElementById("quizTitle").innerText = "No Topic ID Provided!";
    document.getElementById("quizSubtitle").innerText = "Please go back and select a valid topic box.";
    return;
  }

  // 2. Fetch the corresponding JSON file securely
  fetch(`data/topic_${targetId}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`JSON file 'topic_${targetId}.json' not found!`);
      }
      return response.json();
    })
    .then(data => {
      // 3. Exact ID Matching Verification Check
      if (String(data.id) !== String(targetId)) {
        document.getElementById("quizTitle").innerText = "Security Mismatch Error!";
        document.getElementById("quizSubtitle").innerText = `URL ID (${targetId}) and JSON ID (${data.id}) do not match.`;
        return;
      }

      // Render data if matched successfully
      renderQuiz(data);
    })
    .catch(error => {
      console.error(error);
      document.getElementById("quizTitle").innerText = "Failed to Load Data";
      document.getElementById("quizSubtitle").innerText = "Please ensure the JSON file exists inside the 'data/' folder.";
    });
});

function renderQuiz(data) {
  document.getElementById("quizTitle").innerText = data.topicName;
  document.getElementById("quizSubtitle").innerHTML = `<span class="badge bg-success-subtle text-success">Verified Topic ID: ${data.id}</span>`;
  
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  data.questions.forEach((q, index) => {
    const questionCard = document.createElement("div");
    questionCard.className = "card quiz-card p-4 mb-4";

    let optionsHTML = "";
    q.options.forEach((option, optIdx) => {
      optionsHTML += `
        <button class="option-btn" onclick="checkAnswer(this, ${optIdx}, ${q.answer})">
          <span class="fw-bold me-2">${String.fromCharCode(65 + optIdx)}.</span> ${option}
        </button>
      `;
    });

    questionCard.innerHTML = `
      <h5 class="fw-semibold text-dark mb-3">Q${index + 1}: ${q.question}</h5>
      <div class="options-group">${optionsHTML}</div>
    `;

    container.appendChild(questionCard);
  });
}

function checkAnswer(button, selectedIdx, correctIdx) {
  const parentGroup = button.parentElement;
  const buttons = parentGroup.querySelectorAll(".option-btn");
  
  // Disable all buttons in this specific question card after single click
  buttons.forEach(btn => btn.disabled = true);

  if (selectedIdx === correctIdx) {
    button.classList.remove("border");
    button.classList.add("bg-success-subtle", "text-success", "border-success", "fw-bold");
    button.innerHTML += ` <i class="bi bi-check-circle-fill float-end"></i>`;
  } else {
    button.classList.remove("border");
    button.classList.add("bg-danger-subtle", "text-danger", "border-danger");
    button.innerHTML += ` <i class="bi bi-x-circle-fill float-end"></i>`;

    // Highlight the correct option
    const correctBtn = buttons[correctIdx];
    correctBtn.classList.remove("border");
    correctBtn.classList.add("bg-success-subtle", "text-success", "border-success", "fw-bold");
    correctBtn.innerHTML += ` <i class="bi bi-check-circle-fill float-end"></i>`;
  }
}

