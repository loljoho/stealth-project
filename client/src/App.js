/**
 * @flow
 */

import React, { Component } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'
//import logo from '../public/logo512.png'

import './App.css'

class App extends Component {

  state = {
    unmounted: false,
    initialize: false,
    game: {
      width: "100%",
      height: "100%",
      type: Phaser.AUTO,
      scene: {
        init: function() {
          this.cameras.main.setBackgroundColor('#24252A')
        },
        create: function() {
          this.helloWorld = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            "Play Area", { 
              font: "40px Arial", 
              fill: "#ffffff" 
            }
          );
          this.helloWorld.setOrigin(0.5);
        },
        update: function() {
          this.helloWorld.angle += 1;
        }
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
    const { initialize, game, unmounted } = this.state
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
          { !unmounted && <IonPhaser game={game} initialize={initialize} /> }
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