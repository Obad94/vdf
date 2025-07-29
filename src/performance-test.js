const createVdf = require('./index.js');

async function performanceTest() {
    console.log('🚀 VDF Performance Test Starting...');
    
    try {
        const vdf = await createVdf();
        console.log('✅ VDF library loaded');

        const challenge = Buffer.from('performance_test_challenge_12345');
        const iterations = 100; // Reduced for faster testing
        const intSizeBits = 2048;
        const isPietrzak = false;

        console.log(`📊 Test: ${iterations} iterations, ${intSizeBits} bits, ${isPietrzak ? 'Pietrzak' : 'Wesolowski'}`);

        // Generate proof
        console.log('⏳ Generating proof...');
        const startGenerate = Date.now();
        const proof = vdf.generate(iterations, challenge, intSizeBits, isPietrzak);
        const generateTime = Date.now() - startGenerate;
        console.log(`✅ Generated in ${generateTime}ms (${proof.length} bytes)`);

        // Fast verification
        console.log('⚡ Testing FAST verification...');
        const startFast = Date.now();
        const fastValid = vdf.verify(iterations, challenge, proof, intSizeBits, isPietrzak);
        const fastTime = Date.now() - startFast;
        console.log(`⚡ Fast verify: ${fastValid ? 'VALID' : 'INVALID'} (${fastTime}ms)`);

        // Slow verification (if available)
        if (typeof vdf.verifySlow === 'function') {
            console.log('🐌 Testing SLOW verification...');
            const startSlow = Date.now();
            const slowValid = vdf.verifySlow(iterations, challenge, proof, intSizeBits, isPietrzak);
            const slowTime = Date.now() - startSlow;
            console.log(`🐌 Slow verify: ${slowValid ? 'VALID' : 'INVALID'} (${slowTime}ms)`);
            
            const speedup = slowTime > 0 ? (slowTime / fastTime).toFixed(1) : 'N/A';
            console.log(`🎯 Speedup: ${speedup}x faster`);
        }

        const efficiency = ((fastTime / generateTime) * 100).toFixed(1);
        console.log(`📈 Verification efficiency: ${efficiency}% of generation time`);
        console.log('🎉 Performance test completed successfully!');

    } catch (error) {
        console.error('💥 Performance test failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    performanceTest();
}

module.exports = { performanceTest };
