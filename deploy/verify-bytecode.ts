import fs from 'node:fs/promises'
import { HttpNetworkUserConfig } from 'hardhat/types'
import { task, types } from 'hardhat/config'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'

task('verify-bytecode', "Verify contract's bytecode")
  .addParam<string>('contractName', 'Contract name', undefined, types.string)
  .addParam<string>('contractAddress', 'Contract address', undefined, types.string)
  .addOptionalParam<string>('mode', 'Verification mode: partial or full', 'partial', types.string)
  .addOptionalParam<string>('folder', 'Contract folder', undefined, types.string)
  .addOptionalParam<string>('lpPair', 'Liquidity pool pair', undefined, types.string)
  .setAction(async ({ contractAddress, contractName, mode, folder, lpPair }, { ethers, run, network }) => {
    await run(TASK_COMPILE, {
      force: true,
      noTypechain: true,
    })

    const networkConfig = network.config as HttpNetworkUserConfig
    console.log(`Network: ${network.name}`)
    console.log(`Chain id: ${networkConfig.chainId}`)
    console.log(`Provider URL: ${networkConfig.url}`)
    console.log(`\nContract name: ${contractName}`)
    console.log(`Contract address: ${contractAddress}`)
    if (lpPair) {
      console.log(`Liquidity pool pair: ${lpPair}`)
    }

    const artifact = await fs.readFile(
      `./artifacts/contracts/${folder ? `${folder}/` : '/'}${contractName}.sol/${contractName}.json`
    )
    const { deployedBytecode: localBytecode } = JSON.parse(artifact.toString())

    const remoteBytecode = await ethers.provider.getCode(contractAddress)
    if (localBytecode.length != remoteBytecode.length) {
      throw new Error(
        `Local bytecode size doesn't match remote bytecode size: ${localBytecode.length} != ${remoteBytecode.length}`
      )
    }

    console.log(
      `\nLocal bytecode matches remote bytecode by ${calculateSimilarityRatio(
        adjustCheckedBytecode(localBytecode, mode),
        adjustCheckedBytecode(remoteBytecode, mode)
      )}%`
    )

    await fs.rm('./build', { recursive: true, force: true })
    await fs.mkdir('./build')

    const localBytecodeFilePath = `./build/${contractName}-${lpPair}-local.bin-runtime`
    await fs.writeFile(localBytecodeFilePath, localBytecode)
    console.log(`Local bytecode saved to ${localBytecodeFilePath}`)

    const remoteBytecodeFilePath = `./build/${contractName}-${lpPair}-remote.bin-runtime`
    await fs.writeFile(remoteBytecodeFilePath, remoteBytecode)
    console.log(`Remote bytecode saved to ${remoteBytecodeFilePath}`)
  })

const METADATA_SIZE = 106

function adjustCheckedBytecode(bytecode: string, mode: 'partial' | 'full') {
  return mode === 'full' ? bytecode : bytecode.slice(0, -METADATA_SIZE)
}

function calculateSimilarityRatio(localBytecode: string, remoteBytecode: string, digits = 4): string {
  let matchCount = 0
  for (let i = 0; i < localBytecode.length; i++) {
    if (localBytecode[i] == remoteBytecode[i]) {
      matchCount++
    }
  }

  const similarityRatio = (matchCount / localBytecode.length) * 100
  return similarityRatio.toFixed(digits)
}
