import fs from 'node:fs/promises'
import { HttpNetworkUserConfig } from 'hardhat/types'
import { task, types } from 'hardhat/config'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'
import { ethers } from 'hardhat'
import { getContractAddress } from '@ethersproject/address'

task('verify-creation-bytecode', 'Verify contract creation bytecode')
  .addParam<string>('contractName', 'Contract name', undefined, types.string)
  .addParam<string>('contractAddress', 'Contract address', undefined, types.string)
  .addParam<string>('transaction', 'Contract creation transaction hash', undefined, types.string)
  .addVariadicPositionalParam('constructorArguments', 'Contract constructor arguments', [], types.string)
  .addOptionalParam<string>('folder', 'Contract folder', undefined, types.string)
  .addOptionalParam<string>('lpPair', 'Liquidity pool pair', undefined, types.string)
  .setAction(
    async (
      { contractAddress, contractName, transaction: transactionHash, constructorArguments, folder, lpPair },
      { ethers, run, network }
    ) => {
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

      const remoteBytecode = await getRemoteBytecode(ethers, contractAddress, transactionHash)
      const localBytecode = await getLocalBytecode(ethers, contractName, constructorArguments, folder)
      if (localBytecode.length !== remoteBytecode.length) {
        throw new Error(
          `Local bytecode size doesn't match remote bytecode size: ${localBytecode.length} != ${remoteBytecode.length}`
        )
      }

      console.log(
        `\nLocal bytecode matches remote bytecode by ${calculateSimilarityRatio(localBytecode, remoteBytecode)}%`
      )

      await fs.rm('./build', { recursive: true, force: true })
      await fs.mkdir('./build')

      const localBytecodeFilePath = `./build/${contractName}-${lpPair ? `${lpPair}-` : ''}local.bin-runtime`
      await fs.writeFile(localBytecodeFilePath, localBytecode)
      console.log(`Local bytecode saved to ${localBytecodeFilePath}`)

      const remoteBytecodeFilePath = `./build/${contractName}-${lpPair ? `${lpPair}-` : ''}remote.bin-runtime`
      await fs.writeFile(remoteBytecodeFilePath, remoteBytecode)
      console.log(`Remote bytecode saved to ${remoteBytecodeFilePath}`)
    }
  )

async function getRemoteBytecode(
  eth: typeof ethers,
  deployedContractAddress: string,
  transactionHash: string
): Promise<string> {
  const { data: creationCode, from, nonce } = await eth.provider.getTransaction(transactionHash)

  const calculatedContractAddress = getContractAddress({ from, nonce })
  if (deployedContractAddress !== calculatedContractAddress) {
    throw new Error(`Invalid contract address: expected ${deployedContractAddress}, got ${calculatedContractAddress}`)
  }
  return creationCode
}

async function getLocalBytecode(
  eth: typeof ethers,
  contractName: string,
  constructorArguments: string[],
  folder: string
): Promise<string> {
  const artifact = await fs.readFile(
    `./artifacts/contracts/${folder ? `${folder}/` : '/'}${contractName}.sol/${contractName}.json`
  )
  const { bytecode: compiledBytecode, abi }: { bytecode: string; abi: string } = JSON.parse(artifact.toString())
  const iface = new eth.utils.Interface(abi)
  const encodedConstructorArgs = iface.encodeDeploy(constructorArguments).slice(2)
  return compiledBytecode + encodedConstructorArgs
}

function calculateSimilarityRatio(localBytecode: string, remoteBytecode: string, digits = 4): string {
  let matchCount = 0
  for (let i = 0; i < localBytecode.length; i++) {
    if (localBytecode[i] === remoteBytecode[i]) {
      matchCount++
    }
  }

  const similarityRatio = (matchCount / localBytecode.length) * 100
  return similarityRatio.toFixed(digits)
}
