const axios = require("axios");

async function fetchTransactions(address) {
  try {
    const url = `http://localhost:3000/events/transactions?address=${address}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      console.log(
        "Successfully fetched the latest transaction:",
        response.data
      );
    } else {
      console.log(
        "Failed to fetch transaction:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`No transaction found for address ${address}`);
    } else {
      console.error("An error occurred:", error);
    }
  }
}

const address = "0x9Fdd6069b4DBb60cE882066dF7E11F0f12B7aFC7";
fetchTransactions(address);
