import { getScores } from "./utils";

export const showLeaderboard = () => {
  const scores = getScores();
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  if (scores.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet!</li>";
  }

  scores.forEach((score) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Date: ${score.date}, Score: ${score.score}`;
    leaderboardList.appendChild(listItem);
  });

  document.getElementById("start-page").classList.add("hidden");
  document.getElementById("leaderboard-page").classList.remove("hidden");
};

document.getElementById("leaderboard-button").addEventListener("click", showLeaderboard);
document.getElementById("back-button").addEventListener("click", () => {
  document.getElementById("leaderboard-page").classList.add("hidden");
  document.getElementById("start-page").classList.remove("hidden");
});
