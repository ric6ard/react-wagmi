import { useState } from 'react'

import { ActionButtonList } from '../components/ActionButtonList'
import { SmartContractActionButtonList } from '../components/SmartContractActionButtonList'
import { InfoList } from '../components/InfoList'

import "./Default.css"

export function HomePage() {
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [signedMsg, setSignedMsg] = useState('');
  const [balance, setBalance] = useState('');

  const receiveHash = (hash: `0x${string}`) => {
    setTransactionHash(hash); // Update the state with the transaction hash
  };

  const receiveSignedMsg = (signedMsg: string) => {
    setSignedMsg(signedMsg); // Update the state with the transaction hash
  };

  const receivebalance = (balance: string) => {
    setBalance(balance)
  }


  return (
    <div className={"pages"}>
      {/* <img src="/reown.svg" alt="Reown" style={{ width: '150px', height: '150px' }} /> */}
      <h1>Wallet Connect Example</h1>
            <appkit-button />
            <ActionButtonList sendHash={receiveHash} sendSignMsg={receiveSignedMsg} sendBalance={receivebalance}/>
            <SmartContractActionButtonList />
            <InfoList hash={transactionHash} signedMsg={signedMsg} balance={balance}/>
    </div>
  )
}

export default HomePage
