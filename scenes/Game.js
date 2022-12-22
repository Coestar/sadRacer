import Render from '../modules/Render.js'
import Road from '../modules/Road.js'
import Segments from '../modules/Segments.js'

export default class Game extends Phaser.Scene
{
  constructor ()
  {
    super('game')

    this.background    = null // our background image
    this.width         = 1920
    this.height        = 1080
    this.resolution    = null // scaling factor to provide resolution independence (computed)

    this.roadWidth     = 2000 // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    this.segmentLength = 200  // length of a single segment
    this.rumbleLength  = 3    // number of segments per red/white rumble strip
    this.trackLength   = null // z length of entire track (computed)
    this.lanes         = 3    // number of lanes

    this.uknFactor1    = 1
    this.uknFactor2    = 200
    this.fieldOfView   = 100  // angle (degrees) for field of view
    this.cameraHeight  = 800 // z height of camera
    this.cameraDepth   = this.uknFactor1 / Math.tan((this.fieldOfView/2) * Math.PI/180) // z distance camera is from screen (computed)
    this.playerX       = 0    // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    this.playerY       = 0
    this.playerZ       = this.cameraHeight * this.cameraDepth + this.uknFactor2 // player relative z distance from camera (computed)
    this.fogDensity    = 1    // exponential fog density
    this.position      = 0    // current camera Z position (add playerZ to get player's absolute Z position)

    this.speed         = 0    // current speed
    this.maxSpeed      = 12000
    this.accel         =  this.maxSpeed/5  // acceleration rate - tuned until it 'felt' right
    this.braking       = -this.maxSpeed    // deceleration rate when braking
    this.decel         = -this.maxSpeed/5  // 'natural' deceleration rate when neither accelerating, nor braking
    this.offRoadDecel  = -this.maxSpeed/2  // off road deceleration is somewhere in between
    this.offRoadLimit  =  this.maxSpeed/4  // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    this.inertia       = 0//0.15 // centrifugal force multiplier when going around curves
    
    this.debugMaxY    = 0

    this.cameraZoom   = 1
    
    this.autoDrive    = true

    this.keyFaster    = false
    this.keySlower    = false
    this.keyLeft      = false
    this.keyRight     = false

    this.cX           = this.width/2
    this.cY           = this.height/2

    this.playerCar    = null
    this.playerWheels = null
    this.playerShadow = null

    this.bg_sky
    this.bg_clouds
    this.bg_hills
    this.bg_trees

    this.cloudSpeed  = 0.001 // background cloud layer scroll speed when going around curve (or up hill)
    this.hillSpeed   = 0.002 // background hill layer scroll speed when going around curve (or up hill)
    this.treeSpeed   = 0.003 // background tree layer scroll speed when going around curve (or up hill)
    this.cloudOffset = 0   // current sky scroll offset
    this.hillOffset  = 0   // current hill scroll offset
    this.treeOffset  = 0   // current tree scroll offset

    // This needs to be re-evaluated
    this.scaleReference = 80 // Magic number, used to be width of player car straight sprite
    this.spritesScale  = 0.3 * (1/this.scaleReference) // the reference sprite width should be 1/3rd the (half-)roadWidth

    this.colors       = {
      SKY:  0x72D7EE,
      TREE: 0x005108,
      FOG:  0x5692DB,
      LIGHT:  { road: 0x6B6B6B, grass: 0x10AA10, rumble: 0x555555, lane: 0xCCCCCC  },
      DARK:   { road: 0x696969, grass: 0x009A00, rumble: 0xBBBBBB                  },
      START:  { road: 0xFFFFFF,   grass: 0x10AA10,   rumble: 0xFFFFFF              },
      FINISH: { road: 0x000000,   grass: 0x10AA10,   rumble: 0x000000              }
    }

    this.puffs = null

    this.atlasTexture   = null
    this.frameNames     = null
    this.poolGroup      = null

    this.orthoTest      = false
    this.quadTest       = null
    this.quadVertices   = null
    this.quadUVs        = null
    this.quadIndicies   = null
    this.vertCache      = null
    this.meshText       = null
  }

  init ()
  {
    this.Render = new Render(this)
    this.Segments = new Segments(this)
    this.Road = new Road(this)
  }

