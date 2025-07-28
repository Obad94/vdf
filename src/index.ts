// @ts-ignore
// src/index.ts
import vdf = require('./vdf');

/**
 * Emscripten's module instance, typed as `any`, so you should really now what you are doing if you want to use it
 */
type EmscriptenModule = any;

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
    _lib_internal: EmscriptenModule;
}

async function CreateLib(lib: EmscriptenModule, options?: object): Promise<ILibrary> {
    const libInstance = await lib(options);

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

    return {
        _lib_internal: libInstance,
        generate: generate,
        verify: verify,
    };
}

function wrapper(lib: EmscriptenModule): (options?: object) => Promise<ILibrary> {
    return CreateLib.bind(null, lib);
}

export default wrapper(vdf);
