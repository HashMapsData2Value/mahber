import { Contract } from "@algorandfoundation/tealscript";

const MAX_BOX_BYTES = 32768; // 32 KB
const CURVE_POINT_SIZE = 64; // 64 bytes for BN254 curve points (point.X || point.Y)
const MAX_PK_BOX_SIZE = MAX_BOX_BYTES - 1024; // 32 KB - 1KB (If we want write budget to be able to create new PK box AND add PK to hashfilter we can't have the PK BOX be 32KB as it would exceed write budget...
const MAX_PK_BOX_PK_NUMBER = MAX_PK_BOX_SIZE / CURVE_POINT_SIZE;

const CHALLENGE_SIZE = 32; // 32 bytes since we use SHA256 when calculating challenge

// eslint-disable-next-line no-unused-vars
class Mahber extends Contract {
  // GLOBAL STATE

  // For fungibility all deposits need to be the same amount of Algo chunk sum/"denomination".
  denomination = GlobalStateKey<uint64>(); // Includes MBBR.

  asaId = GlobalStateKey<uint64>(); // Includes MBBR.

  pkIndex = GlobalStateKey<uint64>(); // How many public keys (PKs) are in the contract

  // PK BOXES
  // We want to store the PKs in a way that allows for easy access for when they are included in a ring signature.
  quickAccessPKBoxes = BoxMap<uint64, bytes>(); // Boxes containing PK bytes, accessible by [boxId][offsetIndex].

  // HashFilter BOXES
  // We want a simple way to ensure that a PK or a key image (KI) are not submitted twice. The latter is to prevent double spending.
  // For the former, if someone submits the same public key multiple times their funds will be trapped and be unable to be withdrawn.
  // Because we have 1 KI per withdrawal and 1 PK per KI, we can only withdraw 1 once per PK.
  hashFilter = BoxMap<bytes, bytes>(); // HashFilter with box titles = Hash(public key) or Hash/(key image)

  /// WITHDRAWAL BOXES

  // Session BOXES
  // Each withdrawal attempt has a session box, which contains certain information.
  sessionsBoxes = BoxMap<bytes, bytes>();

  // Precomputed Challenges Boxes
  precomputedChallengesBoxes = BoxMap<bytes, bytes>();

  // Intermediate Challenges Boxes
  intermediateChallengesBoxes = BoxMap<bytes, bytes>();

  createApplication(): void {
    // Initialize global state
    this.denomination.value = 1000 * 1000000;
    this.asaId = 0; // Algo, the "default" ASA
    this.pkIndex.value = 0;
  }

  /** Dummy Op Up
   * Dummy operation to get more opcode budget
   * @i - The number to return, necssary to deduplicate the name
   * @returns the number (but we do nothing with it)
   */
  dummyOpUp(i: number): number {
    return i;
  }

  /** Scalar Mult Base
   * Scalar multiplication of the base point
   * @scalar - The scalar to multiply the base point by.
   * @returns a point on the curve
   */
  private scalarMultBase(scalar: bytes): bytes {
    // @ts-ignore
    const result = ec_scalar_mul(
      "BN254g1",
      hex(
        "00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002"
      ),
      scalar
    );
    return result;
  }

  /** publicScalarMultBase
   * Public wrapper around the scalarMultBase method, allowing it to be tested directly.
   * @scalar - The scalar to multiply the basepoint by.
   * @returns the content of the scalarMultBase call
   */
  publicScalarMultBase(scalar: bytes): bytes {
    return this.scalarMultBase(scalar);
  }

  /** Scalar Mult
   * Scalar multiplication with a supplied point
   * @scalar - The scalar to multiply the point with
   * @point - The point that is multiplied with the scalar
   * @returns a point on the curve
   */
  private scalarMult(scalar: bytes, point: bytes): bytes {
    // @ts-ignore
    const result = ec_scalar_mul("BN254g1", point, scalar);
    return result;
  }

  /** publicScalarMult
   * Public wrapper around the scalarMult method, allowing it to be tested directly.
   * @scalar - The scalar to multiply the point with
   * @point - The point that is multiplied with the scalar
   * @returns the content of the scalarMult call
   */
  publicScalarMult(scalar: bytes, point: bytes): bytes {
    return this.scalarMult(scalar, point);
  }

