"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;
const COLORS = [
  "red", "blue", "green", "orange", "purple",
  "red", "blue", "green", "orange", "purple",
];

const colors = shuffle(COLORS);

let firstCard, secondCard;
let score = 0;
let lowestScore;
let gameLock = false;
let matchedPairs = 0;


if (localStorage.getItem("lowestScore")) {
  lowestScore = parseInt(localStorage.getItem("lowestScore"));
  document.querySelector("#lowestScore_value").textContent = lowestScore;
} else {
  lowestScore = Infinity;
}

if (lowestScore === Infinity || lowestScore === 0) {
  document.querySelector("#lowestScore_value").textContent = "No Score Set!";
}

/** Shuffle array items in-place and return shuffled array. */

function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.

  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click event listener for each card to handleCardClick
 */

function createCards(colors) {
  const gameBoard = document.getElementById("game");

  for (let color of colors) {
    const card = document.createElement("div");
    card.classList.add(`card`);
    card.classList.add(`${color}`);
    card.addEventListener("click", handleCardClick);
    gameBoard.appendChild(card);
  }
}

/** Flip a card face-up. */

function flipCard(card) {
  const color = card.classList[1];
  card.style.backgroundColor = `${color}`;
}

/** Flip a card face-down. */

function unFlipCards() {
  setTimeout(() => {
    firstCard.removeAttribute("style");
    secondCard.removeAttribute("style");
    firstCard = null;
    secondCard = null;
    gameLock = false;
  }, FOUND_MATCH_WAIT_MSECS);
}

/** Handle clicking on a card: this could be first-card or second-card. */

function handleCardClick(evt) {
  const card = evt.target;

  if (gameLock || card === firstCard) return;

  if (!firstCard) {
    firstCard = card;
    flipCard(firstCard);
    return;
  } else {
    secondCard = card;
    flipCard(secondCard);
    score++;
    gameLock = true;
    checkCards();
    document.querySelector("#score_value").textContent = score;
  }
}

function checkCards() {
  let isMatch = firstCard.classList[1] === secondCard.classList[1];
  isMatch ? disableCards() : unFlipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", handleCardClick);
  secondCard.removeEventListener("click", handleCardClick);
  gameLock = false;
  firstCard = null;
  secondCard = null;
  matchedPairs++;

  if (matchedPairs === COLORS.length / 2) {
    if (score < lowestScore) {
      lowestScore = score;
      document.querySelector("#lowestScore_value").textContent = lowestScore;
      localStorage.setItem("lowestScore", lowestScore);
    }
  }
}

function clearBoard() {
  const gameBoard = document.getElementById("game");
  gameBoard.innerHTML = "";
  gameLock = false;
}

function showCards() {
  const cardContainer = document.querySelector(".card-container");
  cardContainer.style.opacity = 1;
  cardContainer.style.transform = "scale(1)";
}

function clearCardContainer() {
  const cardContainer = document.querySelector(".card-container");
  cardContainer.style.removeProperty("opacity");
  cardContainer.style.removeProperty("transform");
}

function newGame() {
  clearCardContainer();
  setTimeout(() => {
    clearBoard();
    const reShuffle = shuffle(COLORS);
    createCards(reShuffle);
    score = 0;
    document.querySelector("#score_value").textContent = score;
    matchedPairs = 0;
    showCards();
  }, 500);
}