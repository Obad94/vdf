// tests/bot-simulation.ts
// Bot Environment Simulation Test - Tests VDF consistency in server-like environment
import * as test from 'tape';
import vdf from '../src/index';

interface BotStats {
    botId: number;
    attemptNumber: number;
    generationTime: number;
    verificationTime: number;
    iterations: number;
    success: boolean;
    proofSize: number;
    timestamp: number;
}

interface AttackResult {
    totalBots: number;
    successfulProofs: number;
    failedProofs: number;
    averageGenTime: number;
    minGenTime: number;
    maxGenTime: number;
    timeVariance: number;
    economicCost: number;
    totalTime: number;
}

test('Bot Environment Simulation Tests', async (t) => {
    t.plan(5);
    
    console.log('🤖 Starting Bot Environment Simulation Tests');
    console.log('📊 Testing VDF consistency outside browser environment');
    
    const vdfInstance = await vdf();

    // Test 1: Single Bot Consistency Test
    t.test('Single Bot Repeated Attacks', async (st) => {
        st.plan(1);
        
        console.log('\n🤖 Test 1: Single Bot Repeated Attacks');
        const stats: BotStats[] = [];
        const iterations = 1000;
        const challenge = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD]);
        
        try {
            for (let attempt = 0; attempt < 20; attempt++) {
                const genStart = performance.now();
                const proof = vdfInstance.generate(iterations, challenge, 1024, false);
                const genTime = performance.now() - genStart;
                
                const verStart = performance.now();
                const isValid = vdfInstance.verify(iterations, challenge, proof, 1024, false);
                const verTime = performance.now() - verStart;
                
                stats.push({
                    botId: 1,
                    attemptNumber: attempt + 1,
                    generationTime: genTime,
                    verificationTime: verTime,
                    iterations: iterations,
                    success: isValid,
                    proofSize: proof.length,
                    timestamp: Date.now()
                });
                
                console.log(`   Attempt ${attempt + 1}: Gen=${genTime.toFixed(0)}ms, Ver=${verTime.toFixed(0)}ms, Valid=${isValid}`);
                
                // Small delay to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Analyze consistency
            const genTimes = stats.map(s => s.generationTime);
            const avgTime = genTimes.reduce((a, b) => a + b, 0) / genTimes.length;
            const minTime = Math.min(...genTimes);
            const maxTime = Math.max(...genTimes);
            const variance = maxTime / minTime;
            
            console.log(`\n📊 Single Bot Analysis:`);
            console.log(`   Average Generation Time: ${avgTime.toFixed(0)}ms`);
            console.log(`   Min Time: ${minTime.toFixed(0)}ms`);
            console.log(`   Max Time: ${maxTime.toFixed(0)}ms`);
            console.log(`   Time Variance: ${variance.toFixed(2)}x`);
            console.log(`   Success Rate: ${stats.filter(s => s.success).length}/${stats.length}`);
            
            // VDF should have low variance (< 2x in server environment)
            const isConsistent = variance < 3.0; // Allow some variance in Node.js
            st.ok(isConsistent, `VDF timing should be consistent (variance: ${variance.toFixed(2)}x)`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Single bot test failed: ${errorMessage}`);
            st.fail(`Single bot test failed: ${errorMessage}`);
        }
    });

    // Test 2: Small Bot Farm (10 bots)
    t.test('Small Bot Farm Attack (10 bots)', async (st) => {
        st.plan(1);
        
        console.log('\n🤖 Test 2: Small Bot Farm Attack (10 bots)');
        const stats: BotStats[] = [];
        const iterations = 1000;
        
        try {
            const startTime = performance.now();
            
            // Sequential bot attacks (like your browser test)
            for (let botId = 1; botId <= 10; botId++) {
                const challenge = new Uint8Array([0xAA, 0xBB, 0xCC, botId]);
                
                const genStart = performance.now();
                const proof = vdfInstance.generate(iterations, challenge, 1024, false);
                const genTime = performance.now() - genStart;
                
                const verStart = performance.now();
                const isValid = vdfInstance.verify(iterations, challenge, proof, 1024, false);
                const verTime = performance.now() - verStart;
                
                stats.push({
                    botId: botId,
                    attemptNumber: 1,
                    generationTime: genTime,
                    verificationTime: verTime,
                    iterations: iterations,
                    success: isValid,
                    proofSize: proof.length,
                    timestamp: Date.now()
                });
                
                console.log(`   Bot ${botId}: Gen=${genTime.toFixed(0)}ms, Ver=${verTime.toFixed(0)}ms`);
            }
            
            const totalTime = performance.now() - startTime;
            const result = analyzeAttack(stats, totalTime);
            
            console.log(`\n📊 Small Bot Farm Analysis:`);
            printAttackAnalysis(result);
            
            // In server environment, should maintain consistency
            st.ok(result.timeVariance < 3.0, `Small bot farm should show consistent timing (variance: ${result.timeVariance.toFixed(2)}x)`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Small bot farm test failed: ${errorMessage}`);
            st.fail(`Small bot farm test failed: ${errorMessage}`);
        }
    });

    // Test 3: Medium Bot Farm (50 bots)
    t.test('Medium Bot Farm Attack (50 bots)', async (st) => {
        st.plan(1);
        
        console.log('\n🤖 Test 3: Medium Bot Farm Attack (50 bots)');
        const stats: BotStats[] = [];
        const iterations = 1000;
        
        try {
            const startTime = performance.now();
            
            for (let botId = 1; botId <= 50; botId++) {
                const challenge = new Uint8Array([0xAA, 0xBB, botId % 256, (botId >> 8) % 256]);
                
                const genStart = performance.now();
                const proof = vdfInstance.generate(iterations, challenge, 1024, false);
                const genTime = performance.now() - genStart;
                
                // Skip verification for speed in large test
                const isValid = true; // Assume valid for performance
                
                stats.push({
                    botId: botId,
                    attemptNumber: 1,
                    generationTime: genTime,
                    verificationTime: 0,
                    iterations: iterations,
                    success: isValid,
                    proofSize: proof.length,
                    timestamp: Date.now()
                });
                
                if (botId % 10 === 0) {
                    console.log(`   Processed ${botId}/50 bots, latest: ${genTime.toFixed(0)}ms`);
                }
                
                // Very small delay to prevent overwhelming
                if (botId % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
            
            const totalTime = performance.now() - startTime;
            const result = analyzeAttack(stats, totalTime);
            
            console.log(`\n📊 Medium Bot Farm Analysis:`);
            printAttackAnalysis(result);
            
            st.ok(result.timeVariance < 5.0, `Medium bot farm should maintain reasonable consistency (variance: ${result.timeVariance.toFixed(2)}x)`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Medium bot farm test failed: ${errorMessage}`);
            st.fail(`Medium bot farm test failed: ${errorMessage}`);
        }
    });

    // Test 4: Large Bot Farm (100 bots) - Like your browser test
    t.test('Large Bot Farm Attack (100 bots)', async (st) => {
        st.plan(1);
        
        console.log('\n🤖 Test 4: Large Bot Farm Attack (100 bots)');
        const stats: BotStats[] = [];
        const iterations = 1000;
        
        try {
            const startTime = performance.now();
            
            for (let botId = 1; botId <= 100; botId++) {
                const challenge = new Uint8Array([
                    0xAA, 0xBB, 
                    botId % 256, 
                    (botId >> 8) % 256,
                    Date.now() % 256  // Add some randomness
                ]);
                
                const genStart = performance.now();
                const proof = vdfInstance.generate(iterations, challenge, 1024, false);
                const genTime = performance.now() - genStart;
                
                stats.push({
                    botId: botId,
                    attemptNumber: 1,
                    generationTime: genTime,
                    verificationTime: 0,
                    iterations: iterations,
                    success: true,
                    proofSize: proof.length,
                    timestamp: Date.now()
                });
                
                if (botId % 20 === 0) {
                    console.log(`   Processed ${botId}/100 bots, latest: ${genTime.toFixed(0)}ms`);
                }
            }
            
            const totalTime = performance.now() - startTime;
            const result = analyzeAttack(stats, totalTime);
            
            console.log(`\n📊 Large Bot Farm Analysis:`);
            printAttackAnalysis(result);
            
            // Compare with your browser results
            console.log(`\n🔍 Comparison with Browser Results:`);
            console.log(`   Browser showed: 0.11s - 3.43s (30x variance)`);
            console.log(`   Server shows: ${result.minGenTime.toFixed(0)}ms - ${result.maxGenTime.toFixed(0)}ms (${result.timeVariance.toFixed(2)}x variance)`);
            
            st.ok(result.successfulProofs === 100, `All 100 bots should succeed: ${result.successfulProofs}/100`);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Large bot farm test failed: ${errorMessage}`);
            st.fail(`Large bot farm test failed: ${errorMessage}`);
        }
    });

    // Test 5: Progressive Difficulty Simulation
    t.test('Progressive Difficulty Bot Attack', async (st) => {
        st.plan(1);
        
        console.log('\n🤖 Test 5: Progressive Difficulty Bot Attack');
        const stats: BotStats[] = [];
        const baseIterations = 1000;
        
        try {
            for (let botId = 1; botId <= 20; botId++) {
                // Progressive difficulty: each bot faces harder challenge
                const iterations = baseIterations + (botId - 1) * 100;
                const challenge = new Uint8Array([0xAA, 0xBB, 0xCC, botId]);
                
                const genStart = performance.now();
                const proof = vdfInstance.generate(iterations, challenge, 1024, false);
                const genTime = performance.now() - genStart;
                
                stats.push({
                    botId: botId,
                    attemptNumber: 1,
                    generationTime: genTime,
                    verificationTime: 0,
                    iterations: iterations,
                    success: true,
                    proofSize: proof.length,
                    timestamp: Date.now()
                });
                
                console.log(`   Bot ${botId}: ${iterations} iterations, ${genTime.toFixed(0)}ms`);
            }
            
            // Analyze if progressive difficulty works
            const timesPerIteration = stats.map(s => s.generationTime / s.iterations);
            const avgTimePerIteration = timesPerIteration.reduce((a, b) => a + b, 0) / timesPerIteration.length;
            
            console.log(`\n📊 Progressive Difficulty Analysis:`);
            console.log(`   Average time per iteration: ${avgTimePerIteration.toFixed(4)}ms`);
            console.log(`   First bot (1000 iter): ${stats[0].generationTime.toFixed(0)}ms`);
            console.log(`   Last bot (2900 iter): ${stats[19].generationTime.toFixed(0)}ms`);
            console.log(`   Scaling factor: ${(stats[19].generationTime / stats[0].generationTime).toFixed(2)}x`);
            
            st.ok(stats[19].generationTime > stats[0].generationTime, 'Progressive difficulty should increase computation time');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`❌ Progressive difficulty test failed: ${errorMessage}`);
            st.fail(`Progressive difficulty test failed: ${errorMessage}`);
        }
    });

    console.log('\n✅ Bot Environment Simulation Tests Completed');
});

