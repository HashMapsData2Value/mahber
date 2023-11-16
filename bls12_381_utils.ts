import { bls12_381 } from '@noble/curves/bls12-381';
import { keccak_256 } from '@noble/hashes/sha3';
import * as utils from '@noble/curves/abstract/utils';

export function hash_to_ge(input: Uint8Array): Uint8Array {
    return bls12_381.G1.ProjectivePoint.fromAffine(bls12_381.G1.hashToCurve(input).toAffine()).toRawBytes()
}

export function hash_to_fe(...args: Uint8Array[]){
    const hasher = keccak_256.create();
    for (let arg of args) {
        hasher.update(arg);
    }
    return utils.numberToBytesBE(bls12_381.G1.normPrivateKeyToScalar(hasher.digest()),32);
}

export function generate_fe(): Uint8Array{
    return bls12_381.utils.randomPrivateKey()
}

export function generate_ge(fe: Uint8Array): Uint8Array {
    return bls12_381.getPublicKey(fe);
}

export function ec_add(
    p1: Uint8Array,
    p2: Uint8Array): Uint8Array {
        return bls12_381.G1.ProjectivePoint.fromHex(utils.bytesToHex(p1)).add(bls12_381.G1.ProjectivePoint.fromHex(utils.bytesToHex(p2))).toRawBytes();
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
    p: Uint8Array | 1,
    scalar: Uint8Array): Uint8Array {

        // Multiplies group element by field element
        // 1 is used as a placeholder for the identity element of the group
        if (p === 1) {
            return bls12_381.G1.ProjectivePoint.fromPrivateKey(scalar).toRawBytes()
        }
        return bls12_381.G1.ProjectivePoint.fromHex(utils.bytesToHex(p)).multiply(utils.bytesToNumberBE(scalar)).toRawBytes()
    }

export function create_ring_link(
    msg: Uint8Array,
    r: Uint8Array,
    c: Uint8Array | 0,
    pk: Uint8Array,
    key_image: Uint8Array | 0): Uint8Array{

    if ((c === 0) || (key_image === 0)) {
        return hash_to_fe(msg, ec_scalar_mul(1, r), ec_scalar_mul(hash_to_ge(pk),r))
    }
    return hash_to_fe(msg, ec_add(ec_scalar_mul(1, r), ec_scalar_mul(pk,c)),ec_add(ec_scalar_mul(hash_to_ge(pk),r), ec_scalar_mul(key_image, c)));
}