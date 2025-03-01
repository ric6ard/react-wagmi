import { createPublicClient, http, decodeEventLog } from 'viem'
import { mainnet } from 'viem/chains'
import 'dotenv/config'

// USDT 合约地址
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'

// USDT Transfer 事件 ABI
const transferEventAbi = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: false, name: 'value', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
}

// 创建公共客户端
const url = `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

// 简化地址和哈希的函数
const simplifyAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`
const simplifyHash = (hash) => `${hash.slice(0, 6)}...${hash.slice(-4)}`

// 监听新区块
async function watchBlocks() {
  const unwatch = client.watchBlocks({
    onBlock: (block) => {
      const blockHash = simplifyHash(block.hash)
      console.log(`新区块: 高度: ${block.number}, 哈希: ${blockHash}。
        链接: https://etherscan.io/block/${block.number}`)
    },
    onError: (error) => {
      console.error('区块监听错误:', error)
    }
  })
}

// 监听 USDT Transfer 事件
async function watchUSDTEvents(minAmount) {
  const unwatch = client.watchEvent({
    address: USDT_ADDRESS,
    event: transferEventAbi,
    onLogs: (logs) => {
      logs.forEach(log => {
        const { args, transactionHash, blockNumber } = log
        const amount = Number(args.value) / 1e6
        if (amount >= minAmount) {
            const txHash = simplifyHash(transactionHash)
            const fromAddr = simplifyAddress(args.from)
            const toAddr = simplifyAddress(args.to)
            const formattedAmount = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            
            console.log(`新USDT转账: 区块: ${blockNumber}，哈希: ${txHash}，从 ${fromAddr} 到 ${toAddr}，金额: \x1b[32m${formattedAmount} USDT\x1b[0m。
            链接: https://etherscan.io/tx/${transactionHash}`)
            }
      })
    },
    onError: (error) => {
      console.error('USDT 事件监听错误:', error)
    }
  })
}

// 启动监听
async function startMonitoring() {
  try {
    console.log('开始监听区块链数据...')
    await Promise.all([
      watchBlocks(),
      watchUSDTEvents(10000)
    ])
  } catch (error) {
    console.error('监听启动失败:', error)
  }
}

// 运行程序
startMonitoring()