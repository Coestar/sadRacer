

export default class Segments
{
  constructor (scene)
  {
    this.scene      = scene

    this.segments   = []
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
          z: n * this.scene.segmentLength
        },
        camera: {},
        screen: {}
      },
      p2: {
        world: {
          y: y,
          z: (n + 1 ) * this.scene.segmentLength
        },
        camera: {},   
        screen: {}
      },
      curve: curve,
      sprites: [],
      color: Math.floor(n/this.scene.rumbleLength) % 2 ? this.scene.colors.DARK : this.scene.colors.LIGHT
    })
  }

  /**
   * Gets the last y from point 2 of the last segment in the array.
   */
  lastY ()
  {
    return (this.segments.length == 0) ? 0 : this.segments[this.segments.length-1].p2.world.y
  }

  /**
   * Finds segment
   */
  findSegment (z)
  {
    return this.segments[Math.floor(z/this.scene.segmentLength) % this.segments.length];
  }

  findSegmentPosition (z)
  {
    return Math.floor(z/this.scene.segmentLength) % this.segments.length;
  }

  getSegmentAt (z){
    return this.segments.at(z)
  }
}