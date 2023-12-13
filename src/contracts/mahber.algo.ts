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
  scalarMultBase(scalar: bytes): bytes {
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
  scalarMult(scalar: bytes, point: bytes): bytes {
    // @ts-ignore
    const result = ec_scalar_mul("BN254g1", point, scalar);
    return result;
  }

  /** validPoint
   * Checks if the point is valid (on curve)
   * @point - The point to check
   * @returns true if the point is valid, false otherwise
   */
  validPoint(point: bytes): boolean {
    // @ts-ignore
    return ec_subgroup_check("BN254g1", point);
  }

  /** Point add
   *  Adds two points on the curve
   * @param pointA - The first point
   * @param pointB - The second point
   * @returns The result of the operation
   */
  pointAdd(pointA: bytes, pointB: bytes): bytes {
    // @ts-ignore
    const result = ec_add("BN254g1", pointA, pointB);
    return result;
  }

  /** hashPointToPoint
   *  Hashes a point to a point on the curve
   * NOTE: ec_map_to maps fp_element to curve point. We use hash and then mod to map bytes to fp_element first.
   * What is inside ec_map_to (accessed Dec 13th 2023):
   *    https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/pairing.go#L862
   *    https://pkg.go.dev/github.com/consensys/gnark-crypto/ecc/bn254#MapToG1
   *    https://github.com/Consensys/gnark-crypto/blob/master/ecc/bn254/fp/element.go#L42
   * @param point - The point to hash
   * @returns The result of the operation
   */
  hashToPoint(point: bytes): bytes {
    const hash = sha256(point);
    const fpElement = btoi(hash) % btoi(hex("30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47")); // 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // @ts-ignore
    const result = ec_map_to("BN254g1", fpElement);
    return result;
  }
}
