// ***All ES6 Classes are here***

// The background (immune system)
class Background extends PIXI.AnimatedSprite {
    constructor(x = 0, y = 0){
        super(backgroundTextures);
        this.anchor.set(0, 0);
        this.scale.set(1);
        this.width = screenWidth;
        this.height = screenHeight;
        this.position.set((screenWidth / 2) - (this.width / 2), (screenHeight/2) - (this.height / 2));
        this.x = x;
        this.y = y;
        this.animationSpeed = 1 / 2;
        this.play();
    }
}

// The player (Ship-shaped antibody)
class Antibody extends PIXI.AnimatedSprite {
    constructor(radius, x = 0, y = 0){
        super(antibodyTextures);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.3);
        this.position.set((screenWidth / 2) - (this.width / 2), y);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.animationSpeed = 1 / 12;
        this.play();
    }
}

// The bacteriophage enemies (Spider-shaped viruses)
class Virus extends PIXI.AnimatedSprite {
    constructor(radius, x = 0, y = 0) {
        super(bacteriophageTextures);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.3);
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 75 + level * 5;
        this.isAlive = true;

        this.animationSpeed = 1 / 4;
        this.play();
    }

    // Move virus autonomously
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    // Reverse X direction
    reflectX() {
        this.fwd.x *= -1;
    }

    // Reverse Y direction
    reflectY() {
        this.fwd.y *= -1;
    }
}

// The escherichia enemies (Green bacteria)
class Bacteria extends PIXI.Sprite {
    constructor(radius, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/escherichia.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.3);
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50 + level * 5;
        this.isAlive = true;
    }

    // Move bacteria autonomously
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        this.rotation += 0.5 * dt;
    }

    // Reverse X Direction 
    reflectX() {
        this.fwd.x *= -1;
    }

    // Reverse Y Direction
    reflectY() {
        this.fwd.y *= -1;
    }
}

// The parasitic worm enemies
class Helminth extends PIXI.AnimatedSprite {
    constructor(radius, x = 0, y = 0) {
        super(helminthTextures);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.3);
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.animationSpeed = 3 / 4;
        this.play();

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 100 + level * 5;
        this.isAlive = true;
    }

    // Move helminth autonomously
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;

        if(this.fwd.y > 0){
            this.rotation = -Math.PI / 2;
        }else{
            
            this.rotation = Math.PI / 2;
        }
    }

    // Reverse X Direction
    reflectX() {
        this.fwd.x *= -1;
    }

    // Reverse Y Direction
    reflectY() {
        this.fwd.y *= -1;
    }
}

// The player's projectile
class Projectile extends PIXI.Graphics {
    constructor(color, x = 0, y = 0, rot) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;

        // Variables
        // Left
        if(rot == 3 * Math.PI / 2){
            this.fwd = {x: -1, y: 0}
        }
        // Right
        else if(rot == Math.PI / 2){
            this.fwd = {x: 1, y: 0};
        }
        // Up
        else if(rot == 0){
            this.fwd = {x: 0, y: -1};
        }
        // Down
        else if(rot == Math.PI){
            this.fwd = {x: 0, y: 1};
        }
        // Up-Left
        else if(rot == 7 * Math.PI / 4){
            this.fwd = {x: -1, y: -1};
        }
        // Up-Right
        else if(rot == Math.PI / 4){
            this.fwd = {x: 1, y: -1};
        }
        // Down-Left
        else if(rot == 5 * Math.PI / 4){
            this.fwd = {x: -1, y: 1};
        }
        // Down-Right
        else if(rot == 3 * Math.PI / 4){
            this.fwd = {x: 1, y: 1};
        }
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}