# GenTuring — Decentralized Turing Test on GenLayer

GenTuring is a decentralized Turing Test game where users chat with an opponent and guess whether they are talking to a human or an AI. The judgment is made on-chain using GenLayer's Intelligent Contracts and Optimistic Democracy consensus.

## Demo Video

https://www.youtube.com/watch?v=yJqzWqcj_UM

## Live App

https://gen-turing.vercel.app/

## How it works

1. User chats with an opponent (human or AI)
2. User submits their guess — Human or AI
3. The guess and conversation are sent to a real GenLayer Intelligent Contract
4. 5 AI validators reach consensus using `gl.eq_principle_strict_eq()` and `gl.exec_prompt()`
5. The verdict and transaction hash are returned and displayed on-screen

## GenLayer Integration

**Contract file:** `gen_turing.py`
**Contract address:** `0x5A72e203BF7574b0CaAe36E4351b32B95Cd3Bc7A`
**Network:** Bradbury Testnet
**SDK:** genlayer-js

The contract uses `gl.exec_prompt()` to analyze whether a message was written by a human or AI, and `gl.eq_principle_strict_eq()` to reach consensus across multiple validators through Optimistic Democracy.

## Tech Stack

- React + TypeScript + Vite
- GenLayer Intelligent Contract (Python)
- genlayer-js SDK
- Framer Motion
- Tailwind CSS
- Deployed on Vercel

## Run locally

```bash
npm install
npm run dev
```

## Contract deployment

The Intelligent Contract is deployed on GenLayer Studio (Bradbury Testnet).
Source: `gen_turing.py`
