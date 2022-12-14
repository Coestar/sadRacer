export default class DebugHUD extends Phaser.Scene
{
  constructor ()
  {
    super('debug-hud')
  }

  create ()
  {
    this.add.text(50, 50, 'DEBUG', { color: '#000000', fontSize: '20px' })
  }
}