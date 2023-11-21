import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  /**
   *
   * @returns The result of the operation
   */
  add(): string {
    // @ts-ignore
    const result = ec_add(
      'BLS12_381g1',
      hex('a9a0c9f0289bb8f54de7b13917b410c649d417e1b48dd18d249afc6c96088a0f6e4d72e446186213b27b62827e12c8a5'),
      hex('81ff68baa963706b4fefe341bde81c5873b964acd75f3f0b0fdffb83cfc0edac6be550aede9e91b79cbf85f51191fd1b')
    );
    return result;
  }
}
