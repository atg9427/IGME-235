"use strict";

// Make screen dimensions and add it to document.body
const gameWindow = new PIXI.Application({width: 800, height: 800});
document.body.appendChild(gameWindow.view);

// Make screen dimensions constants
const screenWidth = gameWindow.view.width;
const screenHeight = gameWindow.view.height;

// Pre-load images
gameWindow.loader.add([
    "game-images/antibody_spritesheet.png",
    "game-images/bacteriophage_spritesheet.png",
    "game-images/escherichia.png",
    "game-images/helminth_spritesheet.png"
]);

gameWindow.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
gameWindow.loader.onComplete.add(setup);
gameWindow.loader.load();

// Game variables
let stage, startScene, gameScene, gameOverScene, antibody, scoreLabel, lifeLabel, gameOverScoreLabel, shootSound, damageSound, projectileSound;

let viruses = [];
let helminths = [];
let bacteria = [];
let projectiles = [];
let aliens = [];
let explosions = [];
let antibodyTextures, bacteriophageTextures, helminthTextures, explosionTextures;
let score = 0;
let life = 100;
let level = 1;
let paused = true;

function setUpGame(){
    stage = gameWindow.stage;

    // Start scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // Game scene
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Game over scene
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create Labels & Buttons for each scene
    createLabelsAndButtons();

    // Create antibody (player)
    antibody = new Antibody();
    gameScene.addChild(antibody);

    // Load sounds

    // Load spritesheets
    antibodyTextures = loadSpriteSheet();
    bacteriophageTextures = loadSpriteSheet();
    helminthTextures = loadSpriteSheet();

    // Start update loop
    gameWindow.ticker.add(gameLoop);

    // Listen for click events
}

function createLabelsAndButtons(){

    // Set button and text styles
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Fantasy"
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Fantasy",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    // Make title
    let titleLabel = new PIXI.Text("Antibody");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Fantasy",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    titleLabel.x = 50;
    titleLabel.y = 120;
    startScene.addChild(titleLabel);

    // Make subtitle
    let subtitleLabel = new PIXI.Text("Can you defend the body?");
    subtitleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Fantasy",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    subtitleLabel.x = 185;
    subtitleLabel.y = 300;
    startScene.addChild(subtitleLabel);

    // Make start button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // Make score text
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // Make life text
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // Make game over text
    gameOverScoreLabel = 0;
    let gameOverText = new PIXI.Text("You were destroyed...\nalong with hope of saving the body...");
    gameOverText.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Fantasy",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.x = 100;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    // Make retry button
    let retryButton = new PIXI.Text("Retry?");
    retryButton.style = buttonStyle;
    retryButton.x = 170;
    retryButton.y = sceneHeight - 120;
    retryButton.interactive = true;
    retryButton.buttonMode = true;
    retryButton.on("pointerup", startGame);
    retryButton.on('pointerover', e => e.target.alpha = 0.7);
    retryButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(retryButton);
}

function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    level = 1;
    score = 0;
    life = 10;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    antibody.x = 300;
    antibody.y = 550;
    loadLevel();
}

function increaseScoreBy(point){
    score += point;
    scoreLabel.text = `Exterminated: ${score}`;
}

function decreaseLifeBy(hit){
    life -= hit;
    life = parseInt(life);
    lifeLabel,text = `Antibody structural integrity: ${life}`;
}

function gameLoop(){
    if(paused) return;

    // Delta time
    let dt = 1/gameWindow.ticker.FPS;
    if(dt > 1/30) dt = 1/30;

    // Move antibody

    // Move enemies

    // Move projectiles

    // Check for collisions

    // Cleanup
    projectiles = projectiles.filter(p => p.isAlive);
    viruses = viruses.filter(v => v.isAlive);
    helminths = helminths.filter(h => h.isAlive);
    bacteria = bacteria.filter(b => b.isAlive);

    // Check for game over
    if(life <= 0){
        end();
        return;
    }

    // Load next level
    if(viruses.length == 0 && helmenths.length == 0 && bacteria.length == 0){
        level++;
        loadLevel();
    }
}