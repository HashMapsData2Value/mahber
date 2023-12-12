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

  test("scalarMultBase - 1", async () => {
    const res = await appClient
      .compose()
      .dummyOpUp({ i: 1 })
      .dummyOpUp({ i: 2 })
      .scalarMultBase({ scalar: [1] })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[2]).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
  });

  test("scalarMultBase - sk to pk", async () => {
    const res = await appClient
      .compose()
      .dummyOpUp({ i: 1 })
      .dummyOpUp({ i: 2 })
      .scalarMultBase({ scalar: [1] })
      .execute();

    const a = res.returns?.valueOf() as Array<bigint | Array<number>>;
    expect(a[2]).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
    ]);
  });

  test.skip("pointCheck", async () => {
    const sum = await appClient.pointSubgroup({});
    expect(sum.return?.valueOf()).toStrictEqual(true);
  });
});
