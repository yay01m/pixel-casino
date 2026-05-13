const highScoreText = document.getElementById("highScore");
const highScoreDateText = document.getElementById("highScoreDate");

function updateRankingUI(){
  checkHighScore(getPoints());

  highScoreText.textContent = getHighScore();
  highScoreDateText.textContent = getHighScoreDate();

  updatePoints();
}

updateRankingUI();