export default class DebugHUD extends Phaser.Scene
{
  constructor ()
  {
    super('debug-hud')

    this.gameScene  = null
    this.controlIDs = []
    this.debugDom   = null

    this.Render
    this.Road
    this.Segments
  }

  create ()
  {

    this.gameScene = this.scene.get('game')

    this.Render     = this.gameScene.Render
    this.Road       = this.gameScene.Road
    this.Segments   = this.gameScene.Segments

    const debugModal = `
      <div id="debugModal">
        <div class="debug-hud__wrapper">

          <div class="debug-hud__item-group">
            <div class="debug-hud__item">
              <label>Autodrive:</label>
              <button id="debugAutodrive">${this.gameScene.autoDrive}</button>
            </div>
            <div class="debug-hud__item">
              <label>Draw Distance:</label>
              <input type="number" name="debugDrawDistance" id="debugDrawDistance" value="${this.Render.drawDistance}">
            </div>
            <div class="debug-hud__item">
              <label>Road Width:</label>
              <input type="number" name="debugRoadWidth" id="debugRoadWidth" value="${this.gameScene.roadWidth}">
            </div>
            <div class="debug-hud__item">
              <label>Segment Length:</label>
              <input type="number" name="debugSegmentLength" id="debugSegmentLength" value="${this.gameScene.segmentLength}">
            </div>
            <div class="debug-hud__item">
              <label>Rumble Length:</label>
              <input type="number" name="debugRumbleLength" id="debugRumbleLength" value="${this.gameScene.rumbleLength}">
            </div>
            <div class="debug-hud__item">
              <label>Lanes:</label>
              <input type="number" name="debugLanes" id="debugLanes" value="${this.gameScene.lanes}">
            </div>
            <div class="debug-hud__item">
              <label>Fog Density:</label>
              <input type="number" name="debugFogDensity" id="debugFogDensity" value="${this.Render.fogDensity}">
            </div>
            <div class="debug-hud__item">
              <label>Max Speed:</label>
              <input type="number" name="debugMaxSpeed" id="debugMaxSpeed" value="${this.gameScene.maxSpeed}">
            </div>
            <div class="debug-hud__item">
              <label>Horizontal Inertia:</label>
              <input type="number" step="0.01" max="1" name="debugInertia" id="debugInertia" value="${this.gameScene.inertia}">
            </div>
            <div class="debug-hud__item">
              <label>Unknown Factor 1:</label>
              <input type="number" name="debugUknFactor1" id="debugUknFactor1" step="0.01" value="${this.gameScene.uknFactor1}">
            </div>
            <div class="debug-hud__item">
              <label>Unknown Factor 2:</label>
              <input type="number" name="debugUknFactor2" id="debugUknFactor2" step="10" value="${this.gameScene.uknFactor2}">
            </div>
            <div class="debug-hud__item">
              <label>Camera FOV:</label>
              <input type="number" name="debugFieldOfView" id="debugFieldOfView" step="10" min="10" value="${this.gameScene.fieldOfView}">
            </div>
            <div class="debug-hud__item">
              <label>Camera Height:</label>
              <input type="number" name="debugCameraHeight" id="debugCameraHeight" step="100" min="100" value="${this.gameScene.cameraHeight}">
            </div>
            <div class="debug-hud__item">
              <label>Main Camera Zoom:</label>
              <input type="number" name="debugCameraZoom" id="debugCameraZoom" step="0.01" min="0.01" value="${this.gameScene.cameraZoom}">
            </div>
          </div>

          <div class="debug-hud__item-group">
            <div class="debug-hud__item">
              <label>Reset Road:</label>
              <button id="debugResetRoad">RESET</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Fog:</label>
              <button id="debugRenderFog">${this.Render.renderFog}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Rumble:</label>
              <button id="debugRenderRumble">${this.Render.renderRumble}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Lanes:</label>
              <button id="debugRenderLanes">${this.Render.renderLanes}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Road:</label>
              <button id="debugRenderRoad">${this.Render.renderRoad}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Ground:</label>
              <button id="debugRenderGround">${this.Render.renderGround}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Player:</label>
              <button id="debugRenderPlayer">${this.Render.renderPlayer}</button>
            </div>
            <div class="debug-hud__item">
              <label>Render Sprites:</label>
              <button id="debugRenderSprites">${this.Render.renderSprites}</button>
            </div>
          </div>

          <div class="debug-hud__item-group">
            <div class="debug-hud__item">
              <label>Player X:</label>
              <div id="debugPlayerX">${this.gameScene.playerX}</div>
            </div>
            <div class="debug-hud__item">
              <label>Player Y:</label>
              <div id="debugPlayerY">${this.gameScene.playerY}</div>
            </div>
            <div class="debug-hud__item">
              <label>Player Z:</label>
              <div id="debugPlayerZ">${this.gameScene.playerZ}</div>
            </div>
            <div class="debug-hud__item">
              <label>Speed:</label>
              <div id="debugSpeed">${this.gameScene.speed}</div>
            </div>
            <div class="debug-hud__item">
              <label>Track Length:</label>
              <div id="debugTrackLength">${this.Segments.segments.length * this.gameScene.segmentLength}</div>
            </div>
            <div class="debug-hud__item">
              <label>Position:</label>
              <div id="debugPosition">${this.gameScene.position} (${Math.round(this.gameScene.position / (this.Segments.segments.length * this.gameScene.segmentLength) * 100)}%)</div>
            </div>
            <div class="debug-hud__item">
              <label>poolGroup Size:</label>
              <div id="debugPoolSize">${this.gameScene.poolGroup.getLength()}</div>
            </div>
            <div class="debug-hud__item">
              <label>poolGroup Used:</label>
              <div id="debugPoolUsed">${this.gameScene.poolGroup.getTotalUsed()}</div>
            </div>
            <div class="debug-hud__item">
              <label>poolGroup Diff:</label>
              <div id="debugPoolDiff">${this.gameScene.poolGroup.getLength() - this.gameScene.poolGroup.getTotalUsed()}</div>
            </div>
          </div>

        </div>
      </div>
    `

    this.debugDom = this.add.dom(50, 50)
      .createFromHTML(debugModal)
      .setOrigin(0, 0)

    document.getElementById('debugAutodrive')
      .addEventListener('click', (e) => {
        this.gameScene.autoDrive = !this.gameScene.autoDrive
        document.getElementById(e.target.id).textContent = `${this.gameScene.autoDrive}`
      })

    document.getElementById('debugDrawDistance')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.Render.drawDistance = parseInt(inputEl.value)
      })

    document.getElementById('debugRoadWidth')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.roadWidth = parseInt(inputEl.value)
      })

    document.getElementById('debugSegmentLength')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.segmentLength = parseInt(inputEl.value)
        this.Road.reset()
      })

    document.getElementById('debugRumbleLength')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.rumbleLength = parseInt(inputEl.value)
        this.Road.reset()
      })

    document.getElementById('debugLanes')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.lanes = parseInt(inputEl.value)
      })

    document.getElementById('debugFogDensity')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.Render.fogDensity = parseInt(inputEl.value)
      })

    document.getElementById('debugMaxSpeed')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.maxSpeed = parseInt(inputEl.value)
        this.gameScene.recalcSpeeds()
      })

    document.getElementById('debugInertia')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.inertia = parseFloat(inputEl.value)
      })

    document.getElementById('debugUknFactor1')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.uknFactor1 = parseInt(inputEl.value)
        this.gameScene.recalcCamera()
      })

    document.getElementById('debugUknFactor2')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.uknFactor2 = parseInt(inputEl.value)
        this.gameScene.recalcCamera()
      })

    document.getElementById('debugFieldOfView')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.fieldOfView = parseInt(inputEl.value)
        this.gameScene.recalcCamera()
      })

    document.getElementById('debugCameraHeight')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.cameraHeight = parseInt(inputEl.value)
        this.gameScene.recalcCamera()
      })

    document.getElementById('debugCameraZoom')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.cameraZoom = parseFloat(inputEl.value)
        this.gameScene.cameras.main.setZoom(this.gameScene.cameraZoom)
      })

    document.getElementById('debugResetRoad')
      .addEventListener('click', (e) => {
        this.Road.reset()
      })

    document.getElementById('debugRenderFog')
      .addEventListener('click', (e) => {
        this.Render.renderFog = !this.Render.renderFog
        document.getElementById(e.target.id).textContent = `${this.Render.renderFog}`
      })

    document.getElementById('debugRenderRumble')
      .addEventListener('click', (e) => {
        this.Render.renderRumble = !this.Render.renderRumble
        document.getElementById(e.target.id).textContent = `${this.Render.renderRumble}`
      })

    document.getElementById('debugRenderLanes')
      .addEventListener('click', (e) => {
        this.Render.renderLanes = !this.Render.renderLanes
        document.getElementById(e.target.id).textContent = `${this.Render.renderLanes}`
      })

    document.getElementById('debugRenderRoad')
      .addEventListener('click', (e) => {
        this.Render.renderRoad = !this.Render.renderRoad
        document.getElementById(e.target.id).textContent = `${this.Render.renderRoad}`
      })

    document.getElementById('debugRenderGround')
      .addEventListener('click', (e) => {
        this.Render.renderGround = !this.Render.renderGround
        document.getElementById(e.target.id).textContent = `${this.Render.renderGround}`
      })

    document.getElementById('debugRenderPlayer')
      .addEventListener('click', (e) => {
        this.Render.renderPlayer = !this.Render.renderPlayer
        document.getElementById(e.target.id).textContent = `${this.Render.renderPlayer}`
      })

    document.getElementById('debugRenderSprites')
      .addEventListener('click', (e) => {
        this.Render.renderSprites = !this.Render.renderSprites
        document.getElementById(e.target.id).textContent = `${this.Render.renderSprites}`
      })
  }

  update ()
  {
    document.getElementById('debugPlayerX').textContent = `${this.gameScene.playerX}`;
    document.getElementById('debugPlayerY').textContent = `${this.gameScene.playerY}`;
    document.getElementById('debugPlayerZ').textContent = `${this.gameScene.playerZ}`;
    document.getElementById('debugSpeed').textContent = `${this.gameScene.speed}`;
    document.getElementById('debugTrackLength').textContent = `${this.Segments.segments.length * this.gameScene.segmentLength}`;
    document.getElementById('debugPosition').textContent = `${this.gameScene.position} (${Math.round(this.gameScene.position / (this.Segments.segments.length * this.gameScene.segmentLength) * 100)}%)`;
    document.getElementById('debugPoolSize').textContent = `${this.gameScene.poolGroup.getLength()}`;
    document.getElementById('debugPoolUsed').textContent = `${this.gameScene.poolGroup.getTotalUsed()}`;
    document.getElementById('debugPoolDiff').textContent = `${this.gameScene.poolGroup.getLength() - this.gameScene.poolGroup.getTotalUsed()}`;
  }

  createDebugButtonToggle(label, id, value)
  {
    this.controlIDs.push(`debug${id}`)

    return `
      <div class="debug-hud__item">
        <label>${label}:</label>
        <button id="debug${id}">${value}</button>
      </div>
    `
  }

  createDebugNumberInput(label, id, value, step, min, max)
  {
    this.controlIDs.push(`debug${id}`)
    
    return `
      <div class="debug-hud__item">
        <label>${label}:</label>
        <input type="number" name="debug${id}" id="debug${id}" step="${step}" min="${min}" max="${max}" value="${value}">
      </div>
    `
  }
}