import { getScores } from "./utils";

export const showLeaderboard = () => {
  const scores = getScores();
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = "";

  if (scores.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet!</li>";
    return;
  }

  scores.forEach((score) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Date: ${score.date}, Score: ${score.score}`;
    leaderboardList.appendChild(listItem);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  showLeaderboard();
});
