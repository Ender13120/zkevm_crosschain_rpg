const axios = require("axios");

async function getProofFromLocalEndpoint(
  l1TxHash,
  l1Contract,
  l2Contract
) {
  return new Promise(async (resolve, reject) => {
    const url = `http://localhost:3000/proof-assistant-polygon/getProof/${l1TxHash}/${l1Contract}/${l2Contract}`;
    try {
      const response = await axios.get(url);

      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(
          `Failed to get proof, status code: ${response.status}, status text: ${response.statusText}`
        );
      }
    } catch (error) {
      reject(`An error occurred: ${error}`);
    }
  });
}

// Usage Example
const l1TxHash = "your_l1_transaction_hash_here";
const l1Contract = "0x7694751f9846f9c1c75115275C2e4CD785882720";
const l2Contract = "0xFa2D2883E4312f225E8B64cc3a4202404AeC39D8";

getProofFromLocalEndpoint(l1TxHash, l1Contract, l2Contract)
  .then((data) => {
    console.log("Proof received:", data);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
