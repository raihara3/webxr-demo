import * as THREE from 'three'
import { Color } from 'three'
import WebGL from "./WebGL"

const startButton = document.getElementById('start-button') as HTMLButtonElement
const overlayDom = document.getElementById('overlay-dom') as HTMLDivElement

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

  if (!navigator['xr']) {
    console.error('WebXR not available');
    return;
  }
  const session = await navigator['xr']!.requestSession('immersive-ar', {
    requiredFeatures: ['local', 'hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: overlayDom },
  })
  const refSpace = await session.requestReferenceSpace('viewer')
  if (!session.requestHitTestSource) {
    console.error('requestHitTestSource is not available');
    return;
  }
  const xrHitTestSource = await session.requestHitTestSource({space: refSpace})
  if(!xrHitTestSource) {
    console.error('xrHitTestSource is not available');
    return;
  }
  const xrRefSpace = await session.requestReferenceSpace('local')
  const context: any = webGL.context
  await context.makeXRCompatible()
  webGL.renderer.xr.setReferenceSpaceType('local')
  webGL.renderer.xr.setSession(session)
  session.addEventListener('end', () => location.reload())

  const reticle = createReticle()
  webGL.scene.add(reticle)

  const onXRFrame = (time: DOMHighResTimeStamp, frame: XRFrame) => {
    const hitTestResults = frame.getHitTestResults(xrHitTestSource)
    if(hitTestResults.length > 0) {
      const pose = hitTestResults[0].getPose(xrRefSpace)
      if(!pose) {
        console.error('pose is not available');
        return;
      }
      const { position, orientation } = pose.transform
      reticle.position.set(position.x, position.y, position.z)
      reticle.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w)
      reticle.updateMatrix()
    }

    session.requestAnimationFrame((_, frame) => onXRFrame(_, frame))
  }

  const controller = webGL.renderer.xr.getController(0)
  controller.addEventListener('select', () => {
    const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const cube = new THREE.Mesh(boxGeometry, boxMaterial)
    cube.position.copy(reticle.position)
    // cubeを高さの半分だけ上に移動
    cube.position.y += 0.05
    cube.quaternion.copy(reticle.quaternion)
    console.log(reticle.position)
    webGL.scene.add(cube)
  })

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
