"use strict";

// Make screen dimensions and add it to document.body
const gameWindow = new PIXI.Application({width: window.innerWidth - 20, height: window.innerHeight - 20});
document.body.appendChild(gameWindow.view);

// Make screen dimensions constants
const screenWidth = gameWindow.view.width;
const screenHeight = gameWindow.view.height;

// Pre-load images
gameWindow.loader.add([
    "game-images/abstract-background.gif",
    "game-images/antibody_spritesheet.png",
    "game-images/bacteriophage_spritesheet.png",
    "game-images/escherichia.png",
    "game-images/helminth_spritesheet.png"
]);

// Show progress in console and load the game
gameWindow.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
gameWindow.loader.onComplete.add(setUpGame);
gameWindow.loader.load();

// Player Controls
const keys = {
    W: true,
    A: false,
    S: true,
    D: false
};

// Player Direction
const direction = {
    Up: false,
    Down: false,
    Left: false,
    Right: false
};

// Event to move player
document.addEventListener('keydown', (e) => {
    // Reset directions to false
    direction.Up = false
    direction.Down = false
    direction.Left = false
    direction.Right = false

    e.preventDefault()
    if(e.key == "w"){
        keys.W = false
    }
    if(e.key == "s"){
        keys.S = false
    }
    if(e.key == "a"){
        keys.A = true
    }
    if(e.key == "d"){
        keys.D = true
    }

    if(!keys.W){
        direction.Up = true
    }
    if(!keys.S){
        direction.Down = true
    }
    if(keys.A){
        direction.Left = true
    }
    if(keys.D){
        direction.Right = true
    }
});

// Event to stop moving player
document.addEventListener('keyup', (e) => {
    e.preventDefault()
    if(e.key == "w"){
        keys.W = true
        direction.Up = false
    }
    if(e.key == "s"){
        keys.S = true
        direction.Down = false
    }
    if(e.key == "a"){
        keys.A = false
        direction.Left = false
    }
    if(e.key == "d"){
        keys.D = false
        direction.Right = false
    }
});

// Projectile and pause event
document.addEventListener('keydown', (e) => {
    // Can only have up to 3 on screen
    if(e.key == " " && projectiles.length < 3){
        fireProjectile()
    }
    if(e.key == "f" && gameScene.visible){
        paused = !paused

        if(paused == true){
            background.stop()
            antibody.stop()
            for(let v of viruses){
                v.stop()
            }
            for(let h of helminths){
                h.stop()
            }

            // Pause screen
            pauseLabel = new PIXI.Text("Paused\n\nPress F to continue")
            pauseLabel.style = new PIXI.TextStyle({
                fill: 0xFFFFFF,
                fontSize: 32,
                fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
                stroke: 0x38761D,
                strokeThickness: 3,
                align: "center"
            })
            pauseLabel.x = (screenWidth / 2) - (pauseLabel.width / 2)
            pauseLabel.y = 120
            gameScene.addChild(pauseLabel)

        }else{
            gameScene.removeChild(pauseLabel)
            background.play()
            antibody.play()
            for(let v of viruses){
                v.play()
            }
            for(let h of helminths){
                h.play()
            }
        }

        // Keep the player from moving on its own after unpausing
        keys.W = true
        keys.S = true
        keys.A = false
        keys.D = false
    }
});

// Game variables
let stage;
let startScene, controlsScene, gameScene, gameOverScene;
let antibody, background
let pauseLabel, scoreLabel, lifeLabel, levelLabel, gameOverScoreLabel;
let deathSound, damageSound, projectileSound, startSound;

let viruses = [];
let helminths = [];
let bacteria = [];
let projectiles = [];
let antibodyTextures, bacteriophageTextures, helminthTextures, backgroundTextures;
let score = 0;
let life = 100;
let level = 1;
let paused = true;

