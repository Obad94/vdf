// tests/verification-test.js - JavaScript version for immediate testing
const createVdf = require('../dist/index.js');

async function testVdfVerification() {
    console.log('🧪 Starting VDF verification tests...');
    
    try {
        // Load VDF library
        console.log('📚 Loading VDF library...');
        const vdf = await createVdf();
        console.log('✅ VDF library loaded successfully');

        // Test parameters
        const challenge = Buffer.from('test_challenge_for_verification', 'utf8');
        const iterations = 2000; // Reasonable test size
        const intSizeBits = 2048;
        const isPietrzak = false; // Test Wesolowski

        console.log('📊 Test parameters:');
        console.log(`  Challenge: ${challenge.length} bytes`);
        console.log(`  Iterations: ${iterations}`);
        console.log(`  Bits: ${intSizeBits}`);
        console.log(`  Algorithm: ${isPietrzak ? 'Pietrzak' : 'Wesolowski'}`);

        // Generate proof
        console.log('\n⏳ Generating VDF proof...');
        const startGenerate = Date.now();
        const proof = vdf.generate(iterations, challenge, intSizeBits, isPietrzak);
        const generateTime = Date.now() - startGenerate;
        
        console.log(`✅ Proof generated in ${generateTime}ms`);
        console.log(`📦 Proof size: ${proof.length} bytes`);

        // Test fast verification
        console.log('\n⚡ Testing FAST verification...');
        const startFast = Date.now();
        const fastResult = vdf.verify(iterations, challenge, proof, intSizeBits, isPietrzak);
        const fastTime = Date.now() - startFast;
        
        console.log(`⚡ Fast verification result: ${fastResult ? 'VALID ✅' : 'INVALID ❌'}`);
        console.log(`⚡ Fast verification time: ${fastTime}ms`);

        if (!fastResult) {
            throw new Error('Fast verification failed on valid proof!');
        }

        // Test slow verification if available
        let slowTime = 0;
        let slowResult = false;
        
        if (typeof vdf.verifySlow === 'function') {
            console.log('\n🐌 Testing SLOW verification...');
            const startSlow = Date.now();
            slowResult = vdf.verifySlow(iterations, challenge, proof, intSizeBits, isPietrzak);
            slowTime = Date.now() - startSlow;
            
            console.log(`🐌 Slow verification result: ${slowResult ? 'VALID ✅' : 'INVALID ❌'}`);
            console.log(`🐌 Slow verification time: ${slowTime}ms`);

            if (fastResult !== slowResult) {
                throw new Error(`Verification mismatch! Fast: ${fastResult}, Slow: ${slowResult}`);
            }
        } else {
            console.log('\n🐌 Slow verification not available (using optimized version only)');
        }

        // Test with invalid proof
        console.log('\n🚫 Testing with invalid proof...');
        const invalidProof = new Uint8Array(proof.length);
        // Fill with zeros (invalid proof)
        const invalidResult = vdf.verify(iterations, challenge, invalidProof, intSizeBits, isPietrzak);
        
        console.log(`🚫 Invalid proof result: ${invalidResult ? 'VALID ❌' : 'INVALID ✅'}`);
        
        if (invalidResult) {
            throw new Error('Verification accepted invalid proof!');
        }

        // Performance analysis
        console.log('\n📈 PERFORMANCE ANALYSIS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Generation time:      ${generateTime}ms`);
        console.log(`Fast verification:    ${fastTime}ms`);
        
        if (slowTime > 0) {
            const speedup = (slowTime / fastTime).toFixed(1);
            console.log(`Slow verification:    ${slowTime}ms`);
            console.log(`Speedup factor:       ${speedup}x faster`);
        }
        
        const efficiency = ((fastTime / generateTime) * 100).toFixed(1);
        console.log(`Verification efficiency: ${efficiency}% of generation time`);
        
        // Determine if this is a good VDF implementation
        if (fastTime < generateTime / 10) {
            console.log('🎉 EXCELLENT: Verification is <10% of generation time');
        } else if (fastTime < generateTime / 2) {
            console.log('✅ GOOD: Verification is <50% of generation time');
        } else {
            console.log('⚠️  WARNING: Verification time is high relative to generation');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 All verification tests passed successfully!');
        
        return {
            success: true,
            generateTime,
            fastTime,
            slowTime: slowTime || null,
            speedup: slowTime > 0 ? slowTime / fastTime : null,
            efficiency: efficiency
        };

    } catch (error) {
        console.error('💥 Verification test failed:', error.message);
        console.error('Stack trace:', error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run test if called directly
if (require.main === module) {
    testVdfVerification()
        .then(result => {
            if (result.success) {
                console.log('\n✅ Test completed successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Test failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testVdfVerification };