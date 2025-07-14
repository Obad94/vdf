import * as test from 'tape';
import vdf from '../src/index';

const iterations = 3;
const challenge = new Uint8Array(Buffer.from('aa', 'hex'));
const intSizeBits = 2048;
const isPietrzak = false;
const correctProof = new Uint8Array(Buffer.from(
    // tslint:disable-next-line:max-line-length
    '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
    'hex',
));

test('Basic test', async (t) => {
    t.plan(4);

    const vdfInstance = await vdf();
    const proof = vdfInstance.generate(iterations, challenge, intSizeBits, isPietrzak);
    t.equal(
        Buffer.from(proof).toString('hex'),
        Buffer.from(correctProof).toString('hex'),
        'Proof generated correctly',
    );
    t.true(
        vdfInstance.verify(iterations, challenge, proof, intSizeBits, isPietrzak),
        'Proof is valid',
    );
    t.false(
        vdfInstance.verify(iterations, new Uint8Array([123]), proof, intSizeBits, isPietrzak),
        'Proof is not valid #1',
    );
    t.false(
        vdfInstance.verify(iterations, challenge, new Uint8Array([123]), intSizeBits, isPietrzak),
        'Proof is not valid #2',
    );
});