  /** validPoint
   * Checks if the point is valid (on curve)
   * @point - The point to check
   * @returns true if the point is valid, false otherwise
   */
  private validPoint(point: bytes): boolean {
    // @ts-ignore
    return ec_subgroup_check("BN254g1", point);
  }

  /** publicValidPoint
   * Public wrapper around the validPoint method, allowing it to be tested directly.
   * @point - The point to check
   * @returns the content of the validPoint call
   */
  publicValidPoint(point: bytes): boolean {
    return this.validPoint(point);
  }

  /** Point add
   *  Adds two points on the curve
   * @param pointA - The first point
   * @param pointB - The second point
   * @returns The result of the operation
   */
  private pointAdd(pointA: bytes, pointB: bytes): bytes {
    // @ts-ignore
    const result = ec_add("BN254g1", pointA, pointB);
    return result;
  }

  /** publicPointAdd
   * Public wrapper around the pointAdd method, allowing it to be tested directly.
   * @param pointA - The first point
   * @param pointB - The second point
   * @returns the content of the pointAdd call
   */
  publicPointAdd(pointA: bytes, pointB: bytes): bytes {
    return this.pointAdd(pointA, pointB);
  }

  /** hashPointToPoint
   * Hashes a point to a point on the curve
   * NOTE: ec_map_to maps fp_element to curve point. We use hash and then mod to map the point's X and Y bytes to fp_element first.
   * What is inside ec_map_to (accessed Dec 13th 2023):
   *    https://github.com/algorand/go-algorand/blob/master/data/transactions/logic/pairing.go#L862
   *    https://pkg.go.dev/github.com/consensys/gnark-crypto/ecc/bn254#MapToG1
   *    https://github.com/Consensys/gnark-crypto/blob/master/ecc/bn254/fp/element.go#L42
   * @param point - The point to hash
   * @returns The result of the operation
   */
  private hashPointToPoint(point: bytes): bytes {
    const hash = sha256(point);
    const fpElement =
      btobigint(hash) % btobigint(hex("30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47")); // 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    // @ts-ignore
    const result = ec_map_to("BN254g1", fpElement);
    return result;
  }

  /** publicHashPointToPoint
   * Public wrapper around the hashPointToPoint method, allowing it to be tested directly.
   * @param point - The point to hash
   * @returns the content of the hashPointToPoint call
   */
  publicHashPointToPoint(point: bytes): bytes {
    return this.hashPointToPoint(point);
  }

  /** challenge
   * Produce the challenge, i.e. an individual link in the ring sig verification.
   * We mod by order of fr https://github.com/Consensys/gnark-crypto/blob/master/ecc/bn254/fr/element.go#L42
   * c_{i+1} = Hs(m || r_{i} * G + c_{i} * K_{i} || r_{i}*Hp(K_{i}) + c_{i} * I) mod |fr|
   * @param msg - The message to be signed
   * @param nonce - The nonce, part of the ring signature itself, aka one of the fake secret keys
   * @param cPrev - The previous challenge, or the base challenge if this is the first link (in which case it is part of the ring sig)
   * @param pk - The specific public key in the ring (indexed from the array of public keys)
   * @param keyImage - The key image of the signer, required for linkabiltiy to prevent double spending
   * @returns - the challenge
   */
  private challenge(msg: bytes, nonce: bytes, cPrev: bytes, pk: bytes, keyImage: bytes): bytes {
    /* CALCULATE LEFT-HAND SIDE OF EQUATION (AFTER MSG BYTES)
     ** r_{i} * G + c_{i} * K_{i}
     ** G = 0x00...0100...02 (basepoint)
     */
    const left = this.pointAdd(this.scalarMultBase(nonce), this.scalarMult(cPrev, pk));

    /* CALCULATE RIGHT-HAND SIDE OF EQUATION (AFTER MSG BYTES)
     ** r_{i}*Hp(K_{i}) + c_{i} * I
     ** where Hp is a hash function that maps a point to a point on the curve
     */
    const right = this.pointAdd(this.scalarMult(nonce, this.hashPointToPoint(pk)), this.scalarMult(cPrev, keyImage));

    /* COMBINE MSG BYTES WITH LEFT AND RIGHT BYTES
     ** Take SHA256 of the concatenated bytes and then mod |fr|
     ** Then return the results.
     */
    const h =
      btobigint(sha256(concat(concat(msg, left), right))) %
      btobigint(hex("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001")); // 21888242871839275222246405745257275088548364400416034343698204186575808495617
    // @ts-ignore
    return h as bytes;
  }