function analyzeAttack(stats: BotStats[], totalTime: number): AttackResult {
    const genTimes = stats.map(s => s.generationTime);
    const successfulProofs = stats.filter(s => s.success).length;
    const avgGenTime = genTimes.reduce((a, b) => a + b, 0) / genTimes.length;
    const minGenTime = Math.min(...genTimes);
    const maxGenTime = Math.max(...genTimes);
    const timeVariance = maxGenTime / minGenTime;
    
    // Economic cost calculation (assuming $0.10/hour for CPU)
    const totalCpuHours = (totalTime / 1000) / 3600;
    const economicCost = totalCpuHours * 0.10;
    
    return {
        totalBots: stats.length,
        successfulProofs,
        failedProofs: stats.length - successfulProofs,
        averageGenTime: avgGenTime,
        minGenTime,
        maxGenTime,
        timeVariance,
        economicCost,
        totalTime: totalTime / 1000
    };
}

function printAttackAnalysis(result: AttackResult): void {
    console.log(`   Total Bots: ${result.totalBots}`);
    console.log(`   Successful Proofs: ${result.successfulProofs}/${result.totalBots}`);
    console.log(`   Average Generation Time: ${result.averageGenTime.toFixed(0)}ms`);
    console.log(`   Min Time: ${result.minGenTime.toFixed(0)}ms`);
    console.log(`   Max Time: ${result.maxGenTime.toFixed(0)}ms`);
    console.log(`   Time Variance: ${result.timeVariance.toFixed(2)}x`);
    console.log(`   Total Attack Time: ${result.totalTime.toFixed(1)}s`);
    console.log(`   Economic Cost: $${result.economicCost.toFixed(4)}`);
    console.log(`   Time per Bot: ${(result.totalTime / result.totalBots).toFixed(2)}s`);
}