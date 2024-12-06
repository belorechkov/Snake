document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("start-page").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");
});

document.getElementById("leaderboard-button").addEventListener("click", () => {
  document.getElementById("start-page").classList.add("hidden");
  document.getElementById("leaderboard-page").classList.remove("hidden");
});

document.getElementById("back-button").addEventListener("click", () => {
  document.getElementById("leaderboard-page").classList.add("hidden");
  document.getElementById("start-page").classList.remove("hidden");
});
