import { useAppKitAccount, useAppKitNetworkCore } from '@reown/appkit/react'
import { useReadContract, useSignTypedData, useWriteContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { type Address, parseSignature } from 'viem'
import { ERC20Abi, tokenBankABI } from './abi'

// EIP-2612 类型定义
const types = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: "deadline", type: "uint256" }
  ]
}

const ERC20Address = '0x8364dBE3F69961a0A15039A8a84542C25DAf153b' //verifyingContract
const tokenBankAddress ='0x111D07Ec24Ff76ecEFA35AF72c7ddaB9b5692591' //spender

export function SignTransaction() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetworkCore()

  // domain 参数状态
  const [domainParams, setDomainParams] = useState({
    name: 'Contract Name',
    version: '1',
    chainId: chainId,
    verifyingContract: ERC20Address
  })

  // 监听 chainId 的变化，并更新 domainParams.chainId
  useEffect(() => {
    setDomainParams(prev => ({
      ...prev,
      chainId: chainId
    }))
  }, [chainId])

  // 交易参数状态
  const [txParams, setTxParams] = useState({
    owner: address,
    spender: tokenBankAddress,
    value: '',
    deadline: '1800000000',
    nonce: ''
  })

  // 监听 address 的变化，并更新 txParams.owner
  useEffect(() => {
    setTxParams(prev => ({
      ...prev,
      owner: address
    }))
  }, [address])

  const { refetch: refetchName } = useReadContract({
    address: domainParams.verifyingContract as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'name',
    query:{enabled: false}, // disable the query on load
  })

  const {refetch: refetchBalance} = useReadContract({
    address: domainParams.verifyingContract as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query:{enabled: false}, // disable the query on load
  })

  const { refetch: refetchNonce } = useReadContract({
    address: domainParams.verifyingContract as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'nonces',
    args: [address as `0x${string}`],
    query:{enabled: false}, // disable the query on load
  })

  const updateContractDetail = async () => {
    console.log("Start Reading Contract");
    console.log("Contract: ", domainParams.verifyingContract)
    const contractName = (await refetchName()).data;
    const balance = (await refetchBalance()).data;
    const nonce = (await refetchNonce()).data;
    console.log("Contract Name: ", contractName)
    console.log("balance: ", balance)
    console.log("nonce: ", nonce)

    setDomainParams(prev => ({
      ...prev,
      name: contractName?.toString() || 'Contract Name'
    })) 

    setTxParams(prev => ({
      ...prev,
      nonce: nonce ? nonce.toString() : ''
    }))
  }

  const [signedTx, setSignedTx] = useState('')

  const [signatureDetails, setSignatureDetails] = useState({ v: BigInt(0), r: "", s: "" })

  const { signTypedDataAsync } = useSignTypedData()

  const handleSignTx = async () => {
    try {
      const domain = {
        name: domainParams.name,
        version: domainParams.version,
        chainId: Number(domainParams.chainId),
        verifyingContract: domainParams.verifyingContract as `0x${string}`
      }

      const message = {
        owner: address as Address,
        spender: txParams.spender as Address,
        value: BigInt(txParams.value || '0'),
        nonce: BigInt(txParams.nonce || '0'),
        deadline: BigInt(txParams.deadline || '0')
      }

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Permit',
        message,
      })

      if (signature.length === 132) {
        const { v, r, s } = parseSignature(signature)
        console.log(v, r, s)
        setSignatureDetails({ v: v ?? BigInt(0), r: r ?? "", s: s ?? "" })
      } else {
        setSignatureDetails({ v: BigInt(0), r: "Invalid", s: "Invalid" })
      }

      setSignedTx(signature)
    } catch (error) {
      console.error('Signing failed:', error)
      setSignedTx('Error: Signing failed')
    }
  }

  const { writeContract, isPending, isSuccess } = useWriteContract()

  const sendTransaction = async () => {
    writeContract({
      address: tokenBankAddress as `0x${string}`,
      abi: tokenBankABI,
      functionName: 'permitDeposit',
      args: [
        domainParams.verifyingContract as `0x${string}`, 
        // txParams.owner as `0x${string}`,
        BigInt(txParams.value || '0'), 
        BigInt(txParams.deadline || '0'), 
        Number(signatureDetails.v), 
        signatureDetails.r as `0x${string}`, 
        signatureDetails.s as `0x${string}`
      ],
    })
    console.log("Send Transaction", isPending, isSuccess)
  }

  // 处理输入变化
  const handleDomainInputChange = (field: keyof typeof domainParams) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDomainParams(prev => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  const handleTxInputChange = (field: keyof typeof txParams) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTxParams(prev => ({
        ...prev,
        [field]: e.target.value
      }))
    }

  return (
    <div className='pages'>
      <h1>Sign EIP-2612 Transaction</h1>
      {isConnected && (
        <div>
          <section>
            操作说明：<br />
            · ERC20地址填入Verifying Contract<br />
            · Token Bank地址填入Spender<br />
            · 然后点击【按钮1】更新Name, Nonce<br />
            · 填满其他空格<br />
            · 【按钮2】签名交易<br />
            · 【按钮3】发送交易<br />
          </section>
          <section>
            <h2>Domain Parameters</h2>
            <label>
              Name:
              <input
                type="text"
                value={domainParams.name}
                onChange={handleDomainInputChange('name')}
                placeholder="TransactionSigner"
              />
            </label>
            <label >
              Version:
              <input
                type="text"
                value={domainParams.version}
                onChange={handleDomainInputChange('version')}
                placeholder="1"
              />
            </label>
            <label >
              Chain ID:
              <input
                type="number"
                value={domainParams.chainId}
                onChange={handleDomainInputChange('chainId')}
                placeholder=""
              />
            </label>
            <label >
              Verifying Contract:
              <input
                type="text"
                value={domainParams.verifyingContract}
                onChange={handleDomainInputChange('verifyingContract')}
                placeholder="0x..."
              />
            </label>
          </section>

          <section>
            <h2>Transaction Parameters</h2>
            <label >
              Owner:
              <input
                type="text"
                value={txParams.owner}
                onChange={handleTxInputChange('owner')}
                // placeholder="0x..."
              />
            </label>
            <label >
              Spender:
              <input
                type="text"
                value={txParams.spender}
                onChange={handleTxInputChange('spender')}
                placeholder="0x..."
              />
            </label>
            <label >
              Value:
              <input
                type="number"
                value={txParams.value}
                onChange={handleTxInputChange('value')}
                placeholder="0"
              />
            </label>
            <label >
              Nonce:
              <input
                type="number"
                value={txParams.nonce}
                onChange={handleTxInputChange('nonce')}
                placeholder="0"
              />
            </label>
            <label >
              Deadline:
              <input
                type="number"
                value={txParams.deadline}
                onChange={handleTxInputChange('deadline')}
                placeholder="0"
              />
            </label>
            <button onClick={updateContractDetail}>1. Update Contract Detail by address</button>
            <button onClick={handleSignTx}>2. Sign Transaction</button>
            <button onClick={sendTransaction}>3. Send Transaction</button>
          </section>
          
          {signedTx && (
            <section>
              <h2>Signed Transaction</h2>
              <pre>Signature: {signedTx}</pre>
              <pre>v: {signatureDetails.v.toString()}</pre>
              <pre>r: {signatureDetails.r}</pre>
              <pre>s: {signatureDetails.s}</pre>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default SignTransaction