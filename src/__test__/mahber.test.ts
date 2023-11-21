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

  test('add', async () => {
    const sum = await appClient.add({});
    expect(sum.return?.valueOf()).toBe(
      '9941d92319af7d1f46dc0c702fb9189e78b4773090bb4e9c0a03bb992c7b4e593514f38667479cc9783e9cdf10aeb314'
    );
  });
});
