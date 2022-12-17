import Util from '../modules/Util.js'
import Render from '../modules/Render.js'
import Road from '../modules/Road.js'
import Segments from '../modules/Segments.js'

const INFO_FORMAT = 
`Size:       %1
Spawned:    %2
Despawned:  %3`

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
    this.fieldOfView   = 100  // angle (degrees) for field of view
    this.cameraHeight  = 800 // z height of camera
    this.cameraDepth   = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180) // z distance camera is from screen (computed)
    this.playerX       = 0    // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    this.playerY       = 0
    this.playerZ       = this.cameraHeight * this.cameraDepth + 200 // player relative z distance from camera (computed)
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
    
    this.debugMaxY      = 0

    this.cameraZoom = 1.2
    
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

    this.road         = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
    }

    this.puffs = null

    this.atlasTexture   = null
    this.frameNames     = null
    this.poolGroup      = null
  }

  init ()
  {
    this.Render = new Render(this)
    this.Segments = new Segments(this)
  }

  create ()
  {

    this.atlasTexture   = this.textures.get('atlas')
    this.frameNames     = this.atlasTexture.getFrameNames()
    console.log(this.frameNames)

    this.debugHUD = this.scene.get('debug-hud')

    this.bg_sky = this.add.image(this.cX, this.cY, 'sky').setDepth(-4)
    this.bg_clouds = this.add.tileSprite(0, 0, this.width, this.height, 'clouds').setOrigin(0).setDepth(-3)
    this.bg_hills = this.add.tileSprite(0, 0, this.width, this.height, 'hills').setOrigin(0).setDepth(-2)
    this.bg_trees = this.add.tileSprite(0, 0, this.width, this.height, 'trees').setOrigin(0).setDepth(-1)

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

		this.infoText = this.add.text(300, 200, 'hello?')
      .setDepth(3000)
      .setOrigin(0, 0)

    this.resetRoad()
    
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

    // temp for debug
		if (!this.poolGroup || !this.infoText)
		{
			return
		}

		const size = this.poolGroup.getLength()
		const used = this.poolGroup.getTotalUsed()
		const text = Phaser.Utils.String.Format(
			INFO_FORMAT,
			[
				size,
				used,
				size - used
			]
		)

		this.infoText.setText(text)

  }

  playerUpdate (dt)
  {

    let playerSegment = this.Segments.findSegment(this.position+this.playerZ)
    let speedPercent  = this.speed/this.maxSpeed
    let dx            = dt * 2 * speedPercent // at top speed, should be able to cross from left to right (-1 to +1) in 1 second

    this.position = Util.increase(this.position, dt * this.speed, this.trackLength)
  

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
    this.cameras.main.setAngle(Phaser.Math.Clamp(playerSegment.curve, -8, 8))


    this.bg_clouds.tilePositionX += this.cloudSpeed * 100
    this.bg_clouds.tilePositionX += (dx * 10000 * speedPercent * playerSegment.curve * this.cloudSpeed)
    this.bg_hills.tilePositionX += (dx * 10000 * speedPercent * playerSegment.curve * this.hillSpeed)
    this.bg_trees.tilePositionX += (dx * 10000 * speedPercent * playerSegment.curve * this.treeSpeed)

    this.bg_clouds.tilePositionY = this.playerY * this.cloudSpeed * -2
    this.bg_hills.tilePositionY = this.playerY * this.hillSpeed * -2
    this.bg_trees.tilePositionY = this.playerY * this.treeSpeed * -2

    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.inertia)
  
    if (this.keyFaster)
      this.speed = Util.accelerate(this.speed, this.accel, dt)
    else if (this.keySlower)
      this.speed = Util.accelerate(this.speed, this.braking, dt)
    else
      this.speed = Util.accelerate(this.speed, this.decel, dt)
  
    if (((this.playerX < -1) || (this.playerX > 1)) && (this.speed > this.offRoadLimit))
      this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt)
  
    this.playerX = Util.limit(this.playerX, -2, 2) // dont ever let player go too far out of bounds
    this.speed   = Util.limit(this.speed, 0, this.maxSpeed) // or exceed maxSpeed
  
  }

  recalcCamera()
  {
    this.cameraDepth = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180)
    this.playerZ = this.cameraHeight * this.cameraDepth + 200
  }

  recalcSpeeds()
  { 
    this.accel          =  this.maxSpeed/5
    this.braking        = -this.maxSpeed
    this.decel          = -this.maxSpeed/5
    this.offRoadDecel   = -this.maxSpeed/2
    this.offRoadLimit   =  this.maxSpeed/4
  }

  resetRoad ()
  { 
    // this.segments = []

    this.Segments.reset()

    this.addHill(200, this.road.HILL.HIGH)
    this.addSCurves()
    this.addStraight()
    this.addLowRollingHills()
    this.addHillCurveRight(this.road.LENGTH.LONG, this.road.HILL.HIGH)
    this.addLeftDownhillToEnd()
    this.addHillCurveRight(this.road.LENGTH.LONG, this.road.HILL.HIGH)
    this.addLeftDownhillToEnd()
    this.addHillCurveLeft(this.road.LENGTH.LONG, this.road.HILL.HIGH)
    this.addLowRollingHills()
    this.addHill(200, this.road.HILL.HIGH)
    this.addDownhillToEnd()
    this.addSCurves()
    this.addStraight()

    this.Segments.segments[this.Segments.findSegment(this.playerZ).index + 2].color = this.colors.START
    this.Segments.segments[this.Segments.findSegment(this.playerZ).index + 3].color = this.colors.START
    for(var n = 0 ; n < this.rumbleLength ; n++)
    {
      this.Segments.segments[this.Segments.segments.length-1-n].color = this.colors.FINISH
    }

    this.trackLength = this.Segments.segments.length * this.segmentLength

    console.log(this.Segments.segments)

    this.resetSprites()
  }

  addRoad (enter, hold, leave, curve, y)
  {
    let startY  = this.Segments.lastY()
    let endY    = startY + (Util.toInt(y, 0) * this.segmentLength)
    let n
    let total   = enter + hold + leave

    for(n = 0 ; n < enter ; n++)
    {
      this.Segments.add(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total))
    }

    for(n = 0 ; n < hold  ; n++)
    {
      this.Segments.add(curve, Util.easeInOut(startY, endY, (enter+n)/total))
    }

    for(n = 0 ; n < leave ; n++)
    {
      this.Segments.add(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total))
    }
  }

  addSprite (n, sprite, offset)
  {
		if (!this.poolGroup)
		{
			return null
		}

    let manualFrames = [
      'tree1',
      'tree2',
      'palm_tree',
      'dead_tree1',
      'dead_tree2',
      'column',
      'boulder1',
      'boulder2',
      'boulder3',
      'bush1',
      'bush2',
      'cactus',
      'stump',
      'billboard01',
      'billboard02',
      'billboard03',
      'billboard04',
      'billboard05',
      'billboard06',
      'billboard07',
      'billboard08',
      'billboard09',
    ]

    let randomFrame = manualFrames[Util.randomInt(0, manualFrames.length - 1)]
    // let randomFrame = this.frameNames[Util.randomInt(0, this.frameNames.length - 1)]
    let item = this.poolGroup.get(0, 0, sprite)
    item.setFrame(randomFrame)
    // item.setFrame('column')
    item.setOrigin(0, 0)
		item.setVisible(false)
		item.setActive(true)
    this.Segments.segments[n].sprites.push({ source: item, offset: offset, scaleIn: 0.01 })
  }

  resetSprites ()
  {
    /*
    let gap = 5
    for (let n = 0 ; n < this.Segments.segments.length - gap ; n += gap)
    {
      this.addSprite(n, 'atlas', 1.1)
      this.addSprite(n, 'atlas', -1.1)

      // for(let i = 0 ; i < 10 ; i++)
      // {
      //   this.addSprite(n, 'atlas', (i + 1.1))
      //   this.addSprite(n, 'atlas', -(i + 1.1))
      // }
    }
    */

    for(let n = 0 ; n < this.Segments.segments.length - 5 ; n += 5) {
      this.addSprite(n + Util.randomInt(0,2), 'atlas', 2.1 + (Math.random() * 25))
      this.addSprite(n + Util.randomInt(0,2), 'atlas', -2.1 - (Math.random() * 25))
      this.addSprite(n + Util.randomInt(0,2), 'atlas', 1.1 + (Math.random() * 5))
      this.addSprite(n + Util.randomInt(0,2), 'atlas', -1.1 - (Math.random() * 5))
    }
  }

  addHill (num, height)
  {
    num    = num    || this.road.LENGTH.MEDIUM
    height = height || this.road.HILL.MEDIUM
    this.addRoad(num, num, num, 0, height)
  }

  addHillCurveRight (num, height)
  {
    num    = num    || this.road.LENGTH.MEDIUM
    height = height || this.road.HILL.MEDIUM
    this.addRoad(num, num, num, this.road.CURVE.MEDIUM, height)
  }

  addHillCurveLeft (num, height)
  {
    num    = num    || this.road.LENGTH.MEDIUM
    height = height || this.road.HILL.MEDIUM
    this.addRoad(num, num, num, -this.road.CURVE.MEDIUM, height)
  }

  addLowRollingHills (num, height)
  {
    num    = num    || this.road.LENGTH.SHORT
    height = height || this.road.HILL.LOW
    this.addRoad(num, num, num,  0,  height/2)
    this.addRoad(num, num, num,  0, -height)
    this.addRoad(num, num, num,  0,  height)
    this.addRoad(num, num, num,  0,  0)
    this.addRoad(num, num, num,  0,  height/2)
    this.addRoad(num, num, num,  0,  0)
  }

  addDownhillToEnd (num)
  {
    num = num || 200
    this.addRoad(num, num, num, 0, -Math.round(this.Segments.lastY()/this.segmentLength))
  }

  addLeftDownhillToEnd (num)
  {
    num = num || 200
    this.addRoad(num, num, num, -this.road.CURVE.MEDIUM, -Math.round(this.Segments.lastY()/this.segmentLength))
  }

  addRightDownhillToEnd (num)
  {
    num = num || 200
    this.addRoad(num, num, num, this.road.CURVE.MEDIUM, -Math.round(this.Segments.lastY()/this.segmentLength))
  }

  addStraight (num)
  {
    num = num || this.road.LENGTH.MEDIUM
    this.addRoad(num, num, num, 0)
  }

  addCurve (num, curve)
  {
    num    = num    || this.road.LENGTH.MEDIUM;
    curve  = curve  || this.road.CURVE.MEDIUM;
    this.addRoad(num, num, num, curve);
  }
  
  addSCurves ()
  {
    this.addRoad(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.EASY);
    this.addRoad(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,   this.road.CURVE.MEDIUM);
    this.addRoad(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,   this.road.CURVE.EASY);
    this.addRoad(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.EASY);
    this.addRoad(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.MEDIUM);
  }
  
}