import { subtask, task, types } from "hardhat/config";

task("deploy", "Deploy")
  .addParam("setter", "feeToSetter Factory", "", types.string)
  .addParam("factory", "Factory address", "", types.string)
  .addParam("wulx", "wULX address", "", types.string)
  .setAction(async (taskArgs, {ethers}) => {
        let FactoryAddress = taskArgs.factory
        if (FactoryAddress === "" && taskArgs.setter !== "") {
              const Factory = await ethers.getContractFactory("UniswapV2Factory");
              const factory = await Factory.deploy(taskArgs.setter);
              await factory.deployed();
              FactoryAddress = factory.address
              console.log("Factory deployed to:", FactoryAddress);
          }
        if (taskArgs.wulx !== "" && FactoryAddress !== "") {
              const Router = await ethers.getContractFactory("UniswapV2Router02");
              const router = await Router.deploy(FactoryAddress, taskArgs.wulx);
              await router.deployed();
              console.log("Router deployed to:", router.address);
        }
  });
