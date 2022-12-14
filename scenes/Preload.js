export default class Preload extends Phaser.Scene
{
  constructor ()
  {
    super('preload')
  }

  preload ()
  {
    this.progressDisplay()

    // Backgrounds
    this.load.image('sky', 'assets/sky.png')
    this.load.image('clouds', 'assets/clouds.png')
    this.load.image('hills', 'assets/hills.png')
    this.load.image('trees', 'assets/trees.png')

    // Sprites
    this.load.spritesheet('car_sheet', 'assets/car_sheet.png', {
      frameWidth: 700, frameHeight: 369
    })
    this.load.spritesheet('wheel_sheet', 'assets/wheel_sheet.png', {
      frameWidth: 700, frameHeight: 369
    })
    this.load.spritesheet('shadow_sheet', 'assets/shadow_sheet.png', {
      frameWidth: 900, frameHeight: 650
    })
    this.load.image('car', 'assets/car.png')
    this.load.image('tree', 'assets/tree.png')
    this.load.image('puff', 'assets/puff.png')
    this.load.atlas('atlas', 'assets/atlas_test.png', 'assets/atlas_test.json')
  }

  progressDisplay ()
  {
    let width   = this.cameras.main.width
    let height  = this.cameras.main.height
    let cX      = width / 2
    let cY      = height / 2

    let progressBar   = this.add.graphics()
    let progressBox   = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    let boxX  = cX - (320 / 2)
    let boxY  = cY - (50 / 2)
    progressBox.fillRect(boxX, boxY, 320, 50)

    let loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)
    
    let percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)
    
    let assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    })
    assetText.setOrigin(0.5, 0.5)
    
    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      let barX = cX - ((300 * value) / 2)
      let barY = cY - (30 / 2)
      progressBar.fillRect(barX, barY, 300 * value, 30)
    })
    
    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading asset: ' + file.key)
    })

    this.load.on('complete', () => {
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.scene.start('game')
        },
        callbackScope: this,
        loop: false
      })
    })
  }
}