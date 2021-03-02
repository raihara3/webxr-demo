import * as THREE from 'three'
import { Color } from 'three'
import WebGL from './WebGL'

const startButton = document.getElementById('start-button') as HTMLButtonElement

const createReticle = () => {
  const ringGeometry = new THREE.RingGeometry(0.03, 0.05, 50)
  ringGeometry.rotateX(-0.5 * Math.PI)
  const material = new THREE.MeshBasicMaterial({
    color: new Color('#f3f705'),
    side: THREE.DoubleSide
  })
  const reticle = new THREE.Mesh(ringGeometry, material)
  reticle.name = 'reticle'
  return reticle
}

startButton.addEventListener('click', async() => {
  const canvas = document.getElementById('webAR') as HTMLCanvasElement
  const webGL = new WebGL(canvas)

  const session = await navigator['xr'].requestSession('immersive-ar', {
    requiredFeatures: ['local', 'hit-test']
  })
  const refSpace = await session.requestReferenceSpace('viewer')
  const xrHitTestSource = await session.requestHitTestSource({space: refSpace})
  const xrRefSpace = await session.requestReferenceSpace('local')
  const context: any = webGL.context
  await context.makeXRCompatible()
  webGL.renderer.xr.setReferenceSpaceType('local')
  webGL.renderer.xr.setSession(session)
  session.addEventListener('end', () => location.reload())

  const reticle = createReticle()
  webGL.scene.add(reticle)

  const onXRFrame = (_, frame) => {
    const hitTestResults = frame.getHitTestResults(xrHitTestSource)
    if(hitTestResults.length > 0) {
      const pose = hitTestResults[0].getPose(xrRefSpace)
      const { position, orientation } = pose.transform
      reticle.position.set(position.x, position.y, position.z)
      reticle.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w)
      reticle.updateMatrix()
    }

    session.requestAnimationFrame((_, frame) => onXRFrame(_, frame))
  }

  session.requestAnimationFrame((_, frame) => {
    onXRFrame(_, frame)
  })
})

window.onload = () => {
  const xr = navigator['xr']
  if(!xr) {
    startButton.innerText = 'WebXR not available'
    startButton.disabled = true
    return
  }
  startButton.innerText = 'Starat WebAR'
}
