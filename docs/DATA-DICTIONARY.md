# Solana Score Data Dictionary

**For**: Jupiter Integration
**Query ID**: 6576517

---

## Core Columns

### wallet
- **Type**: String
- **Description**: Solana wallet address

### score
- **Type**: Float (0-100)
- **Description**: Composite Solana Score measuring financial contribution and organic activity on Solana.
- **Additional Information**: See Score Breakdown below

### protocol_fees_paid
- **Type**: Float (USD)
- **Description**: Total USD fees paid across major Solana protocols

### network_fees_paid
- **Type**: Float (SOL)
- **Description**: Total base-layer transaction fees paid to Solana validators

### current_holdings
- **Type**: Float (USD)
- **Description**: Current USD value of the wallet's Solana token balances
- **Additional Information**: May be missing balances for some lower market-cap memecoins or alts

### protocol_count
- **Type**: Integer
- **Description**: Number of unique Solana protocols the wallet has interacted with

### protocols_used
- **Type**: String (comma-separated list)
- **Description**: List of protocol names the wallet has interacted with

### months_active
- **Type**: Integer
- **Description**: Number of months the wallet has been active on Solana

### is_sybil
- **Type**: String or NULL
- **Description**: Indicates whether the wallet triggered one of the internal sybil detection cases
- **Note**: For Solana Score display, ignore sybil checks

### jup_fees_paid
- **Type**: Float (USD)
- **Description**: Total fees paid specifically to Jupiter products (V6 Aggregator, Perps)
- **Additional Information**: Jup fees paid are included in protocol_fees_paid

### jup_staker
- **Type**: Boolean
- **Description**: TRUE if the wallet staked JUP during 2025

### jup_perps_user
- **Type**: Boolean
- **Description**: TRUE if the wallet interacted with Jup perps in 2025

---

## Score Breakdown

### Value (50%)

| Component | Weight | Description |
|-----------|--------|-------------|
| Protocol Fees Paid | 30% | Monetary investment into Solana protocols |
| Network Fees Paid | 10% | Monetary investment into the overall Solana ecosystem |
| Current Solana Holdings | 10% | Wallet value of all Solana tokens, gauge of user's commitment to Solana |

### Activity (50%)

| Component | Weight | Description |
|-----------|--------|-------------|
| Protocol Diversity | 30% | Number of protocols interacted with to ensure organic use |
| Consistency | 20% | Transactions over time, quantified by X months active |

---

## Protocols Analyzed

Used for Protocol Diversity and Fees Paid calculations:

| Protocol | Sector |
|----------|--------|
| PumpSwap | Dex |
| Raydium CPMM | Dex |
| Raydium AMM | Dex |
| Raydium CLMM | Dex |
| Orca | Dex |
| Meteora DAMM v2 | Dex |
| ByReal CLMM | Dex |
| Moonshot Create | Launchpad |
| LaunchLab | Launchpad |
| Pump.fun | Launchpad |
| Lets Bonk | Launchpad |
| Bags | Launchpad |
| Believe | Launchpad |
| Jupiter Aggregator Ultra (v6) | Dex Aggregator |
| Jupiter Aggregator Limit Order | Dex Aggregator |
| Jupiter DCA | Dex Aggregator |
| Jupiter Perps | Perps |
| Drift Perps | Perps |
| Axiom | Trading App |
| moonshot.money | Trading App |
| Photon | Trading App |
| Phantom | Wallet |
| Dex Screener | Other |
| Dex Tools | Other |

---

## Sybil Classification

**Note**: For Solana Score display, sybil checks are ignored.

| Value | Definition |
|-------|------------|
| A | Address did not transact across at least 3 weeks with more than $5. Jup v6 events monitored: SwapEvent & SwapsEvent |
| B | Address had a failure rate > 50% across all transactions |
| C (Atomic) | > 90% of transactions are same token in and same token out within same tx |
| C | > 90% of tx are A->B->A loop across txs within a 10min window |
| NULL | User did not fail a sybil test |

---

## Test Addresses

| Wallet | Score |
|--------|-------|
| `EqXBQ6K6ZkvFGLbSBpG8hx24QztxVGq9ANaeKxvcQf6t` | 0 |
| `CoWiZiAm3S2QSHcdf9DxYygSESJcGiiBQD9ue7MuU1Cg` | 7.293 |
| `E2YxeyUogxpGUv9VgUfKzZ3mqd7Wtn1Mi421gp5c9ZKR` | 0 |
| `Fp6anUt6wUNtahi6Qw4eyvg2vGD4JX4WFVn2YADrx4EP` | 0 |
| `DNcNFVb6L94P2rhKBkWKX4q1Ccn93suMff1RjxpdDv4a` | 5.0549 |
