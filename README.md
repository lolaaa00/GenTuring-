# GenTuring — Decentralized Turing Test on GenLayer

GenTuring is a decentralized Turing Test game where users chat with an opponent and guess whether they are talking to a human or an AI. The judgment is made on-chain using a GenLayer Intelligent Contract.

## Demo Video

https://www.youtube.com/watch?v=yJqzWqcj_UM

## Live App

https://gen-turing.vercel.app/

## How it works

1. User chats with an opponent (human or AI)
2. User submits their guess — Human or AI
3. The guess and full conversation transcript are sent to a real GenLayer Intelligent Contract
4. The contract asks GenLayer AI to judge the full transcript and store the result
5. The verdict and transaction hash are returned and displayed on-screen

## GenLayer Integration

**Contract file:** `gen_turing.py`
**Contract address:** `0xD28ce9831991ab3c643fD7BB84fDea436C40E935`
**Network:** Studionet
**SDK:** genlayer-js

The contract analyzes full match behaviour across the transcript with `gl.exec_prompt()`, stores the finalized result, and updates player/global stats.

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

The Intelligent Contract is deployed on GenLayer Studionet.
Source: `gen_turing.py`