function setUpGame(){
    stage = gameWindow.stage;
    console.log(window.innerWidth);

    // Start scene
    startScene = new PIXI.Container();
    startScene.visible = true;
    stage.addChild(startScene);

    controlsScene = new PIXI.Container();
    controlsScene.visible = false;
    stage.addChild(controlsScene);

    // Game scene
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // Game over scene
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // Create background
    backgroundTextures = loadSpriteSheet(4);
    background = new Background();
    gameScene.addChild(background);

    // Create Labels & Buttons for each scene
    createLabelsAndButtons();

    // Load sounds
    projectileSound = new Howl({src: ['sounds/shoot.mp3']});
    damageSound = new Howl({src: ['sounds/hit.mp3']});
    deathSound = new Howl({src: ['sounds/player-death.mp3']});
    startSound = new Howl({src: ['sounds/game-start.mp3']});

    // Load spritesheets
    antibodyTextures = loadSpriteSheet(1);
    bacteriophageTextures = loadSpriteSheet(2);
    helminthTextures = loadSpriteSheet(3);

    // Create antibody (player)
    antibody = new Antibody(2.5);
    gameScene.addChild(antibody);

    // Start update loop
    gameWindow.ticker.add(gameLoop);

    // Listen for click events
}

function createLabelsAndButtons(){

    // Set button and text styles
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x00FF00,
        fontSize: 48,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy"
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0x00FF00,
        fontSize: 18,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
    });

    // Make title
    let titleLabel = new PIXI.Text("Antibody");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0x38761D,
        fontSize: 96,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        stroke: 0xFFFFFF,
        strokeThickness: 6
    });
    titleLabel.x = (screenWidth / 2) - (titleLabel.width / 2);
    titleLabel.y = 120;
    startScene.addChild(titleLabel);

    // Make subtitle
    let subtitleLabel = new PIXI.Text(" Made by Alexander Gough ");
    subtitleLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        fontStyle: "italic",
        stroke: 0x38761D,
        strokeThickness: 3
    });
    subtitleLabel.x = (screenWidth / 2) - (subtitleLabel.width / 2);
    subtitleLabel.y = titleLabel.y * 2;
    startScene.addChild(subtitleLabel);

    // Make start button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = (screenWidth / 2) - (startButton.width / 2);
    startButton.y = (1.125 * (screenHeight / 2)) - (startButton.height / 2);
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on('pointerup', startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.5);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1);
    startScene.addChild(startButton);

    // Make controls button
    let controlButton = new PIXI.Text("Controls");
    controlButton.style = buttonStyle;
    controlButton.x = (screenWidth / 2) - (controlButton.width / 2);
    controlButton.y = startButton.y + 50;
    controlButton.interactive = true;
    controlButton.buttonMode = true;
    controlButton.on('pointerup', showControls);
    controlButton.on('pointerover', e => e.target.alpha = 0.5);
    controlButton.on('pointerout', e => e.currentTarget.alpha = 1);
    startScene.addChild(controlButton);

    // Show Controls Header
    let controlsHeader = new PIXI.Text("Controls");
    controlsHeader.style = new PIXI.TextStyle({
        fill: 0x38761D,
        fontSize: 64,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        stroke: 0xFFFFFF,
        strokeThickness: 3
    });
    controlsHeader.x = (screenWidth / 2) - (controlsHeader.width / 2);
    controlsHeader.y = (screenHeight / 2) - 100;
    controlsScene.addChild(controlsHeader);

    // Show Controls Text
    let controlsText = new PIXI.Text("WASD: Move\nSpace: Fire\nF: Pause");
    controlsText.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        stroke: 0x38761D,
        strokeThickness: 3,
        align: "center"
    });
    controlsText.x = (screenWidth / 2) - (controlsText.width / 2);
    controlsText.y = controlsHeader.y + controlsHeader.height;
    controlsScene.addChild(controlsText);

    // Back button
    let backButton = new PIXI.Text("← Back");
    backButton.style = buttonStyle;
    backButton.x = 20;
    backButton.y = 20;
    backButton.interactive = true;
    backButton.buttonMode = true;
    backButton.on('pointerup', returnToMenu);
    backButton.on('pointerover', e => e.target.alpha = 0.5);
    backButton.on('pointerout', e => e.currentTarget.alpha = 1);
    controlsScene.addChild(backButton);

    // Make score text
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 26;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // Make life text
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 5;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // Make level label
    levelLabel = new PIXI.Text();
    levelLabel.style = textStyle;
    levelLabel.x = 5;
    levelLabel.y = 47;
    gameScene.addChild(levelLabel);
    increaseLevelBy(0);

    // Make game over text
    let gameOverText = new PIXI.Text("You were destroyed...\nalong with hope of saving the body...");
    gameOverText.style = new PIXI.TextStyle({
        fill: 0x38761D,
        fontSize: 64,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        stroke: 0xFFFFFF,
        strokeThickness: 3
    });

    if(window.innerWidth < 768){
        gameOverText.style = new PIXI.TextStyle({
            fill: 0x38761D,
            fontSize: 32,
            fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
            stroke: 0xFFFFFF,
            strokeThickness: 3,
            align: "center"
        });
    }
    gameOverText.x = (screenWidth / 2) - (gameOverText.width / 2);
    gameOverText.y = screenHeight / 2 - 170;
    gameOverScene.addChild(gameOverText);

    // Make retry button
    let retryButton = new PIXI.Text("Retry?");
    retryButton.style = buttonStyle;

    if(window.innerWidth < 768){
        retryButton.style = new PIXI.TextStyle({
            fill: buttonStyle.fill,
            fontSize: 32,
            fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        });
    }

    retryButton.x = (screenWidth / 2) - (retryButton.width / 2);
    retryButton.y = (screenHeight / 2) + 150;
    retryButton.interactive = true;
    retryButton.buttonMode = true;
    retryButton.on("pointerup", startGame);
    retryButton.on('pointerover', e => e.target.alpha = 0.7);
    retryButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(retryButton);

    // Return to menu button
    let returnButton = new PIXI.Text("Return to menu");
    returnButton.style = buttonStyle;

    if(window.innerWidth < 768){
        returnButton.style = new PIXI.TextStyle({
            fill: buttonStyle.fill,
            fontSize: 32,
            fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        });
    }

    returnButton.x = (screenWidth / 2) - (returnButton.width / 2);
    returnButton.y = retryButton.y + retryButton.height;
    returnButton.interactive = true;
    returnButton.buttonMode = true;
    returnButton.on('pointerup', returnToMenu);
    returnButton.on('pointerover', e => e.target.alpha = 0.5);
    returnButton.on('pointerout', e => e.currentTarget.alpha = 1);
    gameOverScene.addChild(returnButton);
}

