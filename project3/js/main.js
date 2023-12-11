"use strict";

// Make screen dimensions and add it to document.body
const gameWindow = new PIXI.Application({width: 1500, height: 700});
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

gameWindow.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
gameWindow.loader.onComplete.add(setUpGame);
gameWindow.loader.load();

// Controls
const keys = {
    W: true,
    A: false,
    S: true,
    D: false
};

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
    if(e.key === "w"){
        keys.W = false
    }
    if(e.key === "s"){
        keys.S = false
    }
    if(e.key === "a"){
        keys.A = true
    }
    if(e.key === "d"){
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
    if(e.key === "w"){
        keys.W = true
        direction.Up = false
    }
    if(e.key === "s"){
        keys.S = true
        direction.Down = false
    }
    if(e.key === "a"){
        keys.A = false
        direction.Left = false
    }
    if(e.key === "d"){
        keys.D = false
        direction.Right = false
    }
});

// Projectile event
document.addEventListener('keydown', (e) => {
    // Can only have up to 3 on screen
    if(e.key === " " && projectiles.length < 3){
        fireProjectile();
    }
});

// Game variables
let stage;
let startScene;
let gameScene, antibody, background, scoreLabel, lifeLabel, levelLabel, gameOverScoreLabel, deathSound, damageSound, projectileSound, startSound;
let gameOverScene;

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
    let subtitleLabel = new PIXI.Text(" Can you defend the body? ");
    subtitleLabel.style = new PIXI.TextStyle({
        fill: 0x38761D,
        fontSize: 32,
        fontFamily: "Copperplate, Copperplate Gothic Light, Fantasy",
        //fontStyle: "italic",
        stroke: 0xFFFFFF,
        strokeThickness: 2
    });
    subtitleLabel.x = (screenWidth / 2) - (subtitleLabel.width / 2);
    subtitleLabel.y = titleLabel.y * 2;
    startScene.addChild(subtitleLabel);

    // Make start button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = (screenWidth / 2) - (startButton.width / 2);
    startButton.y = (1.25 * (screenHeight / 2)) - (startButton.height / 2);
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame);
    startButton.on('pointerover', e => e.target.alpha = 0.5);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1);
    startScene.addChild(startButton);

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
    gameOverText.x = (screenWidth / 2) - (gameOverText.width / 2);
    gameOverText.y = screenHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);


    // Make retry button
    let retryButton = new PIXI.Text("Retry?");
    retryButton.style = buttonStyle;
    retryButton.x = (screenWidth / 2) - (retryButton.width / 2);
    retryButton.y = screenHeight - 120;
    retryButton.interactive = true;
    retryButton.buttonMode = true;
    retryButton.on("pointerup", startGame);
    retryButton.on('pointerover', e => e.target.alpha = 0.7);
    retryButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(retryButton);
}

// Start the game
function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
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

function increaseLevelBy(num = 1){
    level += num;
    level = parseInt(level);
    levelLabel.text = `Area: ${level}`;
}

function gameLoop(){
    if(paused) return;

    // Delta time
    let dt = 1/gameWindow.ticker.FPS;
    if(dt > 1/12) dt = 1/12;

    // Move antibody
    let futurePlayerPosition = antibody;
    let speed = 3;
    let velocity = 1 * dt;

    if(keys.W){
        futurePlayerPosition.y += speed + velocity;
    }

    if(keys.A){
        futurePlayerPosition.x -= speed + velocity;
    }

    if(keys.S){
        futurePlayerPosition.y -= speed + velocity;
    }

    if(keys.D){
        futurePlayerPosition.x += speed + velocity;
    }

    let newX = lerp(antibody.x, futurePlayerPosition.x, velocity);
    let newY = lerp(antibody.y, futurePlayerPosition.y, velocity);

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

                if (p.y < -10) p.isAlive = false;
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

                if (p.y < -10) p.isAlive = false;
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

function createViruses(numViruses){
    for(let i = 0; i < numViruses; ++i){
        let v = new Virus(2.5);
        v.x = Math.random() * (screenWidth - 50) + 25;
        v.y = Math.random() * (screenHeight - 400) + 25;
        viruses.push(v);
        gameScene.addChild(v);
    }
}

function createHelminths(numHelminths){
    for(let i = 0; i < numHelminths; ++i){
        let h = new Helminth(2.5);
        h.x = Math.random() * (screenWidth - 50) + 25;
        h.y = Math.random() * (screenHeight - 400) + 25;
        helminths.push(h);
        gameScene.addChild(h);
    }
}

function createBacteria(numBacteria){
    for(let i = 0; i < numBacteria; ++i){
        let b = new Bacteria(2.5);
        b.x = Math.random() * (screenWidth - 50) + 25;
        b.y = Math.random() * (screenHeight - 400) + 25;
        bacteria.push(b);
        gameScene.addChild(b);
    }
}

function loadLevel(){
    createViruses(level * (Math.random() * (5-3) + 3));
    createHelminths(level * (Math.random() * (5-2) + 2));
    createBacteria(level * (Math.random() * (7-4) + 4));
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

    // Show game over scene and final score\
    gameOverScoreLabel = score;
    gameOverScoreLabel = parseInt(gameOverScoreLabel);
    gameOverScene.visible = true;
    gameScene.visible = false;
    deathSound.play();
}

function fireProjectile(e){
    if(paused) return;

    let p = new Projectile(0xFFFFFF, antibody.x, antibody.y, antibody.rotation);
    projectiles.push(p);
    gameScene.addChild(p);
    projectileSound.play();
}

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