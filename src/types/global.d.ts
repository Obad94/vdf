// src/types/global.d.ts - Global type declarations to suppress external library errors

// Suppress GMP library type errors (it's a C library, not TypeScript)
declare module 'gmp' {
    const gmp: any;
    export = gmp;
}

// Declare the VDF WASM module structure
declare module '*/vdf.js' {
    const vdfFactory: (options?: any) => Promise<any>;
    export = vdfFactory;
}

// Browser API fallbacks for older environments
declare global {
    interface TextEncoder {
        encode(input?: string): Uint8Array;
    }
    
    interface TextDecoder {
        decode(input?: ArrayBuffer | ArrayBufferView): string;
    }
    
    // Fallback if TextEncoder/TextDecoder not available
    const TextEncoder: {
        prototype: TextEncoder;
        new(): TextEncoder;
    } | undefined;
    
    const TextDecoder: {
        prototype: TextDecoder;
        new(encoding?: string): TextDecoder;
    } | undefined;
}