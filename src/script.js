import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })
const debugObj = {
    depthColor: '#00004d',
    surfaceColor: '#007aa3',
    width: 2,
    height: 2
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(4, 4, 500, 500)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: {value: 0},
        
        uBigWavesElevation: {value: .17},
        uBigWavesFrequency: {value: new THREE.Vector2(3.217, 1.671)},
        uBigWavesSpeed: {value: 0.75},
        
        uSmallWavesElevation: {value: .15},
        uSmallWavesFrequency: {value: 3},
        uSmallWavesSpeed: {value: 0.2},
        uSmallWavesIterations: {value: 4},

        uDepthColor: {value: new THREE.Color(debugObj.depthColor)},
        uSurfaceColor: {value: new THREE.Color(debugObj.surfaceColor)},
        uColorOffset: { value: 0.152 },
        uColorMultiplying: {value: 2.135}
    }
})


const bigWaves = gui.addFolder('Big waves')
bigWaves.close()
bigWaves.add(waterMaterial.uniforms.uBigWavesElevation, 'value', 0, 3, 0.001).name('Elevation')
bigWaves.add(waterMaterial.uniforms.uBigWavesSpeed, 'value', 0, 10, 0.001).name('Speed')
bigWaves.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x', 0, 10, 0.001).name('Frequency X')
bigWaves.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y', 0, 10, 0.001).name('Frequency Y')

const smallWaves = gui.addFolder('Small Waves')
smallWaves.close()
smallWaves.add(waterMaterial.uniforms.uSmallWavesElevation, 'value', 0, 1, 0.001).name('Elevation')
smallWaves.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value', 0, 4, 0.001).name('Speed')
smallWaves.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value', 0, 30, 0.001).name('Frequency')
smallWaves.add(waterMaterial.uniforms.uSmallWavesIterations, 'value', 0, 5, 0.001).name('Iterations')

const colors = gui.addFolder('Colors')
colors.close()
colors.add(waterMaterial.uniforms.uColorOffset, 'value', 0, 1, 0.001).name('Color Offset')
colors.add(waterMaterial.uniforms.uColorMultiplying, 'value', 0, 10, 0.001).name('Color multiplying')
colors
    .addColor(debugObj, 'depthColor')
    .name('Depth Color')
    .onChange(() => {
        waterMaterial.uniforms.uDepthColor.value.set(debugObj.depthColor)
    })
colors
    .addColor(debugObj, 'surfaceColor')
    .name('Surface Color')
    .onChange(() => {
        waterMaterial.uniforms.uSurfaceColor.value.set(debugObj.surfaceColor)
    })

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxDistance = 5
controls.maxZoom = 2

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()