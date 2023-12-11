import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { MahberClient } from '../contracts/clients/MahberClient';

const fixture = algorandFixture();

let appClient: MahberClient;

describe('Mahber', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount } = fixture.context;

    appClient = new MahberClient(
      {
        sender: testAccount,
        resolveBy: 'id',
        id: 0,
      },
      algod
    );

    await appClient.create.createApplication({});
  });

  test.skip('bls12_381g1_add', async () => {
    const sum = await appClient.pointAdd({});
    expect(sum.return?.valueOf()).toStrictEqual([
      5, 114, 203, 234, 144, 77, 103, 70, 136, 8, 200, 235, 80, 169, 69, 12, 151, 33, 219, 48, 145, 40, 1, 37, 67, 144,
      45, 10, 195, 88, 166, 42, 226, 143, 117, 187, 143, 28, 124, 66, 195, 154, 140, 85, 41, 191, 15, 78, 22, 106, 157,
      140, 171, 198, 115, 163, 34, 253, 166, 115, 119, 157, 142, 56, 34, 186, 62, 203, 134, 112, 228, 97, 247, 59, 185,
      2, 29, 95, 215, 106, 76, 86, 217, 212, 205, 22, 189, 27, 186, 134, 136, 25, 121, 116, 157, 40,
    ]);
  });

  test('scalarMultBase', async () => {
    const sum = await appClient.scalarMultBase({});
    console.log(sum);
    expect(sum.return?.valueOf()).toStrictEqual([
      5, 137, 244, 216, 137, 136, 193, 189, 222, 252, 117, 169, 93, 186, 178, 170, 206, 245, 86, 120, 124, 230, 226,
      125, 140, 167, 170, 25, 12, 157, 77, 114, 33, 155, 124, 133, 168, 95, 19, 126, 75, 243, 146, 32, 158, 2, 105, 155,
      22, 210, 212, 191, 87, 123, 196, 223, 194, 178, 17, 21, 171, 101, 223, 235,
    ]);
  });

  test.skip('pointCheck', async () => {
    const sum = await appClient.pointSubgroup({});
    expect(sum.return?.valueOf()).toStrictEqual(true);
  });
});