// Start the game
function startGame(){
    gameOverScene.removeChild(gameOverScoreLabel);
    startScene.visible = false;
    controlsScene.visible = false;
    gameScene.visible = true;
    gameOverScene.visible = false;
    level = 1;
    score = 0;
    life = 10;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    increaseLevelBy(0);
    antibody.x = (screenWidth / 2) - (antibody.width / 2);
    antibody.y = 650;
    loadLevel();
    startSound.play();
}

// Move to the controls scene
function showControls(){
    startScene.visible = false;
    controlsScene.visible = true;
    gameScene.visible = false;
    gameOverScene.visible = false;
}

// Return to the start scene
function returnToMenu(){
    startScene.visible = true;
    controlsScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = false;
}

// Increase the score
function increaseScoreBy(point){
    score += point;
    scoreLabel.text = `Exterminated: ${score}`;
}

// Decrease the health
function decreaseLifeBy(hit){
    life -= hit;
    life = parseInt(life);
    lifeLabel.text = `Antibody structural integrity: ${life}`;
}

// Increase the level
function increaseLevelBy(num = 1){
    level += num;
    level = parseInt(level);
    levelLabel.text = `Area: ${level}`;
}

// Updates the game every frame
function gameLoop(){
    if(paused) return;

    // Delta time
    let dt = 1/gameWindow.ticker.FPS;
    if(dt > 1/12) dt = 1/12;

    // Move antibody
    let futurePlayerPosition = antibody;
    let speed = 3;
    let amount = 1 * dt;

    if(keys.W){
        futurePlayerPosition.y += speed + amount;
    }

    if(keys.A){
        futurePlayerPosition.x -= speed + amount;
    }

    if(keys.S){
        futurePlayerPosition.y -= speed + amount;
    }

    if(keys.D){
        futurePlayerPosition.x += speed + amount;
    }

    let newX = lerp(antibody.x, futurePlayerPosition.x, amount);
    let newY = lerp(antibody.y, futurePlayerPosition.y, amount);

    let w2 = antibody.width / 2;
    let h2 = antibody.height / 2;

    antibody.x = clamp(newX, 0 + w2, screenWidth - w2);
    antibody.y = clamp(newY, 0 + h2, screenHeight - h2);

    // Make player face direction it's moving in
    if(direction.Left && !direction.Up && !direction.Down){
        antibody.rotation = 3 * Math.PI / 2;
    }
    else if(direction.Right && !direction.Up && !direction.Down){
        antibody.rotation = Math.PI / 2;
    }
    else if(direction.Up){
        antibody.rotation = 0;
        if(direction.Left){
            antibody.rotation = 7 * Math.PI / 4
        }else if(direction.Right){
            antibody.rotation = Math.PI / 4
        }
    }
    else if(direction.Down){
        antibody.rotation = Math.PI;
        if(direction.Left){
            antibody.rotation = 5 * Math.PI / 4
        }else if(direction.Right){
            antibody.rotation = 3 * Math.PI / 4
        }
    }

    // Move enemies
        // 1 - Move Viruses
        for(let v of viruses){
            v.move(dt);
            if(v.x <= v.radius || v.x >= screenWidth - v.radius){
                v.reflectX();
                v.move(dt);
            }

            if(v.y <= v.radius || v.y >= screenHeight - v.radius){
                v.reflectY();
                v.move(dt);
            }
        }
        
        // 2 - Move Bacteria
        for(let b of bacteria){
            b.move(dt);
            if(b.x <= b.radius || b.x >= screenWidth - b.radius){
                b.reflectX();
                b.move(dt);
            }

            if(b.y <= b.radius || b.y >= screenHeight - b.radius){
                b.reflectY();
                b.move(dt);
            }
        }

        // 3 - Move Helminths
        for(let h of helminths){
            h.move(dt);
            if(h.x <= h.radius || h.x >= screenWidth - h.radius){
                h.reflectX();
                h.move(dt);
            }

            if(h.y <= h.radius || h.y >= screenHeight - h.radius){
                h.reflectY();
                h.move(dt);
            }
        }

    // Move projectiles
    for(let p of projectiles){
        p.move(dt);
    }

    // Check for collisions
        // 1 - Viruses
        for (let v of viruses) {
            for (let p of projectiles) {
                // Viruses & Projectiles
                if (rectsIntersect(v, p)) {
                    damageSound.play();
                    gameScene.removeChild(v);
                    v.isAlive = false;
                    gameScene.removeChild(p);
                    p.isAlive = false;
                    increaseScoreBy(1);
                }

                // Remove every projectile that is out of bounds
                if (p.y < -10 || p.y > screenHeight + 10 || p.x < -10 || p.x > screenWidth + 10) p.isAlive = false;
            }
            
            // Viruses & Antibody
            if (v.isAlive && rectsIntersect(v, antibody)) {
                damageSound.play();
                gameScene.removeChild(v);
                v.isAlive = false;
                decreaseLifeBy(1);
            }
        }

        // 2 - Bacteria
        for (let b of bacteria) {
            for (let p of projectiles) {
                // Bacteria & Projectiles
                if (rectsIntersect(b, p)) {
                    damageSound.play();
                    gameScene.removeChild(b);
                    b.isAlive = false;
                    gameScene.removeChild(p);
                    p.isAlive = false;
                    increaseScoreBy(1);
                }

                // Remove every projectile that is out of bounds
                if (p.y < -10 || p.y > screenHeight + 10 || p.x < -10 || p.x > screenWidth + 10) p.isAlive = false;
            }
            
            // Bacteria & Antibody
            if (b.isAlive && rectsIntersect(b, antibody)) {
                damageSound.play();
                gameScene.removeChild(b);
                b.isAlive = false;
                decreaseLifeBy(1);
            }
        }

        // 3 - Helminths
        for (let h of helminths) {
            for (let p of projectiles) {
                // Helminths & Projectiles
                if (rectsIntersect(h, p)) {
                    damageSound.play();
                    gameScene.removeChild(h);
                    h.isAlive = false;
                    gameScene.removeChild(p);
                    p.isAlive = false;
                    increaseScoreBy(1);
                }

                // Remove every projectile that is out of bounds
                if (p.y < -10 || p.y > screenHeight + 10 || p.x < -10 || p.x > screenWidth + 10) p.isAlive = false;
            }
            
            // Helminths & Antibody
            if (h.isAlive && rectsIntersect(h, antibody)) {
                damageSound.play();
                gameScene.removeChild(h);
                h.isAlive = false;
                decreaseLifeBy(1);
            }
        }

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
    if(viruses.length == 0 && helminths.length == 0 && bacteria.length == 0){
        increaseLevelBy(1);
        loadLevel();
    }
}

