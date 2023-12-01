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
    for(p of projectiles){
        p.move(dt);
    }

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

function createViruses(numViruses){
    for(let i = 0; i < numViruses; ++i){
        let v = new Virus(10, 0xFFFF00);
        v.x = Math.random() * (sceneWidth - 50) + 25;
        v.y = Math.random() * (sceneHeight - 400) + 25;
        viruses.push(v);
        gameScene.addChild(v);
    }
}

function createHelminths(numHelminths){
    for(let i = 0; i < numHelminths; ++i){
        let h = new Helminth(10, 0xFFFF00);
        h.x = Math.random() * (sceneWidth - 50) + 25;
        h.y = Math.random() * (sceneHeight - 400) + 25;
        helminths.push(h);
        gameScene.addChild(h);
    }
}

function createBacteria(numBacteria){
    for(let i = 0; i < numBacteria; ++i){
        let b = new Bacteria(10, 0xFFFF00);
        b.x = Math.random() * (sceneWidth - 50) + 25;
        b.y = Math.random() * (sceneHeight - 400) + 25;
        bacteria.push(b);
        gameScene.addChild(b);
    }
}

function loadLevel(){
    createViruses(level * (Math.random() * (5-3) + 3));
    createHelminths(level * (Math.random() * (5-2) + 2));
    createViruses(level * (Math.random() * (7-4) + 4));
    paused = false;
}

function end(){
    // Pause level
    paused = true;

    // Clear level
    viruses.forEach(v => gameScene.removeChild(v));
    viruses = [];
    helminths.forEach(h => gameScene.removeChild(h));
    helminths = [];
    bacteria.forEach(b => gameScene.removeChild(b));
    bacteria = [];
    projectiles.forEach(p => gameScene.removeChild(p));
    projectiles = [];

    // Show game over scene and final score
    gameOverScene.visible = true;
    gameScene.visible = false;
    gameOverScoreLabel = score;
}

function fireProjectile(e){
    if(paused) return;

    let p = new Projectile(0xFFFFFF, antibody.x, antibody.y);
    projectiles.push(p);
    gameScene.addChild(p);
    //shootSound.play();
}

function loadSpriteSheet(sprite){
    let spriteSheet;
    let width;
    let height;
    let numFrames;
    let textures;
    switch(sprite){
        case antibodyTextures:
            spriteSheet = PIXI.BaseTexture.from("game-images/antibody_spritesheet.png");
            width = 160;
            height = 160;
            numFrames = 6;
            textures = [];

            for(let i = 0; i < numFrames; ++i){
                let frame;
                if(i < 2){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
                } else if(i < 4){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-2)*width, 160, width, height));
                } else{
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-4)*width, 320, width, height));
                }
                textures.push(frame);
            }
            return textures;

        case bacteriophageTextures:
            spriteSheet = PIXI.BaseTexture.from("game-images/bacteriophage_spritesheet.png");
            width = 160;
            height = 160;
            numFrames = 12;
            textures = [];

            for(let i = 0; i < numFrames; ++i){
                let frame;
                if(i < 3){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
                } else if(i < 6){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-3)*width, 160, width, height));
                } else if(i < 9){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-6)*width, 320, width, height));
                } else{
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-9)*width, 480, width, height));
                }
                textures.push(frame);
            }
            return textures;

        case helminthTextures:
            spriteSheet = PIXI.BaseTexture.from("game-images/helminth_spritesheet.png");
            width = 160;
            height = 160;
            numFrames = 24;
            textures = [];

            for(let i = 0; i < numFrames; ++i){
                let frame;
                if(i < 6){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
                } else if(i < 12){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-6)*width, 160, width, height));
                } else if(i < 18){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-12)*width, 320, width, height));
                } else{
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-18)*width, 480, width, height));
                }
                textures.push(frame);
            }
            return textures;
    }
}