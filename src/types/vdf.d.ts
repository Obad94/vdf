// src/types/vdf.d.ts - Fixed VDF module type declarations
declare module './vdf' {
    interface EmscriptenModule {
        // Emscripten runtime methods
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
        
        // Memory management functions from bytes_allocation.js
        createPointer(address: number, size: number): Pointer;
        allocatePointer(address?: number): Pointer;
        allocateBytes(size: number, value?: Uint8Array): Pointer;
        freeBytes(): void;
        
        // Emscripten heap views
        HEAPU8: Uint8Array;
        HEAP32: Int32Array;
        HEAPU32: Uint32Array;
    }

    interface Pointer extends Number {
        length: number;
        get(as?: Uint8ArrayConstructor | Uint32ArrayConstructor): Uint8Array | Uint32Array;
        dereference(size?: number): Pointer;
        set(value: Uint8Array | string): void;
        free(): void;
    }

    // The main module factory function
    const vdfModule: (options?: object) => Promise<EmscriptenModule>;
    export = vdfModule;
}

// Global type declarations to avoid import issues
declare namespace VDF {
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
        
        createPointer(address: number, size: number): Pointer;
        allocatePointer(address?: number): Pointer;
        allocateBytes(size: number, value?: Uint8Array): Pointer;
        freeBytes(): void;
        
        HEAPU8: Uint8Array;
        HEAP32: Int32Array;
        HEAPU32: Uint32Array;
    }

    interface Pointer extends Number {
        length: number;
        get(as?: Uint8ArrayConstructor | Uint32ArrayConstructor): Uint8Array | Uint32Array;
        dereference(size?: number): Pointer;
        set(value: Uint8Array | string): void;
        free(): void;
    }
}