// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function randomInt800() {
    return Math.floor(Math.random() * 750) + 30;
}

// The Shooter Army:
// shooter army's soldiers run away and shoot enemies
// run towards each other?
function Shooter(game, theX, theY) {
    this.type = "Shooter";
    this.color = "Blue";
    this.radius = 10;
    this.visualRadius = 400;
    this.shotRadius = 200;
    this.numShots = 1;
    this.lastShotTime = 0;
    this.x = theX;
    this.y = theY;
    this.HP = 1;
    this.running = false;
    this.game = game;
    this.velocity = { x: 50, y: 50};
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    Entity.call(this, game, this.x, this.y);
}

Shooter.prototype = new Entity();
Shooter.prototype.constructor = Shooter;

Shooter.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Shooter.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Shooter.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Shooter.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};
Shooter.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Shooter.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.lastShotTime += this.game.clockTick;

    if (this.HP <= 0) {
        this.removeFromWorld = true;
    }
    if (this.lastShotTime > 3 && this.numShots == 0) {
        this.lastShotTime = 0;
        this.numShots++;
    }
    this.x -= this.velocity.x * this.game.clockTick;
    this.y -= this.velocity.y * this.game.clockTick;

    if(this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    

    for (var i = 0; i < this.game.shooterArmy.length; i++) {
        var entity = this.game.shooterArmy[i];
        if (entity != this && this.collide(entity)) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
        }
    }
    this.running = false;
    for (var i = 0; i < this.game.meleeArmy.length; i++) {
        var entity = this.game.meleeArmy[i];
        if (entity != this && this.collide(entity)) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
        }
        if (entity != this && this.collide({ x: entity.x, y: entity.y, radius: this.visualRadius })) {
            var dist = distance(this, entity); 
            if (dist > this.radius + entity.radius + 10) {
                var difX = (entity.x - this.x) / dist;
                var difY = (entity.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                
                
            }
            this.running = true;
        }
        if (entity != this && this.collide({ x: entity.x, y: entity.y, radius: this.shotRadius })) {
            var dist = distance(this, entity);
            if (dist > this.radius + entity.radius) {
                var difX = (entity.x - this.x) / dist;
                var difY = (entity.y - this.y) / dist;
                if (this.numShots > 0) {
                    this.game.addEntity(new Bullet(this.game, this.x, this.y, entity));
                    this.numShots--;
                }  
            } 
        }    
    }
    if (!this.running) {
        entity = this.game.shooterArmy[randomInt(this.game.shooterArmy.length)];
        var dist = distance(this, entity);
        if (dist > this.radius + entity.radius + 2) {
            var difX = (entity.x - this.x) / dist;
            var difY = (entity.y - this.y) / dist;
            this.velocity.x -= difX * acceleration / (dist * dist);
            this.velocity.y -= difY * acceleration / (dist * dist);
        }
    }

    var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
}

Shooter.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

function Turret(game, theX, theY) {
    this.type = "Shooter";
    this.color = "Blue";
    this.radius = 10;
    this.shotRadius = 300;
    this.numShots = 0;
    this.lastShotTime = 0;
    this.x = theX;
    this.y = theY;
    this.HP = 1;
    Entity.call(this, game, this.x, this.y);
}

Turret.prototype = new Entity();
Turret.prototype.constructor = Turret;

Turret.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Turret.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.lastShotTime += this.game.clockTick;
    turretSpawnTime += this.game.clockTick;

    var randIntX = randomInt800();
    var randIntY = randomInt800();

    if (turretSpawnTime >= 1.75 && numTurrets <= maxTurrets) {
        this.game.addEntity(new Turret(this.game, randIntX, randIntY));
        numTurrets++;
        turretSpawnTime = 0;
    }
    if (this.HP <= 0) {
        this.removeFromWorld = true;
        numTurrets--;
    }
    if (this.lastShotTime > 0.75 && this.numShots == 0) {
        this.lastShotTime = 0;
        this.numShots++;
    }

    for (var i = 0; i < this.game.meleeArmy.length; i++) {
        var entity = this.game.meleeArmy[i];
        var closestEnemyDist = 1000;
        var closestEnemy = 1000;
        if (entity != this && this.collide({ x: entity.x, y: entity.y, radius: this.shotRadius })) {
            var dist = distance(this, entity);
            if (dist < closestEnemyDist) {
                closestEnemyDist = dist;
                closestEnemy = entity;
                if (this.numShots > 0) {
                    this.game.addEntity(new Bullet(this.game, this.x, this.y, closestEnemy));
                    this.numShots--;
                }
            }
              
        } 
    }
}

