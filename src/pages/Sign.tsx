import React, { useState } from 'react';
import './Default.css';
import { SignMessage } from '../components/SignMessage';
import SignTransaction from '../components/SignTransaction';

export function Sign() {
  const [selectedOption, setSelectedOption] = useState('message');

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className='pages'>
      <br />
      <appkit-button />
      <div>
        <section>
            <label>
            <input
                type="radio"
                value="message"
                checked={selectedOption === 'message'}
                onChange={handleOptionChange}
            />
            Sign Message
            </label>
            <label>
            <input
                type="radio"
                value="transaction"
                checked={selectedOption === 'transaction'}
                onChange={handleOptionChange}
            />
            Sign EIP-2612 Transaction
            </label>
        </section>
      </div>

      {selectedOption === 'message' && <SignMessage />}
      {selectedOption === 'transaction' && <SignTransaction />}
    </div>
  );
}

export default Sign;