// Create bacteriophages
function createViruses(numViruses){
    for(let i = 0; i < numViruses; ++i){
        let v = new Virus(2.5);
        v.x = Math.random() * (screenWidth - 50) + 25;
        v.y = Math.random() * (screenHeight - 400) + 25;
        viruses.push(v);
        gameScene.addChild(v);
    }
}

// Create helminths (parasitic worms)
function createHelminths(numHelminths){
    for(let i = 0; i < numHelminths; ++i){
        let h = new Helminth(2.5);
        h.x = Math.random() * (screenWidth - 50) + 25;
        h.y = Math.random() * (screenHeight - 400) + 25;
        helminths.push(h);
        gameScene.addChild(h);
    }
}

// Create escherichia bacteria
function createBacteria(numBacteria){
    for(let i = 0; i < numBacteria; ++i){
        let b = new Bacteria(2.5);
        b.x = Math.random() * (screenWidth - 50) + 25;
        b.y = Math.random() * (screenHeight - 400) + 25;
        bacteria.push(b);
        gameScene.addChild(b);
    }
}

// Load the level by filling it with increasingly random enemies
function loadLevel(){
    createViruses(level * (Math.random() * (5-3) + 3));
    createHelminths(level * (Math.random() * (5-2) + 2));
    createBacteria(level * (Math.random() * (7-4) + 4));
    paused = false;
}

