// Ideally would have used BN254 for opcode cost reasons but its implementation in
// noble lacks the hashToCurve function as of 2023-11-14
// import { bn254 } from '@noble/curves/bn254';

import { bls12_381 } from '@noble/curves/bls12-381';
import { keccak_256 } from '@noble/hashes/sha3';
import * as utils from '@noble/curves/abstract/utils';
import type { ProjPointType } from '@noble/curves/abstract/weierstrass';

/// HELPER FUNCTIONS

function hash_to_ge(input: Uint8Array): ProjPointType<bigint> {
    return bls12_381.G1.ProjectivePoint.fromAffine(bls12_381.G1.hashToCurve(input).toAffine())
}

function hash_to_fe(){}

function generate_fe(): Uint8Array{
    return bls12_381.utils.randomPrivateKey()
}

function generate_ge(s: Uint8Array): Uint8Array {
    return bls12_381.getPublicKey(s);
}

function ec_add(
    p1: ProjPointType<bigint>,
    p2: ProjPointType<bigint>): ProjPointType<bigint> {
        return p1.add(p2);
    }

function ec_scalar_mul(
    p: ProjPointType<bigint> | Uint8Array | 1,
    scalar: Uint8Array): ProjPointType<bigint> {

        // Multiplies group element by field element
        // 1 is used as a placeholder for the identity element of the group
        
        if (p === 1) {
            return bls12_381.G1.ProjectivePoint.fromPrivateKey(scalar)
        }

        if (p instanceof Uint8Array) {
            return bls12_381.G1.ProjectivePoint.fromHex(utils.bytesToHex(p)).multiply(utils.bytesToNumberBE(scalar))
        }
        
        return p.multiply(utils.bytesToNumberBE(scalar));
    }

function create_ring_link(
    msg: Uint8Array,
    r: Uint8Array,
    c: Uint8Array | 0,
    pk: Uint8Array,
    key_image: ProjPointType<bigint> | 0): Uint8Array{

    if ((c === 0) || (key_image === 0)) {
        return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(keccak_256
            .create()
            .update(msg)
            .update(ec_scalar_mul(1, r).toRawBytes())
            .update(ec_scalar_mul(hash_to_ge(pk),r).toRawBytes())
            .digest()),32);
    }

    return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(keccak_256
    .create()
    .update(msg)
    .update(ec_add(ec_scalar_mul(1, r), ec_scalar_mul(pk,c)).toRawBytes())
    .update(ec_add(ec_scalar_mul(hash_to_ge(pk),r), ec_scalar_mul(key_image, c)).toRawBytes())
    .digest()), 32);
}

// First we generate a key pair for the signer and public keys for each other participant.
// Then we generate the 
// In reality we obviously don't have access to the other participants private keys

const k_pi: Uint8Array = generate_fe();
const K_pi: Uint8Array = generate_ge(k_pi);
const number_of_other_participants = 5;

let others_public_keys: Uint8Array[] = [];
for (let i = 0; i < number_of_other_participants; i++) {
    others_public_keys.push(generate_ge((generate_fe())));
}

////////////////////////
// GENERATE SIGNATURE //
////////////////////////

// The Key Image, unique to the keypair, is used to prevent double spending
const key_image =  ec_scalar_mul(hash_to_ge(K_pi), k_pi);

const msg_string = 'Send 1000 from mixer with key image ' + key_image.toRawBytes();
console.log(msg_string);
const msg = new TextEncoder().encode(msg_string); // this is the message we want to sign
const a = generate_fe(); // Generate random number, nonce

let nonces: Uint8Array[] = []
for (let i = 0; i < number_of_other_participants; i++) {
    nonces.push(generate_fe());
}

let values: Uint8Array[] = [create_ring_link(msg, a, 0, K_pi, 0)]
for(let i = 0; i < number_of_other_participants; i++) {
    values.push(create_ring_link(msg, nonces[i], values[i], others_public_keys[i], key_image))
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
values_prime.push(create_ring_link(msg, signature[1], signature[0], K_pi, key_image))
for(let i = 0; i < number_of_other_participants; i++) {
    values_prime.push(create_ring_link(msg, signature[i + 2], values_prime[i], others_public_keys[i], key_image));
}

// RING SIGNATURE IS VALID THIS WILL RETURN TRUE:
console.log(utils.bytesToHex(signature[0]) === utils.bytesToHex(values_prime[values_prime.length - 1]));
// I.E, c_pi === c'_final
// Basically the verifier has "looped around" and successfully reconstructed the ring 

console.log("c_pi", values[values.length - 1], "c'_final", values_prime[values_prime.length - 1]);
for(let i = 0; i < number_of_other_participants; i++) {
    console.log("c_"+i.toString(), values[i], "c'_"+i.toString(), values_prime[i]);
}