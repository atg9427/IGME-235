class Antibody extends PIXI.Sprite {
    constructor(x = 0, y = 0){
        super(gameWindow.loader.resources["game-images/antibody_spritesheet.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Virus extends PIXI.Sprite {
    constructor(radius, color = 0xFF0000, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/bacteriophage_spritesheet.png"].texture);
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;

        // variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Bacteria extends PIXI.Sprite {
    constructor(radius, color = 0xFF0000, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/escherichia.png"].texture);
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;

        // variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Helminth extends PIXI.Sprite {
    constructor(radius, color = 0xFF0000, x = 0, y = 0) {
        super(gameWindow.loader.resources["game-images/helminth_spritesheet.png"].texture);
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;

        // variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

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