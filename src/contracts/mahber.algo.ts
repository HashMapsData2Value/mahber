import { Contract } from '@algorandfoundation/tealscript';

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  /**
   * A method that takes two hex group elements (strings) and adds them together
   * @param a The first hex string
   * @param b The second hex string
   *
   * @returns The result of the operation
   */
  add(a: string, b: string): string {
    // @ts-ignore
    const result = ec_add(hex(a), hex(b));
    return result;
  }
}
