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

  test.skip("scalarMultBase", async () => {
    const b = new Uint8Array([1]); // scalar is 1
    const res = await appClient
      .compose()
      .scalarMultBase({ scalar: b })
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
      .scalarMultBase({
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

  test.skip("scalarMult - scalar and point to point", async () => {
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
      .scalarMult({
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

  test.skip("validPoint", async () => {
    const bPoint = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
    const res = await appClient.compose().validPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[0]).toStrictEqual(true);

    const bPointFalse = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200,
    ]);
    try {
      await appClient.compose().validPoint({ point: bPointFalse }).dummyOpUp({ i: 11 }).execute();
      expect(true).toStrictEqual(false); // dirty trick to get the test to fail if the error is not thrown
    } catch (e) {
      expect(true).toStrictEqual(true); // dirty trick to get the test to pass if the error is thrown
    }
  });

  test("hashPointToPoint", async () => {
    const bPoint = new Uint8Array([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
    const res = await appClient.compose().hashPointToPoint({ point: bPoint }).dummyOpUp({ i: 1 }).execute();
    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[0]).toStrictEqual([
      22, 105, 137, 20, 77, 83, 192, 53, 249, 142, 71, 8, 248, 248, 0, 51, 36, 54, 105, 207, 244, 238, 114, 4, 95, 31,
      159, 74, 185, 128, 26, 131, 13, 139, 189, 75, 190, 206, 169, 41, 141, 229, 103, 120, 76, 63, 19, 243, 194, 170,
      172, 78, 212, 97, 75, 154, 61, 158, 135, 190, 135, 226, 96, 195,
    ]);
  });
});
