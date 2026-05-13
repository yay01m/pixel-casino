const POINT_KEY = "pixelCasinoPoints";
const HIGH_SCORE_KEY = "pixelCasinoHighScore";
const HIGH_SCORE_DATE_KEY = "pixelCasinoHighScoreDate";

function getPoints() {
  const saved = localStorage.getItem(POINT_KEY);

  if (saved === null) {
    localStorage.setItem(POINT_KEY, 30);
    checkHighScore(30);
    return 30;
  }

  return Number(saved);
}

function setPoints(value) {
  const fixed = Math.max(0, Math.floor(value));

  localStorage.setItem(POINT_KEY, fixed);

  checkHighScore(fixed);
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

function getTodayText() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  return `${year}年${month}月${day}日`;
}

function getHighScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

function getHighScoreDate() {
  return localStorage.getItem(HIGH_SCORE_DATE_KEY) || "まだ記録なし";
}

function checkHighScore(points) {
  const highScore = getHighScore();

  if (points > highScore) {
    localStorage.setItem(HIGH_SCORE_KEY, points);
    localStorage.setItem(HIGH_SCORE_DATE_KEY, getTodayText());
  }
}

window.addEventListener("load", () => {
  updatePoints();
  checkHighScore(getPoints());
});
const secretCode = "pixel10000";
let typedCode = "";

window.addEventListener("keydown", (e) => {
  typedCode += e.key.toLowerCase();

  if (typedCode.length > secretCode.length) {
    typedCode = typedCode.slice(-secretCode.length);
  }

  if (typedCode === secretCode) {
    addPoints(10000);
    alert("SECRET BONUS! 10000P GET!");

    typedCode = "";
  }
});