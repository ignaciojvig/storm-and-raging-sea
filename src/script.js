import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'


// Debug
const gui = new dat.GUI({ width: 340, closed: true })
const debugObject = {
    thunder: () => {
        scene.background = new THREE.Color('white');
        playThunderclap()

        setTimeout(() => {
            scene.background = new THREE.Color('black');

            if (Math.random() > 0.7) {
                setTimeout(() => {
                    scene.background = new THREE.Color('white');
                    playThunderclap()
                    setTimeout(() => {
                        scene.background = new THREE.Color('black');
                    }, 200)
                }, 200)
            }
        }, 200)
    }
}

// Textures
const textureLoader = new THREE.TextureLoader()
const raindropTexture = textureLoader.load('/textures/particles/12.png')

// Sounds
const thunderclap = new Audio('/sounds/thunderclap.mp3')
const playThunderclap = () => {
    const randomVolume = Math.random()
    thunderclap.volume = randomVolume < 0.5 ? 0.5 : randomVolume
    thunderclap.currentTime = 1
    thunderclap.play()
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

// Color
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesSpeed: { value: 0.75 },
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uPerlinNoiseIterations: { value: 4.0 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },
    }
})

gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name("uBigWavesElevation");
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name("uBigWavesFrequencyX");
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name("uBigWavesFrequencyZ");
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name("uBigWavesSpeed");
gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor) });
gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) });
gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name("uColorOffset");
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name("uColorMultiplier");
gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uPerlinNoiseIterations, 'value').min(0).max(5).step(1).name('uPerlinNoiseIterations')
gui.add(debugObject, 'thunder').name('Thunder!')

// Rain
const raindropGeometry = new THREE.BufferGeometry()
const raindropCount = 100;
const raindropPositions = new Float32Array(raindropCount * 3)

const generateRaindropPositionInXZ = () => {
    // return Math.min(Math.random() * 10, 2)
    return parseFloat(
        (Math.random() * (2 - 0.1) + 0.1).toFixed(2)
    )
}

const generateRaindropPositionInY = () => {
    // return Math.min(Math.random() * 10, 8)
    return parseFloat(
        (Math.random() * (4 - 0.2) + 0.2).toFixed(2)
    )
}

for (let i = 0; i < raindropCount * 3; i++) {
    raindropPositions[i] = i % 3 === 1 ? generateRaindropPositionInY() : generateRaindropPositionInXZ();
}

raindropGeometry.setAttribute('position', new THREE.BufferAttribute(raindropPositions, 3))

const raindropMaterial = new THREE.PointsMaterial({ size: 0.1, sizeAttenuation: true, alphaMap: raindropTexture, transparent: true })
const raindrops = new THREE.Points(raindropGeometry, raindropMaterial)
raindrops.position.x = -1
raindrops.position.z = -1

scene.add(raindrops)

console.log(raindropPositions)


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

//

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
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

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update Water
    waterMaterial.uniforms.uTime.value = elapsedTime;

    // Animate Raindrops
    for (let i = 0; i < raindropCount; i++) {
        const iy = i * 3
        const newRaindropPosition = raindropGeometry.attributes.position.array[iy + 1] - 0.05
        raindropGeometry.attributes.position.array[iy + 1] = newRaindropPosition < 0 ? 4 : newRaindropPosition
    }
    raindropGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()