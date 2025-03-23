# BlockEstate: Blockchain-Based Land Registry System

BlockEstate is a secure and transparent land registry platform that leverages blockchain technology to provide tamper-proof property documentation, streamlined buying/selling processes, and enhanced security for real estate transactions.

## Features

- **Blockchain Integration**: Store property data securely on Ethereum blockchain
- **Property Management**: List, buy, and sell properties with smart contract enforcement
- **Document Verification**: Government verification of property documents
- **MetaMask Integration**: Seamless wallet connectivity for blockchain transactions
- **Secure Transactions**: Transparent and immutable transaction records
- **Role-Based Access**: Separate interfaces for regular users and government officials

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (neondb) with Drizzle ORM
- **Blockchain**: Ethereum (Hardhat for local development), Solidity
- **Authentication**: Clerk Auth
- **Package Manager**: Bun
- **Monorepo Management**: Turborepo

## Project Structure

```
blockestate/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/             # App router pages
│       ├── components/      # UI components
│       └── lib/             # Utility functions including blockchain.ts
├── packages/
│   ├── contracts/           # Solidity smart contracts
│   │   ├── contracts/       # Smart contract code
│   │   └── scripts/         # Deployment scripts
│   └── data/                # Database schema and utilities
└── ...
```

## Getting Started

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/blockestate.git
cd blockestate
```

2. **Install dependencies with Bun**

```bash
bun install
```

3. **Set up environment variables**

Create `.env.local` in the `apps/web` directory:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/blockestate

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. **Set up the database**

```bash
cd packages/data
bun db:push # This will push the schema to your PostgreSQL database
```

5. **Deploy smart contracts locally (for development)**

```bash
cd packages/contracts
bun hardhat node # Start a local Ethereum node
bun hardhat run scripts/deploy.js --network localhost # Deploy contracts
```

Note the deployed contract address and update your `.env.local` file.

### Running the Application

1. **Start the development server**

```bash
bun dev
```

2. **Access the application**

Open your browser and navigate to `http://localhost:3000`

## Core Workflows

### Adding a Property

1. Navigate to "Add Property" in the dashboard
2. Fill in property details and upload documents
3. Confirm the transaction using MetaMask
4. Wait for government verification

### Listing a Property for Sale

1. Go to "Your Listings" in the dashboard
2. Find the property you want to list
3. Set a price and click "List for Sale"
4. Confirm the transaction using MetaMask

### Buying a Property

1. Browse the available properties in "Buy Property"
2. Click on the property you want to purchase
3. Click "Buy Now" and confirm the transaction in MetaMask
4. The ownership transfer is automatically recorded on the blockchain

### Government Verification

1. Government officials log in with their accounts
2. Navigate to "Verify Properties" section
3. Review property documents
4. Approve or reject the property verification

## Smart Contract Architecture

The system uses a `PropertyRegistry` smart contract that handles:

- Property registration with ownership information
- Listing properties for sale with price settings
- Ownership transfers through purchase transactions
- Property verification by authorized government addresses
- Retrieving property details from the blockchain
  
