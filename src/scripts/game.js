import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { saveScore } from "./utils";
import { showLeaderboard } from "./leaderboard";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const appleTexture = await PIXI.Assets.load("/src/assets/images/apple.png");

const WIDTH = 500;
const HEIGHT = WIDTH;
const TILE_NUMBER = 20;
const TILE_SIZE = WIDTH / TILE_NUMBER;
const INITIAL_SPEED = 1;
const SPEED_INCREMENT = 10; // Increase speed when an apple is eaten

let app, snakeContainer, food, score, gameOver, snakeConfig, snakeHead, speed, lastUpdateTime;
let scoreText;
let level = 1;
let obstacle; // Add obstacle for level 2

const initializeGame = async () => {
  createControlButtons();

  app = new PIXI.Application();
  await app.init({
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: 0xfadee9,
  });

  document.getElementById("game-container").appendChild(app.canvas);

  score = 0;
  gameOver = false;
  speed = INITIAL_SPEED;
  lastUpdateTime = 0;
  level = 1;

  // Create score text
  updateScoreDisplay();

  // Initialize snake's position and body
  snakeHead = { x: TILE_SIZE * (TILE_NUMBER / 2 - 1), y: TILE_SIZE * (TILE_NUMBER / 2 - 1) };
  snakeConfig = {
    body: [
      { x: snakeHead.x, y: snakeHead.y },
      { x: snakeHead.x - TILE_SIZE, y: snakeHead.y },
      { x: snakeHead.x - TILE_SIZE * 2, y: snakeHead.y },
    ],
    dx: TILE_SIZE,
    dy: 0,
    length: 3,
  };

  // Initialize containers and food
  snakeContainer = new PIXI.Container();
  food = new PIXI.Sprite(PIXI.Texture.WHITE);
  app.stage.addChild(snakeContainer);
  app.stage.addChild(food);

  replaceFood();
  renderSnake();

  // Initialize obstacle for level 2 (will be added later when the level is reached)
  obstacle = new PIXI.Graphics();
  obstacle.fill(0xff0000).rect((TILE_NUMBER * TILE_SIZE) / 4, (TILE_NUMBER * TILE_SIZE) / 2 - TILE_SIZE, (TILE_NUMBER * TILE_SIZE) / 2, TILE_SIZE);

  // Start the game loop
  app.ticker.maxFPS = speed;
  app.ticker.add((deltaTime) => gameLoop(deltaTime));

  document.addEventListener("keydown", handleKeyPress);
};

const renderSnake = () => {
  snakeContainer.removeChildren();
  snakeConfig.body.forEach((segment) => {
    const segmentSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    segmentSprite.width = TILE_SIZE;
    segmentSprite.height = TILE_SIZE;
    segmentSprite.tint = 0x6bd391;
    segmentSprite.position.set(segment.x, segment.y);
    snakeContainer.addChild(segmentSprite);
  });
};

const replaceFood = () => {
  food.texture = appleTexture;
  food.width = TILE_SIZE;
  food.height = TILE_SIZE;
  food.tint = 0xf5427e;
  food.position.set(Math.floor(Math.random() * TILE_NUMBER) * TILE_SIZE, Math.floor(Math.random() * TILE_NUMBER) * TILE_SIZE);

  if (snakeConfig.body.some((segment) => segment.x === food.x && segment.y === food.y)) {
    replaceFood();
  }
};

const handleWallCollision = () => {
  if (snakeHead.x < 0) snakeHead.x = WIDTH - TILE_SIZE;
  else if (snakeHead.x >= WIDTH) snakeHead.x = 0;

  if (snakeHead.y < 0) snakeHead.y = HEIGHT - TILE_SIZE;
  else if (snakeHead.y >= HEIGHT) snakeHead.y = 0;
};

const handleFoodCollision = () => {
  if (snakeHead.x === food.x && snakeHead.y === food.y) {
    snakeConfig.length += 1;
    score += 1;

    if (score % 5 === 0) {
      speed += 1;
    }
    // speed += SPEED_INCREMENT;
    console.log(`SPEED_INCREMENT: ${SPEED_INCREMENT}, speed: ${speed}`);

    replaceFood();
    updateScoreDisplay();

    if (score === 5 && level === 1) {
      levelUp(); // Move to level 2 after eating 25 apples
    }
  }
};

const handleSelfCollision = () => {
  if (snakeConfig.body.slice(1).some((segment) => segment.x === snakeHead.x && segment.y === snakeHead.y)) {
    gameOver = true;
    app.ticker.stop();
    saveScore(score);

    const gameOverMessage = document.createElement("div");
    gameOverMessage.className = "game-over";
    gameOverMessage.textContent = "Game Over :(";
    const gameContainer = document.getElementById("game-container");
    gameContainer.innerHTML = "";
    gameContainer.appendChild(gameOverMessage);

    setTimeout(() => {
      gameContainer.classList.add("hidden");
      document.getElementById("start-page").classList.remove("hidden");
      showLeaderboard();
      gameContainer.innerHTML = "";
    }, 2000);
  }
};

