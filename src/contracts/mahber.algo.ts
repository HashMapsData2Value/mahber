import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  /**
   *
   * @returns The result of the operation
   */
  add(): bytes {
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
}
