// Topics list with multi-digit IDs, descriptions and Unsplash image placeholders
const topics = [
  {
    id: "101",
    title: "Percentage & Ratio",
    description: "Master essential calculations, population growth, and ratio proportions.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "5082",
    title: "Speed & Distance",
    description: "Solve time, relative speed, trains, and boat-stream problems.",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "99999",
    title: "Profit & Loss",
    description: "Advanced practice on marked price, discounts, and successive percentages.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("topicGrid");
  gridContainer.innerHTML = "";

  topics.forEach(topic => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";

    col.innerHTML = `
      <a href="quiz.html?id=${topic.id}" class="text-decoration-none">
        <div class="card card-custom h-100">
          <img src="${topic.image}" class="card-img-top" alt="${topic.title}">
          <div class="card-body p-4">
            <span class="badge bg-primary-subtle text-primary mb-2 fw-semibold">ID: ${topic.id}</span>
            <h5 class="card-title fw-bold text-dark mb-2">${topic.title}</h5>
            <p class="card-text text-muted small mb-0">${topic.description}</p>
          </div>
          <div class="card-footer bg-white border-0 px-4 pb-4 pt-0 text-primary fw-semibold small">
            Start Practice <i class="bi bi-arrow-right ms-1"></i>
          </div>
        </div>
      </a>
    `;

    gridContainer.appendChild(col);
  });
});

