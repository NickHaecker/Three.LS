import * as THREE from 'three'
import { Clock, Renderer, Scene, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Turtle } from './Turtle' //Warum braucht es das? Bei LSystem gehts doch auch...
import { Rule } from './Rule'
import { LSystem } from './LSystem'
import { Utils } from './Utils'

let camera: THREE.PerspectiveCamera
let scene: Scene
let renderer: Renderer
let line: THREE.Line
let controls: OrbitControls
let clock: Clock = new THREE.Clock()

//L System stuff
let generations: number = 2
let ruleset: Rule[] = []

// Square
// ruleset.push(new Rule('F', 'F[F]-F+F[--F]+F-F'))
// let lsys: LSystem = new LSystem('F-F-F-F', ruleset)
// for (let i: number = 0; i < generations; i++) {
//     lsys.generate()
//     console.log(lsys.getSentence())
// }
// let turtle: Turtle = new Turtle(lsys.getSentence(), 0.5, Math.PI / 2)

// Triangle
// ruleset.push(new Rule('F', 'F--F--F--G'))
// ruleset.push(new Rule('G', 'GG'))
// let lsys: LSystem = new LSystem('F--F--F', ruleset)
// for (let i: number = 0; i < generations; i++) {
//     lsys.generate()
//     console.log(lsys.getSentence())
// }
// let turtle: Turtle = new Turtle(lsys.getSentence(), 0.5, (2 * Math.PI) / 3)

// Tree
// ruleset.push(new Rule('F', 'FF+[+F-F-F]-[-F+F+F]'))
// let lsys: LSystem = new LSystem('F', ruleset)
// for (let i: number = 0; i < generations; i++) {
//     lsys.generate()
//     console.log(lsys.getSentence())
// }
// let turtle: Turtle = new Turtle(
//     lsys.getSentence(),
//     0.5,
//     Utils.degreesToRadians(25)
// )

//Debugging
ruleset.push(new Rule('F', 'F[F]-F+F[--F]+F-F'))
let lsys: LSystem = new LSystem('F-F-F-F', ruleset)
for (let i: number = 0; i < generations; i++) {
    lsys.generate()
    console.log(lsys.getSentence())
}
let turtle: Turtle = new Turtle(lsys.getSentence(), 0.5, Math.PI / 2)

init()
animate()

function init() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        10000
    )

    controls = new OrbitControls(camera, renderer.domElement)
    camera.position.set(0, 0, 10)
    controls.update()

    scene = new THREE.Scene()

    turtle.render(scene)

    renderer.render(scene, camera)

    window.addEventListener('resize', onWindowResize, false)
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}