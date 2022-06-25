import { subtask, task, types } from "hardhat/config";
import * as Helpers from "./helpers";

task("deploy", "Deploy")
  .setAction(async (taskArgs, {run, ethers, network}) => {
      const uniswapV2Factory = await run("UniswapV2Factory");

      const weth = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // goerli
      const uniswapV2Router = await run("UniswapV2Router", { factory: uniswapV2Factory, weth: weth });

      const setRouterInitial = await run("UniswapV2Router", { factory: uniswapV2Factory, router: uniswapV2Router });

      console.log("=".repeat(50));
      Helpers.logDeploy('UniswapV2Factory',uniswapV2Factory);
      Helpers.logDeploy('UniswapV2Router', uniswapV2Router);
      Helpers.logDeploy('SetRouterInitial', setRouterInitial);
  });

/*========== UniswapV2Factory ==========*/
subtask("UniswapV2Factory", "The contract UniswapV2Factory is deployed")
      .setAction(async (_, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];
            const feeToSetter = signer.address;
            const treasuryAddress = signer.address;

            const UniswapV2Factory_Factory = await ethers.getContractFactory("UniswapV2Factory", signer);
            const UniswapV2Factory = await (await UniswapV2Factory_Factory.deploy(feeToSetter, treasuryAddress)).deployed();
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

/*========== UniswapV2Factory ==========*/
subtask("SetRouterInitial", "Setting UniswapV2Router Address in UniswapV2Factory after deploying UniswapV2Router")
      .addParam("factory", "UniswapV2Factory address", "", types.string)      
      .addParam("router", "UniswapV2Router address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapV2Factory = await ethers.getContractAt("UniswapV2Factory", taskArgs.factory, signer);
            await UniswapV2Factory.setRouterAddress(taskArgs.router);
            await Helpers.delay(4000);
            
            console.info(await UniswapV2Factory.routerAddress());
            return true;
      });
