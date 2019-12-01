import Phaser from 'phaser';

import GFS from './GFS.png';
import crosshair from './crosshair.png';
import floor from './floor.png';
import bullet6 from './bullet6.png';

export default class Bullet extends Phaser.Scene {
    
    constructor (config) {
        super(config);
        Phaser.GameObjects.Image.call(this, this.scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    }

    // Fires a bullet from the player to the reticle
    fire (shooter, target) {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    }

    // Updates the position of the bullet each cycle
    update (time, delta) {
        // Rotates player to face towards reticle
        this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.reticle.x, this.reticle.y);
    
        // Camera follows player ( can be set in create )
        this.cameras.main.startFollow(this.player);
    
        // Makes reticle move with player
        this.reticle.body.velocity.x = this.player.body.velocity.x;
        this.reticle.body.velocity.y = this.player.body.velocity.y;
    
        // Constrain velocity of player
        this.constrainVelocity(this.player, 500);
    
        // Constrain position of reticle
        this.constrainReticle(this.reticle);

        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    preload () {
        // Load in images and sprites
        this.load.spritesheet('player_handgun', GFS, {
            frameWidth: 66,
            frameHeight: 60
        });
        this.load.image('target', crosshair);
        this.load.image('background', floor);
        this.load.image('bullet', bullet6);
    }
    
    create () {
        // Create world bounds
        this.physics.world.setBounds(0, 0, 1600, 1200);
    
        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    
        // Add background, player, and reticle sprites
        var background = this.add.image(800, 600, 'background');
        this.player = this.physics.add.sprite(800, 600, 'player_handgun');
        this.reticle = this.physics.add.sprite(800, 700, 'target');
    
        // Set image/sprite properties
        background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
        this.this.player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
        this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
    
        // Set camera zoom
        // this.cameras.main.zoom = 0.5;
        this.cameras.main.zoom = 0.5; /* NEW*/
        this.cameras.main.startFollow(this.player);
    
        // Creates object for input with WASD kets
        let moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });
    
        // Enables movement of player with WASD keys
        this.input.keyboard.on('keydown_W', function (event) {
            this.player.setAccelerationY(-800);
        });
        this.input.keyboard.on('keydown_S', function (event) {
            this.player.setAccelerationY(800);
        });
        this.input.keyboard.on('keydown_A', function (event) {
            this.player.setAccelerationX(-800);
        });
        this.input.keyboard.on('keydown_D', function (event) {
            this.player.setAccelerationX(800);
        });
    
        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', function (event) {
            if (moveKeys['down'].isUp)
                this.player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_S', function (event) {
            if (moveKeys['up'].isUp)
                this.player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_A', function (event) {
            if (moveKeys['right'].isUp)
                this.player.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_D', function (event) {
            if (moveKeys['left'].isUp)
                this.player.setAccelerationX(0);
        });
    
        // lanuch bullet
        this.input.on('pointerdown', function (pointer, time, lastFired) {
            if (this.player.active === false)
                return;
    
            // Get bullet
            var bullet = this.playerBullets.get().setActive(true).setVisible(true);
            if (bullet) {
                bullet.fire(this.player, this.reticle);
                this.physics.add.collider(this.enemy, bullet, this.enemyHitCallback);
            }
        }, this);
    
        // Locks pointer on mousedown
        this.config.canvas.addEventListener('mousedown', function () {
            this.config.input.mouse.requestPointerLock();
        });
    
        // Exit pointer lock when Q or escape (by default) is pressed.
        this.input.keyboard.on('keydown_Q', function (event) {
            if (this.config.input.mouse.locked)
                this.config.input.mouse.releasePointerLock();
        }, 0, this);
    
        // Move reticle upon locked pointer move
        this.input.on('pointermove', function (pointer) {
            if (this.input.mouse.locked) {
                this.reticle.x += pointer.movementX;
                this.reticle.y += pointer.movementY;
            }
        }, this);
    
    }
    
    // Ensures sprite speed doesnt exceed maxVelocity while update is called
    constrainVelocity (sprite, maxVelocity) {
        if (!sprite || !sprite.body)
            return;
    
        var angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;
    
        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }
    
    // Ensures reticle does not move offscreen relative to player
    constrainReticle (reticle) {
        var distX = this.reticle.x - this.player.x; // X distance between player & reticle
        var distY = this.reticle.y - this.player.y; // Y distance between player & reticle
    
        // Ensures reticle cannot be moved offscreen
        if (distX > 800)
            this.reticle.x = this.player.x + 800;
        else if (distX < -800)
            this.reticle.x = this.player.x - 800;
    
        if (distY > 600)
            this.reticle.y = this.player.y + 600;
        else if (distY < -600)
            this.reticle.y = this.player.y - 600;
    }

}