import * as test from 'tape';
import vdf from '../src/index';

test('Production readiness tests', async (t) => {
    t.plan(8);

    const vdfInstance = await vdf();

    // Test 1: Large iteration count
    t.test('Handle large iteration counts', async (st) => {
        st.plan(1);
        try {
            const proof = vdfInstance.generate(10000, new Uint8Array([0xaa]), 2048, false);
            st.ok(proof.length > 0, 'Should handle large iteration counts');
        } catch (error) {
            st.fail(`Failed with large iterations: ${error.message}`);
        }
    });

    // Test 2: Input validation
    t.test('Input validation', async (st) => {
        st.plan(4);
        
        try {
            vdfInstance.generate(-1, new Uint8Array([0xaa]), 2048, false);
            st.fail('Should reject negative iterations');
        } catch (error) {
            st.pass('Correctly rejects negative iterations');
        }

        try {
            vdfInstance.generate(100, new Uint8Array([]), 2048, false);
            st.fail('Should reject empty challenge');
        } catch (error) {
            st.pass('Correctly rejects empty challenge');
        }

        try {
            vdfInstance.generate(100, new Uint8Array([0xaa]), 1023, false);
            st.fail('Should reject invalid int size bits');
        } catch (error) {
            st.pass('Correctly rejects invalid int size bits');
        }

        try {
            vdfInstance.generate(65, new Uint8Array([0xaa]), 2048, true);
            st.fail('Should reject odd iterations for Pietrzak');
        } catch (error) {
            st.pass('Correctly rejects odd iterations for Pietrzak');
        }
    });

    // Test 3: Memory management
    t.test('Memory management', async (st) => {
        st.plan(1);
        
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Generate many proofs
        for (let i = 0; i < 100; i++) {
            const proof = vdfInstance.generate(10, new Uint8Array([i]), 1024, false);
            vdfInstance.verify(10, new Uint8Array([i]), proof, 1024, false);
        }
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 10MB)
        st.ok(memoryIncrease < 10 * 1024 * 1024, `Memory increase acceptable: ${memoryIncrease / 1024 / 1024}MB`);
    });

    // Test 4: Different key sizes
    t.test('Different key sizes', async (st) => {
        st.plan(4);
        
        const keySizes = [1024, 2048, 3072, 4096];
        const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
        
        for (const keySize of keySizes) {
            try {
                const proof = vdfInstance.generate(100, challenge, keySize, false);
                const isValid = vdfInstance.verify(100, challenge, proof, keySize, false);
                st.ok(isValid, `Key size ${keySize} works correctly`);
            } catch (error) {
                st.fail(`Key size ${keySize} failed: ${error.message}`);
            }
        }
    });

    // Test 5: Concurrent operations
    t.test('Concurrent operations', async (st) => {
        st.plan(1);
        
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(
                new Promise(async (resolve) => {
                    try {
                        const proof = vdfInstance.generate(50 + i, new Uint8Array([i]), 1024, false);
                        const isValid = vdfInstance.verify(50 + i, new Uint8Array([i]), proof, 1024, false);
                        resolve(isValid);
                    } catch (error) {
                        resolve(false);
                    }
                })
            );
        }
        
        const results = await Promise.all(promises);
        const allPassed = results.every(result => result === true);
        st.ok(allPassed, 'All concurrent operations completed successfully');
    });

    // Test 6: Performance benchmarks
    t.test('Performance benchmarks', async (st) => {
        st.plan(2);
        
        const challenge = new Uint8Array([0xaa, 0xbb, 0xcc]);
        
        // Generation performance
        const genStart = Date.now();
        const proof = vdfInstance.generate(1000, challenge, 2048, false);
        const genTime = Date.now() - genStart;
        
        st.ok(genTime < 30000, `Generation time acceptable: ${genTime}ms`); // Less than 30 seconds
        
        // Verification performance
        const verStart = Date.now();
        const isValid = vdfInstance.verify(1000, challenge, proof, 2048, false);
        const verTime = Date.now() - verStart;
        
        st.ok(verTime < 5000 && isValid, `Verification time acceptable: ${verTime}ms`); // Less than 5 seconds
    });

    // Test 7: Algorithm consistency
    t.test('Algorithm consistency', async (st) => {
        st.plan(2);
        
        const challenge = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
        const iterations = 100;
        
        // Test Wesolowski consistency
        const wesolowskiProof1 = vdfInstance.generate(iterations, challenge, 2048, false);
        const wesolowskiProof2 = vdfInstance.generate(iterations, challenge, 2048, false);
        st.equal(
            Buffer.from(wesolowskiProof1).toString('hex'),
            Buffer.from(wesolowskiProof2).toString('hex'),
            'Wesolowski algorithm produces consistent results'
        );
        
        // Test Pietrzak consistency
        const pietrzakProof1 = vdfInstance.generate(iterations, challenge, 2048, true);
        const pietrzakProof2 = vdfInstance.generate(iterations, challenge, 2048, true);
        st.equal(
            Buffer.from(pietrzakProof1).toString('hex'),
            Buffer.from(pietrzakProof2).toString('hex'),
            'Pietrzak algorithm produces consistent results'
        );
    });

    // Test 8: Error recovery
    t.test('Error recovery', async (st) => {
        st.plan(1);
        
        try {
            // This should fail
            vdfInstance.generate(-1, new Uint8Array([0xaa]), 2048, false);
        } catch (error) {
            // After error, library should still work
            const proof = vdfInstance.generate(100, new Uint8Array([0xaa]), 2048, false);
            const isValid = vdfInstance.verify(100, new Uint8Array([0xaa]), proof, 2048, false);
            st.ok(isValid, 'Library recovers from errors correctly');
        }
    });
});
