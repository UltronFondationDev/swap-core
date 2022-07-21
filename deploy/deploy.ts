import { subtask, task, types } from "hardhat/config";
import * as Helpers from "./helpers";

task("deploy", "Deploy")
  .setAction(async (taskArgs, {run, ethers, network}) => {
      const uniswapV2Factory = await run("factory");

      let weth;
      if(network.name === 'ultron_testnet') {
            weth = "0xE2619ab40a445526B0AaDff944F994971d2EAc05"; 
      }
      else if(network.name === 'goerli') {
            weth = '0x6E983AAcb09bBd0aB422874c85CFf66B6864d75d';
      }
      else if(network.name === 'ultron') {
            weth = '0x3a4F06431457de873B588846d139EC0d86275d54';
      }
      else {
            weth = await run("weth");
      }

      const dao = await run("dao", { factory: uniswapV2Factory });

      const setDaoIntitial = await run("set-dao-initial", { factory: uniswapV2Factory, dao: dao });

      const uniswapV2Router = await run("router", { factory: uniswapV2Factory, weth: weth });

      const setRouter = await run("set-router", { factory: uniswapV2Factory, dao: dao, router: uniswapV2Router });

      console.log("=".repeat(50));
      Helpers.logDeploy('weth',weth);
      Helpers.logDeploy('UniswapV2Factory',uniswapV2Factory);
      Helpers.logDeploy('UniswapDAO',dao);
      Helpers.logDeploy('UniswapV2Router02', uniswapV2Router);
      Helpers.logDeploy('SetDaoIntitial', setDaoIntitial);
      Helpers.logDeploy('SetRouter', setRouter);
  });

/*========== WETH ==========*/
subtask("weth", "The contract WETH is deployed")
.setAction(async (taskArgs, { ethers, network }) => {
      const signer = (await ethers.getSigners())[0];

      const wethFactory = await ethers.getContractFactory("newWETH", signer);
      const weth = await (await wethFactory.deploy()).deployed();
      console.log(`The WETH: \u001b[1;34m${weth.address}\u001b[0m`);    
      return weth.address;
});

/*========== UniswapV2Factory ==========*/
subtask("factory", "The contract UniswapV2Factory is deployed")
      .setAction(async (_, { ethers, network }) => {
            const signer = (await ethers.getSigners())[0];
            const feeToSetter = signer.address;
            let treasuryAddress = signer.address;
            if(network.name === 'ultron_testnet') {
                  treasuryAddress = '0x68CbD167CB4a15f2400b4B3913252B6D9D9d7613';
            }

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
            const factoryAddress = "0x58e103F46b99014e1A28113C7434fDB05e84Fb2a";
            const daoAddress = "0xdC0E1b34406548e25D0250439e7f0069E65C3259";

            const UniswapV2Factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress, signer);
            const UniswapDAO = await ethers.getContractAt("UniswapDAO", daoAddress, signer);

            const feeToAddress = "0x02504c5022A62f88224E5756EC62f9b00f52dF06" // brewETH

            await UniswapDAO.newFeeToChangeRequest(feeToAddress);
            await Helpers.delay(4000);
            await UniswapV2Factory.setFeeTo(1);
            await Helpers.delay(4000);

            console.info(await UniswapV2Factory.feeTo());
      })

task("add-liq", "adding liq for tokens")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x1abc0EfCBB786A6A254ef7B639e6AeD426eD9876";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer); 

          const usdc = '0xFac94031AA8f09e2858F93974178fd70F276EAD1';
          const avax = '0xA066a85923dFB145B947EB4A74c6e0ad7CEAE193';
          const dai = '0x9d40F4A04C737887a79902Caa7cE8003197D8B1C';
          const wulx = '0xE2619ab40a445526B0AaDff944F994971d2EAc05';
          const shib = '0x29263214978Db13A1b1cA0381f58Ca7b2054588c';

          const tokenAddress0 = wulx;
          const tokenAddress1 = shib;

          const token0 = await ethers.getContractAt("ERC20test", tokenAddress0, signer);
          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);   
      
          const amountADesired = ethers.utils.parseUnits("100", 18);
          const amountBDesired = ethers.utils.parseUnits("100000", 18);
          
          const amountAMin = ethers.utils.parseUnits("100", 18);
          const amountBMin = ethers.utils.parseUnits("100000", 18);

          await token0.approve(routerAddress, amountADesired);
          await token1.approve(routerAddress, amountBDesired);

          await UniswapV2Router.addLiquidity(tokenAddress0, tokenAddress1, amountADesired, amountBDesired, amountAMin, amountBMin, signer.address, Date.now() + 20, { gasLimit: 3100000 });
      });

task("add-eth-liq", "adding liq for tokens")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x1abc0EfCBB786A6A254ef7B639e6AeD426eD9876";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer); 

          const tokenAddress0 = "0x0ec8bD3fb03dDb651eD654B941E8a3B7A4c7170E";
          const tokenAddress1 = "0xa0A30a188269dBB6A446f180B21CeB5f169f9A20"

          const token0 = await ethers.getContractAt("ERC20test", tokenAddress0, signer);
          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);   
      
          const amountADesired = ethers.utils.parseUnits("20", 18);
          const amountBDesired = ethers.utils.parseUnits("20", 18);
          
          const amountAMin = ethers.utils.parseUnits("20", 18);
          const amountBMin = ethers.utils.parseUnits("20", 18);

          await token0.approve(routerAddress, amountADesired);
          await UniswapV2Router.addLiquidityETH(tokenAddress0, amountADesired, 0, 0, signer.address, Date.now() + 20, { gasLimit: 3100000, value: amountBDesired });
          
          await token1.approve(routerAddress, amountBDesired);
          await UniswapV2Router.addLiquidityETH(tokenAddress1, amountADesired, amountAMin, amountBMin, signer.address, Date.now() + 20, { gasLimit: 3100000, value: amountBDesired });
      });

task("swap", "swap token0 for token1")
      .setAction(async (_, { ethers }) => {
          const signer = (await ethers.getSigners())[0];
          const routerAddress = "0x1abc0EfCBB786A6A254ef7B639e6AeD426eD9876";
          const UniswapV2Router = await ethers.getContractAt("UniswapV2Router02", routerAddress, signer); 

          const tokenAddress1 = "0x0ec8bD3fb03dDb651eD654B941E8a3B7A4c7170E";
          const tokenAddress2 = "0xa0A30a188269dBB6A446f180B21CeB5f169f9A20"

          const token1 = await ethers.getContractAt("ERC20test", tokenAddress1, signer);
          const token2 = await ethers.getContractAt("ERC20test", tokenAddress2, signer);

          const amountADesired = ethers.utils.parseUnits("20", 18);
          const amountBDesired = ethers.utils.parseUnits("20", 18);

          await token1.approve(UniswapV2Router.address, amountADesired);
          await token2.approve(UniswapV2Router.address, amountBDesired);
          await UniswapV2Router.swapExactTokensForTokens(amountADesired, 0, [token1.address, token2.address], signer.address, Date.now() + 20, { gasLimit: 3045000 });    
      });
