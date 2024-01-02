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
A(...) -->|PK| B{App: Deposit API}
C(...) --> |PK| B
D(...) --> |PK| B
E(...) --> |PK| B
F(...) --> |PK| B
:::

Withdrawal Workflow - Alice to Bob

::: mermaid
flowchart LR
A(Box: Storage) --> |Sample PKs|B(Alice)
B --> B
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