const handleObstacleCollision = () => {
  if (level === 2) {
    const obstacleBounds = obstacle.getBounds(); // Get the obstacle's bounds
    const snakeHeadBounds = new PIXI.Rectangle(snakeHead.x, snakeHead.y, TILE_SIZE, TILE_SIZE);

    if (snakeHeadBounds.x < obstacleBounds.x + obstacleBounds.width && snakeHeadBounds.x + snakeHeadBounds.width > obstacleBounds.x && snakeHeadBounds.y < obstacleBounds.y + obstacleBounds.height && snakeHeadBounds.y + snakeHeadBounds.height > obstacleBounds.y) {
      gameOver = true;
      app.ticker.stop();
      saveScore(score);

      const gameOverMessage = document.createElement("div");
      gameOverMessage.className = "game-over";
      gameOverMessage.textContent = "Game Over :(";
      const gameContainer = document.getElementById("game-container");
      gameContainer.innerHTML = "";
      gameContainer.appendChild(gameOverMessage);

      setTimeout(() => {
        gameContainer.classList.add("hidden");
        document.getElementById("start-page").classList.remove("hidden");
        showLeaderboard();
        gameContainer.innerHTML = "";
      }, 2000);
    }
  }
};

const gameLoop = (deltaTime) => {
  if (gameOver) return;

  app.ticker.maxFPS = speed;

  // Check for level up
  levelUp();

  // Move the snake head
  snakeHead.x += snakeConfig.dx;
  snakeHead.y += snakeConfig.dy;

  // Handle collisions (wall, food, self, obstacle)
  handleWallCollision();
  handleFoodCollision();
  handleObstacleCollision();
  handleSelfCollision();

  // Update snake body by adding the new head and removing the tail
  snakeConfig.body.unshift({ x: snakeHead.x, y: snakeHead.y });
  if (snakeConfig.body.length > snakeConfig.length) {
    snakeConfig.body.pop();
  }

  // Render the snake
  renderSnake();

  // Update score display
  scoreText = `Score: ${score}`;
};

const levelUp = () => {
  if (level === 1 && score >= 25) {
    level = 2;

    // Display a message indicating the level transition
    const levelUpMessage = new PIXI.Text({
      text: "Level Up! Obstacle Added!",
      style: { fontSize: 24, fill: 0xff0000 },
    });
    levelUpMessage.anchor.set(0.5);
    levelUpMessage.position.set(WIDTH / 2, HEIGHT / 2);
    app.stage.addChild(levelUpMessage);

    // Remove the message after a short delay
    gsap.to(levelUpMessage, {
      alpha: 0,
      duration: 2,
      onComplete: () => app.stage.removeChild(levelUpMessage),
    });

    // Add an obstacle aligned to the grid
    const obstacleX = TILE_SIZE * (TILE_NUMBER / 2 - 2); // Centered horizontally
    const obstacleY = TILE_SIZE * (TILE_NUMBER / 2 - 1); // Centered vertically
    obstacle = new PIXI.Graphics();
    obstacle.fill(0x000000); // Black obstacle for visibility
    obstacle.rect(0, 0, TILE_SIZE * 4, TILE_SIZE); // 4 tiles wide, 1 tile high
    obstacle.fill();
    obstacle.position.set(obstacleX, obstacleY); // Set position on the stage
    app.stage.addChild(obstacle);

    app.ticker.maxFPS = speed;
  }
};

const createControlButtons = () => {
  // Remove existing controls, if any
  const existingControls = document.querySelector(".controls");
  if (existingControls) existingControls.remove();

  // Create container for buttons and score
  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add("controls");

  // Create score display
  const scoreDisplay = document.createElement("span");
  scoreDisplay.classList.add("score-display");
  scoreDisplay.textContent = `Score: ${score}`;
  controlsContainer.appendChild(scoreDisplay);

  // Create Pause button
  const pauseButton = document.createElement("button");
  pauseButton.textContent = "Pause";
  pauseButton.classList.add("button", "pause");
  pauseButton.addEventListener("click", () => {
    app.ticker.stop();
    pauseButton.style.display = "none";
    resumeButton.style.display = "inline-block";
  });
  controlsContainer.appendChild(pauseButton);

  // Create Resume button
  const resumeButton = document.createElement("button");
  resumeButton.textContent = "Resume";
  resumeButton.classList.add("button", "resume");
  resumeButton.style.display = "none"; // Initially hidden
  resumeButton.addEventListener("click", () => {
    app.ticker.start();
    resumeButton.style.display = "none";
    pauseButton.style.display = "inline-block";
  });
  controlsContainer.appendChild(resumeButton);

  // Append controls container to game container
  document.getElementById("game-container").appendChild(controlsContainer);
};

const updateScoreDisplay = () => {
  const scoreDisplay = document.querySelector(".score-display");
  scoreDisplay.textContent = `Score: ${score}`;
};

const handleKeyPress = (e) => {
  if (gameOver) return;

  switch (e.key) {
    case "ArrowLeft":
    case "a":
      if (snakeConfig.dx === 0) {
        snakeConfig.dx = -TILE_SIZE;
        snakeConfig.dy = 0;
      }
      break;
    case "ArrowUp":
    case "w":
      if (snakeConfig.dy === 0) {
        snakeConfig.dx = 0;
        snakeConfig.dy = -TILE_SIZE;
      }
      break;
    case "ArrowRight":
    case "d":
      if (snakeConfig.dx === 0) {
        snakeConfig.dx = TILE_SIZE;
        snakeConfig.dy = 0;
      }
      break;
    case "ArrowDown":
    case "s":
      if (snakeConfig.dy === 0) {
        snakeConfig.dx = 0;
        snakeConfig.dy = TILE_SIZE;
      }
      break;
  }
};

document.getElementById("start-button").addEventListener("click", initializeGame);
