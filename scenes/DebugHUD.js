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
        </div>
      </div>
    `

    this.debugDom = this.add.dom(50, 50)
      .createFromHTML(debugModal)
      .setOrigin(0, 0)
    
  }
}