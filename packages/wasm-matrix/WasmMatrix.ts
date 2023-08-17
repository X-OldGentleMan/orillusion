import { DEGREES_TO_RADIANS, Matrix4 } from '../../src';

export class WasmMatrix {

    public static matrixBuffer: Float32Array;
    public static matrixSRTBuffer: Float32Array;
    public static matrixContinuedSRTBuffer: Float32Array;
    public static matrixStateBuffer: Int32Array;
    static matrixBufferPtr: number;
    static matrixSRTBufferPtr: number;
    static matrixContinuedSRTBufferPtr: number;
    static matrixStateBufferPtr: number;
    static wasm: any;
    static stateStruct: number = 4;

    public static async isReady(): Promise<boolean> {
        return new Promise(
            (suc, fail) => {
                const script = document.createElement('script');
                script.async = true;
                script.type = "text/javascript";
                script.src = "packages/wasm-matrix/matrix.js";
                document.body.appendChild(script)
                script.onload = () => {
                    let id = setInterval(() => {
                        this.wasm = window['wasmMatrix'];
                        if (this.wasm) {
                            let ready = this.wasm['calledRun']
                            if (ready) {
                                clearInterval(id);
                                suc(true);
                            } else {
                                // fail(false);
                            }
                        }
                    }, 16);
                }
            }
        )
    }

    public static init(count: number) {
        // this.wasm = window['wasmMatrix'];
        this.allocMatrix(count);
    }

    public static allocMatrix(count: number) {
        if (count >= Matrix4.maxCount) {
            console.error('The maximum allocation size is exceeded!');
        }

        this.wasm._allocation(count);

        this.matrixBufferPtr = this.wasm._getMatrixBufferPtr();
        this.matrixSRTBufferPtr = this.wasm._getSRTPtr();
        this.matrixStateBufferPtr = this.wasm._getInfoPtr();
        this.matrixContinuedSRTBufferPtr = this.wasm._getContinuedSRTPtr();

        this.matrixBuffer = new Float32Array(this.wasm.HEAPF32.buffer, this.matrixBufferPtr, 16 * count);
        this.matrixSRTBuffer = new Float32Array(this.wasm.HEAPF32.buffer, this.matrixSRTBufferPtr, (3 * 3) * count);
        this.matrixContinuedSRTBuffer = new Float32Array(this.wasm.HEAPF32.buffer, this.matrixContinuedSRTBufferPtr, (3 * 3) * count);
        this.matrixStateBuffer = new Int32Array(this.wasm.HEAP32.buffer, this.matrixStateBufferPtr, (WasmMatrix.stateStruct) * count);

        Matrix4.allocMatrix(count);
    }

    public static updateAllContinueTransform(start: number, end: number, dt: number) {
        this.wasm._updateAllMatrixContinueTransform(start, end, dt);
    }

    public static setParent(matIndex: number, x: number, depthOrder: number) {
        this.matrixStateBuffer[matIndex * WasmMatrix.stateStruct + 2] = x >= 0 ? x : -1;
        this.matrixStateBuffer[matIndex * WasmMatrix.stateStruct + 3] = depthOrder;
        // console.warn(`${matIndex} -> ${depthOrder}`);
    }

    public static setTranslate(matIndex: number, x: number, y: number, z: number) {
        this.matrixSRTBuffer[matIndex * 9 + 6] = x;
        this.matrixSRTBuffer[matIndex * 9 + 7] = y;
        this.matrixSRTBuffer[matIndex * 9 + 8] = z;
    }

    public static setRotation(matIndex: number, x: number, y: number, z: number) {
        this.matrixSRTBuffer[matIndex * 9 + 3] = (x % 360) * DEGREES_TO_RADIANS;
        this.matrixSRTBuffer[matIndex * 9 + 4] = (y % 360) * DEGREES_TO_RADIANS;
        this.matrixSRTBuffer[matIndex * 9 + 5] = (z % 360) * DEGREES_TO_RADIANS;
    }

    public static setScale(matIndex: number, x: number, y: number, z: number) {
        this.matrixSRTBuffer[matIndex * 9 + 0] = x;
        this.matrixSRTBuffer[matIndex * 9 + 1] = y;
        this.matrixSRTBuffer[matIndex * 9 + 2] = z;
    }

    public static setContinueTranslate(matIndex: number, x: number, y: number, z: number) {
        if (x != 0 || y != 0 || z != 0) {
            this.matrixContinuedSRTBuffer[matIndex * 9 + 6] = x;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 7] = y;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 8] = z;
            this.matrixStateBuffer[matIndex * WasmMatrix.stateStruct + 1] = 1;
        }
    }

    public static setContinueRotation(matIndex: number, x: number, y: number, z: number) {
        if (x != 0 || y != 0 || z != 0) {
            this.matrixContinuedSRTBuffer[matIndex * 9 + 3] = x;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 4] = y;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 5] = z;
            this.matrixStateBuffer[matIndex * WasmMatrix.stateStruct + 1] = 1;
        }
    }

    public static setContinueScale(matIndex: number, x: number, y: number, z: number) {
        if (x != 0 || y != 0 || z != 0) {
            this.matrixContinuedSRTBuffer[matIndex * 9 + 0] = x;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 1] = y;
            this.matrixContinuedSRTBuffer[matIndex * 9 + 2] = z;
            this.matrixStateBuffer[matIndex * WasmMatrix.stateStruct + 1] = 1;
        }
    }
}