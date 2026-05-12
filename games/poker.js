const pointsEl = document.getElementById("points");
const betText = document.getElementById("betText");
const cardsEl = document.getElementById("cards");
const message = document.getElementById("message");
const handNameEl = document.getElementById("handName");

const dealBtn = document.getElementById("dealBtn");
const drawBtn = document.getElementById("drawBtn");
const betBtns = document.querySelectorAll(".bet-btn");

let bet = 10;
let deck = [];
let hand = [];
let selected = [];
let playing = false;

const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
  { label: "A", value: 14 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "J", value: 11 },
  { label: "Q", value: 12 },
  { label: "K", value: 13 }
];

function updateUI() {
  pointsEl.textContent = getPoints();
  betText.textContent = bet;
}

function createDeck() {
  const newDeck = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      newDeck.push({
        suit,
        rank: rank.label,
        value: rank.value
      });
    });
  });

  return shuffle(newDeck);
}

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function drawCard() {
  return deck.pop();
}

function renderCards() {
  cardsEl.innerHTML = "";

  hand.forEach((card, index) => {
    const div = document.createElement("div");

    div.className = "card";

    if (card.suit === "♥" || card.suit === "♦") {
      div.classList.add("red-suit");
    }

    if (selected.includes(index)) {
      div.classList.add("selected");
    }

    div.innerHTML = `
      <div class="rank">${card.rank}</div>
      <div class="suit">${card.suit}</div>
      <div class="hold">${selected.includes(index) ? "HOLD" : ""}</div>
    `;

    div.addEventListener("click", () => {
      toggleCard(index);
    });

    cardsEl.appendChild(div);
  });
}

function toggleCard(index) {
  if (!playing) return;

  if (selected.includes(index)) {
    selected = selected.filter(i => i !== index);
  } else {
    selected.push(index);
  }

  renderCards();
}

function deal() {
  if (playing) return;

  if (!spendPoints(bet)) {
    message.textContent = "ポイント不足！ゲーム選択画面で救済を受け取ろう";
    updateUI();
    return;
  }

  deck = createDeck();
  hand = [];
  selected = [];

  for (let i = 0; i < 5; i++) {
    hand.push(drawCard());
  }

  playing = true;

  dealBtn.disabled = true;
  drawBtn.disabled = false;

  handNameEl.textContent = "---";
  message.textContent = "残したいカードを選んでDRAW！";

  renderCards();
  updateUI();
}

function draw() {
  if (!playing) return;

  for (let i = 0; i < hand.length; i++) {
    if (!selected.includes(i)) {
      hand[i] = drawCard();
    }
  }

  selected = [];
  playing = false;

  dealBtn.disabled = false;
  drawBtn.disabled = true;

  renderCards();

  const result = judgeHand(hand);
  handNameEl.textContent = result.name;

  if (result.multiplier > 0) {
    const win = bet * result.multiplier;

    addPoints(win);

    message.textContent = `${result.name}！ +${win}P`;
  } else {
    message.textContent = "役なし... LOSE";
  }

  updateUI();
}

function judgeHand(cards) {
  const values = cards.map(card => card.value).sort((a, b) => a - b);
  const suitsOnly = cards.map(card => card.suit);

  const counts = {};

  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });

  const countValues = Object.values(counts).sort((a, b) => b - a);

  const isFlush = suitsOnly.every(suit => suit === suitsOnly[0]);

  const uniqueValues = [...new Set(values)];

  let isStraight = false;

  if (uniqueValues.length === 5) {
    const min = uniqueValues[0];
    const max = uniqueValues[4];

    if (max - min === 4) {
      isStraight = true;
    }

    const lowAce = [2, 3, 4, 5, 14];

    if (JSON.stringify(uniqueValues) === JSON.stringify(lowAce)) {
      isStraight = true;
    }
  }

  const isRoyal =
    isFlush &&
    values.includes(10) &&
    values.includes(11) &&
    values.includes(12) &&
    values.includes(13) &&
    values.includes(14);

  if (isRoyal) {
    return { name: "ROYAL FLUSH", multiplier: 50 };
  }

  if (isStraight && isFlush) {
    return { name: "STRAIGHT FLUSH", multiplier: 30 };
  }

  if (countValues[0] === 4) {
    return { name: "FOUR CARD", multiplier: 25 };
  }

  if (countValues[0] === 3 && countValues[1] === 2) {
    return { name: "FULL HOUSE", multiplier: 10 };
  }

  if (isFlush) {
    return { name: "FLUSH", multiplier: 8 };
  }

  if (isStraight) {
    return { name: "STRAIGHT", multiplier: 6 };
  }

  if (countValues[0] === 3) {
    return { name: "THREE CARD", multiplier: 4 };
  }

  if (countValues[0] === 2 && countValues[1] === 2) {
    return { name: "TWO PAIR", multiplier: 2 };
  }

  if (countValues[0] === 2) {
    return { name: "ONE PAIR", multiplier: 1 };
  }

  return { name: "NO HAND", multiplier: 0 };
}

betBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (playing) return;

    betBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    bet = Number(btn.dataset.bet);
    updateUI();
  });
});

dealBtn.addEventListener("click", deal);
drawBtn.addEventListener("click", draw);

document.addEventListener("keydown", event => {
  if (event.repeat) return;

  if (event.code === "Space") {
    event.preventDefault();

    if (!playing) {
      deal();
    } else {
      draw();
    }
  }

  if (event.code === "Digit1") toggleCard(0);
  if (event.code === "Digit2") toggleCard(1);
  if (event.code === "Digit3") toggleCard(2);
  if (event.code === "Digit4") toggleCard(3);
  if (event.code === "Digit5") toggleCard(4);
});

updateUI();