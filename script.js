const POINT_KEY = "pixelCasinoPoints";

function getPoints() {
  const saved = localStorage.getItem(POINT_KEY);

  if (saved === null) {
    localStorage.setItem(POINT_KEY, 30);
    return 30;
  }

  return Number(saved);
}

function setPoints(value) {
  const fixed = Math.max(0, Math.floor(value));
  localStorage.setItem(POINT_KEY, fixed);
  updatePoints();
}

function addPoints(value) {
  setPoints(getPoints() + value);
}

function spendPoints(value) {
  if (getPoints() < value) {
    return false;
  }

  setPoints(getPoints() - value);
  return true;
}

function updatePoints() {
  const pointText = document.getElementById("points");

  if (pointText) {
    pointText.textContent = getPoints();
  }
}

window.addEventListener("load", updatePoints);