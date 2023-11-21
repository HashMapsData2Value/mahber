import { bls12_381 } from '@noble/curves/bls12-381';
import * as utils from '@noble/curves/abstract/utils';
import { AffinePoint } from '@noble/curves/abstract/curve';

function concatXandY(p: AffinePoint<bigint>): Uint8Array {
  return utils.concatBytes(utils.numberToBytesBE(p.x, 48), utils.numberToBytesBE(p.y, 48));
}

export const p = utils.bytesToHex(concatXandY(bls12_381.G1.ProjectivePoint.BASE.toAffine()));
