import { subtask, task, types } from "hardhat/config";
import * as Helpers from "./helpers";

task("deploy", "Deploy")
  .setAction(async (taskArgs, {run, ethers, network}) => {
      const uniswapV2Factory = await run("factory");

      const weth = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // goerli
      const uniswapV2Router = await run("router", { factory: uniswapV2Factory, weth: weth });

      const setRouterInitial = await run("set-router", { factory: uniswapV2Factory, router: uniswapV2Router });

      console.log("=".repeat(50));
      Helpers.logDeploy('UniswapV2Factory',uniswapV2Factory);
      Helpers.logDeploy('UniswapV2Router02', uniswapV2Router);
      Helpers.logDeploy('SetRouterInitial', setRouterInitial);
  });

/*========== UniswapV2Factory ==========*/
subtask("factory", "The contract UniswapV2Factory is deployed")
      .setAction(async (_, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];
            const feeToSetter = signer.address;
            const treasuryAddress = signer.address;

            const UniswapV2Factory_Factory = await ethers.getContractFactory("UniswapV2Factory", signer);
            const UniswapV2Factory = await (await UniswapV2Factory_Factory.deploy(feeToSetter, treasuryAddress)).deployed();
            console.log(`The UniswapV2Factory: \u001b[1;34m${UniswapV2Factory.address}\u001b[0m`);    
            return UniswapV2Factory.address;
      });

/*========== UniswapV2Router02 ==========*/
subtask("router", "The contract UniswapV2Router02 is deployed")
      .addParam("factory", "UniswapV2Factory address", "", types.string)
      .addParam("weth", "wETH address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapV2RouterFactory = await ethers.getContractFactory("UniswapV2Router02", signer);
            const UniswapV2Router = await (await UniswapV2RouterFactory.deploy(taskArgs.factory, taskArgs.weth)).deployed();
            console.log(`The UniswapV2Router02: \u001b[1;34m${UniswapV2Router.address}\u001b[0m`);    
            return UniswapV2Router.address;
      });

/*========== set-router ==========*/
subtask("set-router", "Setting UniswapV2Router Address in UniswapV2Factory after deploying UniswapV2Router")
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

task("deploy-token", "deploying erc20 token")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const tokenFactory = await ethers.getContractFactory("ERC20test", signer);
          const totalSupply = ethers.utils.parseUnits("1000", 18);
          const token = await (await tokenFactory.deploy(totalSupply, "MyToken2", "MYT2")).deployed();
          console.log(`The token: \u001b[1;34m${token.address}\u001b[0m`);    
      });

task("add-liq", "adding liq for tokens")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x9DcD76b4A7357249d6160D456670bAcC53292e27";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer);

          const tokenAddress1 = "0x400b3D2Ac98f93e14146E330210910f396f59C1E";
          const tokenAddress2 = "0x598E5dBC2f6513E6cb1bA253b255A5b73A2a720b"

          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);
          const token2 = await ethers.getContractAt("ERC20test", tokenAddress2, signer);   
      
          const amountADesired = ethers.utils.parseUnits("50", 18);
          const amountBDesired = ethers.utils.parseUnits("50", 18);
          
          const amountAMin = ethers.utils.parseUnits("40", 18);
          const amountBMin = ethers.utils.parseUnits("40", 18);

          await token1.approve(routerAddress, amountADesired);
          await token2.approve(routerAddress, amountBDesired);

          await UniswapV2Router.addLiquidity(tokenAddress1, tokenAddress2, amountADesired, amountBDesired, amountAMin, amountBMin, signer.address, 1000000000000, { gasLimit: 3000000 });

      });
