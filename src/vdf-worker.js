// vdf-worker.js: Web Worker for VDF computation
self.importScripts('vdf.js');

let vdfModulePromise = null;

function getVDFModule() {
    if (!vdfModulePromise) {
        // Patch locateFile for WASM loading in worker
        self.Module = self.Module || {};
        self.Module.locateFile = function(path) {
            if (path.endsWith('.wasm')) return 'dist/' + path;
            return path;
        };
        vdfModulePromise = Module();
    }
    return vdfModulePromise;
}

self.onmessage = async function(e) {
    const { type, data } = e.data;
    if (type === 'generate') {
        try {
            const mod = await getVDFModule();
            const { iterations, challenge, keySize, isPietrzak } = data;
            const proof = mod.generate(iterations, new Uint8Array(challenge), keySize, isPietrzak);
            self.postMessage({ type: 'result', proof });
        } catch (err) {
            self.postMessage({ type: 'error', error: err.message });
        }
    } else if (type === 'verify') {
        try {
            const mod = await getVDFModule();
            const { iterations, challenge, proof, keySize, isPietrzak } = data;
            const isValid = mod.verify(iterations, new Uint8Array(challenge), new Uint8Array(proof), keySize, isPietrzak);
            self.postMessage({ type: 'result', isValid });
        } catch (err) {
            self.postMessage({ type: 'error', error: err.message });
        }
    }
};
