import React, { useState, useRef } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import './HomePage.css'; // 导入 HomePage.css

// USDT 合约地址
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7' as const;

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
} as const;

interface TransferData {
  blockNumber: bigint;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  link: string;
}

const WatchUsdt: React.FC = () => {
  const [minAmount, setMinAmount] = useState<number>(10000);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const unwatchRef = useRef<(() => void) | null>(null);

  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const simplifyAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const simplifyHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  const startMonitoring = async () => {
    if (unwatchRef.current) return; // 防止重复启动

    const unwatch = client.watchEvent({
      address: USDT_ADDRESS,
      event: transferEventAbi,
      onLogs: (logs) => {
        logs.forEach(log => {
          const { args, transactionHash, blockNumber } = log;
          const amount = Number(args.value) / 1e6;
          if (amount >= minAmount) {
            const txHash = simplifyHash(transactionHash);
            const fromAddr = args.from ? simplifyAddress(args.from) : 'unknown';
            const toAddr = args.to ? simplifyAddress(args.to) : 'unknown';
            const formattedAmount = amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            setTransfers(prev => [{
              blockNumber,
              txHash,
              from: fromAddr,
              to: toAddr,
              amount: formattedAmount,
              link: `https://etherscan.io/tx/${transactionHash}`,
            }, ...prev.slice(0, 99)]); // 限制显示100条
          }
        });
      },
      onError: (error) => {
        console.error('USDT 事件监听错误:', error);
      },
    });

    unwatchRef.current = unwatch;
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    if (unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
      setIsMonitoring(false);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  return (
    <div className="pages">
      <h1>USDT Transfer Monitor</h1>
      <div className="advice">
        <label>
          Minimum Amount (USDT): 
          <input
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(Number(e.target.value))}
            disabled={isMonitoring} // 监听时禁用输入
          />
        </label>
        <button onClick={toggleMonitoring}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Block</th>
            <th>Tx Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Amount (USDT)</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, index) => (
            <tr key={index}>
              <td>{transfer.blockNumber.toString()}</td>
              <td>
                <a href={transfer.link} target="_blank" rel="noopener noreferrer" className="link">{transfer.txHash}</a>
              </td>
              <td>{transfer.from}</td>
              <td>{transfer.to}</td>
              <td className="amount">{transfer.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WatchUsdt;