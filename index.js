"use strict";

$(function () {
  /** Memory game: find matching pairs of cards and flip both of them. */

  const FOUND_MATCH_WAIT_MSECS = 1000;
  const COLORS = [
    "red", "blue", "green", "orange", "purple",
    "red", "blue", "green", "orange", "purple",
  ];

  let firstCard, secondCard;
  let score = 0;
  let lowestScore;
  let gameLock = false;
  let matchedPairs = 0;

  if (localStorage.getItem("lowestScore")) {
    lowestScore = parseInt(localStorage.getItem("lowestScore"));
    $("#lowestScore_value").text(lowestScore);
  } else {
    lowestScore = Infinity;
  }

  if (lowestScore === Infinity || lowestScore === 0) {
    $("#lowestScore_value").text("No Score Set!");
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function createCards(colors) {
    const $gameBoard = $("#game");

    for (let color of colors) {
      const $card = $("<div>").addClass("card").addClass(color);
      $card.on("click", handleCardClick);
      $gameBoard.append($card);
    }
  }

  function flipCard($card) {
    const color = $card.attr("class").split(" ")[1];
    $card.css("background-color", color);
  }

  function unFlipCards() {
    setTimeout(() => {
      firstCard.removeAttr("style");
      secondCard.removeAttr("style");
      firstCard = null;
      secondCard = null;
      gameLock = false;
    }, FOUND_MATCH_WAIT_MSECS);
  }

  function handleCardClick() {
    const $card = $(this);

    if (gameLock || $card[0] === firstCard[0]) return;

    if (!firstCard) {
      firstCard = $card;
      flipCard(firstCard);
      return;
    } else {
      secondCard = $card;
      flipCard(secondCard);
      score++;
      gameLock = true;
      checkCards();
      $("#score_value").text(score);
    }
  }

  function checkCards() {
    let isMatch = firstCard.attr("class").split(" ")[1] === secondCard.attr("class").split(" ")[1];
    isMatch ? disableCards() : unFlipCards();
  }

  function disableCards() {
    firstCard.off("click", handleCardClick);
    secondCard.off("click", handleCardClick);
    gameLock = false;
    firstCard = null;
    secondCard = null;
    matchedPairs++;

    if (matchedPairs === COLORS.length / 2) {
      if (score < lowestScore) {
        lowestScore = score;
        $("#lowestScore_value").text(lowestScore);
        localStorage.setItem("lowestScore", lowestScore);
      }
    }
  }

  function clearBoard() {
    const $gameBoard = $("#game");
    $gameBoard.empty();
    gameLock = false;
  }

  function showCards() {
    const $cardContainer = $(".card-container");
    $cardContainer.css("opacity", 1).css("transform", "scale(1)");
  }

  function clearCardContainer() {
    const $cardContainer = $(".card-container");
    $cardContainer.css("opacity", "").css("transform", "");
  }

  function newGame() {
    clearCardContainer();
    setTimeout(() => {
      clearBoard();
      const reShuffle = shuffle(COLORS);
      score = 0;
      $("#score_value").text(score);
      matchedPairs = 0;
      createCards(reShuffle);
      showCards();
    }, 500);

    $("#newGameButton").on("click", newGame);
  }
});