"use strict";

/* =========================================
   General Utilities
========================================= */

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}


function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function slugToTitle(slug) {
    if (!slug) {
        return "";
    }

    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


function setCurrentYear() {
    document.querySelectorAll(".current-year").forEach(element => {
        element.textContent = new Date().getFullYear();
    });
}


/* =========================================
   Home Page
========================================= */

async function loadSubjects() {

    const container = document.getElementById("subjectsContainer");

    if (!container) {
        return;
    }

    try {

        const response = await fetch("data/subjects.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("Unable to load subjects.");
        }

        const data = await response.json();

        if (!data.subjects || !Array.isArray(data.subjects)) {
            throw new Error("Invalid subjects.json format.");
        }

        if (data.subjects.length === 0) {

            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-book"></i>
                        <h3>No subjects available</h3>
                        <p>Please check back later.</p>
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML = data.subjects.map(subject => {

            const subjectId = encodeURIComponent(subject.id);

            return `
                <div class="col-12 col-sm-6 col-lg-4">

                    <a
                        href="topic.html?subject=${subjectId}"
                        class="subject-card"
                        aria-label="Open ${escapeHTML(subject.name)}"
                    >

                        <div class="subject-card-top">

                            <div class="subject-icon">
                                <i class="bi ${escapeHTML(subject.icon || "bi-book")}"></i>
                            </div>

                            <span class="card-arrow">
                                <i class="bi bi-arrow-up-right"></i>
                            </span>

                        </div>

                        <div class="subject-card-content">

                            <h3>${escapeHTML(subject.name)}</h3>

                            <p>
                                ${escapeHTML(subject.description || "")}
                            </p>

                        </div>

                    </a>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="col-12">
                <div class="error-state">
                    <i class="bi bi-exclamation-circle"></i>
                    <h3>Unable to load subjects</h3>
                    <p>Please refresh the page and try again.</p>
                </div>
            </div>
        `;
    }
}


/* =========================================
   Topic Page
========================================= */

async function loadTopics() {

    const container = document.getElementById("topicsContainer");

    if (!container) {
        return;
    }

    const subject = getQueryParam("subject");

    if (!subject) {
        window.location.href = "404.html";
        return;
    }

    const safeSubject = subject.toLowerCase();

    try {

        const response = await fetch(
            `data/${encodeURIComponent(safeSubject)}/topics.json`,
            {
                cache: "no-cache"
            }
        );

        if (!response.ok) {
            throw new Error("Topics file not found.");
        }

        const data = await response.json();

        if (!data.topics || !Array.isArray(data.topics)) {
            throw new Error("Invalid topics.json format.");
        }

        const subjectName =
            data.name ||
            data.subject ||
            slugToTitle(safeSubject);

        document.title =
            `${subjectName} Topics | SciencePrep`;

        const subjectNameElement =
            document.getElementById("subjectName");

        const subjectDescriptionElement =
            document.getElementById("subjectDescription");

        const breadcrumbSubject =
            document.getElementById("breadcrumbSubject");

        if (subjectNameElement) {
            subjectNameElement.textContent = subjectName;
        }

        if (subjectDescriptionElement) {
            subjectDescriptionElement.textContent =
                data.description ||
                `Explore important ${subjectName} topics.`;
        }

        if (breadcrumbSubject) {
            breadcrumbSubject.textContent = subjectName;
        }

        const topicCount =
            document.getElementById("topicCount");

        if (topicCount) {
            topicCount.textContent =
                `${data.topics.length} ${
                    data.topics.length === 1 ? "Topic" : "Topics"
                }`;
        }

        if (data.topics.length === 0) {

            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-journal-x"></i>
                        <h3>No topics available</h3>
                        <p>Topics for this subject are not available yet.</p>
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML = data.topics.map((topic, index) => {

            const topicId = encodeURIComponent(topic.id);

            return `
                <div class="col-12 col-md-6">

                    <a
                        href="question.html?subject=${encodeURIComponent(safeSubject)}&topic=${topicId}"
                        class="topic-card"
                    >

                        <div class="topic-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="topic-content">

                            <h3>
                                ${escapeHTML(topic.name)}
                            </h3>

                            <p>
                                ${escapeHTML(topic.description || "")}
                            </p>

                        </div>

                        <div class="topic-arrow">
                            <i class="bi bi-chevron-right"></i>
                        </div>

                    </a>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="col-12">
                <div class="error-state">
                    <i class="bi bi-exclamation-circle"></i>
                    <h3>Unable to load topics</h3>
                    <p>
                        The requested subject could not be loaded.
                    </p>
                </div>
            </div>
        `;
    }
}


/* =========================================
   Question Page
========================================= */

async function loadQuestions() {

    const container =
        document.getElementById("questionsContainer");

    if (!container) {
        return;
    }

    const subject = getQueryParam("subject");
    const topic = getQueryParam("topic");

    if (!subject || !topic) {
        window.location.href = "404.html";
        return;
    }

    const safeSubject = subject.toLowerCase();
    const safeTopic = topic.toLowerCase();

    try {

        const filePath =
            `data/${encodeURIComponent(safeSubject)}/${encodeURIComponent(safeTopic)}.json`;

        const response = await fetch(filePath, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error("Question file not found.");
        }

        const data = await response.json();

        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error("Invalid question JSON format.");
        }

        const subjectName =
            data.subject ||
            slugToTitle(safeSubject);

        const topicName =
            data.topic ||
            slugToTitle(safeTopic);

        document.title =
            `${topicName} Questions | ${subjectName} | SciencePrep`;

        const questionTopic =
            document.getElementById("questionTopic");

        const questionSubject =
            document.getElementById("questionSubject");

        const topicBreadcrumb =
            document.getElementById("topicBreadcrumb");

        const subjectBreadcrumb =
            document.getElementById("subjectBreadcrumb");

        const questionTotal =
            document.getElementById("questionTotal");

        if (questionTopic) {
            questionTopic.textContent = topicName;
        }

        if (questionSubject) {
            questionSubject.textContent =
                `${subjectName} · Competitive Exam MCQs`;
        }

        if (topicBreadcrumb) {
            topicBreadcrumb.textContent = topicName;
        }

        if (subjectBreadcrumb) {
            subjectBreadcrumb.textContent = subjectName;
            subjectBreadcrumb.href =
                `topic.html?subject=${encodeURIComponent(safeSubject)}`;
        }

        if (questionTotal) {
            questionTotal.textContent =
                data.questions.length;
        }

        if (data.questions.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-question-circle"></i>
                    <h3>No questions available</h3>
                    <p>
                        Questions for this topic are being prepared.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = data.questions
            .map((question, index) =>
                createQuestionCard(question, index)
            )
            .join("");

        initializeQuestionInteractions();

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error-state">
                <i class="bi bi-file-earmark-x"></i>
                <h3>Questions unavailable</h3>
                <p>
                    The requested topic could not be loaded.
                </p>

                <a
                    href="topic.html?subject=${encodeURIComponent(safeSubject)}"
                    class="btn btn-primary-custom mt-2"
                >
                    Back to Topics
                </a>
            </div>
        `;
    }
}


/* =========================================
   Question Card
========================================= */

function createQuestionCard(question, index) {

    const options =
        Array.isArray(question.options)
            ? question.options
            : [];

    const answerIndex =
        Number.isInteger(question.answer)
            ? question.answer
            : -1;

    const optionLetters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
    ];

    const optionsHTML = options.map((option, optionIndex) => {

        const isCorrect =
            optionIndex === answerIndex;

        return `
            <li class="mcq-option ${isCorrect ? "correct-option" : ""}">

                <span class="option-letter">
                    ${optionLetters[optionIndex] || optionIndex + 1}
                </span>

                <span class="option-text">
                    ${escapeHTML(option)}
                </span>

                ${
                    isCorrect
                        ? `<i class="bi bi-check-circle-fill option-correct-icon"></i>`
                        : ""
                }

            </li>
        `;

    }).join("");


    const examsHTML =
        Array.isArray(question.exams) &&
        question.exams.length
            ? question.exams.map(exam => `
                <span class="exam-tag">
                    <i class="bi bi-award"></i>
                    ${escapeHTML(exam.name)}
                    <span>·</span>
                    ${escapeHTML(exam.year)}
                </span>
            `).join("")
            : `
                <span class="exam-tag">
                    <i class="bi bi-info-circle"></i>
                    General
                </span>
            `;


    return `
        <article class="question-card">

            <div class="question-card-header">

                <span class="question-number">
                    Question ${String(index + 1).padStart(2, "0")}
                </span>

                ${
                    question.difficulty
                        ? `
                            <span class="difficulty-tag">
                                ${escapeHTML(question.difficulty)}
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="question-body">

                <h2 class="question-text">
                    ${escapeHTML(question.question)}
                </h2>


                <ol class="mcq-options">
                    ${optionsHTML}
                </ol>


                <button
                    type="button"
                    class="answer-toggle"
                    data-question="${index}"
                    aria-expanded="false"
                    aria-controls="answer-${index}"
                >
                    <span>
                        <i class="bi bi-eye"></i>
                        Show Answer
                    </span>

                    <i class="bi bi-chevron-down toggle-icon"></i>
                </button>


                <div
                    class="answer-area"
                    id="answer-${index}"
                    hidden
                >

                    <div class="answer-box">

                        <div class="answer-label">
                            <i class="bi bi-check-circle-fill"></i>
                            Correct Answer
                        </div>

                        <div class="answer-text">
                            ${
                                answerIndex >= 0 &&
                                options[answerIndex] !== undefined
                                    ? escapeHTML(options[answerIndex])
                                    : "Answer not available"
                            }
                        </div>

                    </div>


                    ${
                        question.explanation
                            ? `
                                <div class="explanation-box">

                                    <div class="explanation-title">
                                        <i class="bi bi-lightbulb"></i>
                                        Explanation
                                    </div>

                                    <p>
                                        ${escapeHTML(question.explanation)}
                                    </p>

                                </div>
                              `
                            : ""
                    }


                    <div class="asked-in">

                        <span class="asked-label">
                            Asked In
                        </span>

                        <div class="exam-list">
                            ${examsHTML}
                        </div>

                    </div>

                </div>

            </div>

        </article>
    `;
}


/* =========================================
   Question Interactions
========================================= */

function initializeQuestionInteractions() {

    document
        .querySelectorAll(".answer-toggle")
        .forEach(button => {

            button.addEventListener("click", () => {

                const targetId =
                    button.getAttribute("aria-controls");

                const answerArea =
                    document.getElementById(targetId);

                if (!answerArea) {
                    return;
                }

                const isHidden =
                    answerArea.hasAttribute("hidden");

                if (isHidden) {

                    answerArea.removeAttribute("hidden");

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                    button.classList.add("active");

                    button.querySelector("span").innerHTML = `
                        <i class="bi bi-eye-slash"></i>
                        Hide Answer
                    `;

                } else {

                    answerArea.setAttribute(
                        "hidden",
                        ""
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    button.classList.remove("active");

                    button.querySelector("span").innerHTML = `
                        <i class="bi bi-eye"></i>
                        Show Answer
                    `;
                }

            });

        });
}


/* =========================================
   Global Initialization
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
});
