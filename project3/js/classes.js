// The player (Ship-shaped antibody)
class Antibody extends PIXI.Sprite {
    constructor(x = 0, y = 0){
        super(gameWindow.loader.resources["game-images/antibody_spritesheet.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

// The bacteriophage enemies (Spider-shaped viruses)
class Virus extends PIXI.Sprite {
    constructor(radius, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/bacteriophage_spritesheet.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
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
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    // Move bacteria autonomously
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
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
class Helminth extends PIXI.Sprite {
    constructor(radius, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/helminth_spritesheet.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
        this.radius = radius;

        // Variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    // Move helminth autonomously
    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
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
    constructor(color = 0xFFFFFF, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;

        // Variables
        this.fwd = {x: 0, y: -1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}