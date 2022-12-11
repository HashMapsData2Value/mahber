# mahber - ማሕበር

Implementing ring signatures in a smart contract to do stuff in a mahber...

Pronunced maa-hhh-behr. Means *association* in Tigrinya.

# How it works

Premise: You have account A and you wish to send to account B with some obfuscation for anonymity. You can do so by using a mahber smart contract (SC), which will act as an intermediary.

First of all, you can either pick an existing SC OR deploy a new SC yourself. To better obfuscate, the SC will have a set input and output monetary figure, e.g. 100 Algo for the sake of this explanation. (Of course, Algorand's first-class-citizen approach to tokens makes it trivial to replace that with some other fungible token, e.g. USDC.)

You generate a private key *k* and a public key *K* and pass along *K* as input to the SC as you fill it with 100 Algo from account A. *k* will be used to recover those funds from the SC into account B. The SC will store the *K*, making sure it is unique. The SC can be filled multiple times from account A but you'll need to provide a different *K* each time.

After some time, as others have filled the SC with their own Algos, it is time to withdraw those 100 Algo you inserted!

Let's say there have been 10 insertions into the SC and you are happy with that level of obfuscation. There are now 10 public keys *K_1*, *K_2*, ..., *K_10* stored and available for use in a so called *ring signature*. Ring signatures allows one entity with one signature to sign a message, the message in this case being the final intended recipient (e.g., "account B"), on behalf of a group. Outsiders will be able to verify that ONE of the entities in the group signed it - presumably the one who entered their funds - but they will not be able to figure out exactly which account it was (with negligble probability). Note that it is very important that the message includes the recipient account (account B) in some way, to avoid a relay node runner front running and stealing the money.

We can use this property of ring signatures to prove to the SC that account B represents ONE of the 10 entities that inserted Algo into it, without anyone being able to figure out which account account B is connected to exactly (account A). Also, to prevent someone from repeatedly extracting 100 Algos out of the SC (double-spending), we include a so called key image *K^~*, unique to the private key *k*. For each extraction the SC will store the key image and block any attempts to use it again, preventing double-spending.


# Math

Let R = {K_1, K_2, ..., K_n} be a collection of *n* public keys, also known as a ring *R*. Each corresponds to a private key *k_n*. *Hp* is a hash-function that links a point to another point on the curve. *Hn* is a normal scalar to scalar hash-function, e.g. Keccak. *G* is the generator such that *K_n* = *k_n* \* G (mod *l*). The *+* and \* operators are either scalar or curve point operators depending on the case. *m* is the message that is being signed. In general things are happening (mod *l*).

Let n=π, *k_π* and K_π represent the prover.

1. Generate key image *K^~* = *k_π* x *Hp(K_π)*
2. Generate random integers *a* and *r_i* for i member of *1*, *2*, ..., *n* EXCEPT for *r_π*.
3. Compute *c_{π+1}* = *Hn(m || a\*G || aHp(K_π))*
4. For *i* = *π+1*, *π+2*, ..., *n*, *1*, *2*, ..., *π-1* (looping around after *n* to *1*) compute
    *c_{i+1}* = *Hn(m || r_i \* G + c_i \* K_i || r_i \* Hp(K_i) + c_i \* K^~)*
5. Define *r_π* = *a* - *c_π* \* *k_π*

The signature presented to the SC will be the message *m*, *c_1* (an arbitrary *c* value), the random values *r_1* from *1* to *n*, the ring R and of course the key image *K^~*.

What about verification? The SC has to verify that things are correct. It does so as follows.

1. Check that *lK^~* == 0
2. For *i* = *1*, *2*, ..., *n* iteratively compute the following (looping around after at *n* to 1):
    *c'_{i+1}* = *Hn(m || r_i \* G + c_i \* K_i || r_i \* Hp(K_i) + c_i \*K^~)*
3. If *c_1* == c'_1 then all is good.

Refer to Zero to Monero 2.0 pages 30-31 for more in-depth and rigurous explanations.

# Issues 
- For the smart contract to be able to verify it needs the introduction of some Ed25519 opcodes, like scalar multiplicaton. *K^~* is itself not created from *G* but rather follows.
- Unclear at this stage how this could scale to many keys. Should the SC max out at 10? Or could it grow to arbitrary sizes, with the caveat being that the extractor has to pay extra for a larger ring size with many more public keys? Perhaps the user could be forced to pass on the indices of the public keys they want
- Could this be expanded to do "private DAOs"? I.e., an SC that basically contains the treasuries of several DAOs?