Turret.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

function Bullet(game, theX, theY, theTarget) {
    this.type = "Projectile";
    this.color = "White";
    this.radius = 5;
    this.x = theX;
    this.y = theY;
    this.timeAlive = 0;
    this.target = theTarget;
    this.velocity = { x: 100, y: 100};
    this.game = game;
    Entity.call(this.game, this.x, this.y);
}

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};
Bullet.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Bullet.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Bullet.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Bullet.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Bullet.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.timeAlive += this.game.clockTick;

    if (this.timeAlive >= 0.5) {
        this.removeFromWorld = true;
        this.timeAlive = 0;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    var temp = { x: this.velocity.x, y: this.velocity.y };

    var dist = distance(this, this.target);
    var delta = this.radius + this.target.radius - dist;
    var difX = (this.x - this.target.x) / dist;
    var difY = (this.y - this.target.y) / dist;

    this.x += difX * delta / 2;
    this.y += difY * delta / 2;

    this.velocity.x = this.target.velocity.x * friction;
    this.velocity.y = this.target.velocity.y * friction;
    this.target.velocity.x = temp.x * friction;
    this.target.velocity.y = temp.y * friction;   

    if(this.collideLeft() || this.collideRight()) {
        this.removeFromWorld = true;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.removeFromWorld = true;
    }

    for (var i = 0; i < this.game.meleeArmy.length; i++) {
        var entity = this.game.meleeArmy[i];
        if (entity != this && this.collide(entity)) {
            entity.HP -= 1;
            this.removeFromWorld = true;
        }
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
}

Bullet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

// Melee Army:
// this army's soldiers chase down enemies and attack from close range
function Melee(game, theX, theY) {
    this.type = "Melee";
    this.color = "Red";
    this.radius = 10;
    this.visualRadius = 600;
    this.x = theX;
    this.y = theY;
    this.HP = 1;
    this.game = game;
    this.velocity = { x: 75, y: 75};
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    Entity.call(this, game, this.x, this.y);
};

Melee.prototype = new Entity();
Melee.prototype.constructor = Melee;

Melee.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};
Melee.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Melee.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Melee.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Melee.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Melee.prototype.update = function () {
    Entity.prototype.update.call(this);
    meleeSpawnTime += this.game.clockTick;
    
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    var randIntX = randomInt800();
    var randIntY = randomInt800();

    if (meleeSpawnTime >= 1.75 && numMelee <= maxMelee) {
        this.game.addEntity(new Melee(this.game, randIntX, randIntY));
        meleeSpawnTime = 0;
        numMelee++;
    }
    if (this.HP <= 0) {
        this.removeFromWorld = true;
        numMelee--;
    }
    if (this.velocity.x === 0 && this.velocity.y === 0) {
        this.removeFromWorld = true;
    }

    if(this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.meleeArmy.length; i++) {
        var entity = this.game.meleeArmy[i];
        if (entity != this && this.collide(entity)) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
        }
    }

    // If we see a shooter soldier chase them down
    for (var i = 0; i < this.game.shooterArmy.length; i++) {
        var entity = this.game.shooterArmy[i];
        if (entity != this && this.collide(entity)) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
            entity.HP -= 1;
        }
        if (entity != this && this.collide({ x: entity.x, y: entity.y, radius: this.visualRadius })) {
            var dist = distance(this, entity); 
            if (dist > this.radius + entity.radius + 10) {
                var difX = (entity.x - this.x) / dist;
                var difY = (entity.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
            }
        }
    }

    var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
}

Melee.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

var friction = 1;
var acceleration = 200000;
var maxSpeed = 100; 
var maxTurrets = 1;
var numTurrets = 0;
var maxMelee = 10;
var numMelee = 0;
var turretSpawnTime = 0;
var meleeSpawnTime = 0;
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();

    var melee = new Melee(gameEngine, 30, 30);
    var melee2 = new Melee(gameEngine, 750, 750);
    gameEngine.addEntity(melee);
    gameEngine.addEntity(melee2);
    
    var turret = new Turret(gameEngine, 350, 350);
    gameEngine.addEntity(turret);
    
    gameEngine.init(ctx);
    gameEngine.start();
});


