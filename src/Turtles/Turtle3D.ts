import {
    Vector3,
    Quaternion,
    BufferGeometry,
    Float32BufferAttribute,
    MeshBasicMaterial,
    Mesh,
    BoxGeometry,
    Material,
    MeshPhongMaterial,
} from 'three';
import { BaseTurtle } from './BaseTurtle';

export class Turtle3D extends BaseTurtle {
    addGeometryToScene(scene: THREE.Scene): void {
        console.time('Geometry creation');

        const leafCenterPositions: Vector3[] = [];

        const material: Material = new MeshPhongMaterial({ emissive: 0xffff00 });
        const geometry: BoxGeometry = new BoxGeometry(1, 1, 1);

        for (let i = 0; i < this.instructionString.length; i++) {
            switch (this.instructionString.charAt(i)) {
                case 'F': //Move and draw line in current direction
                    const currentPositionBeforeMove = this.currentPosition.clone();
                    this.move();
                    const currentPositionAfterMove = this.currentPosition.clone();

                    const centerPositionBetweenMovePoints: Vector3 = currentPositionAfterMove
                        .clone()
                        .lerp(currentPositionBeforeMove.clone(), 2);

                    leafCenterPositions.push(
                        currentPositionAfterMove.clone().sub(currentPositionBeforeMove.clone()).divideScalar(2),
                    );

                    const boxMesh = new Mesh(geometry, material);

                    const boxScale = 0.15;
                    boxMesh.scale.set(boxScale, boxScale, boxScale);


                    boxMesh.position.copy(centerPositionBetweenMovePoints);

                    scene.add(boxMesh);

                    break;
                case 'G': //Move in current direction
                    this.move();
                    break;
                case '[':
                    this.saveState();
                    break;
                case ']':
                    this.loadState();
                    break;
                case '+':
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), this.rotationStepSize),
                    );
                    break;
                case '-':
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(0, 0, -1), this.rotationStepSize),
                    );
                    break;
                case '&':
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), this.rotationStepSize),
                    );
                    break;
                case '∧': //Achtung, ∧ (mathematisches UND) und nicht ^ :D
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(0, -1, 0), this.rotationStepSize),
                    );
                    break;
                case '\\':
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), this.rotationStepSize),
                    );
                    break;
                case '/':
                    this.currentRotation.multiply(
                        new Quaternion().setFromAxisAngle(new Vector3(-1, 0, 0), this.rotationStepSize),
                    );
                    break;
                case '|':
                    this.currentRotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI));
                    break;
                default:
                    console.log('Unknown axiom character: ' + this.instructionString.charAt(i));
                    break;
            }
        }

        let globalCenterPoint: Vector3 = new Vector3();
        leafCenterPositions.forEach((eachVector3: Vector3) => {
            globalCenterPoint.add(eachVector3);
        });
        globalCenterPoint = globalCenterPoint.divideScalar(leafCenterPositions.length);

        // mesh.applyMatrix4(new Matrix4().makeTranslation(globalCenterPoint.x, globalCenterPoint.y, globalCenterPoint.z));

        console.timeEnd('Geometry creation');
        scene.add(createPlane());
    }

    move(): void {
        const absoluteMovement: Vector3 = new Vector3(0, 1, 0)
            .applyQuaternion(this.currentRotation.clone())
            .multiplyScalar(this.stepLength);

        this.currentPosition.add(absoluteMovement);
    }
}
function createPlane(): THREE.Mesh {
    const bufferGeometry: THREE.BufferGeometry = new BufferGeometry();
    const newColors = [Math.random() * 0.7 + 0.3, Math.random() * 0.7 + 0.3, Math.random() * 0.7 + 0.3];
    const vertices: any[] = [];
    const tris: number[] = [];
    vertices[0] = [-5, -5, 2.5];
    vertices[1] = [5, -5, 2.5];
    vertices[2] = [5, -5, -2.5];
    vertices[3] = [-5, -5, -2.5];
    tris.push(...[...vertices[0], ...vertices[1], ...vertices[2], ...vertices[0], ...vertices[2], ...vertices[3]]);
    const colorsArray: number[] = [...newColors, ...newColors, ...newColors, ...newColors, ...newColors, ...newColors];
    bufferGeometry.setAttribute('position', new Float32BufferAttribute(tris, 3));

    // console.log(colorsArray);

    bufferGeometry.setAttribute('color', new Float32BufferAttribute(colorsArray, 3));

    // console.log(bufferGeometry);

    const material = new MeshBasicMaterial({
        vertexColors: true,
    });

    const mesh = new Mesh(bufferGeometry, material);
    return mesh;
}
