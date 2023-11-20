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
    const a = 'a9a0c9f0289bb8f54de7b13917b410c649d417e1b48dd18d249afc6c96088a0f6e4d72e446186213b27b62827e12c8a5';
    const b = '81ff68baa963706b4fefe341bde81c5873b964acd75f3f0b0fdffb83cfc0edac6be550aede9e91b79cbf85f51191fd1b';
    const sum = await appClient.add({ a, b });
    expect(sum.return?.valueOf()).toBe(
      '9941d92319af7d1f46dc0c702fb9189e78b4773090bb4e9c0a03bb992c7b4e593514f38667479cc9783e9cdf10aeb314'
    );
  });
});
