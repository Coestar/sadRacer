export default class Road
{
  constructor (scene)
  {
    this.road = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
    }
  }

  add (enter, hold, leave, curve, y)
  {
    let startY  = this.lastY()
    let endY    = startY + (Util.toInt(y, 0) * this.segmentLength)
    let total   = enter + hold + leave
    let n

    for(n = 0 ; n < enter ; n++)
    {
      this.addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total))
    }

    for(n = 0 ; n < hold  ; n++)
    {
      this.addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total))
    }

    for(n = 0 ; n < leave ; n++)
    {
      this.addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter + hold + n) / total))
    }
  }

  addHill (num, height)
  {
    num    = num    || this.road.LENGTH.MEDIUM
    height = height || this.road.HILL.MEDIUM
    this.add(num, num, num, 0, height)
  }

  addLowRollingHills (num, height)
  {
    num    = num    || this.road.LENGTH.SHORT
    height = height || this.road.HILL.LOW
    this.add(num, num, num,  0,  height/2)
    this.add(num, num, num,  0, -height)
    this.add(num, num, num,  0,  height)
    this.add(num, num, num,  0,  0)
    this.add(num, num, num,  0,  height/2)
    this.add(num, num, num,  0,  0)
  }

  addDownhillToEnd (num)
  {
    num = num || 200
    this.add(num, num, num, -this.road.CURVE.EASY, -this.lastY()/this.segmentLength)
  }

  addStraight (num)
  {
    num = num || this.road.LENGTH.MEDIUM
    this.add(num, num, num, 0)
  }

  addCurve (num, curve)
  {
    num    = num    || this.road.LENGTH.MEDIUM
    curve  = curve  || this.road.CURVE.MEDIUM
    this.add(num, num, num, curve)
  }
  
  addSCurves ()
  {
    this.add(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.EASY)
    this.add(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,   this.road.CURVE.MEDIUM)
    this.add(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,   this.road.CURVE.EASY)
    this.add(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.EASY)
    this.add(this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM, this.road.LENGTH.MEDIUM,  -this.road.CURVE.MEDIUM)
  }
}