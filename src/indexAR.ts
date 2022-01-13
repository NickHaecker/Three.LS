import * as THREE from 'three';
import { Clock, Mesh, Scene, XRFrame, XRHitTestSource } from 'three';
import Turtle from './Turtle';
// import PerformanceStats from './PerformanceStats';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import Utils from './Utils';
import { LSystem } from './LSystem';
import { Rule } from './Rule';
import LindenmayerTree from './LindenmayerTree';
import { LindenmayerFormularAR } from './LindenmayerFormularAR';


import './styles/ar.scss';

const lindenmayerSettingsForm: LindenmayerFormularAR = LindenmayerFormularAR.getInstance();


let hitTestSource: XRHitTestSource = null;
let hitTestSourceRequested = false;

const sceneClock: Clock = new Clock();

export const scene: Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20,
);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

const treeObjects: LindenmayerTree[] = [];

// Add AR target reticle
const reticle: Mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial(),
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;

scene.add(reticle);

function main() {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, { 
        requiredFeatures: ['hit-test'], 
        optionalFeatures: [ 'dom-overlay', 'dom-overlay-for-handheld-ar' ],
	    domOverlay: { root: document.body } 
    }));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);



    function onSelect() {

        const turtle: Turtle = lindenmayerSettingsForm.generateLSystemImage();

        const turtleMesh = turtle.generateMeshObject();
        // turtleMesh.position.set(0, 0, -0.8).applyMatrix4(controller.matrixWorld);
        turtleMesh.position.setFromMatrixPosition(reticle.matrix);

        turtleMesh.rotateY(Utils.RandomRange(0.0, Math.PI * 2));
        const newTreeObject = new LindenmayerTree(turtleMesh, Utils.RandomRange(0.02, 0.035));
        treeObjects.push(newTreeObject);
        scene.add(newTreeObject);
    }

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize, false);

    renderer.setAnimationLoop(render);
}

function render(timestamp: number, frame: XRFrame) {
    const deltaTime: number = sceneClock.getDelta();
    // Tree Rotation
    treeObjects.forEach((eachTreeObject) => {
        eachTreeObject.render(deltaTime);
    });

    //XR Stuff
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then(function (referenceSpace) {
                session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
                    hitTestSource = source;
                });
            });

            session.addEventListener('end', function () {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });

            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {
                const hit = hitTestResults[0];

                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);

    // PerformanceStats.instance?.update(); // Only update stats if present
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


//Start main loop
main();
