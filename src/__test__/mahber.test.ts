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

  test.skip("bls12_381g1_add", async () => {
    const sum = await appClient.pointAdd({});
    expect(sum.return?.valueOf()).toStrictEqual([
      5, 114, 203, 234, 144, 77, 103, 70, 136, 8, 200, 235, 80, 169, 69, 12, 151, 33, 219, 48, 145, 40, 1, 37, 67, 144,
      45, 10, 195, 88, 166, 42, 226, 143, 117, 187, 143, 28, 124, 66, 195, 154, 140, 85, 41, 191, 15, 78, 22, 106, 157,
      140, 171, 198, 115, 163, 34, 253, 166, 115, 119, 157, 142, 56, 34, 186, 62, 203, 134, 112, 228, 97, 247, 59, 185,
      2, 29, 95, 215, 106, 76, 86, 217, 212, 205, 22, 189, 27, 186, 134, 136, 25, 121, 116, 157, 40,
    ]);
  });

  test("scalarMultBase - 1 to base", async () => {
    const b = new Uint8Array([1]);
    const res = await appClient
      .compose()
      .dummyOpUp({ i: 1 })
      .dummyOpUp({ i: 2 })
      .scalarMultBase({ scalar: b })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

    console.log("scalarMultBase 1", a);

    expect(a[2]).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
  });

  test("scalarMultBase - scalar to point", async () => {
    const b = new Uint8Array([
      43, 43, 74, 87, 118, 68, 161, 190, 119, 52, 7, 77, 232, 183, 32, 169, 64, 29, 214, 97, 221, 184, 208, 198, 18, 7,
      185, 226, 87, 128, 207, 23,
    ]);
    const res = await appClient
      .compose()
      .dummyOpUp({ i: 11 })
      .dummyOpUp({ i: 22 })
      .scalarMultBase({
        scalar: b,
      })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;

    expect(a[2]).toEqual([
      2, 211, 59, 206, 168, 18, 112, 41, 206, 16, 18, 168, 234, 92, 245, 113, 75, 26, 107, 230, 28, 69, 66, 139, 31,
      238, 254, 241, 207, 190, 99, 118, 12, 134, 251, 66, 223, 28, 63, 75, 200, 249, 117, 254, 180, 244, 169, 35, 47,
      51, 76, 253, 113, 191, 129, 166, 85, 134, 43, 73, 71, 94, 113, 120,
    ]);
  });

  test.skip("pointCheck", async () => {
    const sum = await appClient.pointSubgroup({});
    expect(sum.return?.valueOf()).toStrictEqual(true);
  });
});
