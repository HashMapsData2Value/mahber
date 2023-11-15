// Ideally would have used BN254 for opcode cost reasons but its implementation in
// noble lacks the hashToCurve export function as of 2023-11-14
// import { bn254 } from '@noble/curves/bn254';

import { bls12_381 } from '@noble/curves/bls12-381';
import { keccak_256 } from '@noble/hashes/sha3';
import * as utils from '@noble/curves/abstract/utils';
import type { ProjPointType } from '@noble/curves/abstract/weierstrass';

// TODO: Ensure that everything is using Uint8Array to pass along data between functions
// While this might make things less clear in the main file, it will make it easier to switch out
// from bls12_381 to bn254 in the future, or even ed25519

export function hash_to_ge(input: Uint8Array): ProjPointType<bigint> {
    return bls12_381.G1.ProjectivePoint.fromAffine(bls12_381.G1.hashToCurve(input).toAffine())
}

export function hash_to_fe(){}

export function generate_fe(): Uint8Array{
    return bls12_381.utils.randomPrivateKey()
}

export function generate_ge(s: Uint8Array): Uint8Array {
    return bls12_381.getPublicKey(s);
}

export function ec_add(
    p1: ProjPointType<bigint>,
    p2: ProjPointType<bigint>): ProjPointType<bigint> {
        return p1.add(p2);
    }

export function ec_fe_mul(
    fe1: Uint8Array,
    fe2: Uint8Array): Uint8Array {
        return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(utils.bytesToNumberBE(fe1) * utils.bytesToNumberBE(fe2)), 32);
    }

export function ec_fe_sub(
    fe1: Uint8Array,
    fe2: Uint8Array): Uint8Array {
        return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(utils.bytesToNumberBE(fe1) - utils.bytesToNumberBE(fe2)), 32);
}

export function ec_scalar_mul(
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

export function create_ring_link(
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