import { Camera3D, ComponentBase, Engine3D, Object3D, PointerEvent3D, Vector3 } from '../../..';

/**
 * @internal
 * @group CameraController 
 */
export class FirstPersonCameraController extends ComponentBase {
    public focus: Object3D;

    public distance: number = 5;

    private _camera: Camera3D;

    constructor() {
        super();
        this.serializeTag = 'dont-serialize';
    }

    protected start() {
        this._camera = this.object3D.getOrAddComponent(Camera3D);
        if (!this._camera) {
            console.error('FirstPersonCameraController need camera');
            return;
        }

        if (!this.focus) {
            console.error('FirstPersonCameraController need target');
            return;
        }
        Engine3D.inputSystem.addEventListener(PointerEvent3D.POINTER_WHEEL, this.mouseWheel, this);
        Engine3D.inputSystem.addEventListener(PointerEvent3D.POINTER_UP, this.mouseUp, this);
        Engine3D.inputSystem.addEventListener(PointerEvent3D.POINTER_DOWN, this.mouseDown, this);
    }

    private mouseDown(e: PointerEvent3D) {
        Engine3D.inputSystem.addEventListener(PointerEvent3D.POINTER_MOVE, this.mouseMove, this);
    }

    private mouseUp(e: PointerEvent3D) {
        Engine3D.inputSystem.removeEventListener(PointerEvent3D.POINTER_MOVE, this.mouseMove, this);
    }

    private mouseMove(e: PointerEvent3D) {
        // this.rotation.y += e.movementX * 0.01;
        // this.rotation.x += e.movementY * 0.01;
        let temp = this.transform.localRotation;
        temp.y += e.movementX * 0.01;
        temp.x += e.movementY * 0.01;
        this.transform.localRotation = temp;
    }

    private mouseWheel(e: PointerEvent3D) {
        this.distance += Engine3D.inputSystem.wheelDelta * 0.1;
    }

    public onUpdate() {
        let vec = new Vector3();
        this._camera.transform.forward.scaleToRef(this.distance, vec);
        var focusPoint = this.focus.transform.worldPosition;
        // this._camera.transform.localPosition = focusPoint.subtract(vec);
        this._camera.transform.localPosition = focusPoint;
    }

    public destroy(): void {
        Engine3D.inputSystem.removeEventListener(PointerEvent3D.POINTER_WHEEL, this.mouseWheel, this);
        Engine3D.inputSystem.removeEventListener(PointerEvent3D.POINTER_UP, this.mouseUp, this);
        Engine3D.inputSystem.removeEventListener(PointerEvent3D.POINTER_DOWN, this.mouseDown, this);
        super.destroy();
    }
}