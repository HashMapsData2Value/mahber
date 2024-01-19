A normal signature has the following flow:

::: mermaid
flowchart LR
m1[Message m] --> Sign(Sign)
sk[Secret Key] --> Sign
Sign --> Signature

m2[Message m] --> Verify{Verify}
pk[Public Key] --> Verify
S[Signature] --> Verify
Verify --> True
Verify --> False

:::

A ring signature scheme allows one individual, who is a member of a group, to sign a message _m_. We can call the group a _ring of public keys_, of which one public key belongs to the individual. However, ascertaining who among the group produced the signature is computationally infeasible.

::: mermaid
flowchart TD
X(Message - m) --> Z{Ring Signature}

B(PK1) --> A["Ring" of PKs]
C(PK2) --> A
D(...) --> A
E(PKN) --> A
A --> Z

F(c_0 - Initializer) --> Z
G(r_1) --> Y(Nonces)
H(r_2) --> Y
I(...) --> Y
J(r_N) --> Y
Y --> Z
:::

We use ring signatures to create a mixer, a smart contract that can break the chains of tracability by mixing funds from different accounts and allowing the depositors to withdraw them into a new account without it being directly clear which account on the blockchain was the original.

To ensure that the ring signature is _linkable_, i.e. that it is possible to know when the same person has made a signature over multiple occassions, something known as a KeyImage can be utilized. In this application, this means making sure someone can only withdraw money as often as they have deposited.

And to ensure fungibility between various deposits and withdrawal accounts, the smart contract needs to have a certain denomination/amount that is fixed and everyone must stick to.

::: mermaid
flowchart LR
A[PK] --> B(Hash_to_Point)
C[SK] --> D(ScalarMult)
B --> D
D --> E[KeyImage for SK,PK]
:::

Note that the KeyImage cannot be used to derive the SK.

The following flow details how a challenge is produced. It is a main calculation done both when generating a signature and when verifying it.

::: mermaid
flowchart TD

m[message m] --> Concat(Concatenate)
Concat --> |"m || r-i • G + c-i • PK-i || r-i • Hp(PK-i) + c-i • KI"| Hs(HashToScalar)
r[r_i - nonce] --> sm1(ScalarMult)
G[G - basepoint] --> sm1
c[c_i - prev challenge] --> sm2(ScalarMult)
PK[PK_i] --> sm2
sm1 --> |r-i • G| add1(PointAdd)
sm2 --> |"c-i • PK-i"|add1
add1 --> |r-i • G + c-i • PK|Concat
r --> sm4(ScalarMult)
Hp[HashToPoint] --> |"Hp(PK-i)"|sm4
PK --> Hp
c --> sm3(ScalarMult)
sm4 --> |"r-i • Hp(PK-i)"|add2(PointAdd)
KI[KeyImage] --> sm3
sm3 --> |c-i • KI|add2
add2 --> |"r-i • Hp(PK-i) + c-i • KI"|Concat

Hs --> |"Hs(m || r-i • G + c-i • PK-i || r-i • Hp(PK-i) + c-n • KI)"|c_ii[c_i+1 - next challenge]

:::

Deposit workflow

::: mermaid
flowchart LR
A(Alice) -->|Generate SK, PK| A
A -->|1001 A| B{App: Deposit API}
A -->|PK| B
B --> |Validate| B
B --> |Add PK| C(App: Box Storage)
B --> |1001 A| D(App: Funds)
:::

::: mermaid
flowchart LR
A(...) -->|PK, 1001 A| B{App: Deposit API}
C(...) -->|PK, 1001 A| B
D(...) -->|PK, 1001 A| B
E(...) -->|PK, 1001 A| B
F(...) -->|PK, 1001 A| B
:::

Withdrawal Workflow - Alice to Bob, using a relayer.

::: mermaid
flowchart LR
A(Box: Storage) --> |Sample PKs|B(Alice)
B --> |Generate RingSig|D(Relayer)
B --> |Generate KeyImage|D

S(Relayer) --> |1. Provide RingSig| T{App: Withdrawal API}
S --> |1. Provide KeyImage| T{App: Withdrawal API}
T --> |2. Validate KeyImage|U(App: Box Storage)
U --> |3. Confirm KeyImage NOT added|T
T --> |4. Validate Ring Sig|T
T --> V{5. App: Pay Out}
V --> |6. Give Fee| Relayer
V --> |6. Transfer 1000A| Bob
V --> |6. Add KeyImage|U
:::

Compliance Strategies

White Listing

::: mermaid
flowchart LR
A(Account A) --> D{Deposit API}
D --> C{Whitelisted}

:::
