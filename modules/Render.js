

export default class Render
{
  constructor (scene)
  {
    this.scene          = scene

    this.gfx            = scene.add.graphics()

    // Settings
    this.drawDistance   = 500
    this.fogDensity     = 1

    // Debug
    this.renderFog      = true
    this.renderRumble   = true
    this.renderLanes    = true
    this.renderRoad     = true
    this.renderGround   = true
    this.renderPlayer   = true
    this.renderSprites  = true
  }

  init ()
  {

  }


  clear ()
  {
    this.gfx.clear()

    // Deactivate sprites outside of drawDistance
    let initial = this.scene.Segments.findSegmentPosition(this.scene.position)

    for(let i = initial; i != initial - this.drawDistance; i--){
      let segment = this.scene.Segments.getSegmentAt(i)
      segment.sprites.forEach((sprite) => {
        sprite.source.setActive(false)
        sprite.source.setVisible(false)
      })
    }
  }


  project (p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth)
  {
    p.camera.x     = (p.world.x || 0) - cameraX
    p.camera.y     = (p.world.y || 0) - cameraY
    p.camera.z     = (p.world.z || 0) - cameraZ
    p.screen.scale = cameraDepth/p.camera.z
    p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2))
    p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2))
    p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2))
  }

  percentRemaining (n, total)
  {
    return(n % total) / total;
  }

  exponentialFog (distance, density)
  {
    return 1 / (Math.pow(Math.E, (distance * distance * density)));
  }


  /**
   * Render all
   */
  all ()
  {
    let baseSegment           = this.scene.Segments.findSegment(this.scene.position),
        basePercent           = this.percentRemaining(this.scene.position, this.scene.segmentLength),
        playerSegment         = this.scene.Segments.findSegment(this.scene.position + this.scene.playerZ),
        playerPercent         = this.percentRemaining(this.scene.position + this.scene.playerZ, this.scene.segmentLength),
        width                 = this.scene.width,
        height                = this.scene.height,
        cameraHeight          = this.scene.cameraHeight,
        cameraDepth           = this.scene.cameraDepth,
        roadWidth             = this.scene.roadWidth,
        trackLength           = this.scene.trackLength,
        position              = this.scene.position,
        playerX               = this.scene.playerX,
        dx                    = - (baseSegment.curve * basePercent),
        x                     = 0,
        maxy                  = height,
        n, segment
        
    this.scene.playerY    = Phaser.Math.Linear(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)
    
    // Segment render loop (away from camera)
    for(n = 0 ; n < this.drawDistance ; n++) {
  
      segment         = this.scene.Segments.segments[(baseSegment.index + n) % this.scene.Segments.segments.length];
      segment.looped  = segment.index < baseSegment.index;
      segment.fog     = this.exponentialFog(n/this.drawDistance, this.fogDensity);
      segment.clip    = maxy;
  
      this.project(segment.p1, (playerX * roadWidth) - x, this.scene.playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
      this.project(segment.p2, (playerX * roadWidth) - x - dx, this.scene.playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

      x = x + dx;
      dx = dx + segment.curve;

      if ((segment.p1.camera.z <= cameraDepth)          ||  // behind us
          (segment.p2.screen.y >= segment.p1.screen.y)  ||  // back face cull
          (segment.p2.screen.y >= maxy))                    // clip by (already rendered) hill
      {
        continue;
      }


      // Render Segment
      // Includes ground, road, rumble, lanes, and fog
      this.segment(segment);
  

      maxy                  = segment.p1.screen.y;
      this.scene.debugMaxY  = maxy;
    }


    // Other render items loop (towards camera)
    // Sprites, player car
    for(n = (this.drawDistance-1) ; n > 0 ; n--) {
      segment = this.scene.Segments.segments[(baseSegment.index + n) % this.scene.Segments.segments.length];
    

      // Render roadside sprites
      if (this.renderSprites)
      {
        for(let i = 0 ; i < segment.sprites.length ; i++) {
          this.sprite(segment.sprites[i], segment, n);
        }
      }


      // Render player car
      if (segment.index == playerSegment.index && this.renderPlayer) {
        this.player(playerSegment);
      }
    

    }
  }

  /**
   * Render Segments
   */
  segment (segment)
  {
    let sw    = this.scene.width, // game width
        x1    = segment.p1.screen.x,
        y1    = segment.p1.screen.y,
        w1    = segment.p1.screen.w,
        x2    = segment.p2.screen.x,
        y2    = segment.p2.screen.y,
        w2    = segment.p2.screen.w,
        color = segment.color,
        fog   = segment.fog,
        r1 = this.rumbleWidth(w1, this.scene.lanes),
        r2 = this.rumbleWidth(w2, this.scene.lanes),
        l1 = this.laneMarkerWidth(w1, this.scene.lanes),
        l2 = this.laneMarkerWidth(w2, this.scene.lanes),
        lanew1, lanew2, lanex1, lanex2, lane;


    // Render Ground
    if (this.renderGround)
    {
      this.gfx.fillStyle(color.grass, 1);
      this.gfx.fillRect(0, y2, sw, y1 - y2);
    }
    

    // Render Rumble
    if (this.renderRumble)
    {
      // Left Rumble
      this.polygon(x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);

      // Right Rumble
      this.polygon(x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
    }


    // Render Road
    if (this.renderRoad)
    {
      this.polygon(x1 - w1,      y1, x1 + w1, y1, x2 + w2, y2, x2 - w2,      y2, color.road);
    }
    
    // Render Lanes
    if (color.lane && this.renderLanes)
    {
      lanew1 = w1 * 2 / this.scene.lanes
      lanew2 = w2 * 2 / this.scene.lanes
      lanex1 = x1 - w1 + lanew1
      lanex2 = x2 - w2 + lanew2
      for(lane = 1 ; lane < this.scene.lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++)
      {
        this.polygon(lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);
      }
    }


    // Render Fog
    if (this.renderFog)
    {
      this.fog(0, y1, sw, y2 - y1, fog);
    }
  }

  polygon (x1, y1, x2, y2, x3, y3, x4, y4, color)
  {
    this.gfx.fillStyle(color, 1)
    this.gfx.beginPath()
    this.gfx.moveTo(x1, y1)
    this.gfx.lineTo(x2, y2)
    this.gfx.lineTo(x3, y3)
    this.gfx.lineTo(x4, y4)
    this.gfx.fill()
    this.gfx.closePath()
  }

  fog (x, y, w, h, fog) {
    if (fog < 1) {
      this.gfx.fillStyle(this.scene.colors.FOG, 1 - fog)
      this.gfx.fillRect(x, y, w, h)
    }
  }

  rumbleWidth (projectedRoadWidth, lanes)
  {
    return projectedRoadWidth / Math.max(6, 2 * lanes)
  }

  laneMarkerWidth (projectedRoadWidth, lanes)
  {
    return projectedRoadWidth / Math.max(32, 8 * lanes)
  }

  
  /**
   * Render Sprites
   */
  sprite (sprite, segment, n)
  {
    let roadWidth = this.scene.roadWidth,
        width     = this.scene.width,
        height    = this.scene.height,
        allScale  = this.scene.spritesScale,
        scale     = segment.p1.screen.scale,
        destX     = segment.p1.screen.x + (scale * sprite.offset * roadWidth * width / 2),
        destY     = segment.p1.screen.y,
        spriteW   = sprite.source.width,
        spriteH   = sprite.source.height,
        destW     = (spriteW * scale * width / 2) * (allScale * roadWidth) * sprite.scaleIn,
        destH     = (spriteH * scale * width / 2) * (allScale * roadWidth) * sprite.scaleIn,
        offsetX   = sprite.offset < 0 ? -1 : 0,
        offsetY   = -1,
        clipY     = segment.clip

    destX = destX + (destW * (offsetX || 0))
    destY = destY + (destH * (offsetY || 0))

    let clipH = clipY ? Math.max(0, destY + destH - clipY) : 0

    // On Screen
    if (!sprite.source.active)
    {
      sprite.source.alpha = 0
      sprite.scaleIn = 0
    }
    if (sprite.source.alpha < 1) {
      sprite.source.alpha += 0.05
    }
    if (sprite.scaleIn < 1) {
      sprite.scaleIn += 0.05
    }


    sprite.source.x = destX
    sprite.source.y = destY
    sprite.source.displayWidth = destW
    sprite.source.displayHeight = destH
    sprite.source.setCrop(0, 0, spriteW, spriteH - (spriteH * clipH / destH))
    let fixDepth = 1999 - n
    sprite.source.setDepth(fixDepth)
    if (fixDepth < 0) { console.log(fixDepth) }
    sprite.source.setVisible(true)
    sprite.source.setActive(true)
  }


  /**
   * Render Player
   */
  player (segment)
  {
    let width         = this.scene.width,
        height        = this.scene.height,
        resolution    = this.scene.resolution,
        cameraDepth   = this.scene.cameraDepth,
        playerZ       = this.scene.playerZ,
        speedPercent  = this.scene.speed / this.scene.maxSpeed,
        playerPercent = this.percentRemaining(this.scene.position + playerZ, this.scene.segmentLength),
        y1            = segment.p1.camera.y,
        y2            = segment.p2.camera.y,
        curve         = segment.curve,
        scale         = cameraDepth / playerZ,
        destX         = width / 2,
        destY         = (height / 2) - (cameraDepth / playerZ * Phaser.Math.Linear(y1, y2, playerPercent) * height / 2),
        steer         = this.scene.speed * (this.scene.keyLeft ? -1 : this.scene.keyRight ? 1 : 0),
        updown        = y2 - y1,
        // bounce        = (1.5 * Math.random() * speedPercent * resolution) * Phaser.Math.Between(-1, 1)
        bounceCar     = (1.5 * Math.random() * speedPercent) * Phaser.Math.Between(-1, 1),
        bounceWheels  = (2.5 * Math.random() * speedPercent) * Phaser.Math.Between(-1, 1)

    // console.log(`steer: ${steer}, updown: ${updown}, curve: ${curve}`)

    // Sprite Sheet
    // turn: dl, tl, s, tr, dr
    // flat:  0,  1, 2,  3,  4
    // hill:  5,  6, 7,  8,  9
    let carFrame = 2
    if (curve < -2 && curve > -4) { carFrame = 1 }
    else if (curve > 2 && curve < 4) { carFrame = 3 }
    else if (curve <= -4) { carFrame = 0 }
    else if (curve >= 4) { carFrame = 4 }

    if (updown > 20) { carFrame += 5 }

    if (curve >= 4 || curve <= -4)
    {
      if (carFrame === 0)
      {
        // this.scene.puffs.angle = { min: 45, max: 90 }
        this.scene.puffs.emitParticleAt(destX, destY - 30)
        this.scene.puffs.emitParticleAt(destX + 210, destY - 69)
      }
      if (carFrame === 4)
      {
        // this.scene.puffs.setAngle({ min: 0, max: 45 })
        this.scene.puffs.emitParticleAt(destX, destY - 30)
        this.scene.puffs.emitParticleAt(destX - 210, destY - 69)
      }
      if (carFrame === 5)
      {
        this.scene.puffs.emitParticleAt(destX, destY - 0)
        this.scene.puffs.emitParticleAt(destX + 210, destY - 39)
      }
      if (carFrame === 9)
      {
        this.scene.puffs.emitParticleAt(destX, destY - 0)
        this.scene.puffs.emitParticleAt(destX - 210, destY - 39)
      }
    }

    // Car Body Foreground
    if (!this.scene.playerCar)
    {
      this.scene.playerCar = this.scene.add.image(destX, destY + bounceCar, 'car_sheet', carFrame)
      this.scene.playerCar.setOrigin(0.5, 1)
      this.scene.playerCar.setDepth(2002)
    }
    else
    {
      this.scene.playerCar.setFrame(carFrame)
      this.scene.playerCar.x = destX
      this.scene.playerCar.y = destY + bounceCar
    }
    this.scene.playerCar.setScale(scale * 1000)

    // Car Wheels
    if (!this.scene.playerWheels)
    {
      this.scene.playerWheels = this.scene.add.image(destX, destY + bounceWheels, 'wheel_sheet', carFrame)
      this.scene.playerWheels.setOrigin(0.5, 1)
      this.scene.playerWheels.setDepth(2001)
    }
    else
    {
      this.scene.playerWheels.setFrame(carFrame)
      this.scene.playerWheels.x = destX
      this.scene.playerWheels.y = destY + bounceWheels
    }
    this.scene.playerWheels.setScale(scale * 1000)

    // Car Shadows
    let shadY = destY + 180
    if (!this.scene.playerShadow)
    {
      this.scene.playerShadow = this.scene.add.image(destX, shadY, 'shadow_sheet', carFrame)
      this.scene.playerShadow.setOrigin(0.5, 1)
      this.scene.playerShadow.setDepth(2000)
    }
    else
    {
      this.scene.playerShadow.setFrame(carFrame)
      this.scene.playerShadow.x = destX
      this.scene.playerShadow.y = shadY
    }
    this.scene.playerShadow.setScale(scale * 820)
    this.scene.playerShadow.setAlpha(.60)
  }
}