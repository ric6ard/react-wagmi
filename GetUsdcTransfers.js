import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';


const client = createPublicClient({chain: mainnet,transport: http(),});
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

// 定义 USDC 合约的 ABI，仅包含 Transfer 事件
const usdcAbi = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256' },
    ],
  },
];

// 获取最近 100 个区块的 USDC 转账记录
async function getUsdcTransfers() {
  const currentBlock = await client.getBlockNumber();
  const fromBlock = currentBlock - 99n;
  const toBlock = currentBlock;

  // 查询 Transfer 事件
  const events = await client.getContractEvents({
    address: usdcAddress,
    abi: usdcAbi,
    eventName: 'Transfer',
    fromBlock,
    toBlock,
  });

  // 如果没有找到记录，输出提示
  if (events.length === 0) {
    console.log("没有找到转账记录。");
    return;
  }

  // 遍历事件，格式化并输出
  for (const event of events) {
    const from = event.args.from;
    const to = event.args.to;
    const value = event.args.value;
    const transactionHash = event.transactionHash;

    // 转换金额（USDC 有 6 位小数）
    const amount = (Number(value) / 1000000).toFixed(5);

    // 按格式输出
    console.log(`从 ${from} 转账给 ${to} ${amount} USDC, 交易 ID: ${transactionHash}`);
  }
}

// 执行函数并处理可能的错误
getUsdcTransfers().catch((error) => {
  console.error(error);
});