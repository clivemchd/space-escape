# Space Escape

A 3D space game where you navigate through space debris to reach a black hole. Built with Three.js.

## Game Description

You control a damaged spaceship trying to reach a black hole while avoiding space debris and asteroids. Your ship's engine is damaged, leaving a trail of smoke as you navigate through space.

## Controls

- **Arrow Keys**: Control the spaceship movement (Up, Down, Left, Right)
- **Space Bar**: Shoot missiles to destroy asteroids
- **Mouse**: No mouse controls (keyboard only game)

## Features

- 3D space environment with a black hole
- Asteroid field obstacles
- Missile shooting mechanics
- Life system (3 attempts, lose 0.5 life per collision)
- Score system based on distance traveled
- Game over screen with restart option

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```
4. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- Three.js for 3D graphics
- Vite for development and building
- JavaScript for game logic

## Game Rules

- You have 3 lives
- Each collision with an asteroid costs 0.5 lives
- Score increases based on distance traveled
- Game ends when all lives are lost
- Destroy asteroids with missiles to earn bonus points
- Reach the black hole to win 