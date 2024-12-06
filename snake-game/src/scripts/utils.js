// Utility functions to save and retrieve scores from localStorage

export const saveScore = (score) => {
  const now = new Date();
  const readableTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const readableDate = now.toLocaleDateString([], { day: "2-digit", month: "short" });

  const records = JSON.parse(localStorage.getItem("records")) || [];

  records.push({
    date: `${readableDate}, ${readableTime}`,
    score: score,
  });
  localStorage.setItem("records", JSON.stringify(records.slice(-10)));
};

export const getScores = () => {
  const records = JSON.parse(localStorage.getItem("records")) || [];
  return records;
};