  /** publicChallenge
   * Public wrapper around the challenge method, allowing it to be tested directly.
   * @param msg - The message to be signed
   * @param nonce - The nonce, part of the ring signature itself, aka one of the fake secret keys
   * @param cPrev - The previous challenge, or the base challenge if this is the first link (in which case it is part of the ring sig)
   * @param pk - The specific public key in the ring (indexed from the array of public keys)
   * @param keyImage - The key image of the signer, required for linkabiltiy to prevent double spending
   * @returns - the content of the privateChallenge call
   */
  publicChallenge(msg: bytes, nonce: bytes, cPrev: bytes, pk: bytes, keyImage: bytes): bytes {
    return this.challenge(msg, nonce, cPrev, pk, keyImage);
  }

  /** deposit
   * Deposit funds + public key into the contract
   * @param pk - The public key to deposit
   * TODO: Add custom EdDSA to check that the depositor knows the secret key. Useful to prevent rogue key attack, adding the negative of another pk.
   * @returns - the number id of the public key, if successful. fails if unsuccessful.
   */
  deposit(depositTxn: PayTxn, pk: bytes): uint64[] {
    // Ensure the public key is OK.
    assert(this.validPoint(pk)); // Filter out invalid points
    assert(!this.hashFilter(pk).exists); // Filter out duplicate public keys by checking if the hash of the public key is already in the filter
    // TODO: assert(this.eddsaVerify(pk, msg, sig)); // Filter out rogue key attack by proving that the depositor knows the secret key
    verifyTxn(depositTxn, {
      // Ensure the depositor is funding the right amount
      receiver: this.app.address,
      amount: this.denomination.value,
    });

    // Calculate the box id to slot the PK into based off of the number of PKs already in the contract.
    const boxId = this.pkIndex.value / MAX_PK_BOX_PK_NUMBER; // Integer division, e.g. 2000/512 ->x 3

    // Check if the quick access box exists, otherwise create it.

    // Once we've gotten box_resize integrated which will allow us to resize boxes, we can use this instead:
    // if (!this.quickAccessPKBoxes(boxId).exists) {
    //   this.quickAccessPKBoxes(boxId).create(CURVE_POINT_SIZE);
    // } else {
    //   const boxlength = this.quickAccessPKBoxes(boxId).length();
    //   this.quickAccessPKBoxes(boxId).resize(boxlength + CURVE_POINT_SIZE);
    // }
    // It would also allow us to set MAX_PK_BOX_SIZE to 32KB instead of 31KB, which would allow us to store 512 PKs per box instead of 496.

    if (!this.quickAccessPKBoxes(boxId).exists) {
      this.quickAccessPKBoxes(boxId).create(MAX_PK_BOX_SIZE);
    }

    // Add the PK at the right offset.
    this.quickAccessPKBoxes(boxId).replace((this.pkIndex.value % MAX_PK_BOX_PK_NUMBER) * CURVE_POINT_SIZE, pk);

    // Add the PK to the hash filter - a box whose title is the PK
    this.hashFilter(pk).create(0);

    const idx = this.pkIndex.value;

    // Increment the number of PKs in the contract.
    this.pkIndex.value = this.pkIndex.value + 1;

    return [idx, boxId];
  }

  /** initWithdrawal
   * Creates a box representing a "withdrawal session".
   * Of key importance is the signed message string, which must contain the following:
   * Ring Size - Chosen number of PKs, i.e. size of anonymity set
   * Key Image - The keyimage, the one thing that is unique for a withdrawal
   * App Id - The id of the smart contract app
   * Nominal amount - The denomination of the contract, what was deposited originally
   * ASA ID - Clarifies the ASA ID. (Plain Algo has ID 0, "the default" asset of Algorand)
   * Withdrawal Address - Address of the final recipient of the funds
   * Relayer Address - Address of the relayer, facilitating the withdrawal (could be same as withdrawal address)
   * Relayer Fee - The fee the relayer charges for facilitating the withdrawal (could be 0)
   * The hash of the message becomes the id of the withdrawal session's box.
   * @param mbbrDepositTxn - The transaction that deposited the MBBR
   * @param msg - Signed message
   * @param initialChallenge - The initial challenge, which needs to be re-created to verify the ring signature
   * @returns - the id of the withdrawal session box
   */
  initWithdrawalSession(mbbrDepositTxn: PayTxn, msg: bytes, initialChallenge: bytes): bytes {
    // TODO: verify relayer address is session creator, to prevent relayers screwing each other over
    // TODO: verify mbbr is enough to cover the box creation fee
    // TODO: verify message characer length is correct
    const id = sha256(msg);
    this.sessionsBoxes(id).create(len(msg) + 2 * len(initialChallenge)); // Size neeeds cover message size, initial challenge size and the last calculated challenge from the last verified box of loaded values
    // initialChallenge size and the last calculated challenge from the last verified box of loaded values?

    // TODO: add a locking/unlock state? Once locked the session can't be modified anymore, and the relayer can either withdraw or destroy the session.
    // TODO: add space for keeping track of box verifications... increment box verified number from 0, to 1, to 2, etc until final box, as determined by the ring size
    // TODO: Keep track of the last challenge as well, which at some point will equal the initial challenge.
    return id;
  }

