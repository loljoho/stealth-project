import React, { Component } from 'react'
import Phaser from 'phaser'
import { IonPhaser } from '@ion-phaser/react'

export class LoadScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.LOAD
        })
    }
    init() {


    }
    preload() {
        // change screen res to 800x600

        //load image,spritesheet, sound



        /*
        create a loading bar
        Loader Events:
            complete - when done loading everything
            progress - loader number progress in decimal
        */










    }
    create() {
        //this.scene.start(CST.SCENES.MENU, "hello from LoadScene");



    }
}