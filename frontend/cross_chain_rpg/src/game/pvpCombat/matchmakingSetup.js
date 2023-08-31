// PVPMatchmakingSetupScene.js
import Phaser from "phaser";
import { ethers } from "ethers";
import { diamondL1ABI } from "./diamondABI.ts";
import CombatScene from "./combatScene.js";
class PVPMatchmakingSetupScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;

    // If there are specific contract variables or signer you need, set them here
    // Example:
    this.contract = config.contract;
    this.signer = config.signer;
    this.NFTContract = config.NFTContract;
    this.combatContract = null;
    this.ownedTokenIds = [];
  }

  preload() {
    this.load.image(
      "backgroundMatchmaking",
      "artwork/matchmaking_menu.jpg"
    );
  }

  create() {
    console.log("started");

    this.add.image(0, 0, "backgroundMatchmaking").setOrigin(0, 0);

    console.log(this.contract);
    console.log(this.signer);

    // Fetch and display NFTs owned by the user
    this.getOwnedNFTs();

    const startMatchmakingButton = this.add
      .text(330, 400, "Start Matchmaking", {
        fontFamily: "PixelArtFont",
        fontSize: "64px",
        fill: "#ffffff",
        align: "center",
        backgroundColor: "#000000",
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
      })
      .setInteractive();

    startMatchmakingButton.on(
      "pointerdown",
      this.startMatchmaking,
      this
    );
    startMatchmakingButton.on("pointerover", function () {
      this.setFill("#ff8800"); // Change to the color you want on hover, e.g., orange
      this.scene.game.canvas.style.cursor = "pointer";
    });

    startMatchmakingButton.on("pointerout", function () {
      this.setFill("#ffffff"); // Change back to the original color, e.g., white
      this.scene.game.canvas.style.cursor = "default";
    });

    // Go back button to return to the main menu
    const backButton = this.add
      .text(20, 20, "Back", {
        font: "24px Courier",
        fill: "#ffffff",
        align: "center",
        backgroundColor: "#000000",
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
      })
      .setInteractive();

    backButton.on("pointerdown", () => {
      this.backToMenu();
    });
  }

  backToMenu() {
    this.scene.stop("PVPMatchmakingSetupScene");
    this.scene.remove("PVPMatchmakingSetupScene");
    this.game.scene.start("GameScene");
  }

  async startMatchmaking() {
    // Wait for network to change, if it's not already the one we want.

    const networkChanged = await this.checkAndSwitchChainZKEVM();

    if (networkChanged) {
      //@TODO to be moved to the combatScene, this is just here to verify.

      await this.setupCombatInteractions();

      // Fetch the broadcasted NFTs
      const broadcastedNFTs = await this.getBroadcastedNFTs();

      const broadcastedNFTsArray = Array.from(broadcastedNFTs).map(
        (bigIntValue) => Number(bigIntValue)
      );

      console.log("Broadcasted NFTs: ", broadcastedNFTsArray);

      // Fetch team stats using the broadcasted NFTs
      let teamStats = await this.combatContract.getTeamStats(
        broadcastedNFTsArray
      );
      console.log("Team Stats: ", teamStats);

      console.log("Starting matchmaking...");

      // Mock waiting time for demonstration
      setTimeout(() => {
        console.log("Matchmaking completed. Opponent found!");
      }, 2000);
    } else {
      console.log(
        "Could not change network, not starting matchmaking."
      );
    }
  }

  async setupCombatInteractions() {
    let DIAMOND_ADDRESS_L2 =
      process.env.REACT_APP_CONTRACT_ADDRESS_L2;

    this.combatContract = new ethers.Contract(
      DIAMOND_ADDRESS_L2,
      diamondL1ABI,
      this.signer
    );

    // Add event listener for NewMatch event
    this.combatContract.on("NewMatch", (player1, player2, event) => {
      const address = this.signer.getAddress();
      if (player1 == address || player2 == address) {
        this.game.scene.stop("PVPMatchmakingSetupScene");
        this.game.scene.add(
          "CombatScene",
          new CombatScene(
            {
              key: "CombatScene",
              combatContract: this.combatContract,
              signer: this.signer,
            },
            this
          ),
          true
        );
      }
    });

    try {
      let tx = await this.combatContract.lookForMatch(
        this.ownedTokenIds
      );
      this.displayLoading(
        "waiting for transaction to be broadcasted"
      );

      await tx.wait();
      this.hideLoading();

      this.displayLoading("in queue!");
    } catch (error) {
      console.error("An error occurred:", error);
      if (
        error.message &&
        error.message.includes("match already running")
      ) {
        this.displayLoading(
          "Match is already running. Redirecting..."
        );
        console.log("Match is already running. Redirecting...");
        this.game.scene.stop("PVPMatchmakingSetupScene");
        this.game.scene.add(
          "CombatScene",
          new CombatScene(
            {
              key: "CombatScene",
              combatContract: this.combatContract,
              signer: this.signer,
            },
            this
          ),
          true
        );
      } else if (
        error.message &&
        error.message.includes("ownership not ")
      ) {
        this.displayLoading(
          "your team hasnt been confirmed on the zkEVM yet, please wait a couple minutes"
        );
      } else if (
        error.message &&
        error.message.includes("cannot play again")
      ) {
        console.log("triggered");
        this.displayLoading("Already in queue!");
      }
    }
  }

  displayLoading(text) {
    const loadingTextStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "32px",
      color: "#FFFF00", // Yellow color for loading
      align: "center",
      backgroundColor: "#000000",
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    };

    if (!this.loadingText) {
      this.loadingText = this.add
        .text(
          this.sys.game.config.width / 2,
          this.sys.game.config.height - 240,
          text,
          loadingTextStyle
        )
        .setOrigin(0.5);
    } else {
      this.loadingText.setVisible(true);
    }
  }

  hideLoading() {
    if (this.loadingText) {
      this.loadingText.setVisible(false);
    }
  }

  update() {
    // Update logic here
  }

  async getOwnedNFTs() {
    console.log("NFTContract:", this.NFTContract);

    const address = await this.signer.getAddress();
    const balance = await this.NFTContract.balanceOf(address);
    let ownedTokenIds = [];

    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await this.NFTContract.tokenOfOwnerByIndex(
          address,
          i
        );
        ownedTokenIds.push(Number(tokenId));
      } catch (err) {
        console.error(`Error fetching token ID for index ${i}:`, err);
      }
    }

    const responseTeamStats = await this.contract.getTeamStatsL1(
      ownedTokenIds
    );

    this.ownedTokenIds = ownedTokenIds;

    // Assuming each NFT has a type/name, use this information to display the NFTs
    this.selectedMembers = responseTeamStats.map((stats, i) => {
      return {
        key: stats[0], // Assuming the first element is the character type/name
        name: stats[0],
        tokenId: ownedTokenIds[i],
      };
    });

    this.selectedMembers.forEach((nft) => {
      this.load.image(
        nft.key,
        `artwork/characters/${nft.key}_asset.jpg`
      );
    });

    // Start loading and once done, display the NFTs
    this.load.once("complete", () => {
      this.displayNFTs();
    });
    this.load.start();
  }
  displayNFTs() {
    const startButtonY = 600; // This is just below the Y-position of the startMatchmakingButton
    const spacingBetweenNFTs = 150; // Adjust this value based on how much space you want between each NFT

    this.selectedMembers.forEach((nft, index) => {
      const x = 380 + index * spacingBetweenNFTs; // Place each NFT to the right of the previous one
      const y = startButtonY;

      // Error handling: Check if the image for the nft.key has been loaded.
      if (this.textures.exists(nft.key)) {
        const nftImage = this.add.image(x, y, nft.key).setScale(0.55);
      } else {
        console.error(
          `Image for NFT key ${nft.key} hasn't been preloaded.`
        );
      }

      const nftLabel = this.add
        .text(x, y + 80, nft.name, {
          fontFamily: "PixelArtFont",
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
          backgroundColor: "#000000",
        })
        .setOrigin(0.5);

      const tokenIdLabel = this.add
        .text(x, y + 110, `token ID: ${nft.tokenId}`, {
          fontFamily: "PixelArtFont",
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
          backgroundColor: "#000000",
        })
        .setOrigin(0.5);
    });
  }

  async checkAndSwitchChainZKEVM() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await provider.getSigner();
      // Get the current network's chain ID
      const currentChainId = await provider.send("eth_chainId");

      // Check if the current chain ID matches Goerli's chain ID (or any desired chain)
      if (currentChainId !== "0x5a2") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5a2" }],
          });
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              this.displayLoading("Switching Chain to ZK-EVM . . .");
              // The chain isn't added, so let's request the user to add it
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x5a2",
                    chainName: "Polygon ZKEVM Testnet", // Replace with your chain's name
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.public.zkevm-test.net"], // Replace with your chain's RPC URL
                    blockExplorerUrls: [
                      "https://testnet-zkevm.polygonscan.com/",
                    ], // Replace with your chain's block explorer URL
                  },
                ],
              });
              return true;
            } catch (addError) {
              console.error("Failed to add the chain.");
              console.error(addError);
              return false;
            }
          } else {
            console.error(switchError);
            return false;
          }
        }
      }
      this.hideLoading();
      return true; // already on the desired chain
    }
    console.error("Ethereum object (MetaMask) not detected!");
    return false;
  }

  async getBroadcastedNFTs() {
    const address = await this.signer.getAddress();
    console.log(address);
    try {
      // Call getNFTsOwnedBroadcastedBy from the smart contract
      const broadcastedNFTs =
        await this.combatContract.getNFTsOwnedBroadcastedBy(address);

      console.log(broadcastedNFTs);
      return broadcastedNFTs;
    } catch (error) {
      console.error(
        "An error occurred while fetching broadcasted NFTs: ",
        error
      );
      return [];
    }
  }

  displaySuccessMessage() {
    const successTextStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "26px",
      color: "#00FF00", // Green color for success
      align: "center",
      backgroundColor: "#000000",
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    };

    const successText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height - 100,
        "Ownership successfully broadcasted to L2! Proof Generation will take a couple minutes..",
        successTextStyle
      )
      .setOrigin(0.5);

    // Add a "Back to Menu" button below the success message
    const backButtonStyle = {
      font: "24px Courier",
      fill: "#ffffff",
      align: "center",
      backgroundColor: "#000000",
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    };

    const backButton = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height - 50,
        "Back to Menu",
        backButtonStyle
      )
      .setOrigin(0.5)
      .setInteractive();

    backButton.on("pointerdown", () => {
      this.backToMenu();
    });

    backButton.on("pointerover", function () {
      this.setFill("#ff8800");
      this.scene.game.canvas.style.cursor = "pointer";
    });

    backButton.on("pointerout", function () {
      this.setFill("#ffffff");
      this.scene.game.canvas.style.cursor = "default";
    });

    // Optionally, you can add a timer to remove this text after a few seconds
    this.time.delayedCall(
      5000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    ); // This will remove the text and button after 5 seconds
  }
}

export default PVPMatchmakingSetupScene;
