const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

let whitelist = require("./whitelist");

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

let merkleTree;

let addresses = whitelist.addresses.map((item) => item.toLowerCase());

const setMerkle = () => {
  let leafNodes = addresses.map((addr) => keccak256(addr));
  merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
};

const getRoot = () => {
  setMerkle();
  let rootHash = merkleTree.getRoot().toString("hex");
  return rootHash;
};

const getProof = (address) => {
  setMerkle();
  let hashedAddress = keccak256(address);
  let proof = merkleTree.getHexProof(hashedAddress);
  return proof;
};

app.get("/", (req, res) => {
  res.json("Hello from the TypeScript world!");
});

app.get("/all", (req, res) => {
  res.json({ addresses: addresses });
});

app.get("/add/:address", (req, res) => {
  if (!addresses.includes(req.params.address)) {
    addresses.push(req.params.address);
    res.json({ addresses: addresses });
  } else {
    res.json({ root: "Address already exists" });
  }
});

app.get("/hash", (req, res) => {
  res.json({ root: getRoot(addresses), addresses: addresses });
});

app.get("/get/:address", (req, res) => {
  res.json({ proof: getProof(req.params.address) });
});

app.listen(PORT, () => console.log(`Running on ${PORT}!`));
