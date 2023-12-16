import { Contract } from "@algorandfoundation/tealscript";

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  /** Dummy Op Up
   * Dummy operation to get more opcode budget
   * @i - The number to return, necssary to deduplicate the name
   * @returns the number (but we do nothing with it)
   */
  dummyOpUp(i: number): number {
    return i;
  }

  /** Scalar Mult Base
   * Scalar multiplication of the base point
   * @scalar - The scalar to multiply the basepoint by.
   * @returns a point on the curve
   */
  private scalarMultBase(scalar: bytes): bytes {
    // @ts-ignore
    const result = ec_scalar_mul(
      "BN254g1",
      hex(
        "00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002"
      ),
      scalar
    );
    return result;
  }

  /** Scalar Mult
   * Scalar multiplication with a supplied point
   * @scalar - The scalar to multiply the point with
   * @point - The point that is multiplied with the scalar
   * @returns a point on the curve
   */
  private scalarMult(scalar: bytes, point: bytes): bytes {
    // @ts-ignore
    const result = ec_scalar_mul("BN254g1", point, scalar);
    return result;
  }

  /** validPoint
   * Checks if the point is valid (on curve)
   * @point - The point to check
   * @returns true if the point is valid, false otherwise
   */
  private validPoint(point: bytes): boolean {
    // @ts-ignore
    return ec_subgroup_check("BN254g1", point);
  }

  /** Point add
   *  Adds two points on the curve
   * @param pointA - The first point
   * @param pointB - The second point
   * @returns The result of the operation
   */
  private pointAdd(pointA: bytes, pointB: bytes): bytes {
    // @ts-ignore
    const result = ec_add("BN254g1", pointA, pointB);
    return result;
  }

  /** hashPointToPoint
   *  Hashes a point to a point on the curve
   * NOTE: ec_map_to maps fp_element to curve point. We use hash and then mod to
   * map the point's X and Y bytes to fp_element first.
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
    // @ts-ignore
    const result = ec_map_to("BN254g1", fpElement);
    return result;
  }

  /** challenge
   * Produce the challenge, i.e. an individual link in the ring sig verification.
   * We mod by order of fr https://github.com/Consensys/gnark-crypto/blob/master/ecc/bn254/fr/element.go#L42
   * c_{i+1} = Hs(m || r_{i} * G + c_{i} * K_{i} || r_{i}*Hp(K_{i}) + c_{i} * I) mod |fr|
   * @param msg - The message to be signed
   * @param nonce - The nonce, part of the ring signature itself, aka one of the fake secret keys
   * @param cPrev - The previous challenge, or the base challenge if this is the first link (in which case it is part of the ring sig)
   * @param pk - The specific public key in the ring (indexed from the array of public keys)
   * @param keyImage - The key image of the signer, required for linkabiltiy to prevent double spending
   * @returns
   */
  challenge(msg: bytes, nonce: bytes, cPrev: bytes, pk: bytes, keyImage: bytes): bytes {
    /* CALCULATE LEFT-HAND SIDE OF EQUATION (AFTER MSG BYTES)
     ** r_{i} * G + c_{i} * K_{i}
     ** G = 0x00...0100.git..02 (basepoint)
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
    // @ts-ignore
    return h as bytes;
  }
}
