import {generate_fe, generate_ge, hash_to_ge, create_ring_link, ec_scalar_mul, ec_fe_mul, ec_fe_sub} from './bls12_381_utils';

// First we generate a key pair for the signer and public keys for each other participant.
// Then we generate the 
// In reality we obviously don't have access to the other participants private keys

const k_pi: Uint8Array = generate_fe();
const K_pi: Uint8Array = generate_ge(k_pi);
const number_of_other_participants = 5;

let others_public_keys: Uint8Array[] = [];
for (let i = 0; i < number_of_other_participants; i++) {
    others_public_keys.push(generate_ge((generate_fe())));
}

////////////////////////
// GENERATE SIGNATURE //
////////////////////////

// The Key Image, unique to the keypair, is used to prevent double spending
const key_image =  ec_scalar_mul(hash_to_ge(K_pi), k_pi);

const msg_string = 'Send 1000 from mixer with key image ' + key_image;
console.log(msg_string);
const msg = new TextEncoder().encode(msg_string); // this is the message we want to sign
const a = generate_fe(); // Generate random number, nonce

let nonces: Uint8Array[] = []
for (let i = 0; i < number_of_other_participants; i++) {
    nonces.push(generate_fe());
}

let values: Uint8Array[] = [create_ring_link(msg, a, 0, K_pi, 0)]
for(let i = 0; i < number_of_other_participants; i++) {
    values.push(create_ring_link(msg, nonces[i], values[i], others_public_keys[i], key_image))
}

// This is the core of the security of the ring signature
// The verifier will have access to r_pi, NOT a and DEFINITELY NOT k_pi.
const r_pi  = ec_fe_sub(a, ec_fe_mul(values[values.length - 1], k_pi))

// Construct the ring signature
// First add the last value, i.e. c_"pi"
// Then add r_pi
// Then add the rest of the nonces (but not a)
let signature: Uint8Array[] = []
signature.push(values[values.length - 1])
signature.push(r_pi)
for(let i = 0; i < number_of_other_participants; i++) {
    signature.push(nonces[i])
}

// SIGNATURE CREATED

//////////////////////////////////////////////////////////
// PUBLIC KNOWLEDGE: K_pi and others_public_keys  ////////
// COMMUNICATED FROM SIG TO VER: msg, signature   ////////
// (c_pi, r_pi, rest of the nonces) and key_image ////////
//////////////////////////////////////////////////////////

//////////////////////
// VERIFY SIGNATURE //
//////////////////////

let values_prime: Uint8Array[] = []
values_prime.push(create_ring_link(msg, signature[1], signature[0], K_pi, key_image))
for(let i = 0; i < number_of_other_participants; i++) {
    values_prime.push(create_ring_link(msg, signature[i + 2], values_prime[i], others_public_keys[i], key_image));
}

// RING SIGNATURE IS VALID THIS WILL RETURN TRUE:

function areEqual(a: Uint8Array, b: Uint8Array): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

console.log(areEqual(signature[0], values_prime[values_prime.length - 1]));
// I.E, c_pi === c'_final
// Basically the verifier has "looped around" and successfully reconstructed the ring 

console.log("c_pi", values[values.length - 1], "c'_final", values_prime[values_prime.length - 1]);
for(let i = 0; i < number_of_other_participants; i++) {
    console.log("c_"+i.toString(), values[i], "c'_"+i.toString(), values_prime[i]);
}