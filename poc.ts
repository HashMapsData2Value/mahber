// Ideally would have used BN254 for opcode cost reasons but its implementation in
// noble lacks the hashToCurve function as of 2023-11-14
// import { bn254 } from '@noble/curves/bn254';

import { bls12_381 } from '@noble/curves/bls12-381';
import { keccak_256 } from '@noble/hashes/sha3';
import * as utils from '@noble/curves/abstract/utils';
import type { H2CPoint } from '@noble/curves/abstract/hash-to-curve';

/// HELPER FUNCTIONS
function h2c_hashable_string(
    p: H2CPoint<bigint>,
    ): string {
    return p.toAffine().x.toString() + p.toAffine().y.toString();
}
function special_case_a_hash_concat_func(
    msg: Uint8Array,
    a: Uint8Array,
    pk: Uint8Array
    ): Uint8Array{

        return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(keccak_256
        .create()
        .update(msg)
        .update(bls12_381.G1.ProjectivePoint.fromPrivateKey(a).toRawBytes())
        .update(h2c_hashable_string(bls12_381.G1.hashToCurve(pk).multiply(utils.bytesToNumberBE(a))))
        .digest()),32);

}
function main_hash_concat_func(
    msg: Uint8Array,
    r: Uint8Array,
    c: Uint8Array,
    pk: Uint8Array,
    key_image: H2CPoint<BigInt>): Uint8Array{

    const r_times_G = bls12_381.G1.ProjectivePoint.fromPrivateKey(r)
    const c_times_pk = bls12_381.G1.ProjectivePoint.fromHex(utils.bytesToHex(pk)).multiply(utils.bytesToNumberBE(c))
    const r_times_G_plus_c_times_pk = r_times_G.add(c_times_pk)
    
    const r_times_hashtocurve_pk = bls12_381.G1.hashToCurve(pk).multiply(utils.bytesToNumberBE(r))
    const c_times_key_image = key_image.multiply(utils.bytesToNumberBE(c))
    const r_times_hashtocurve_pk_plus_c_times_key_image = r_times_hashtocurve_pk.add(c_times_key_image as H2CPoint<bigint>)

    return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(keccak_256
    .create()
    .update(msg)
    .update(r_times_G_plus_c_times_pk.toRawBytes())
    .update(h2c_hashable_string(r_times_hashtocurve_pk_plus_c_times_key_image))
    .digest()), 32);
}

// First we generate a key pair for the signer and public keys for each other participant.
// Then we generate the 
// In reality we obviously don't have access to the other participants private keys

const k_pi: Uint8Array = bls12_381.utils.randomPrivateKey();
const K_pi: Uint8Array = bls12_381.getPublicKey(k_pi);
const number_of_other_participants = 15;

let others_public_keys: Uint8Array[] = [];
for (let i = 0; i < number_of_other_participants; i++) {
    others_public_keys.push(bls12_381.getPublicKey(bls12_381.utils.randomPrivateKey()));
}

////////////////////////
// GENERATE SIGNATURE //
////////////////////////

// The Key Image, unique to the keypair, is used to prevent double spending
const key_image =  bls12_381.G1.hashToCurve(K_pi).multiply(utils.bytesToNumberBE(k_pi));

const msg_string = 'Send 1000 from mixer with key image ' + h2c_hashable_string(key_image);
console.log(msg_string);
const msg = new TextEncoder().encode(msg_string); // this is the message we want to sign
const a = bls12_381.utils.randomPrivateKey(); // Generate random number, nonce

let nonces = []
for (let i = 0; i < number_of_other_participants; i++) {
    nonces.push(bls12_381.utils.randomPrivateKey());
}

let values: Uint8Array[] = [special_case_a_hash_concat_func(msg, a, K_pi)]
for(let i = 0; i < number_of_other_participants; i++) {
    values.push(main_hash_concat_func(msg, nonces[i], values[i], others_public_keys[i], key_image))
}

// This is the core of the security of the ring signature
// The verifier will have access to r_pi, NOT a and DEFINITELY NOT k_pi.
const r_pi  = utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(utils.bytesToNumberBE(a) - utils.bytesToNumberBE(values[values.length - 1]) * utils.bytesToNumberBE(k_pi)), 32)

// Construct the ring signature
// First add the last value, i.e. c_"pi"
// Then add r_pi
// Then add the rest of the nonces (but not a)
let signature: Uint8Array[] = []
signature.push(values[values.length - 1])
signature.push(r_pi)
for(let i = 0; i < number_of_other_participants; i++) {
    signature.push(nonces[i])
}

// SIGNATURE CREATED

//////////////////////////////////////////////////////////
// PUBLIC KNOWLEDGE: K_pi and others_public_keys  ////////
// COMMUNICATED FROM SIG TO VER: msg, signature   ////////
// (c_pi, r_pi, rest of the nonces) and key_image ////////
//////////////////////////////////////////////////////////

//////////////////////
// VERIFY SIGNATURE //
//////////////////////

let values_prime: Uint8Array[] = []
values_prime.push(main_hash_concat_func(msg, signature[1], signature[0], K_pi, key_image))
for(let i = 0; i < number_of_other_participants; i++) {
    values_prime.push(main_hash_concat_func(msg, signature[i + 2], values_prime[i], others_public_keys[i], key_image));
}

// RING SIGNATURE IS VALID THIS WILL RETURN TRUE:
console.log(utils.bytesToHex(signature[0]) === utils.bytesToHex(values_prime[values_prime.length - 1]));
// I.E, c_pi === c'_final
// Basically the verifier has "looped around" and successfully reconstructed the ring 

console.log("c_pi", values[values.length - 1], "c'_final", values_prime[values_prime.length - 1]);
for(let i = 0; i < number_of_other_participants; i++) {
    console.log("c_"+i.toString(), values[i], "c'_"+i.toString(), values_prime[i]);
}