export default class Segments
{
  constructor (scene)
  {
    this.segments = []
  }

  /**
   * Clear all segments.
   */
  reset ()
  {
    this.segments = []
  }

  /**
   * Adds a single un-projected segment to the array. Camera and screen
   * points are calculated during projection.
   */
  add (curve, y)
  {
    // Current length of segments array before adding next
    let n = this.segments.length

    this.segments.push({
      index: n,
      p1: {
        world: {
          y: this.lastY(),
          z: n * this.segmentLength
        },
        camera: {},
        screen: {}
      },
      p2: {
        world: {
          y: y,
          z: (n + 1 ) * this.segmentLength
        },
        camera: {},   
        screen: {}
      },
      curve: curve,
      sprites: [],
      color: Math.floor(n/this.rumbleLength) % 2 ? this.colors.DARK : this.colors.LIGHT
    })
  }

  /**
   * Gets the last y from point 2 of the last segment in the array.
   */
  lastY ()
  {
    return (this.segments.length == 0) ? 0 : this.segments[this.segments.length-1].p2.world.y
  }
}