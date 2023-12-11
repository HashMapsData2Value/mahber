import { bls12_381 } from '@noble/curves/bls12-381';
import * as utils from '@noble/curves/abstract/utils';
import { AffinePoint } from '@noble/curves/abstract/curve';

function ninetysix_bytes_rep(p: AffinePoint<bigint>): string {
    return utils.bytesToHex(utils.concatBytes(utils.numberToBytesBE(p.x, 48), utils.numberToBytesBE(p.y, 48)))
}

const p = bls12_381.G1.ProjectivePoint.BASE.toAffine();
const two_p = bls12_381.G1.ProjectivePoint.BASE.multiply(2n).toAffine();

console.log(ninetysix_bytes_rep(p));
console.log(utils.hexToBytes(ninetysix_bytes_rep(two_p)));
