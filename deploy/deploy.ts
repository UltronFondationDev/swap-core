import { subtask, task, types } from "hardhat/config";
import * as Helpers from "./helpers";

task("deploy", "Deploy")
  .setAction(async (taskArgs, {run, ethers, network}) => {
      const uniswapV2Factory = await run("factory");

      let weth;
      if(network.name === 'goerli') {
            weth = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; 
      }
      else if(network.name === 'ultron_testnet') {
            weth = "0xE2619ab40a445526B0AaDff944F994971d2EAc05"; 
      }

      const dao = await run("dao", { factory: uniswapV2Factory });

      const setDaoIntitial = await run("set-dao-initial", { factory: uniswapV2Factory, dao: dao });

      const uniswapV2Router = await run("router", { factory: uniswapV2Factory, weth: weth });

      const setRouter = await run("set-router", { factory: uniswapV2Factory, dao: dao, router: uniswapV2Router });

      console.log("=".repeat(50));
      Helpers.logDeploy('UniswapV2Factory',uniswapV2Factory);
      Helpers.logDeploy('UniswapDAO',dao);
      Helpers.logDeploy('UniswapV2Router02', uniswapV2Router);
      Helpers.logDeploy('SetDaoIntitial', setDaoIntitial);
      Helpers.logDeploy('SetRouter', setRouter);
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

/*========== UniswapDAO ==========*/
subtask("dao", "The contract UniswapDAO is deployed")
      .addParam("factory", "UniswapDAO address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapDAOFactory = await ethers.getContractFactory("UniswapDAO", signer);
            const dao = await (await UniswapDAOFactory.deploy(taskArgs.factory)).deployed();
            console.log(`The UniswapDAO: \u001b[1;34m${dao.address}\u001b[0m`);    
            return dao.address;
      });

/*========== set-dao-initial ==========*/
subtask("set-dao-initial", "Setting UniswapDAO Address in UniswapV2Factory after deploying UniswapDAO")
      .addParam("factory", "UniswapV2Factory address", "", types.string)      
      .addParam("dao", "UniswapDAO address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapV2Factory = await ethers.getContractAt("UniswapV2Factory", taskArgs.factory, signer);
            await UniswapV2Factory.setDAOContractInitial(taskArgs.dao);
            await Helpers.delay(4000);
            
            console.info(await UniswapV2Factory.daoAddress());
            return true;
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
      .addParam("dao", "UniswapDAO address", "", types.string)      
      .addParam("router", "UniswapV2Router address", "", types.string)
      .setAction(async (taskArgs, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];

            const UniswapDAO = await ethers.getContractAt("UniswapDAO", taskArgs.dao, signer);
            await UniswapDAO.newRouterChangeRequest(taskArgs.router);
            await Helpers.delay(4000);

            const UniswapV2Factory = await ethers.getContractAt("UniswapV2Factory", taskArgs.factory, signer);
            await UniswapV2Factory.setRouterAddress(1);
            await Helpers.delay(4000);
            
            console.info(await UniswapV2Factory.routerAddress());
            return true;
      });

task("deploy-tokens", "deploying erc20 tokens")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const tokenFactory = await ethers.getContractFactory("ERC20test", signer);
          const totalSupply = ethers.utils.parseUnits("1000000000", 18);
          const token0 = await (await tokenFactory.deploy(totalSupply, "MyToken0", "MYT0")).deployed();
          const token1 = await (await tokenFactory.deploy(totalSupply, "MyToken1", "MYT1")).deployed();
          console.log(`The token0: \u001b[1;34m${token0.address}\u001b[0m`); 
          console.log(`The token1: \u001b[1;34m${token1.address}\u001b[0m`);       
      });

task("set-fee-to", "New FeeTo address")
      .setAction(async (_, { ethers }) => {
            const signer = (await ethers.getSigners())[0];
            const factoryAddress = "0x47b8d7d6901b674aF69c2c5844F6df2ea8612C38";
            const daoAddress = "0xC685E8EDDC9f078666794CbfcD8D8351bac404eF";

            const UniswapV2Factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress, signer);
            const UniswapDAO = await ethers.getContractAt("UniswapDAO", daoAddress, signer);

            const feeToAddress = "0xa30396f2a233fdFFCC3C2b5445e24bfe01593b3b" // brewETH

            await UniswapDAO.newFeeToChangeRequest(feeToAddress);
            await Helpers.delay(4000);
            await UniswapV2Factory.setFeeTo(1);
            await Helpers.delay(4000);

            console.info(await UniswapV2Factory.feeTo());
      })

task("add-liq", "adding liq for tokens")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x5024D1E290523c68f09816f847E6fac5B5eeaf28";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer); 

          const tokenAddress0 = "0xD0d0B25dBCA9488F409f2f5e8BE92B60CE4e01Ab";
          const tokenAddress1 = "0xec63D98d3e1C83E72B9e74f7D952331f7Fc765E1"

          const token0 = await ethers.getContractAt("ERC20test", tokenAddress0, signer);
          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);   
      
          const amountADesired = ethers.utils.parseUnits("20", 18);
          const amountBDesired = ethers.utils.parseUnits("20", 18);
          
          const amountAMin = ethers.utils.parseUnits("20", 18);
          const amountBMin = ethers.utils.parseUnits("20", 18);

          await token0.approve(routerAddress, amountADesired);
          await token1.approve(routerAddress, amountBDesired);

          await UniswapV2Router.addLiquidity(tokenAddress0, tokenAddress1, amountADesired, amountBDesired, amountAMin, amountBMin, signer.address, Date.now() + 20, { gasLimit: 3000000 });
      });

task("swap", "swap token0 for token1")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x5310700c9bacC7De98DC18A56597077eA2EfD7c9";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer); 

          const tokenAddress1 = "0x6E983AAcb09bBd0aB422874c85CFf66B6864d75d";
          const tokenAddress2 = "0x26d6039C78fC0Ce78C22354bd040E68B1445e2ac"

          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);
          const token2 = await ethers.getContractAt("ERC20test", tokenAddress2, signer);

          const amountADesired = ethers.utils.parseUnits("20", 18);
          const amountBDesired = ethers.utils.parseUnits("20", 18);
          
          const amountAMin = ethers.utils.parseUnits("20", 18);
          const amountBMin = ethers.utils.parseUnits("20", 18);          

          await token1.approve(routerAddress, amountADesired);
          await UniswapV2Router.addLiquidityETH(token2.address, amountADesired, amountAMin, amountBMin, signer.address, Date.now() + 20, { gasLimit: 3045000, value: amountBMin });
          
          await token2.approve(routerAddress, amountBDesired);
          await UniswapV2Router.addLiquidityETH(token2.address, amountADesired, amountAMin, amountBMin, signer.address, Date.now() + 20, { gasLimit: 3045000, value: amountBMin });


          await token1.approve(UniswapV2Router.address, amountADesired);
          await token2.approve(UniswapV2Router.address, amountBDesired);
          await UniswapV2Router.swapExactTokensForTokens(ethers.utils.parseUnits("1", 18), 0, [token1.address, token2.address], signer.address, Date.now() + 20, { gasLimit: 3045000 });    
      });
