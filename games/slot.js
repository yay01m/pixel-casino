const reelPattern = [
  "🍀", "🔔", "🟨", "⭐", "💎", "🍀",
  "🔔", "7", "🟨", "⭐", "💎", "🍀"
];

const reels = [
  document.querySelector("#reel0 span"),
  document.querySelector("#reel1 span"),
  document.querySelector("#reel2 span")
];

const reelBoxes = [
  document.getElementById("reel0"),
  document.getElementById("reel1"),
  document.getElementById("reel2")
];

const stopBtns = [
  document.getElementById("stop0"),
  document.getElementById("stop1"),
  document.getElementById("stop2")
];

const spinBtn = document.getElementById("spinBtn");
const lamp = document.getElementById("lamp");
const message = document.getElementById("message");
const pointsEl = document.getElementById("points");
const betText = document.getElementById("betText");
const betBtns = document.querySelectorAll(".bet-btn");

let bet = 5;
let spinning = false;
let chance = false;

let intervals = [null, null, null];
let stopped = [true, true, true];

let reelIndex = [0, 3, 6];
let result = ["7", "7", "7"];
let normalResult = ["", "", ""];

function updateUI() {
  pointsEl.textContent = getPoints();
  betText.textContent = bet;
}

function nextSymbol(i) {
  reelIndex[i] = (reelIndex[i] + 1) % reelPattern.length;
  reels[i].textContent = reelPattern[reelIndex[i]];
}

function randomFromPattern() {
  return reelPattern[Math.floor(Math.random() * reelPattern.length)];
}

function decideNormalResult() {
  const r = Math.random();

  if (r < 0.004) {
    return ["💎", "💎", "💎"];
  }

  if (r < 0.015) {
    return ["🔔", "🔔", "🔔"];
  }

  if (r < 0.05) {
    const s = randomFromPattern();
    return [s, s, s];
  }

  if (r < 0.18) {
    const s = randomFromPattern();
    let other = randomFromPattern();

    while (other === s) {
      other = randomFromPattern();
    }

    return [s, s, other].sort(() => Math.random() - 0.5);
  }

  let arr = [
    randomFromPattern(),
    randomFromPattern(),
    randomFromPattern()
  ];

  while (
    new Set(arr).size < 3 ||
    arr.filter(x => x === "7").length >= 2
  ) {
    arr = [
      randomFromPattern(),
      randomFromPattern(),
      randomFromPattern()
    ];
  }

  return arr;
}

function startSpin() {
  if (spinning) return;

  if (!spendPoints(bet)) {
    message.textContent = "ポイント不足！ゲーム選択画面で救済を受け取ろう";
    return;
  }

  updateUI();

  spinning = true;
  stopped = [false, false, false];
  result = ["", "", ""];

  chance = Math.random() < 0.035;
  normalResult = decideNormalResult();

  if (chance) {
    lamp.classList.add("on");
    message.textContent = "CHANCE！7が来たらSTOP！";
  } else {
    lamp.classList.remove("on");
    message.textContent = "通常回転中。STOPで止めよう";
  }

  reelBoxes.forEach((box, i) => {
    box.classList.add("spin");
    stopBtns[i].disabled = false;

    intervals[i] = setInterval(() => {
      nextSymbol(i);
    }, 145 + i * 15);
  });

  spinBtn.disabled = true;
}

function isNearSeven(i) {
  const index = reelIndex[i];
  const sevenIndex = reelPattern.indexOf("7");

  const prev = (sevenIndex - 1 + reelPattern.length) % reelPattern.length;
  const next = (sevenIndex + 1) % reelPattern.length;

  return index === sevenIndex || index === prev || index === next;
}

function stopReel(i) {
  if (stopped[i]) return;

  stopped[i] = true;
  clearInterval(intervals[i]);

  reelBoxes[i].classList.remove("spin");
  stopBtns[i].disabled = true;

  if (chance) {
    if (isNearSeven(i)) {
      result[i] = "7";
      reels[i].textContent = "7";
      message.textContent = "成功！残りも7を狙え！";
    } else {
      result[i] = reelPattern[reelIndex[i]];
      reels[i].textContent = result[i];

      chance = false;
      lamp.classList.remove("on");
      message.textContent = "目押しミス！CHANCE終了";
    }
  } else {
    result[i] = normalResult[i];
    reels[i].textContent = result[i];
  }

  if (stopped.every(Boolean)) {
    finishSpin();
  }
}

function finishSpin() {
  spinning = false;
  spinBtn.disabled = false;

  const [a, b, c] = result;

  let win = 0;

  if (a === "7" && b === "7" && c === "7") {
    win = bet * 30;
  } else if (a === "💎" && b === "💎" && c === "💎") {
    win = bet * 10;
  } else if (a === "🔔" && b === "🔔" && c === "🔔") {
    win = bet * 6;
  } else if (a === b && b === c) {
    win = bet * 4;
  } else if (a === b || b === c || a === c) {
    win = bet;
  }

  if (win > 0) {
    addPoints(win);

    if (a === "7" && b === "7" && c === "7") {
      lamp.classList.add("on");
      message.textContent = `777 JACKPOT！ +${win} POINT`;
    } else {
      message.textContent = `WIN！ +${win} POINT`;
    }
  } else {
    message.textContent = "はずれ";
  }

  chance = false;
  updateUI();
}

stopBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    stopReel(i);
  });
});

spinBtn.addEventListener("click", startSpin);

betBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (spinning) return;

    betBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    bet = Number(btn.dataset.bet);
    updateUI();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  if (event.code === "Space") {
    event.preventDefault();

    if (!spinning) {
      spinBtn.click();
    }
  }

  if (event.code === "Digit1") {
    stopBtns[0].click();
  }

  if (event.code === "Digit2") {
    stopBtns[1].click();
  }

  if (event.code === "Digit3") {
    stopBtns[2].click();
  }
});

updateUI();