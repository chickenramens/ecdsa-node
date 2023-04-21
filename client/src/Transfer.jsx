import { useState } from "react";
import server from "./server";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import {toHex} from "ethereum-cryptography/utils";
import {keccak256} from "ethereum-cryptography/keccak";

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const data = {
      amount: parseInt(sendAmount),
      recipient
    };

    const messageHash = keccak256(new TextEncoder().encode(JSON.stringify(data)));
    const signature = secp256k1.sign(messageHash, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: {
          r: signature.r.toString(),
          s: signature.s.toString(),
          recovery: signature.recovery.toString()
        },
        amount: parseInt(sendAmount),
        recipient,
        msgHash: toHex(messageHash)
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
