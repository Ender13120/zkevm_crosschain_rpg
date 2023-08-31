const axios = require("axios");

async function getProofFromLocalEndpoint(
  l1TxHash,
  l1Contract,
  l2Contract
) {
  try {
    const url = `http://localhost:3000/proof-assistant-polygon/getProof/${l1TxHash}/${l1Contract}/${l2Contract}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `Failed to get proof, status code: ${response.status}, status text: ${response.statusText}`
      );
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(
        `An error occurred: ${error.response.data.message} (Status code: ${error.response.status})`
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`An error occurred: ${error.message}`);
    }
  }
}

// Function to fetch the latest transaction for a given address
async function fetchTransactions(address) {
  try {
    const url = `http://localhost:3000/events/transactions?address=${address}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `Failed to fetch transaction: ${response.status}, ${response.statusText}`
      );
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // No transaction found for the address
    } else {
      throw new Error(`An error occurred: ${error}`);
    }
  }
}

// Main function to combine the two tasks
async function main() {
  try {
    //player address
    const address = "0x9Fdd6069b4DBb60cE882066dF7E11F0f12B7aFC7";
    //diamond contract addresses.
    const l1Contract = "0x7694751f9846f9c1c75115275C2e4CD785882720";
    const l2Contract = "0xFa2D2883E4312f225E8B64cc3a4202404AeC39D8";

    // Fetch the latest transaction for the address
    const transaction = await fetchTransactions(address);

    if (transaction) {
      console.log(
        "Successfully fetched the latest transaction:",
        transaction
      );

      // Fetch proof for the transaction
      const l1TxHash = transaction.transactionHash;
      console.log(l1TxHash);
      try {
        const proof = await getProofFromLocalEndpoint(
          l1TxHash,
          l1Contract,
          l2Contract
        );
        console.log(
          `Proof received for transaction ${l1TxHash}:`,
          proof
        );
      } catch (error) {
        if (error.message.includes("Status code: 404")) {
          console.error(
            "Zkproof has not been generated yet:",
            error.message
          );
        } else {
          console.error("An error occurred:", error);
        }
      }
    } else {
      console.log(`No transaction found for address ${address}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
