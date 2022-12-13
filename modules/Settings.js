export default class Settings
{
  constructor (scene)
  {
    // How many 'update' frames per second
    this.fps           = 60

    // How long is each frame (in seconds)
    this.step          = 1/this.fps

    // Array of road segments (likely to be deprecated)
    this.segments      = []

    // Background image (likely to be deprecated)
    this.background    = null

    // Spritesheet (likely to be deprecated)
    this.sprites       = null

    // This should be pulled from game/sys
    this.width         = 1920
    this.height        = 1080

    // Scaling factor to provide resolution independence (computed)
    // Not yet implemented
    this.resolution    = null

    // Actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    this.roadWidth     = 2000

    // Length of a single segment
    this.segmentLength = 200

    // Number of segments per red/white rumble strip
    this.rumbleLength  = 3

    // z length of entire track (computed)
    this.trackLength   = null

    // Number of lanes
    this.lanes         = 3

    // Angle (degrees) for field of view
    this.fieldOfView   = 100

    // z height of camera
    this.cameraHeight  = 1000

    // z distance camera is from screen (computed)
    this.cameraDepth   = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180)

    // Number of segments to draw
    this.drawDistance  = 500

    // Player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    this.playerX       = 0

    this.playerY       = 0

    // Player relative z distance from camera (computed)
    this.playerZ       = null 

    // Exponential fog density
    // Not yet implemented
    this.fogDensity    = 5

    // Current camera Z position (add playerZ to get player's absolute Z position)
    this.position      = 0

    // Current speed
    this.speed         = 0

    // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    this.maxSpeed      = this.segmentLength/this.step

    // acceleration rate - tuned until it 'felt' right
    this.accel         =  this.maxSpeed/5

    // deceleration rate when braking
    this.breaking      = -this.maxSpeed
    
    // 'natural' deceleration rate when neither accelerating, nor braking
    this.decel         = -this.maxSpeed/5
    
    // off road deceleration is somewhere in between
    this.offRoadDecel  = -this.maxSpeed/2

    // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    this.offRoadLimit  =  this.maxSpeed/4

    // centrifugal force multiplier when going around curves
    this.centrifugal    = 0//0.3

    
    /**
     * This will most likely be replaced with a spritesheet 
     * implementation.
     */
    this.sprites = {
      TREE:                   { x:    5, y:  555, w:  135, h:  333 },
      PLAYER_UPHILL_LEFT:     { x: 1383, y:  961, w:   80, h:   45 },
      PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w:   80, h:   45 },
      PLAYER_UPHILL_RIGHT:    { x: 1385, y: 1018, w:   80, h:   45 },
      PLAYER_LEFT:            { x:  995, y:  480, w:   80, h:   41 },
      PLAYER_STRAIGHT:        { x: 1085, y:  480, w:   80, h:   41 },
      PLAYER_RIGHT:           { x:  995, y:  531, w:   80, h:   41 }
    }

    this.colors = {
      SKY:  0x72D7EE,
      TREE: 0x0051080,
      FOG:  0x005108,
      LIGHT:  {
        road: 0x6B6B6B,
        grass: 0x10AA10,
        rumble: 0x555555,
        lane: 0xCCCCCC
      },
      DARK:   {
        road: 0x696969,
        grass: 0x009A00,
        rumble: 0xBBBBBB
      },
      START:  {
        road: 0xFFFFFF,
        grass: 0xFFFFFF,
        rumble: 0xFFFFFF
      },
      FINISH: {
        road: 0x000000,
        grass: 0x000000,
        rumble: 0x000000
      }
    }

    this.road = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
    }
  }
}