// When the player dies, clear the game and show game over scene
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
    console.log(score);

    // Check if it can be saved as a high score
    let savedHighScore = localStorage.getItem('highScore');
    if(savedHighScore == null){
        localStorage.setItem('highScore', score);
    }else{
        savedHighScore = parseInt(savedHighScore);
        if(score > savedHighScore){
            localStorage.setItem('highScore', score);
        }
    }

    // Show final score and high score
    gameOverScoreLabel = new PIXI.Text(`Final extermination count: ${score}\nHighest extermination count: ${localStorage.getItem('highScore')}`);
    gameOverScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 48,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        stroke: 0x38761D,
        strokeThickness: 3
    });

    if(window.innerWidth < 768){
        gameOverScoreLabel.style = new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: 32,
            fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
            stroke: 0x38761D,
            strokeThickness: 3,
        });
    }
    
    gameOverScoreLabel.x = (screenWidth / 2) - (gameOverScoreLabel.width / 2);
    gameOverScoreLabel.y = screenHeight / 2;

    gameOverScene.addChild(gameOverScoreLabel);

    gameOverScene.visible = true;
    gameScene.visible = false;
    deathSound.play();
}

// Allows the player to fire a projectile
function fireProjectile(e){
    if(paused) return;

    let p = new Projectile(0xFFFFFF, antibody.x, antibody.y, antibody.rotation);
    projectiles.push(p);
    gameScene.addChild(p);
    projectileSound.play();
}

// Add each frame to each sprite sheet's texture array
function loadSpriteSheet(sprite){
    let spriteSheet;
    let width;
    let height;
    let numFrames;
    let textures;
    switch(sprite){
        case 1:
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

        case 2:
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

        case 3:
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
        case 4:
            spriteSheet = PIXI.BaseTexture.from("game-images/background.png");
            width = 1000;
            height = 1000;
            numFrames = 37;
            textures = [];

            for(let i = 0; i < numFrames; i++){
                let frame;
                if(i < 9){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 0, width, height));
                } else if(i < 18){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-9)*width, 1000, width, height));
                } else if(i < 27){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-18)*width, 2000, width, height));
                } else if(i < 36){
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-27)*width, 3000, width, height));
                } else{
                    frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle((i-36)*width, 4000, width, height));
                }
                textures.push(frame);
            }
            return textures;
    }
}