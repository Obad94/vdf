// src/index.ts - Updated with fast verification option (UMD compatible)
/// <reference path="./types/vdf.d.ts" />
/// <reference path="./types/global.d.ts" />

// Import the VDF module factory
const createVdfModule = require('./vdf');

/**
 * Emscripten's module instance with proper typing
 */
interface EmscriptenModule {
    _malloc(size: number): number;
    _free(ptr: number): void;
    _generate(
        iterations: number,
        challengePtr: number,
        challengeSize: number,
        intSizeBits: number,
        isPietrzak: boolean,
        proofPtr: number,
        proofSizePtr: number
    ): number;
    _verify(
        iterations: number,
        challengePtr: number,
        challengeSize: number,
        proofPtr: number,
        proofSize: number,
        intSizeBits: number,
        isPietrzak: boolean
    ): boolean;
    _verify_slow(
        iterations: number,
        challengePtr: number,
        challengeSize: number,
        proofPtr: number,
        proofSize: number,
        intSizeBits: number,
        isPietrzak: boolean
    ): boolean;

    // Memory management functions
    createPointer(address: number, size: number): Pointer;
    allocatePointer(address?: number): Pointer;
    allocateBytes(size: number, value?: Uint8Array): Pointer;
    freeBytes(): void;

    // Heap views
    HEAPU8: Uint8Array;
}

interface Pointer extends Number {
    length: number;
    get(as?: Uint8ArrayConstructor | Uint32ArrayConstructor): Uint8Array | Uint32Array;
    dereference(size?: number): Pointer;
    set(value: Uint8Array | string): void;
    free(): void;
}

interface ILibrary {
    generate: (
        iterations: number,
        challenge: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ) => Uint8Array;
    verify: (
        iterations: number,
        challenge: Uint8Array,
        proof: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ) => boolean;
    // Add the slow verification method for comparison
    verifySlow: (
        iterations: number,
        challenge: Uint8Array,
        proof: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ) => boolean;
    _lib_internal: EmscriptenModule;
}

async function CreateLib(moduleFactory: any, options?: object): Promise<ILibrary> {
    const libInstance = await moduleFactory(options);

    function generate(
        iterations: number,
        challenge: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ): Uint8Array {
        if (isPietrzak && (iterations % 2 !== 0 || iterations < 66)) {
            throw new Error('Number of iterations must be even and at least 66');
        }
        if (!challenge || challenge.length === 0) {
            throw new Error('Challenge must not be empty');
        }
        const validSizes = [1024, 2048, 3072, 4096];
        if (!validSizes.includes(intSizeBits)) {
            throw new Error('intSizeBits must be one of 1024, 2048, 3072, 4096');
        }

        const challengePtr = libInstance.allocateBytes(challenge.length, challenge);
        const proofPtr = libInstance.allocatePointer();
        const proofSizePtr = libInstance.allocateBytes(4);

        const result = libInstance._generate(
            iterations,
            challengePtr,
            challengePtr.length,
            intSizeBits,
            isPietrzak,
            proofPtr,
            proofSizePtr,
        );

        if (result === 0) {
            const proof = proofPtr.dereference(proofSizePtr.get(Uint32Array)[0]);
            const proofValue = proof.get();
            proofPtr.free();
            proofSizePtr.free();
            challengePtr.free();
            proof.free();
            return proofValue;
        } else {
            proofPtr.free();
            proofSizePtr.free();
            challengePtr.free();
            throw new Error('Failed to generate proof');
        }
    }

    // Fast verification using POA Networks optimized code
    function verify(
        iterations: number,
        challenge: Uint8Array,
        proof: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ): boolean {
        if (isPietrzak && (iterations % 2 !== 0 || iterations < 66)) {
            throw new Error('Number of iterations must be even and at least 66');
        }

        const challengeBuffer = libInstance.allocateBytes(0, challenge);
        const proofBuffer = libInstance.allocateBytes(0, proof);

        // Use the FAST verification function
        const result = libInstance._verify(
            iterations,
            challengeBuffer,
            challengeBuffer.length,
            proofBuffer,
            proofBuffer.length,
            intSizeBits,
            isPietrzak,
        );

        challengeBuffer.free();
        proofBuffer.free();
        return Boolean(result);
    }

    // Slow verification for comparison (uses original vdf crate)
    function verifySlow(
        iterations: number,
        challenge: Uint8Array,
        proof: Uint8Array,
        intSizeBits: number,
        isPietrzak: boolean,
    ): boolean {
        if (isPietrzak && (iterations % 2 !== 0 || iterations < 66)) {
            throw new Error('Number of iterations must be even and at least 66');
        }

        const challengeBuffer = libInstance.allocateBytes(0, challenge);
        const proofBuffer = libInstance.allocateBytes(0, proof);

        // Use the SLOW verification function for comparison
        const result = libInstance._verify_slow(
            iterations,
            challengeBuffer,
            challengeBuffer.length,
            proofBuffer,
            proofBuffer.length,
            intSizeBits,
            isPietrzak,
        );

        challengeBuffer.free();
        proofBuffer.free();
        return Boolean(result);
    }

    return {
        _lib_internal: libInstance,
        generate: generate,
        verify: verify,
        verifySlow: verifySlow,
    };
}

function wrapper(moduleFactory: any): (options?: object) => Promise<ILibrary> {
    return CreateLib.bind(null, moduleFactory);
}

// Export the default function
const vdfFactory = wrapper(createVdfModule);
export = vdfFactory;