  /** TODO: destroyWithdrawalSession, IF SESSION LOCKED */

  /** createUploadPrecomputedChallengesBox
   * Creates a box that will be used to upload precomputed challenges into.
   * @param msg - Msg, functioning as the id for the withdrawal session
   * @param boxIndex - The index of the precomputed challenge box, incrementing with each chunk of date.
   * @param boxSize - The size of the precomputed challenge box
   * @returns - the id of the precomputed challenge box
   */
  createUploadPrecomputedChallengesBox(mbbrDepositTxn: PayTxn, msg: bytes, boxIndex: uint64, boxSize: uint64): bytes {
    // TODO: verify relayer address is session creator, to prevent relayers screwing with each other
    // TODO: verify relayer has enough MBBR to cover the box creation fee
    // TODO: CHECK IF SESSION IS LOCKED, IN WHICH CASE NO CHANGE CAN BE MADE FOR THIS ID!
    const boxId = sha256(concat(concat(sha256(msg), "precomputedChallenges"), itob(boxIndex)));
    this.precomputedChallengesBoxes(boxId).create(boxSize);
    return boxId;
  }

  /** uploadPrecomputedChallenges
   * Creates a box and uploads the precomputed challenges into it.
   * @param msg - Msg, functioning as the id for the withdrawal session
   * @param index - The index of the precomputed challenge box, incrementing with each chunk of date.
   * @param precomputedChallenges - The precomputed challenges
   * @returns - the id of the precomputed challenge box
   */
  uploadPrecomputedChallenges(msg: bytes, boxIndex: uint64, precomputedChallenges: bytes): bytes {
    // TODO: verify relayer address is session creator, to prevent others overwriting the precomputed challenges
    // TODO: CHECK IF SESSION IS LOCKED, IN WHICH CASE NO CHANGE CAN BE MADE FOR THIS ID!
    const boxId = sha256(concat(concat(sha256(msg), "precomputedChallenges"), itob(boxIndex)));
    this.precomputedChallengesBoxes(boxId).replace(0, precomputedChallenges);
    return boxId;
  }

  /** createIntermediateChallengesBox
   * Creates a box that will be used to contain intermediateChallengesBox.
   * Should eventually be a mirror image of the corresponding uploadPrecomputedChallengesBox.
   * @param msg - Msg, functioning as the id for the withdrawal session
   * @param boxIndex - The index of the precomputed challenge box, incrementing with each chunk of date.
   * @param boxSize - The size of the precomputed challenge box
   * @returns - the id of the precomputed challenge box
   */
  createIntermediateChallengesBox(mbbrDepositTxn: PayTxn, msg: bytes, boxIndex: uint64, boxSize: uint64): bytes {
    // TODO: verify relayer address is session creator, to prevent relayers screwing with each other
    // TODO: verify relayer has enough MBBR to cover the box creation fee
    // TODO: CHECK IF SESSION IS LOCKED, IN WHICH CASE NO CHANGE CAN BE MADE FOR THIS ID!
    const boxId = sha256(concat(concat(sha256(msg), "intermediateChallenges"), itob(boxIndex)));
    this.precomputedChallengesBoxes(boxId).create(boxSize);
    return boxId;
  }

  // TODO: COMBINE challenge boxes into one function, to save on code space

