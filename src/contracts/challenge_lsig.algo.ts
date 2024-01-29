import { LogicSig } from "@algorandfoundation/tealscript";

const MAX_BOX_BYTES = 32768; // 32 KB
const CURVE_POINT_SIZE = 64; // 64 bytes for BN254 curve points (point.X || point.Y)
const MAX_PK_BOX_SIZE = MAX_BOX_BYTES - 1024; // 32 KB - 1KB (If we want write budget to be able to create new PK box AND add PK to hashfilter we can't have the PK BOX be 32KB as it would exceed write budget...
const MAX_PK_BOX_PK_NUMBER = MAX_PK_BOX_SIZE / CURVE_POINT_SIZE;

const CHALLENGE_SIZE = 32; // 32 bytes since we use SHA256 when calculating challenge

export class MahberChallengeLsig extends LogicSig {
  /** hashPointToPoint
   * Hashes a point to a point on the curve
   * NOTE: ec_map_to maps fp_element to curve point. We use hash and then mod to map the point's X and Y bytes to fp_element first.
   * What is inside ec_map_to (accessed Dec 13th 2023):
   *    https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/pairing.go#L862
   *    https://pkg.go.dev/github.com/consensys/gnark-crypto/ecc/bn254#MapToG1
   *    https://github.com/Consensys/gnark-crypto/blob/master/ecc/bn254/fp/element.go#L42
   * @param point - The point to hash
   * @returns The result of the operation
   */
  private hashPointToPoint(point: bytes): bytes {
    const hash = sha256(point);
    const fpElement =
      btobigint(hash) % btobigint(hex("30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47")); // 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    const result = ecMapTo("BN254g1", rawBytes(fpElement));
    return result;
  }

  /** Scalar Mult
   * Scalar multiplication with a supplied point
   * @scalar - The scalar to multiply the point with
   * @point - The point that is multiplied with the scalar
   * @returns a point on the curve
   */
  private scalarMult(scalar: bytes, point: bytes): bytes {
    const result = ecScalarMul("BN254g1", point, scalar);
    return result;
  }

  /** Scalar Mult Base
   * Scalar multiplication of the base point
   * @scalar - The scalar to multiply the base point by.
   * @returns a point on the curve
   */
  private scalarMultBase(scalar: bytes): bytes {
    const result = ecScalarMul(
      "BN254g1",
      hex(
        "00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002"
      ),
      scalar
    );
    return result;
  }

  /** Point add
   *  Adds two points on the curve
   * @param pointA - The first point
   * @param pointB - The second point
   * @returns The result of the operation
   */
  private pointAdd(pointA: bytes, pointB: bytes): bytes {
    const result = ecAdd("BN254g1", pointA, pointB);
    return result;
  }

  logic(msg: bytes, nonce: bytes, cPrev: bytes, pk: bytes, keyImage: bytes): void {
    /* CALCULATE LEFT-HAND SIDE OF EQUATION (AFTER MSG BYTES)
     ** r_{i} * G + c_{i} * K_{i}
     ** G = 0x00...0100...02 (basepoint)
     */
    const left = this.pointAdd(this.scalarMultBase(nonce), this.scalarMult(cPrev, pk));

    /* CALCULATE RIGHT-HAND SIDE OF EQUATION (AFTER MSG BYTES)
     ** r_{i}*Hp(K_{i}) + c_{i} * I
     ** where Hp is a hash function that maps a point to a point on the curve
     */
    const right = this.pointAdd(this.scalarMult(nonce, this.hashPointToPoint(pk)), this.scalarMult(cPrev, keyImage));

    /* COMBINE MSG BYTES WITH LEFT AND RIGHT BYTES
     ** Take SHA256 of the concatenated bytes and then mod |fr|
     ** Then return the results.
     */
    const h =
      btobigint(sha256(concat(concat(msg, left), right))) %
      btobigint(hex("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001")); // 21888242871839275222246405745257275088548364400416034343698204186575808495617

    verifyAppCallTxn(this.txnGroup[this.txn.groupIndex + 1], {
      applicationArgs: {
        1: rawBytes(msg),
        2: rawBytes(nonce),
        3: rawBytes(cPrev),
        4: rawBytes(pk),
        5: rawBytes(keyImage),
        6: rawBytes(h),
      },
    });
  }
}