  create ()
  {



    this.atlasTexture   = this.textures.get('atlas')
    this.frameNames     = this.atlasTexture.getFrameNames()
    console.log(this.frameNames)

    this.debugHUD = this.scene.get('debug-hud')

    this.bg_sky = this.add.image(this.cX, this.cY, 'sky').setDepth(-4)
    this.bg_clouds = this.add.tileSprite(0, 0, this.width, this.height, 'wide_bg_test').setOrigin(0).setDepth(-3)//.setTileScale(3)
    this.bg_hills = this.add.tileSprite(0, 0, this.width, this.height, 'far_hills_test').setOrigin(0).setDepth(-2)
    this.bg_trees = this.add.tileSprite(0, 0, this.width, this.height, 'near_hills_test').setOrigin(0).setDepth(-1)

    this.puffs = this.add.particles('puff')
    this.puffs.createEmitter({
      angle: { min: 45, max: 135 },
      speed: 1500, //{ min: 200, max: 300 },
      quantity: 1,
      lifespan: 100,
      alpha: { start: .5, end: 0 },
      scale: { start: 1.5, end: 5 },
      on: false
    })
    this.puffs.setDepth(2003)

    // delay drive start
    if (this.autoDrive)
    {
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.overrideFaster = true
        },
        callbackScope: this,
        loop: false
      })
    }
    
    // Zoom in camera to hide my bad programming
    this.cameras.main.setZoom(this.cameraZoom)

    
    // this.scene.run('debug-hud')

    this.cursors = this.input.keyboard.createCursorKeys()
    this.keys = this.input.keyboard.addKeys('Q,W,E,A,S,D')

    this.keys.Q.on('up', () => {
      if (this.scene.isActive('debug-hud'))
      {
        this.scene.stop('debug-hud')
      } 
      else
      {
        this.scene.run('debug-hud')
      }
    })

    this.poolGroup = this.add.group({
			key: 'atlas',
      frame: this.frameNames,
      // frameQuantity: 7,
      // randomKey: true,
      // randomFrame: true,
      active: false,
      visible: false
		})

    this.Road.reset()

    this.runOrthoTest()
    
    
  }

  update (time, delta)
  {
    if (this.autoDrive && this.overrideFaster)
    {
      this.keyFaster  = true
    }

    if (!this.autoDrive)
    {
      this.keyLeft    = this.cursors.left.isDown
      this.keyRight   = this.cursors.right.isDown
      this.keyFaster  = this.cursors.up.isDown
      this.keySlower  = this.cursors.down.isDown
    }

    // game loop
    this.Render.clear()
    this.Render.all()
    this.playerUpdate(delta / 1000)


    if (this.orthoTest)
    {
      this.debugQuad.clear();
      this.debugQuad.lineStyle(1, 0x00ff00);

      this.updateUVs()
    }
  }

  // with looping
  increase (start, increment, max)
  {
    var result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  }

  playerUpdate (dt)
  {

    let playerSegment = this.Segments.findSegment(this.position+this.playerZ)
    let speedPercent  = this.speed/this.maxSpeed
    let dx            = dt * 2 * speedPercent // at top speed, should be able to cross from left to right (-1 to +1) in 1 second

    this.position = this.increase(this.position, dt * this.speed, this.trackLength)
  

    let centerGap = 0.05
    if (this.autoDrive)
    {
      // Steer back to center
      if (this.playerX < -0.001) //-centerGap - 0.01)
      {
        this.playerX += dx / 2
        // this.keyRight = true
      }
      else if (this.playerX > 0.001) //centerGap + 0.01)
      {
        this.playerX -= dx / 2
        // this.keyLeft = true
      }
      else //if (this.playerX <= centerGap && this.playerX >= -centerGap)
      {
        this.playerX = 0
        // this.keyLeft = false
        // this.keyRight = false
      }
    }

    if (this.keyLeft)
    {
      this.playerX = this.playerX - dx
    }
    else if (this.keyRight)
    {
      this.playerX = this.playerX + dx
    }

    let factor = dx * playerSegment.curve
    // console.log(`dx: ${dx}, playerSegment.curve: ${playerSegment.curve}, factor: ${factor}`)
    // console.log(factor * 100)

    // this.cameras.main.setAngle(Phaser.Math.Clamp(factor * 100, -6, 6))
    // this.cameras.main.setAngle(Phaser.Math.Clamp(playerSegment.curve, -8, 8))


    this.bg_clouds.tilePositionX += this.cloudSpeed * 100
    this.bg_clouds.tilePositionX += dx * 10000 * speedPercent * playerSegment.curve * this.cloudSpeed
    this.bg_hills.tilePositionX += (dx * 10000 * speedPercent * playerSegment.curve * this.hillSpeed)
    this.bg_trees.tilePositionX += (dx * 10000 * speedPercent * playerSegment.curve * this.treeSpeed)

    this.bg_clouds.tilePositionY = this.playerY * this.cloudSpeed * -2
    this.bg_hills.tilePositionY = this.playerY * this.hillSpeed * -2
    this.bg_trees.tilePositionY = this.playerY * this.treeSpeed * -2

    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.inertia)
  
    if (this.keyFaster)
      this.speed = this.accelerate(this.speed, this.accel, dt)
    else if (this.keySlower)
      this.speed = this.accelerate(this.speed, this.braking, dt)
    else
      this.speed = this.accelerate(this.speed, this.decel, dt)
  
    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = this.accelerate(this.speed, this.offRoadDecel, dt)
  
    this.playerX = Phaser.Math.Clamp(this.playerX, -2, 2) // dont ever let player go too far out of bounds
    this.speed   = Phaser.Math.Clamp(this.speed, 0, this.maxSpeed) // or exceed maxSpeed
  
  }

  accelerate (v, accel, dt)
  {
    return v + (accel * dt);
  }

  updateUVs ()
  {
    let speedPercent  = this.speed/this.maxSpeed
    let modU = 0.00 * speedPercent
    let modV = -0.1 * speedPercent

    this.quadTest.vertices.forEach((vert, i) => {
      vert.u += modU
      vert.v += modV
    })

    // this.meshText.setText(`
    // ${this.quadTest.vertices[0].u},
    // ${this.quadTest.vertices[0].v},
    // ${this.quadTest.vertices[1].u},
    // ${this.quadTest.vertices[1].v},
    // ${this.quadTest.vertices[2].u},
    // ${this.quadTest.vertices[2].v},
    // ${this.quadTest.vertices[3].u},
    // ${this.quadTest.vertices[3].v},
    // ${this.quadTest.vertices[4].u},
    // ${this.quadTest.vertices[4].v},
    // ${this.quadTest.vertices[5].u},
    // ${this.quadTest.vertices[5].v}
    // `)
  }

  runOrthoTest ()
  {
    if (this.orthoTest)
    {
      this.quadVertices = [
          -960, 100,    // tl
          960, 100,     // tr
          -960, -100,   // bl
          960, -100     // br
      ];

      this.quadUVs = [
        0, 0,
        6.5, 0,
        0, 1,
        6.5, 1
      ];

      this.quadIndicies = [ 0, 2, 1, 2, 3, 1 ];
      
      this.quadTest = this.add.mesh(this.cX, this.cY, 'colorgrid');
      this.quadTest.addVertices(this.quadVertices, this.quadUVs, this.quadIndicies)
      this.quadTest.panZ(this.quadTest.height / (2 * Math.tan(Math.PI / 16)))
      this.quadTest.setDepth(4001);
      this.quadTest.setOrtho(this.quadTest.width, this.quadTest.height);

      this.debugQuad = this.add.graphics();
      this.debugQuad.setDepth(4002);

      this.quadTest.setDebug(this.debugQuad);

      console.log(this.quadTest.vertices)
      
      this.vertCache = JSON.parse(JSON.stringify(this.quadTest.vertices));
      console.log(this.vertCache)

      // this.meshText = this.add.text(this.cX, this.cY + 300, 'HELLO', { fontSize: '20px' })
      // this.meshText.setDepth(4001)
      // this.meshText.setOrigin(0.5)
    }
  }

  recalcCamera ()
  {
    this.cameraDepth  = this.uknFactor1 / Math.tan((this.fieldOfView/2) * Math.PI/180)
    this.playerZ      = this.cameraHeight * this.cameraDepth + this.uknFactor2
  }

  recalcSpeeds ()
  { 
    this.accel          =  this.maxSpeed/5
    this.braking        = -this.maxSpeed
    this.decel          = -this.maxSpeed/5
    this.offRoadDecel   = -this.maxSpeed/2
    this.offRoadLimit   =  this.maxSpeed/4
  }
  
}