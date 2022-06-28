import {ethers} from "hardhat";
import { UniswapV2Router02, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Router02__factory, ERC20test, ERC20test__factory, WETH, WETH__factory, IUniswapV2Pair__factory } from "../typechain-types";
import {expect} from "chai";
import { BigNumber, utils } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("\x1b[33mUniswap test\x1b[0m\n", () => {
    const beforeTest = "\t";
    const insideTest = "\t\t";
    const colorRed = "\x1b[31m";
    const colorGreen = "\x1b[32m";
    const colorBlue = "\x1b[36m";
    const colorReset = "\x1b[0m";

    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    let provider: any;
    let accounts: SignerWithAddress[];

    let owner: SignerWithAddress;
    let treasuryAccount: SignerWithAddress;

    let factory: UniswapV2Factory;
    let router: UniswapV2Router02;
    let weth: WETH;
    let token1: ERC20test;
    let token2: ERC20test;

    beforeEach(async () => {
        provider = ethers.provider;
    
        accounts = await ethers.getSigners();

        [ owner, treasuryAccount ] = await ethers.getSigners();

        const feeToSetter = owner.address;
        const treasuryAddress = treasuryAccount.address;

        factory = await (await new UniswapV2Factory__factory(owner).deploy(feeToSetter, treasuryAddress)).deployed();
        console.log(`${beforeTest}Deployed UniswapV2Factory contract: ${colorBlue}${factory.address}${colorReset}`);

        weth = await (await new WETH__factory(owner).deploy()).deployed();
        console.log(`${beforeTest}Deployed wETH contract: ${colorBlue}${weth.address}${colorReset}`);

        router = await (await new UniswapV2Router02__factory(owner).deploy(factory.address, weth.address)).deployed();
        console.log(`${beforeTest}Deployed UniswapV2Router02 contract: ${colorBlue}${router.address}${colorReset}`);
        
        await factory.connect(owner).setRouterAddress(router.address);
        console.log(`${beforeTest}${colorBlue}Inserted${colorReset} initial router address to factory: ${colorGreen}${router.address}${colorReset}`);    

        const totalSupply = ethers.utils.parseUnits("1000", 18);
        token1 = await (await new ERC20test__factory(owner).deploy(totalSupply, "MyToken1", "MYT1")).deployed();
        token2 = await (await new ERC20test__factory(owner).deploy(totalSupply, "MyToken2", "MYT2")).deployed();
    });

    it("Router contract address is zero address\n", async () => {
        await expect(factory.connect(owner).setRouterAddress(zeroAddress)).revertedWith("zero address");
    });

    it("Add liq if liq does not exist\n", async () => {       
        const amountADesired = ethers.utils.parseUnits("50", 18);
        const amountBDesired = ethers.utils.parseUnits("50", 18);
        
        const amountAMin = ethers.utils.parseUnits("40", 18);
        const amountBMin = ethers.utils.parseUnits("40", 18);

        await token1.connect(owner).approve(router.address, amountADesired);
        await token2.connect(owner).approve(router.address, amountBDesired);

        await router.connect(owner).addLiquidity(token1.address, token2.address, amountADesired, amountBDesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000 });
    });

    it("Add liq if liq exists and then remove it\n", async () => {       
        const amountADesired = ethers.utils.parseUnits("50", 18);
        const amountBDesired = ethers.utils.parseUnits("50", 18);
        
        const amountAMin = ethers.utils.parseUnits("40", 18);
        const amountBMin = ethers.utils.parseUnits("40", 18);

        await token1.connect(owner).approve(router.address, amountADesired);
        await token2.connect(owner).approve(router.address, amountBDesired);

        await router.connect(owner).addLiquidity(token1.address, token2.address, amountADesired, amountBDesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000 });
        
        await token1.connect(owner).approve(router.address, amountADesired);
        await token2.connect(owner).approve(router.address, amountBDesired);

        await router.connect(owner).addLiquidity(token1.address, token2.address, amountADesired, amountBDesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000 });    
    
        const pairAddress = await factory.connect(owner).getPair(token1.address, token2.address);
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress, owner);
        const pairBalance = await pair.balanceOf(owner.address);

        await pair.connect(owner).approve(router.address, pairBalance)

        await router.connect(owner).removeLiquidity(token1.address, token2.address, pairBalance, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000 });    
    });

    it("Add payable liq\n", async () => {       
        const amountADesired = ethers.utils.parseUnits("50", 18);
        const etherAmount = ethers.utils.parseEther("40.0");
        
        const amountAMin = ethers.utils.parseUnits("40", 18);
        const amountBMin = ethers.utils.parseUnits("40", 18);

        await token1.connect(owner).approve(router.address, amountADesired);

        await router.connect(owner).addLiquidityETH(token1.address, amountADesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000, value: etherAmount });
    });

    it("Add payable liq if liq exists and then remove it\n", async () => {       
        const amountADesired = ethers.utils.parseUnits("50", 18);
        const etherAmount = ethers.utils.parseEther("40.0");
        
        const amountAMin = ethers.utils.parseUnits("40", 18);
        const amountBMin = ethers.utils.parseUnits("40", 18);

        await token1.connect(owner).approve(router.address, amountADesired);

        await router.connect(owner).addLiquidityETH(token1.address, amountADesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000, value: etherAmount });
    
        await token1.connect(owner).approve(router.address, amountADesired);

        await router.connect(owner).addLiquidityETH(token1.address, amountADesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000, value: etherAmount });

        const pairAddress = await factory.connect(owner).getPair(token1.address, weth.address);
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress, owner);
        const pairBalance = await pair.balanceOf(owner.address);

        await pair.connect(owner).approve(router.address, pairBalance)

        await router.connect(owner).removeLiquidityETH(token1.address, pairBalance, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000 });    
    });

    it("swapExactTokensForETH in wETH pair\n", async () => {    
        const provider = ethers.getDefaultProvider();
    
        const balanceTreasuryBeforeToken1 = await token1.balanceOf(treasuryAccount.address);
        console.log(`balanceTreasuryBeforeToken1 ${balanceTreasuryBeforeToken1}`)

        const amountADesired = ethers.utils.parseUnits("50", 18);
        const etherAmount = ethers.utils.parseEther("40.0");
        
        const amountAMin = ethers.utils.parseUnits("40", 18);
        const amountBMin = ethers.utils.parseUnits("40", 18);

        await token1.connect(owner).approve(router.address, amountADesired);

        await router.connect(owner).addLiquidityETH(token1.address, amountADesired, amountAMin, amountBMin, owner.address, Date.now() + 20, { gasLimit: 3000000, value: etherAmount });

        await token1.connect(owner).approve(router.address, amountADesired);

        const balanceBeforeEther = await provider.getBalance(owner.address);
        console.log(`balanceBeforeEther ${balanceBeforeEther}`)

        const balanceTreasuryBeforeEther = await provider.getBalance(treasuryAccount.address);
        console.log(`balanceTreasuryBeforeEther ${balanceTreasuryBeforeEther}`)

        await router.connect(owner).swapExactTokensForETH(amountAMin, 1, [token1.address, weth.address], owner.address, Date.now() + 20, { gasLimit: 3000000 });    
    
        const balanceAfterEther = await provider.getBalance(owner.address);
        console.log(`balanceAfterEther ${balanceAfterEther}`)

        const balanceTreasuryAfterEther = await provider.getBalance(treasuryAccount.address);
        console.log(`balanceTreasuryAfterEther ${balanceTreasuryAfterEther}`)

        const balanceTreasuryAfterToken1 = await token1.balanceOf(treasuryAccount.address);
        console.log(`balanceTreasuryAfterToken1 ${balanceTreasuryAfterToken1}`)
    });
}) 