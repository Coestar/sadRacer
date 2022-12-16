export default class DebugHUD extends Phaser.Scene
{
  constructor ()
  {
    super('debug-hud')

    this.gameScene  = null
    this.debugDom   = null
  }

  create ()
  {

    this.gameScene = this.scene.get('game')

    const debugModal = `
      <div id="debugModal">
        <div class="debug-hud__wrapper">
          <div class="debug-hud__item">
            <label>Autodrive:</label>
            <button id="debugAutodrive">${this.gameScene.autoDrive}</button>
          </div>
          <div class="debug-hud__item">
            <label>Draw Distance:</label>
            <input type="number" name="debugDrawDistance" id="debugDrawDistance" value="${this.gameScene.drawDistance}">
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
            <input type="number" name="debugFogDensity" id="debugFogDensity" value="${this.gameScene.fogDensity}">
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
        this.gameScene.drawDistance = parseInt(inputEl.value)
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
        this.gameScene.resetRoad()
      })

    document.getElementById('debugRumbleLength')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.rumbleLength = parseInt(inputEl.value)
        this.gameScene.resetRoad()
      })

    document.getElementById('debugLanes')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.lanes = parseInt(inputEl.value)
      })

    document.getElementById('debugFogDensity')
      .addEventListener('change', (e) => {
        let inputEl = document.getElementById(e.target.id)
        this.gameScene.fogDensity = parseInt(inputEl.value)
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
  }
}