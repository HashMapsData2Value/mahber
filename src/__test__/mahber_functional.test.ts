/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import algosdk from "algosdk";
import * as algokit from "@algorandfoundation/algokit-utils";

import { MahberClient } from "../contracts/clients/MahberClient";

const fixture = algorandFixture();

let appClient: MahberClient;
let permanentTestAccount: algosdk.Account;

describe("Mahber - Functionality Tests", () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { algod, kmd } = fixture.context;

    permanentTestAccount = await algokit.getDispenserAccount(algod, kmd);

    appClient = new MahberClient(
      {
        sender: permanentTestAccount,
        resolveBy: "id",
        id: 0,
      },
      algod
    );
    await appClient.create.createApplication({});
  });

  test("deposit twice", async () => {
    // Test depositing funds and storing two public keys

    const pk1 = new Uint8Array([
      11, 48, 4, 239, 146, 88, 81, 181, 255, 165, 13, 48, 49, 236, 186, 215, 45, 128, 73, 145, 33, 162, 247, 59, 111,
      204, 3, 250, 109, 60, 186, 154, 17, 236, 107, 153, 192, 187, 48, 92, 143, 116, 33, 82, 156, 186, 75, 116, 152, 83,
      152, 91, 35, 51, 213, 130, 134, 113, 172, 108, 77, 224, 158, 148,
    ]);

    const pk2 = new Uint8Array([
      9, 248, 102, 55, 220, 25, 60, 89, 46, 208, 84, 173, 48, 230, 88, 102, 32, 224, 91, 169, 142, 249, 223, 222, 61,
      232, 97, 146, 42, 74, 99, 44, 33, 17, 116, 95, 48, 43, 184, 201, 193, 43, 213, 130, 27, 208, 47, 43, 35, 254, 22,
      155, 150, 40, 132, 181, 229, 12, 225, 61, 204, 38, 70, 69,
    ]);

    const { algod } = fixture.context;
    const { appAddress } = await appClient.appClient.getAppReference();

    const depositFunc = async (
      depositTxn: algosdk.Transaction,
      pk: Uint8Array,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quickAccessPKBoxRef: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hashFilterBoxRef: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> => {
      const res = await appClient
        .compose()
        .deposit(
          { depositTxn, pk },
          {
            boxes: [
              quickAccessPKBoxRef,
              hashFilterBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef, // Hash filter reference
            ],
          }
        )
        .dummyOpUp(
          { i: 1 },
          {
            boxes: [
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
            ],
          }
        )
        .dummyOpUp(
          { i: 2 },
          {
            boxes: [
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
            ],
          }
        )
        .dummyOpUp(
          { i: 3 },
          {
            boxes: [
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
              quickAccessPKBoxRef,
            ],
          }
        )
        .dummyOpUp({ i: 4 })
        .execute();
      const a = res.returns?.valueOf();

      return a;
    };

    const getBoxIndex = async () => {
      const gs = await appClient.getGlobalState();
      let pkIndex;
      if (gs.pkIndex?.asNumber() !== undefined) {
        pkIndex = gs.pkIndex.asNumber();
      } else {
        throw new Error("No pkIndex");
      }
      return Math.floor(pkIndex / 512);
    };

    await depositFunc(
      algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: permanentTestAccount.addr,
        to: appAddress,
        amount: 1000 * 1000000,
        suggestedParams: await algod.getTransactionParams().do(),
      }),
      pk1,
      { appIndex: 0, name: algosdk.encodeUint64(await getBoxIndex()) },
      { appIndex: 0, name: pk1 }
    );

    const res = await depositFunc(
      algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: permanentTestAccount.addr,
        to: appAddress,
        amount: 1000 * 1000000,
        suggestedParams: await algod.getTransactionParams().do(),
      }),
      pk2,
      { appIndex: 0, name: algosdk.encodeUint64(await getBoxIndex()) },
      { appIndex: 0, name: pk2 }
    );
    const a = res[0];
    expect(a[0]).toEqual(1n);
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
