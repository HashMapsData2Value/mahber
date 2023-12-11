import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  /** Point add
   *
   * @returns The result of the operation
   */
  pointAdd(): bytes {
    // @ts-ignore
    const result = ec_add(
      'BLS12_381g1',
      hex(
        '17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1'
      ),
      hex(
        '17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1'
      )
    );
    return result;
  }

  /** Scalar Mult
   *
   * @returns The result of the operation
   */
  scalarMult(): bytes {
    // @ts-ignore
    const result = ec_scalar_mul('BN254g1', hex(''), hex(''));
    return result;
  }

  /** Scalar Mult Base
   * Scalar multiplication of the base point
   * @returns The result of the operation
   */
  scalarMultBase(): bytes {
    // @ts-ignore
    const result = ec_scalar_mul(
      'BN254g1',
      hex(
        '00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002'
      ),
      hex('01')
    );
    return result;
  }

  /** Point Check
   *
   * @returns The result of the operation
   */
  pointSubgroup(): boolean {
    // @ts-ignore
    const check1 = ec_subgroup_check(
      'BN254g1',
      hex(
        '00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002'
      )
    );
    /**

    const check2 = ec_subgroup_check(
      'BN254g1',
      hex(
        '09d3a257b99f1ad804a9e2354ea71c72da7fa518f4ca7904c6951d924b4045b4174be12ae3fd899d55d3e487fa103f951a24ca0f670ecae802209b2518ccca6c'
      )
    );
         * 
     */

    return check1; // && check2;
  }

  // /** Scalar Mult Base
  //  *
  //  * @returns The result of the operation
  //  */
  // hashToPoint(): bytes {
  //   // @ts-ignore
  //   const s = 'Hello World';
  //   const h = sha256(s);
  //   const result = ec_map_to('BN254g1', hex(h));
  //   return result;
  // }
}
