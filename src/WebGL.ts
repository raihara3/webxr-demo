import * as THREE from 'three'

class WebGL {
  context: WebGLRenderingContext
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2
  renderer: THREE.WebGLRenderer

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgl')
    if (!context) {
      throw new Error('WebGL not supported')
    }
    this.context = context
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: context,
      antialias: true,
      alpha: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.xr.enabled = true
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera)
    })

    const aspect = window.innerWidth / window.innerHeight
    window.addEventListener('resize', () => {
      this.camera.aspect = aspect
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }, false)
  }
}

export default WebGL
