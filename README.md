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

## Verify Contract Code

```
# UniswapV2Factory
npm run verify-code:uniswap-v2-factory

# UniswapV2Router02
npm run verify-code:uniswap-v2-router02

# UniswapV2DAO
npm run verify-code:uniswap-dao

# UniswapV2Pair (uUSDT-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:uusdt-wulx

# UniswapV2Pair (uUSDC-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:uusdc-wulx

# UniswapV2Pair (BNB-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:bnb-wulx

# UniswapV2Pair (MATIC-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:matic-wulx

# UniswapV2Pair (FTM-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:ftm-wulx

# UniswapV2Pair (wETH-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:weth-wulx

# UniswapV2Pair (wBTC-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:wbtc-wulx

# UniswapV2Pair (AVAX-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:avax-wulx

# UniswapV2Pair (uUSDT-uUSDC Liquidity Pool)
npm run verify-code:uniswap-v2-pair:uusdt-uusdc

# UniswapV2Pair (DAI-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:dai-wulx

# UniswapV2Pair (BUSD-wULX Liquidity Pool)
npm run verify-code:uniswap-v2-pair:busd-wulx

# UniswapV2Pair (wETH-uUSDT Liquidity Pool)
npm run verify-code:uniswap-v2-pair:weth-uusdt
```
