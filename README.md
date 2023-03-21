# UltronSwap

These are the core contracts of UltronSwap.

Originally a fork of Uniswap V2, see In-depth documentation at [uniswap.org](https://uniswap.org/docs).

The built contract artifacts can be browsed via [unpkg.com](https://unpkg.com/browse/@uniswap/v2-core@latest/).

# Local Development

The following assumes the use of `node@>=10`.

## Install Dependencies

```
npm install
```

## Compile Contracts

```
npm run compile
```

## Run Tests

```
npm test
```

## Verify Bytecode

The compiled bytecode is stored in the `./bytecode` directory. To compile it manually, you should
run the corresponding task below for a checked contract. The task will fetch a contract's bytecode
from the respective address in the Ultron mainnet and will compile its source code into bytecode
locally. Both remote and local bytecode is saved into the `./build` directory with the respective
filename.

```
# UniswapV2Factory Contract
npm run verify-bytecode:uniswap-v2-factory

# UniswapV2Router02 Contract
npm run verify-bytecode:uniswap-v2-router02

# UniswapV2DAO Contract
npm run verify-bytecode:uniswap-dao

# UniswapV2Pair Contract (uUSDT-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:uusdt-wulx

# UniswapV2Pair Contract (uUSDC-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:uusdc-wulx

# UniswapV2Pair Contract (BNB-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:bnb-wulx

# UniswapV2Pair Contract (MATIC-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:matic-wulx

# UniswapV2Pair Contract (FTM-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:ftm-wulx

# UniswapV2Pair Contract (wETH-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:weth-wulx

# UniswapV2Pair Contract (wBTC-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:wbtc-wulx

# UniswapV2Pair Contract (AVAX-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:avax-wulx

# UniswapV2Pair Contract (uUSDT-uUSDC Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:uusdt-uusdc

# UniswapV2Pair Contract (DAI-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:dai-wulx

# UniswapV2Pair Contract (BUSD-wULX Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:busd-wulx

# UniswapV2Pair Contract (wETH-uUSDT Liquidity Pool)
npm run verify-bytecode:uniswap-v2-pair:weth-uusdt
```
