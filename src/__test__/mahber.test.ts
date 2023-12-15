/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import { MahberClient } from "../contracts/clients/MahberClient";

const fixture = algorandFixture();

let appClient: MahberClient;

describe("Mahber", () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, testAccount } = fixture.context;

    appClient = new MahberClient(
      {
        sender: testAccount,
        resolveBy: "id",
        id: 0,
      },
      algod
    );

    await appClient.create.createApplication({});
  });

  // test.skip("scalarMultBase", async () => {
  //   const b = new Uint8Array([1]); // scalar is 1
  //   const res = await appClient
  //     .compose()
  //     .scalarMultBase({ scalar: b })
  //     .dummyOpUp({ i: 1 })
  //     .dummyOpUp({ i: 2 })
  //     .execute();

  //   const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

  //   expect(a[0]).toEqual([
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  //   ]);

  //   // random scalar

  //   const b2 = new Uint8Array([
  //     43, 43, 74, 87, 118, 68, 161, 190, 119, 52, 7, 77, 232, 183, 32, 169, 64, 29, 214, 97, 221, 184, 208, 198, 18, 7,
  //     185, 226, 87, 128, 207, 23,
  //   ]);
  //   const res2 = await appClient
  //     .compose()
  //     .scalarMultBase({
  //       scalar: b2,
  //     })
  //     .dummyOpUp({ i: 11 })
  //     .dummyOpUp({ i: 22 })
  //     .execute();

  //   const a2 = res2.returns?.valueOf() as Array<bigint | Array<number>>;

  //   expect(a2[0]).toEqual([
  //     2, 211, 59, 206, 168, 18, 112, 41, 206, 16, 18, 168, 234, 92, 245, 113, 75, 26, 107, 230, 28, 69, 66, 139, 31,
  //     238, 254, 241, 207, 190, 99, 118, 12, 134, 251, 66, 223, 28, 63, 75, 200, 249, 117, 254, 180, 244, 169, 35, 47,
  //     51, 76, 253, 113, 191, 129, 166, 85, 134, 43, 73, 71, 94, 113, 120,
  //   ]);
  // });

  // test.skip("scalarMult - scalar and point to point", async () => {
  //   const bScalar = new Uint8Array([
  //     43, 43, 74, 87, 118, 68, 161, 190, 119, 52, 7, 77, 232, 183, 32, 169, 64, 29, 214, 97, 221, 184, 208, 198, 18, 7,
  //     185, 226, 87, 128, 207, 23,
  //   ]);

  //   const bPoint = new Uint8Array([
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  //   ]);

  //   const res = await appClient
  //     .compose()
  //     .scalarMult({
  //       scalar: bScalar,
  //       point: bPoint,
  //     })
  //     .dummyOpUp({ i: 11 })
  //     .dummyOpUp({ i: 22 })
  //     .execute();

  //   const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

  //   expect(a[0]).toEqual([
  //     2, 211, 59, 206, 168, 18, 112, 41, 206, 16, 18, 168, 234, 92, 245, 113, 75, 26, 107, 230, 28, 69, 66, 139, 31,
  //     238, 254, 241, 207, 190, 99, 118, 12, 134, 251, 66, 223, 28, 63, 75, 200, 249, 117, 254, 180, 244, 169, 35, 47,
  //     51, 76, 253, 113, 191, 129, 166, 85, 134, 43, 73, 71, 94, 113, 120,
  //   ]);
  // });

  // test.skip("validPoint", async () => {
  //   const bPoint = new Uint8Array([
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  //   ]);
  //   const res = await appClient.compose().validPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
  //   const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
  //   expect(a[0]).toStrictEqual(true);

  //   const bPointFalse = new Uint8Array([
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200,
  //   ]);
  //   try {
  //     await appClient.compose().validPoint({ point: bPointFalse }).dummyOpUp({ i: 11 }).execute();
  //     expect(true).toStrictEqual(false); // dirty trick to get the test to fail if the error is not thrown
  //   } catch (e) {
  //     expect(true).toStrictEqual(true); // dirty trick to get the test to pass if the error is thrown
  //   }
  // });

  // test.skip("hashPointToPoint", async () => {
  //   const bPoint = new Uint8Array([
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  //     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  //   ]);
  //   const res = await appClient.compose().hashPointToPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
  //   const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
  //   expect(a[0]).toStrictEqual([
  //     22, 105, 137, 20, 77, 83, 192, 53, 249, 142, 71, 8, 248, 248, 0, 51, 36, 54, 105, 207, 244, 238, 114, 4, 95, 31,
  //     159, 74, 185, 128, 26, 131, 13, 139, 189, 75, 190, 206, 169, 41, 141, 229, 103, 120, 76, 63, 19, 243, 194, 170,
  //     172, 78, 212, 97, 75, 154, 61, 158, 135, 190, 135, 226, 96, 195,
  //   ]);
  // });

  test.skip("challenge", async () => {
    const nonce = new Uint8Array([
      46, 156, 236, 248, 53, 50, 159, 170, 109, 169, 33, 158, 103, 180, 57, 80, 45, 125, 194, 252, 175, 92, 76, 230, 42,
      18, 31, 135, 164, 88, 110, 100,
    ]);
    const cPrev = new Uint8Array([
      10, 242, 224, 61, 122, 18, 136, 168, 107, 81, 128, 119, 234, 141, 99, 16, 48, 109, 145, 6, 165, 41, 159, 175, 35,
      161, 119, 221, 171, 37, 20, 143,
    ]);
    const pk = new Uint8Array([
      46, 202, 152, 28, 229, 99, 170, 207, 25, 15, 76, 176, 41, 90, 186, 29, 18, 175, 126, 183, 69, 186, 134, 67, 137,
      130, 204, 150, 101, 180, 58, 11, 20, 231, 21, 98, 227, 162, 44, 149, 112, 24, 20, 219, 254, 187, 147, 46, 82, 60,
      232, 80, 19, 248, 27, 9, 175, 1, 235, 49, 63, 192, 225, 82,
    ]);
    const keyImage = new Uint8Array([
      44, 6, 251, 206, 14, 47, 48, 192, 109, 48, 17, 22, 179, 194, 233, 24, 115, 237, 71, 95, 249, 32, 235, 161, 152,
      236, 60, 30, 196, 74, 2, 161, 38, 223, 24, 19, 52, 138, 189, 23, 133, 217, 202, 20, 31, 102, 61, 97, 160, 130, 31,
      238, 181, 244, 155, 126, 196, 87, 125, 121, 0, 75, 219, 53,
    ]);

    const msg = new Uint8Array([104, 101, 108, 108, 111]); // Hello

    const res = await appClient
      .compose()
      .challenge({ msg, nonce, cPrev, pk, keyImage })
      .dummyOpUp({ i: 1 })
      .dummyOpUp({ i: 2 })
      .dummyOpUp({ i: 3 })
      .dummyOpUp({ i: 4 })
      .dummyOpUp({ i: 5 })
      .dummyOpUp({ i: 6 })
      .dummyOpUp({ i: 7 })
      .dummyOpUp({ i: 8 })
      .dummyOpUp({ i: 9 })
      .dummyOpUp({ i: 10 })
      .dummyOpUp({ i: 11 })
      .dummyOpUp({ i: 12 })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

    expect(a[0]).toStrictEqual([
      31, 23, 238, 26, 160, 14, 69, 231, 97, 21, 127, 13, 99, 116, 63, 10, 113, 187, 137, 219, 27, 244, 80, 61, 19, 14,
      234, 70, 151, 175, 55, 199,
    ]);
  });

  test("verify ring of 2", async () => {
    // ringSig ---- {c0, r0, ..., rn, I}
    // initializer, nonces, keyImage

    const initializer = new Uint8Array([
      2, 1, 168, 168, 197, 227, 109, 157, 227, 3, 13, 159, 58, 59, 188, 149, 247, 2, 237, 240, 102, 169, 201, 132, 53,
      103, 207, 255, 209, 168, 137, 125,
    ]);

    const nonces = [
      new Uint8Array([
        0, 23, 143, 9, 79, 24, 233, 162, 162, 17, 38, 151, 172, 19, 67, 129, 94, 47, 155, 186, 40, 200, 20, 240, 65,
        142, 242, 137, 167, 234, 228, 184,
      ]),
      new Uint8Array([
        6, 177, 96, 201, 104, 146, 205, 29, 185, 135, 79, 132, 98, 46, 200, 108, 59, 55, 244, 96, 252, 67, 22, 21, 97,
        110, 133, 76, 124, 1, 178, 23,
      ]),
    ];

    const ring = [
      new Uint8Array([
        11, 48, 4, 239, 146, 88, 81, 181, 255, 165, 13, 48, 49, 236, 186, 215, 45, 128, 73, 145, 33, 162, 247, 59, 111,
        204, 3, 250, 109, 60, 186, 154, 17, 236, 107, 153, 192, 187, 48, 92, 143, 116, 33, 82, 156, 186, 75, 116, 152,
        83, 152, 91, 35, 51, 213, 130, 134, 113, 172, 108, 77, 224, 158, 148,
      ]),
      new Uint8Array([
        9, 248, 102, 55, 220, 25, 60, 89, 46, 208, 84, 173, 48, 230, 88, 102, 32, 224, 91, 169, 142, 249, 223, 222, 61,
        232, 97, 146, 42, 74, 99, 44, 33, 17, 116, 95, 48, 43, 184, 201, 193, 43, 213, 130, 27, 208, 47, 43, 35, 254,
        22, 155, 150, 40, 132, 181, 229, 12, 225, 61, 204, 38, 70, 69,
      ]),
    ];

    const keyImage = new Uint8Array([
      6, 251, 80, 216, 179, 51, 80, 107, 123, 176, 45, 6, 137, 30, 155, 94, 119, 47, 54, 163, 119, 54, 121, 145, 217,
      199, 157, 38, 62, 98, 209, 83, 18, 233, 8, 27, 210, 8, 50, 237, 111, 248, 16, 77, 10, 111, 83, 140, 230, 177, 181,
      186, 86, 237, 129, 180, 244, 65, 79, 179, 78, 0, 104, 198,
    ]);
    const msg = new Uint8Array([104, 101, 108, 108, 111]); // hello

    const n = ring.length;

    const callChallenge = async (
      nonce: Uint8Array,
      cPrev: Uint8Array,
      pk: Uint8Array,
      keyImage: Uint8Array
    ): Promise<Uint8Array> => {
      const res = await appClient
        .compose()
        .challenge({ msg, nonce, cPrev, pk, keyImage })
        .dummyOpUp({ i: 1 })
        .dummyOpUp({ i: 2 })
        .dummyOpUp({ i: 3 })
        .dummyOpUp({ i: 4 })
        .dummyOpUp({ i: 5 })
        .dummyOpUp({ i: 6 })
        .dummyOpUp({ i: 7 })
        .dummyOpUp({ i: 8 })
        .dummyOpUp({ i: 9 })
        .dummyOpUp({ i: 10 })
        .dummyOpUp({ i: 11 })
        .dummyOpUp({ i: 12 })
        .execute();
      const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
      // @ts-ignore
      return new Uint8Array(a[0]);
    };

    const cValues = [initializer];
    for (let i = 0; i < n; i++) {
      if (i === n - 1) {
        // We loop around!
        cValues[0] = await callChallenge(nonces[i], cValues[cValues.length - 1], ring[i], keyImage);
      }
      cValues.push(await callChallenge(nonces[i], cValues[i], ring[i], keyImage));
    }

    // Ring Sig verified if we were able to reconstruct the initializer using the nonces, ring and keyImage
    expect(cValues[0]).toStrictEqual(initializer);
  });
});
