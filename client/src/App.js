/**
 * @flow
 */

import React, { Component } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
import './App.css'

import GFS from './components/GFS.png';
import crosshair from './components/crosshair.png';
import floor from './components/floor.png';
import bullet6 from './components/bullet6.png';

var game = new Phaser.Game(game);



function preload() {
  // Load in images and sprites
  this.load.spritesheet('player_handgun', GFS, {
      frameWidth: 66,
      frameHeight: 60
  });
  this.load.image('target', crosshair);
  this.load.image('background', floor);
  this.load.image('bullet', bullet6);
};

function create() {
  // Create world bounds
  this.physics.world.setBounds(0, 0, 1600, 1200);

  var playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

  // Add background, player, and reticle sprites
  var background = this.add.image(800, 600, 'background');
  var player = this.physics.add.sprite(800, 600, 'player_handgun');
  var reticle = this.physics.add.sprite(800, 700, 'target');

  // Set image/sprite properties
  background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
  player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
  reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);

  // Set camera zoom
  // this.cameras.main.zoom = 0.5;
  this.cameras.main.zoom = 0.5; /* NEW*/
  this.cameras.main.startFollow(player);

  // Creates object for input with WASD kets
  var moveKeys = this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
  });

  // Enables movement of player with WASD keys
  this.input.keyboard.on('keydown_W', function (event) {
      player.setAccelerationY(-800);
  });
  this.input.keyboard.on('keydown_S', function (event) {
      player.setAccelerationY(800);
  });
  this.input.keyboard.on('keydown_A', function (event) {
      player.setAccelerationX(-800);
  });
  this.input.keyboard.on('keydown_D', function (event) {
      player.setAccelerationX(800);
  });

  // Stops player acceleration on uppress of WASD keys
  this.input.keyboard.on('keyup_W', function (event) {
      if (moveKeys['down'].isUp)
          player.setAccelerationY(0);
  });
  this.input.keyboard.on('keyup_S', function (event) {
      if (moveKeys['up'].isUp)
          player.setAccelerationY(0);
  });
  this.input.keyboard.on('keyup_A', function (event) {
      if (moveKeys['right'].isUp)
          player.setAccelerationX(0);
  });
  this.input.keyboard.on('keyup_D', function (event) {
      if (moveKeys['left'].isUp)
          player.setAccelerationX(0);
  });

  // lanuch bullet
  this.input.on('pointerdown', function (pointer, time, lastFired) {
      if (player.active === false)
          return;

      // Get bullet
      var bullet = playerBullets.get().setActive(true).setVisible(true);
      if (bullet) {
          bullet.fire(player, reticle);
          this.physics.add.collider(bullet);
      }
  }, this);

  // Locks pointer on mousedown
  game.canvas.addEventListener('mousedown', function () {
      game.input.mouse.requestPointerLock();
  });

  // Exit pointer lock when Q or escape (by default) is pressed.
  this.input.keyboard.on('keydown_Q', function (event) {
      if (game.input.mouse.locked)
          game.input.mouse.releasePointerLock();
  }, 0, this);

  // Move reticle upon locked pointer move
  this.input.on('pointermove', function (pointer) {
      if (this.input.mouse.locked) {
          reticle.x += pointer.movementX;
          reticle.y += pointer.movementY;
      }
  }, this);

};

function update(time, delta) {

  var player = this.physics.add.sprite(800, 600, 'player_handgun');
  var reticle = this.physics.add.sprite(800, 700, 'target');

  // Rotates player to face towards reticle
  player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

  // Camera follows player ( can be set in create )
  this.cameras.main.startFollow(player);

  // Makes reticle move with player
  reticle.body.velocity.x = player.body.velocity.x;
  reticle.body.velocity.y = player.body.velocity.y;

  // Constrain velocity of player
  constrainVelocity(player, 500);

  // Constrain position of reticle
  constrainReticle(reticle);

};

function constrainReticle(reticle) {

  var player = this.physics.add.sprite(800, 600, 'player_handgun');


  var distX = reticle.x - player.x; // X distance between player & reticle
  var distY = reticle.y - player.y; // Y distance between player & reticle

  // Ensures reticle cannot be moved offscreen
  if (distX > 800)
      reticle.x = player.x + 800;
  else if (distX < -800)
      reticle.x = player.x - 800;

  if (distY > 600)
      reticle.y = player.y + 600;
  else if (distY < -600)
      reticle.y = player.y - 600;
};

function constrainVelocity(sprite, maxVelocity) {
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
};

/**/var Bullet = new Phaser.Class({

  Extends: Phaser.GameObjects.Image,

  initialize:

  // Bullet Constructor
  function Bullet (scene)
  {
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
      this.speed = 1;
      this.born = 0;
      this.direction = 0;
      this.xSpeed = 0;
      this.ySpeed = 0;
      this.setSize(12, 12, true);
  },

  // Fires a bullet from the player to the reticle
  fire: function (shooter, target)
  {
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
  },

  // Updates the position of the bullet each cycle
  update: function (time, delta)
  {
      this.x += this.xSpeed * delta;
      this.y += this.ySpeed * delta;
      this.born += delta;
      if (this.born > 1800)
      {
          this.setActive(false);
          this.setVisible(false);
      }
  }

});


class App extends Component {

  state = {
    unmounted: false,
    initialize: false,
    player: null,
    reticle: null,
    moveKeys: null,
    playerBullets: null,
    time: 0,
    game: {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
              y: 0
          },
          debug: true
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      }
    }
  }
  

  initializeGame = () => {
    this.setState({ initialize: true })
  }

  destroy = () => {
    this.setState({ unmounted: true })
  }

  render() {
    const { initialize, game, unmounted, player } = this.state
    return (
      <div className="App">
        <header className="App-header">
          { !initialize &&
            <React.Fragment>
              <div onClick={this.initializeGame} className="flex">
                <a href="#1" className="bttn">Begin</a>
              </div>
            </React.Fragment>
          }
          { !unmounted && <IonPhaser game={ game } player={ player } initialize={ initialize } /> }
          { initialize && !unmounted &&
            <div onClick={this.destroy} className="flex destroyButton">
              <a href="#1" className="bttn">Destroy</a>
            </div>
          }
        </header>
      </div>
    );
  }
}

export default App;