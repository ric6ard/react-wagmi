import  { useState } from 'react';
import { useSignMessage } from 'wagmi'
import { type Address } from 'viem'
import { useAppKitAccount } from '@reown/appkit/react';


export function SignMessage() {
    const { address, isConnected } = useAppKitAccount() // AppKit hook to get the address and check if the user is connected
    const [message, setMessage] = useState('');
    const [signedMsg, setSignedMsg] = useState('');
    const { signMessageAsync } = useSignMessage() // Wagmi hook to sign a message

    const handleSignMsg = async (msg:string) => {
        const sig = await signMessageAsync({ message: msg, account: address as Address }); 
        setSignedMsg(sig);
    };


    return (
        <div className='pages'>
            <h1>Sign Message</h1>
            {isConnected && (<div>
                <section>
                    <label>
                        Message: 
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage (e.target.value)}
                        />
                    </label>
                    <button onClick={() => handleSignMsg(message)}>Sign msg</button>
                </section>
                {signedMsg && (
                    <section >
                        <h2>Sign msg</h2>
                        <pre>signedMsg: {signedMsg}<br /></pre>
                    </section>
                )}
            </div>)}
        </div>
    )
}

export default SignMessage