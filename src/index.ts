import * as THREE from 'three';
import { Scene } from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { Turtle3D } from './Turtles/Turtle3D';
import { LindenmayerFormular } from './LindenmayerFormular';
import PerformanceStats from './PerformanceStats';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

export let scene: Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: TrackballControls;

// Can we handle routes differently somehow? ~bas
const windowLocationHref: string = window.location.href;
const windowFileLocationName: string = windowLocationHref.substring(windowLocationHref.lastIndexOf('/'));

switch (windowFileLocationName) {
    case '/':
        const lindenmayerSettingsForm: LindenmayerFormular = LindenmayerFormular.getInstance();
        const newTurtle: Turtle3D = lindenmayerSettingsForm.generateLSystemImage();

        if (scene !== undefined) {
            repaint(newTurtle);
        } else {
            initTestingScene(newTurtle, lindenmayerSettingsForm);
            animate();
        }
        break;
    case '/ar.html':
        initArTestingScene();
        animate();

        break;
    default:
        console.error('Route not found');
}

function hookUpGenerateButtonEventListener(lindenmayerSettingsForm: LindenmayerFormular) {
    const btnGenerate: HTMLInputElement = document.querySelector('#btnGenerate');
    btnGenerate.addEventListener('click', (e) => {
        e.preventDefault();
        const newTurtle: Turtle3D = lindenmayerSettingsForm.generateLSystemImage();

        if (scene !== undefined) {
            repaint(newTurtle);
        } else {
            initTestingScene(newTurtle, lindenmayerSettingsForm);
            animate();
        }
    });
}

function initTestingScene(turtle: Turtle3D, lindenmayerSettingsForm: LindenmayerFormular) {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2;
    camera.position.set(0, 0, 15);
    controls.update();

    scene = new THREE.Scene();

    const mesh: THREE.Mesh = turtle.addGeometryToScene(scene);

    renderer.render(scene, camera);

    const directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.target = mesh;
    scene.add(directionalLight);

    scene.add(addPlane());

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    window.addEventListener('resize', onWindowResize, false);

    hookUpGenerateButtonEventListener(lindenmayerSettingsForm);
}

function initArTestingScene() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // TODO: replace this geometrx with a generated tree somehow
    const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

    function onSelect() {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
        mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(mesh);
    }

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    renderer.render(scene, camera);

    window.addEventListener('resize', onWindowResize, false);
}

function repaint(turtle: Turtle3D) {
    for (let i = scene.children.length - 1; i >= 0; i--) {
        const obj = scene.children[i];
        scene.remove(obj);
    }
    turtle.addGeometryToScene(scene);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
    controls?.update(); // Only update controls if present

    //Performance Stats update
    PerformanceStats.instance?.update(); // Only update stats if present
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
function addPlane(): THREE.Mesh {
    const bufferGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
    const newColors = [Math.random() * 0.7 + 0.3, Math.random() * 0.7 + 0.3, Math.random() * 0.7 + 0.3];
    const vertices: any[] = [];
    const tris: number[] = [];
    vertices[0] = [-5, -5, 2.5];
    vertices[1] = [5, -5, 2.5];
    vertices[2] = [5, -5, -2.5];
    vertices[3] = [-5, -5, -2.5];
    tris.push(...[...vertices[0], ...vertices[1], ...vertices[2], ...vertices[0], ...vertices[2], ...vertices[3]]);
    const colorsArray: number[] = [...newColors, ...newColors, ...newColors, ...newColors, ...newColors, ...newColors];
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));

    // console.log(colorsArray);

    bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3));

    // console.log(bufferGeometry);

    const material = new THREE.MeshBasicMaterial({
        vertexColors: true,
    });

    const mesh = new THREE.Mesh(bufferGeometry, material);
    return mesh;
}
