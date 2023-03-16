import fs from 'node:fs/promises'
import { task, types } from 'hardhat/config'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'

task('verify-code', 'Compare code for UniswapV2Factory contract')
  .addParam<string>('contractName', 'Contract name', undefined, types.string)
  .addParam<string>('contractAddress', 'Contract address', undefined, types.string)
  .setAction(async ({ contractAddress, contractName }, { ethers, run, network, config }) => {
    await run(TASK_COMPILE)

    const { compilers } = config.solidity
    if (!compilers.length) {
      throw new Error('No compiler configuration found')
    }
    const {
      version,
      settings: { optimizer },
    } = compilers[0]

    console.log(`Network: ${network.name}`)
    console.log(`Solidity compiler version: ${version}`)
    console.log(`Solidity compiler optimizater enabled: ${optimizer.enabled}`)
    console.log(`Solidity compiler optimizater runs: ${optimizer.runs}`)
    console.log(`Contract name: ${contractName}`)
    console.log(`Contract address: ${contractAddress}`)

    const artifact = await fs.readFile(`./artifacts/contracts/${contractName}.sol/${contractName}.json`)
    const { deployedBytecode: buildCode } = JSON.parse(artifact.toString())

    const chainCode = await ethers.provider.getCode(contractAddress)
    console.log(`Build code matches chain code: ${buildCode === chainCode}`)

    await fs.rm('./build', { recursive: true, force: true })
    await fs.mkdir('./build')

    const buildCodeFilePath = `./build/build-code-${contractName}.txt`
    await fs.writeFile(buildCodeFilePath, buildCode)
    console.log(`Build code saved to ${buildCodeFilePath}`)

    const chainCodeFilePath = `./build/chain-code-${contractName}.txt`
    await fs.writeFile(`./build/chain-code-${contractAddress}.txt`, chainCode)
    console.log(`Chain code saved to ${buildCodeFilePath}`)
  })
