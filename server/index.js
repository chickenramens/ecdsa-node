const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp256k1 = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "0363e26188d18f702cb7f81d7af4b6fc5b95fb8fccdca64783f433666dd412dfe3": 100, // a5114b2ec6c2bf69fefb54751dafb16d84a4ec042dad3b9e209144724e5b2b39
  "02570174e82de4e73bdfadda299a5ff5c2156a07ca7037fcc8ae15d9289743a799": 50,  // e59265eb1fe2fa59ba43172e8c41c280d6210c6225695733a668319a5f352810
  "033e1df737e4c78711c4e8076860bbf549cab0edde7563b0566ef398c1ba43bec7": 75,  // 82a3decd03c5847280bb328a41a15dd9ec52a8614b66af98123a7c588f286a6f
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //get a signature from the client-side application
  const { signature, amount, recipient, msgHash } = req.body;

  //recover the public addresss from the signature
  var sig = new secp256k1.secp256k1.Signature(BigInt(signature.r), BigInt(signature.s));
  sig = sig.addRecoveryBit(parseInt(signature.recovery));
  const sender = sig.recoverPublicKey(msgHash).toHex();

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
