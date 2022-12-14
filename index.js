
import Preload from './scenes/Preload.js'
import Game from './scenes/Game.js'
import DebugHUD from './scenes/DebugHUD.js'

const config = {
  type            : Phaser.AUTO,
  parent          : 'phaser-app',
  title           : 'SAD Racer',
  url             : 'http://coestar.live',
  width           : 1920,
  height          : 1080,
  scale           : {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene           : [ Preload, Game, DebugHUD ],
  pixelArt        : false,
  backgroundColor : 0x000000
}

const game = new Phaser.Game(config)