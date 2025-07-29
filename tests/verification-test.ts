// tests/verification-test.ts - Test for optimized verification
import * as tape from 'tape';
import createVdf from '../src/index';

tape('VDF Fast Verification Test', async (t) => {
    t.plan(8); // Number of assertions we expect

    try {
        // Load VDF library
        const vdf = await createVdf();
        t.pass('VDF library loaded successfully');

        // Test parameters
        const challenge = new Uint8Array([1, 2, 3, 4, 5]);
        const iterations = 1000; // Small for testing
        const intSizeBits = 2048;
        const isPietrzak = false; // Test Wesolowski first

        // Generate proof
        console.log('Generating VDF proof...');
        const startGenerate = Date.now();
        const proof = vdf.generate(iterations, challenge, intSizeBits, isPietrzak);
        const generateTime = Date.now() - startGenerate;
        
        t.ok(proof instanceof Uint8Array, 'Proof is Uint8Array');
        t.ok(proof.length > 0, 'Proof has content');
        console.log(`Proof generated in ${generateTime}ms (${proof.length} bytes)`);

        // Test fast verification
        console.log('Testing fast verification...');
        const startFast = Date.now();
        const fastResult = vdf.verify(iterations, challenge, proof, intSizeBits, isPietrzak);
        const fastTime = Date.now() - startFast;
        
        t.equal(fastResult, true, 'Fast verification accepts valid proof');
        t.ok(fastTime < generateTime, 'Fast verification is faster than generation');
        console.log(`Fast verification: ${fastTime}ms`);

        // Test with invalid proof (should fail)
        const invalidProof = new Uint8Array(proof.length);
        const invalidResult = vdf.verify(iterations, challenge, invalidProof, intSizeBits, isPietrzak);
        t.equal(invalidResult, false, 'Fast verification rejects invalid proof');

        // Test slow verification if available
        if (typeof vdf.verifySlow === 'function') {
            console.log('Testing slow verification...');
            const startSlow = Date.now();
            const slowResult = vdf.verifySlow(iterations, challenge, proof, intSizeBits, isPietrzak);
            const slowTime = Date.now() - startSlow;
            
            t.equal(slowResult, true, 'Slow verification accepts valid proof');
            t.equal(fastResult, slowResult, 'Fast and slow verification agree');
            
            const speedup = slowTime > 0 ? slowTime / fastTime : 1;
            console.log(`Slow verification: ${slowTime}ms (${speedup.toFixed(1)}x slower than fast)`);
            
            if (speedup > 1.5) {
                console.log('✅ Fast verification shows significant speedup!');
            }
        } else {
            t.pass('Slow verification not available (expected)');
            t.pass('Skipping slow/fast comparison');
        }

        console.log('📊 Performance Summary:');
        console.log(`  Generation: ${generateTime}ms`);
        console.log(`  Fast Verify: ${fastTime}ms (${((fastTime/generateTime)*100).toFixed(1)}% of generation)`);
        
    } catch (error) {
        t.fail(`Test failed with error: ${error.message}`);
        console.error('Test error:', error);
    }
});

tape('VDF Error Handling Test', async (t) => {
    t.plan(4);

    try {
        const vdf = await createVdf();

        // Test invalid parameters
        const challenge = new Uint8Array([1, 2, 3]);
        const iterations = 100;
        const intSizeBits = 2048;

        // Test with Pietrzak invalid iterations (must be even and >= 66)
        try {
            vdf.generate(65, challenge, intSizeBits, true); // Odd number
            t.fail('Should throw error for odd Pietrzak iterations');
        } catch (error) {
            t.pass('Correctly rejects odd Pietrzak iterations');
        }

        try {
            vdf.generate(64, challenge, intSizeBits, true); // Less than 66
            t.fail('Should throw error for insufficient Pietrzak iterations');
        } catch (error) {
            t.pass('Correctly rejects insufficient Pietrzap iterations');
        }

        // Test with invalid challenge
        try {
            vdf.generate(iterations, new Uint8Array(0), intSizeBits, false);
            t.fail('Should throw error for empty challenge');
        } catch (error) {
            t.pass('Correctly rejects empty challenge');
        }

        // Test with invalid bit size
        try {
            vdf.generate(iterations, challenge, 1000, false); // Not in [1024, 2048, 3072, 4096]
            t.fail('Should throw error for invalid bit size');
        } catch (error) {
            t.pass('Correctly rejects invalid bit size');
        }

    } catch (error) {
        t.fail(`Error handling test failed: ${error.message}`);
    }
});

// Export for CommonJS compatibility
export {};