  /** computeIndividualChallenge
   * Computes an individual challenge.
   * Note that the previous challenge is loaded specifically from the precomputed challenges box.
   * While the calculated challenge is loaded into the intermediate challenges box.
   * At the end we will compare if the two boxes are the same, and of course that the last challenge is the same as the initial challenge.
   * By loading specifically from the precomputed challenges box we can verify in parallell.
   * The odds of being able to arrive at the same initial challenge in the last challenge is astronomically low UNLESS it is a valid ring signature.
   * Public keys are of course loaded from the contract storage.
   * @param msg - The message to be signed
   * @param nonce - The nonce, part of the ring signature itself, aka one of the fake secret keys
   * @param pkIndex- The index number of the public key in the smart contract storage
   * @param keyImage - The key image of the signer, required for linkabiltiy to prevent double spending
   * @param cPrevIndex - The index of the previous challenge, allowing it to be loaded from the loaded precomputed challenges box
   * @returns - ...
   */
  computeIndividualChallenge(
    msg: bytes,
    nonce: bytes,
    pkIndex: uint64,
    keyImage: bytes,
    cPrevBoxIndex: uint64,
    cPrevOffset: uint64
  ): [bytes, uint64] {
    // TODO: extract PK from storage using index
    // TODO: extract cPrev from precomputed storage using index

    const pkBoxId = pkIndex / MAX_PK_BOX_PK_NUMBER; // Box of the PK in question
    const pkOffset = (pkIndex % MAX_PK_BOX_PK_NUMBER) * CURVE_POINT_SIZE; // Offset of the PK in question inside the box
    const pk = this.quickAccessPKBoxes(pkBoxId).extract(pkOffset, pkOffset + CURVE_POINT_SIZE); // PK in question

    const cPrevBoxId = sha256(concat(concat(sha256(msg), "precomputedChallenges"), itob(cPrevBoxIndex)));
    const cPrev = this.precomputedChallengesBoxes(cPrevBoxId).extract(cPrevOffset, cPrevOffset + CHALLENGE_SIZE); // cPrev in question

    const computedChallenge = this.challenge(msg, nonce, cPrev, pk, keyImage);

    let intermediateChallengesBoxIndex = cPrevBoxIndex;
    let intermediateChallengesBoxOffset = cPrevOffset + CHALLENGE_SIZE;
    if (intermediateChallengesBoxOffset === MAX_BOX_BYTES) {
      // If we are at the end of the precomputed challenges box, we need to upload to the next box at the 0th offset
      intermediateChallengesBoxIndex = intermediateChallengesBoxIndex + 1;
      intermediateChallengesBoxOffset = 0;
    }

    // TODO: Consider adding a check here already comparing the smart contract computed challenge with the pre-computed (cPrev + 1) compute challenge?
    // Would provide an additional check but require loading another box...

    // TODO: check if session is locked, in which case no change can be made!

    const intermediateChallengesBoxId = sha256(
      concat(concat(sha256(msg), "precomputedChallenges"), itob(intermediateChallengesBoxIndex))
    );
    this.intermediateChallengesBoxes(intermediateChallengesBoxId).replace(
      intermediateChallengesBoxOffset,
      computedChallenge
    );
    return [intermediateChallengesBoxId, intermediateChallengesBoxOffset];
  }

  // TODO:
  /** lockSessions
   * Locks session to either delete all boxes or allow withdrawal. After a lock has been made no changes can be made.
   */

  /** verifyChallengesEqual
   * Verifies that precomputated and intermediated challenges are equal.
   * If they are equal, the last challenge is stored in the withdrawalSession.
   * As the last boxIndex is checked, if the ring sig is valid, the last challenge will be equal to the initial challenge.
   * Since
   * @param msg - the msg, which acts as id for the withdrawal session
   */
  verifyChallengesEqualIncrement(msg: bytes, boxIndex: uint64, half: uint64): bytes {
    // check if "lock" has been set! If not nothing can be done
  }

  // TODO:
  /** finalPayOutCheck
   * Checks if the lock has been set, if the correct number of boxes of computations have been verified, etc
   */

  // TODO: verify function that will loop through all the intermediary challenge values and confirm that the relayer posted correct cPrevs based off of the calculations made...
  // - Should only be possible if the key image has NOT been added yet
  // - Do we need to consider the case where relayers submit the withdrawal in the same block?†
  //   Or should all transactions in a block be considered sequentially, such that despite being
  //   in the same block one tx will win over the other, preventing the other from withdrawing?

  // So long as the last value corresponds to the initailizer value (which we imply accepted from the verifier), it means that the ring has looped around
}
