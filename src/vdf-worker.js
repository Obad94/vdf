// vdf-worker.js: Web Worker for VDF computation using vdf.js glue and manual wrapper
self.importScripts('vdf.js');

let vdfModulePromise = null;

function getVDFModule() {
    if (!vdfModulePromise) {
        // Patch locateFile for WASM loading in worker
        self.Module = self.Module || {};
        self.Module.locateFile = function(path) {
            if (path.endsWith('.wasm')) {
                return 'dist/' + path;
            }
            return path;
        };
        vdfModulePromise = Module();
    }
    return vdfModulePromise;
}

function generate(mod, iterations, challenge, intSizeBits, isPietrzak) {
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
    const challengePtr = mod.allocateBytes(challenge.length, challenge);
    const proofPtr = mod.allocatePointer();
    const proofSizePtr = mod.allocateBytes(4);
    const result = mod._generate(
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

function verify(mod, iterations, challenge, proof, intSizeBits, isPietrzak) {
    if (isPietrzak && (iterations % 2 !== 0 || iterations < 66)) {
        throw new Error('Number of iterations must be even and at least 66');
    }
    const challengeBuffer = mod.allocateBytes(0, challenge);
    const proofBuffer = mod.allocateBytes(0, proof);
    const result = mod._verify(
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


let isBusy = false;
self.onmessage = async function(e) {
    if (isBusy) {
        self.postMessage({ type: 'error', error: 'Worker is busy. Only one VDF computation allowed at a time.' });
        return;
    }
    isBusy = true;
    const { type, data } = e.data;
    try {
        const mod = await getVDFModule();
        if (type === 'generate') {
            const { iterations, challenge, keySize, isPietrzak } = data;
            const proof = generate(mod, iterations, new Uint8Array(challenge), keySize, isPietrzak);
            self.postMessage({ type: 'result', proof });
        } else if (type === 'verify') {
            const { iterations, challenge, proof, keySize, isPietrzak } = data;
            const isValid = verify(mod, iterations, new Uint8Array(challenge), new Uint8Array(proof), keySize, isPietrzak);
            self.postMessage({ type: 'result', isValid });
        }
    } catch (err) {
        self.postMessage({ type: 'error', error: err.message });
    } finally {
        isBusy = false;
    }
};