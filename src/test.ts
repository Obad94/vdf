// src/test.ts - Simple test to verify everything works (UMD compatible)
/// <reference path="./types/global.d.ts" />

import createVdf = require('./index');

async function simpleTest(): Promise<void> {
    console.log('🚀 Loading VDF library...');

    try {
        const vdf = await createVdf();
        console.log('✅ VDF library loaded successfully');

        // Use TextEncoder if available, otherwise create simple encoder
        const encoder = typeof TextEncoder !== 'undefined' ?
            new TextEncoder() :
            { encode: (str: string) => new Uint8Array(str.split('').map(c => c.charCodeAt(0))) };

        const decoder = typeof TextDecoder !== 'undefined' ?
            new TextDecoder() :
            { decode: (bytes: Uint8Array) => String.fromCharCode(...Array.from(bytes)) };

        const challenge = encoder.encode('hello_world');
        const iterations = 1000; // Small number for quick test
        const intSizeBits = 2048;
        const isPietrzak = false;

        console.log('📊 Test parameters:');
        console.log(`  Challenge: "${decoder.decode(challenge)}"`);
        console.log(`  Iterations: ${iterations}`);
        console.log(`  Bits: ${intSizeBits}`);
        console.log(`  Algorithm: ${isPietrzak ? 'Pietrzak' : 'Wesolowski'}`);

        // Generate proof
        console.log('\n⏳ Generating proof...');
        const startTime = Date.now();
        const proof = vdf.generate(iterations, challenge, intSizeBits, isPietrzak);
        const generateTime = Date.now() - startTime;
        console.log(`✅ Proof generated in ${generateTime}ms`);
        console.log(`📦 Proof size: ${proof.length} bytes`);

        // Verify with fast method
        console.log('\n⚡ Verifying with FAST method...');
        const verifyStart = Date.now();
        const isValid = vdf.verify(iterations, challenge, proof, intSizeBits, isPietrzak);
        const verifyTime = Date.now() - verifyStart;

        console.log(`✅ Fast verification: ${isValid ? 'VALID' : 'INVALID'} (${verifyTime}ms)`);

        // Verify with slow method for comparison
        console.log('\n🐌 Verifying with SLOW method...');
        const slowVerifyStart = Date.now();
        const isValidSlow = vdf.verifySlow(iterations, challenge, proof, intSizeBits, isPietrzak);
        const slowVerifyTime = Date.now() - slowVerifyStart;

        console.log(`✅ Slow verification: ${isValidSlow ? 'VALID' : 'INVALID'} (${slowVerifyTime}ms)`);

        // Results
        if (isValid && isValidSlow && isValid === isValidSlow) {
            const speedup = slowVerifyTime > 0 ? (slowVerifyTime / verifyTime).toFixed(1) : 'N/A';
            console.log(`\n🎉 SUCCESS! Fast verification is ${speedup}x faster`);
            console.log(`📈 Performance: Generate=${generateTime}ms, FastVerify=${verifyTime}ms, SlowVerify=${slowVerifyTime}ms`);
        } else {
            console.error('\n❌ FAILURE! Verification results do not match');
            console.error(`Fast: ${isValid}, Slow: ${isValidSlow}`);
        }

    } catch (error) {
        console.error('💥 Error during test:', error);
        throw error;
    }
}

// Export for UMD compatibility
export { simpleTest };

// Run the test if this is the main module
declare const require: any;
if (typeof require !== 'undefined' && require.main === module) {
    simpleTest()
        .then(() => {
            console.log('\n✅ Test completed successfully');
            if (typeof process !== 'undefined') process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Test failed:', error);
            if (typeof process !== 'undefined') process.exit(1);
        });
}