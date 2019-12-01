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

import Bullet from './components/game';



var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
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
        preload: Bullet.preload,
        create: Bullet.create,
        update: Bullet.update,
        extend: {
            player: null,
            reticle: null,
            moveKeys: null,
            playerBullets: null,
            time: 0,
        }
    }
};

let game = new Bullet(config);


class App extends Component {

  constructor() {
    super();
    this.state = {
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
          preload: game.preload,
          create: game.create,
          update: game.update,
        }
      }
    };
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