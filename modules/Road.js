import Util from './Util.js'

export default class Road
{
  constructor (scene)
  {
    this.scene = scene

    this.road         = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
    }
  }

  init ()
  {

  }

  reset ()
  {

    this.scene.Segments.reset()

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
    this.addSCurves()
    this.addStraight()
    this.addDownhillToEnd()

    this.scene.Segments.segments[this.scene.Segments.findSegment(this.scene.playerZ).index + 2].color = this.scene.colors.START
    this.scene.Segments.segments[this.scene.Segments.findSegment(this.scene.playerZ).index + 3].color = this.scene.colors.START

    for(var n = 0 ; n < this.scene.rumbleLength ; n++)
    {
      this.scene.Segments.segments[this.scene.Segments.segments.length-1-n].color = this.scene.colors.FINISH
    }

    this.scene.trackLength = this.scene.Segments.segments.length * this.scene.segmentLength

    console.log(this.scene.Segments.segments)

    this.resetSprites()
  }

  addRoad (enter, hold, leave, curve, y)
  {
    let startY  = this.scene.Segments.lastY()
    let endY    = startY + (Util.toInt(y, 0) * this.scene.segmentLength)
    let n
    let total   = enter + hold + leave

    for(n = 0 ; n < enter ; n++)
    {
      this.scene.Segments.add(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total))
    }

    for(n = 0 ; n < hold  ; n++)
    {
      this.scene.Segments.add(curve, Util.easeInOut(startY, endY, (enter+n)/total))
    }

    for(n = 0 ; n < leave ; n++)
    {
      this.scene.Segments.add(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total))
    }
  }

  addSprite (n, sprite, offset)
  {
		if (!this.scene.poolGroup)
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
    let item = this.scene.poolGroup.get(0, 0, sprite)
    item.setFrame(randomFrame)
    // item.setFrame('column')
    item.setOrigin(0, 0)
		item.setVisible(false)
		item.setActive(true)
    this.scene.Segments.segments[n].sprites.push({ source: item, offset: offset, scaleIn: 0.01 })
  }

  resetSprites ()
  {
    let gap = 5
    for (let n = 0 ; n < this.scene.Segments.segments.length - gap ; n += gap)
    {
      // this.addSprite(n, 'atlas', 1.1)
      // this.addSprite(n, 'atlas', -1.1)

      for(let i = 0 ; i < 2 ; i++)
      {
        this.addSprite(n, 'atlas', (i + 1.1) + (Math.random() * 25))
        this.addSprite(n, 'atlas', -(i + 1.1) - (Math.random() * 25))
      }
    }

    // for(let n = 0 ; n < this.scene.Segments.segments.length - 5 ; n += 5) {
    //   this.addSprite(n + Util.randomInt(0,2), 'atlas', 2.1 + (Math.random() * 25))
    //   this.addSprite(n + Util.randomInt(0,2), 'atlas', -2.1 - (Math.random() * 25))
    //   this.addSprite(n + Util.randomInt(0,2), 'atlas', 1.1 + (Math.random() * 5))
    //   this.addSprite(n + Util.randomInt(0,2), 'atlas', -1.1 - (Math.random() * 5))
    // }
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
    this.addRoad(num, num, num, 0, -Math.round(this.scene.Segments.lastY()/this.scene.segmentLength))
  }

  addLeftDownhillToEnd (num)
  {
    num = num || 200
    this.addRoad(num, num, num, -this.road.CURVE.MEDIUM, -Math.round(this.scene.Segments.lastY()/this.scene.segmentLength))
  }

  addRightDownhillToEnd (num)
  {
    num = num || 200
    this.addRoad(num, num, num, this.road.CURVE.MEDIUM, -Math.round(this.scene.Segments.lastY()/this.scene.segmentLength))
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