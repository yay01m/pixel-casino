const bonusBtn = document.getElementById("bonusBtn");
const bonusMessage = document.getElementById("bonusMessage");

const BONUS_DAY_KEY = "pixelCasinoBonusDay";

function getTodayKey(){
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRandomBonus(){
  const rewards = [10, 20, 30, 50, 100];
  const index = Math.floor(Math.random() * rewards.length);

  return rewards[index];
}

function checkBonusState(){
  const today = getTodayKey();
  const lastBonusDay = localStorage.getItem(BONUS_DAY_KEY);

  if(lastBonusDay === today){
    bonusBtn.disabled = true;
    bonusBtn.textContent = "今日は受け取り済み";
    bonusMessage.textContent = "また明日ボーナスを受け取れます！";
  }else{
    bonusBtn.disabled = false;
    bonusBtn.textContent = "ボーナスを受け取る";
    bonusMessage.textContent = "今日のボーナスを受け取ろう！";
  }
}

bonusBtn.addEventListener("click", () => {
  const today = getTodayKey();
  const lastBonusDay = localStorage.getItem(BONUS_DAY_KEY);

  if(lastBonusDay === today){
    checkBonusState();
    return;
  }

  const bonus = getRandomBonus();

  addPoints(bonus);

  localStorage.setItem(BONUS_DAY_KEY, today);

  bonusMessage.textContent = `${bonus}P 獲得！`;
  bonusBtn.disabled = true;
  bonusBtn.textContent = "今日は受け取り済み";
});

updatePoints();
checkBonusState();