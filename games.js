const pointDisplay = document.getElementById("pointDisplay");
const rescueBtn = document.getElementById("rescueBtn");

function updateGamesPointUI() {
  const points = getPoints();

  pointDisplay.textContent = points;

  rescueBtn.disabled = points !== 0;
}

rescueBtn.addEventListener("click", () => {
  if (getPoints() === 0) {
    addPoints(30);
    updateGamesPointUI();
  }
});

updateGamesPointUI();