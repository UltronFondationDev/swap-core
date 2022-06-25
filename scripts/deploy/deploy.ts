import { subtask, task, types } from "hardhat/config";

task("deploy", "Deploy")
  .setAction(async (taskArgs, {run, ethers, network}) => {
      const uniswapV2Factory = await run("UniswapV2Factory");

      const weth = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // goerli
      const uniswapV2Router = await run("UniswapV2Router", { factory: uniswapV2Factory, weth: weth });

      console.log("=".repeat(50));
      console.log(`UniswapV2Factory: \x1b[32m$${uniswapV2Factory}\x1b[0m`);
      console.log(`UniswapV2Router: \x1b[32m$${uniswapV2Router}\x1b[0m`);
  });

/*========== UniswapV2Factory ==========*/
subtask("UniswapV2Factory", "The contract UniswapV2Factory is deployed")
      .setAction(async (_, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];
            const feeToSetter = signer.address;

            const UniswapV2Factory_Factory = await ethers.getContractFactory("UniswapV2Factory", signer);
            const UniswapV2Factory = await (await UniswapV2Factory_Factory.deploy(feeToSetter)).deployed();
            console.log(`The UniswapV2Factory: \u001b[1;34m${UniswapV2Factory.address}\u001b[0m`);    
            return UniswapV2Factory.address;
      });

/*========== UniswapV2Router ==========*/
subtask("UniswapV2Router", "The contract UniswapV2Router is deployed")
      .addParam("factory", "UniswapV2Factory address", "", types.string)
      .addParam("weth", "wETH address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapV2RouterFactory = await ethers.getContractFactory("UniswapV2Router", signer);
            const UniswapV2Router = await (await UniswapV2RouterFactory.deploy(taskArgs.factory, taskArgs.weth)).deployed();
            console.log(`The UniswapV2Router: \u001b[1;34m${UniswapV2Router.address}\u001b[0m`);    
            return UniswapV2Router.address;
      });