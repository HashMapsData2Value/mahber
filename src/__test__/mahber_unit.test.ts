/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import { MahberClient } from "../contracts/clients/MahberClient";

const fixture = algorandFixture();

let appClient: MahberClient;

describe("Mahber - Unit Tests", () => {
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

  test("scalarMultBase - scalar=1", async () => {
    const b = new Uint8Array([1]); // scalar is 1
    const res = await appClient
      .compose()
      .publicScalarMultBase({ scalar: b })
      .dummyOpUp({ i: 1 })
      .dummyOpUp({ i: 2 })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

    expect(a[0]).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);

    // random scalar

    const b2 = new Uint8Array([
      43, 43, 74, 87, 118, 68, 161, 190, 119, 52, 7, 77, 232, 183, 32, 169, 64, 29, 214, 97, 221, 184, 208, 198, 18, 7,
      185, 226, 87, 128, 207, 23,
    ]);
    const res2 = await appClient
      .compose()
      .publicScalarMultBase({
        scalar: b2,
      })
      .dummyOpUp({ i: 11 })
      .dummyOpUp({ i: 22 })
      .execute();

    const a2 = res2.returns?.valueOf() as Array<bigint | Array<number>>;

    expect(a2[0]).toEqual([
      2, 211, 59, 206, 168, 18, 112, 41, 206, 16, 18, 168, 234, 92, 245, 113, 75, 26, 107, 230, 28, 69, 66, 139, 31,
      238, 254, 241, 207, 190, 99, 118, 12, 134, 251, 66, 223, 28, 63, 75, 200, 249, 117, 254, 180, 244, 169, 35, 47,
      51, 76, 253, 113, 191, 129, 166, 85, 134, 43, 73, 71, 94, 113, 120,
    ]);
  });

  test("scalarMult - scalar and point -> point", async () => {
    const bScalar = new Uint8Array([
      43, 43, 74, 87, 118, 68, 161, 190, 119, 52, 7, 77, 232, 183, 32, 169, 64, 29, 214, 97, 221, 184, 208, 198, 18, 7,
      185, 226, 87, 128, 207, 23,
    ]);

    const bPoint = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);

    const res = await appClient
      .compose()
      .publicScalarMult({
        scalar: bScalar,
        point: bPoint,
      })
      .dummyOpUp({ i: 11 })
      .dummyOpUp({ i: 22 })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

    expect(a[0]).toEqual([
      2, 211, 59, 206, 168, 18, 112, 41, 206, 16, 18, 168, 234, 92, 245, 113, 75, 26, 107, 230, 28, 69, 66, 139, 31,
      238, 254, 241, 207, 190, 99, 118, 12, 134, 251, 66, 223, 28, 63, 75, 200, 249, 117, 254, 180, 244, 169, 35, 47,
      51, 76, 253, 113, 191, 129, 166, 85, 134, 43, 73, 71, 94, 113, 120,
    ]);
  });

  test("validPoint", async () => {
    const bPoint = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
    const res = await appClient.compose().publicValidPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[0]).toStrictEqual(true);

    const bPointFalse = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200,
    ]);
    try {
      await appClient.compose().publicValidPoint({ point: bPointFalse }).dummyOpUp({ i: 11 }).execute();
      expect(false).toStrictEqual(true); // dirty trick to get the test to fail if the error is not thrown
    } catch (e) {
      expect(true).toStrictEqual(true); // dirty trick to get the test to pass if the error is thrown
    }
  });

  test("hashPointToPoint", async () => {
    const bPoint = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
    const res = await appClient.compose().publicHashPointToPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[0]).toStrictEqual([
      22, 105, 137, 20, 77, 83, 192, 53, 249, 142, 71, 8, 248, 248, 0, 51, 36, 54, 105, 207, 244, 238, 114, 4, 95, 31,
      159, 74, 185, 128, 26, 131, 13, 139, 189, 75, 190, 206, 169, 41, 141, 229, 103, 120, 76, 63, 19, 243, 194, 170,
      172, 78, 212, 97, 75, 154, 61, 158, 135, 190, 135, 226, 96, 195,
    ]);
  });

  test("challenge", async () => {
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
      .publicChallenge({ msg, nonce, cPrev, pk, keyImage })
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
});
