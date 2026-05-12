const pointsEl = document.getElementById("points");
const betText = document.getElementById("betText");
const resultNumber = document.getElementById("resultNumber");
const message = document.getElementById("message");

const wheel = document.getElementById("wheel");
const numberRing = document.getElementById("numberRing");
const spinBtn = document.getElementById("spinBtn");

const redBtn = document.getElementById("redBtn");
const blackBtn = document.getElementById("blackBtn");
const greenBtn = document.getElementById("greenBtn");

const feverGauge = document.getElementById("feverGauge");
const feverText = document.getElementById("feverText");
const historyList = document.getElementById("historyList");
const coinBurst = document.getElementById("coinBurst");

const betBtns = document.querySelectorAll(".bet-btn");
const choiceBtns = document.querySelectorAll(".choice");

let bet = 10;
let selectedColor = "red";
let spinning = false;

let currentRotation = 0;
let fever = 0;
let feverMode = false;
let history = [];

const results = [
  { number: 0, color: "green" },
  { number: 1, color: "red" },
  { number: 2, color: "black" },
  { number: 3, color: "red" },
  { number: 4, color: "black" },
  { number: 5, color: "red" },
  { number: 6, color: "black" },
  { number: 7, color: "red" },
  { number: 8, color: "black" },
  { number: 9, color: "red" },
  { number: 10, color: "black" }
];

const SEGMENT = 360 / results.length;

function buildWheelNumbers() {
  numberRing.innerHTML = "";

  results.forEach((item, index) => {
    const num = document.createElement("div");

    num.className = `num ${item.color}`;
    num.textContent = item.number;

    const angle = index * SEGMENT + SEGMENT / 2;

    num.style.setProperty("--angle", `${angle}deg`);

    numberRing.appendChild(num);
  });
}

function updateUI() {
  pointsEl.textContent = getPoints();
  betText.textContent = bet;

  feverGauge.style.width = fever + "%";

  if (feverMode) {
    feverText.textContent = "FEVER中！ 次の当たり配当UP！";
    wheel.classList.add("fever-active");
  } else {
    feverText.textContent = `FEVERまで ${100 - fever}%`;
    wheel.classList.remove("fever-active");
  }
}

function selectColor(color) {
  selectedColor = color;

  choiceBtns.forEach(btn => {
    btn.classList.remove("selected");
  });

  if (color === "red") redBtn.classList.add("selected");
  if (color === "black") blackBtn.classList.add("selected");
  if (color === "green") greenBtn.classList.add("selected");

  message.textContent = `${color.toUpperCase()} にBET中`;
}

function randomResult() {
  const r = Math.random();

  if (r < 0.07) {
    return results[0];
  }

  const normalResults = results.filter(item => item.color !== "green");

  return normalResults[
    Math.floor(Math.random() * normalResults.length)
  ];
}

function addHistory(result) {
  history.unshift(result);

  if (history.length > 5) {
    history.pop();
  }

  historyList.innerHTML = "";

  history.forEach(item => {
    const span = document.createElement("span");

    span.className = `history-item ${item.color}`;
    span.textContent = `${item.number} ${item.color.toUpperCase()}`;

    historyList.appendChild(span);
  });
}

function createCoinBurst() {
  coinBurst.innerHTML = "";

  for (let i = 0; i < 28; i++) {
    const coin = document.createElement("div");

    coin.className = "coin";

    const x = Math.floor(Math.random() * 420 - 210) + "px";
    const y = Math.floor(Math.random() * -300 - 30) + "px";

    coin.style.setProperty("--x", x);
    coin.style.setProperty("--y", y);

    coinBurst.appendChild(coin);
  }

  setTimeout(() => {
    coinBurst.innerHTML = "";
  }, 1000);
}

function addFever() {
  if (feverMode) return;

  fever += 20;

  if (fever >= 100) {
    fever = 100;
    feverMode = true;
    message.textContent = "FEVER突入！次の当たりは配当UP！";
  }
}

function getTargetRotation(index) {
  const itemAngle = index * SEGMENT + SEGMENT / 2;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const needed = (360 - ((itemAngle + currentMod) % 360)) % 360;

  return currentRotation + 360 * 6 + needed;
}

function spinRoulette() {
  if (spinning) return;

  if (!spendPoints(bet)) {
    message.textContent = "ポイント不足！ゲーム選択画面で救済を受け取ろう";
    updateUI();
    return;
  }

  updateUI();

  spinning = true;
  spinBtn.disabled = true;
  resultNumber.textContent = "--";
  message.textContent = "ルーレット回転中...";

  const result = randomResult();

  const index = results.findIndex(item => item.number === result.number);

  currentRotation = getTargetRotation(index);

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    finishRoulette(result);
  }, 3500);
}

function finishRoulette(result) {
  spinning = false;
  spinBtn.disabled = false;

  resultNumber.textContent = `${result.number} ${result.color.toUpperCase()}`;

  addHistory(result);
  addFever();

  let win = 0;

  if (selectedColor === result.color) {
    if (result.color === "green") {
      win = feverMode ? bet * 20 : bet * 14;
    } else {
      win = feverMode ? bet * 3 : bet * 2;
    }
  }

  if (win > 0) {
    addPoints(win);
    createCoinBurst();

    if (feverMode) {
      message.textContent = `FEVER WIN！ +${win}P`;
    } else {
      message.textContent = `WIN！ ${result.color.toUpperCase()} 的中！ +${win}P`;
    }
  } else {
    message.textContent = `LOSE... ${result.color.toUpperCase()} でした`;
  }

  if (feverMode) {
    fever = 0;
    feverMode = false;
  }

  updateUI();
}

betBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (spinning) return;

    betBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    bet = Number(btn.dataset.bet);

    updateUI();
  });
});

redBtn.addEventListener("click", () => {
  if (!spinning) selectColor("red");
});

blackBtn.addEventListener("click", () => {
  if (!spinning) selectColor("black");
});

greenBtn.addEventListener("click", () => {
  if (!spinning) selectColor("green");
});

spinBtn.addEventListener("click", spinRoulette);

document.addEventListener("keydown", event => {
  if (event.repeat) return;

  if (event.code === "Space") {
    event.preventDefault();
    spinRoulette();
  }

  if (event.code === "Digit1" && !spinning) {
    selectColor("red");
  }

  if (event.code === "Digit2" && !spinning) {
    selectColor("black");
  }

  if (event.code === "Digit3" && !spinning) {
    selectColor("green");
  }
});

buildWheelNumbers();
selectColor("red");
updateUI();