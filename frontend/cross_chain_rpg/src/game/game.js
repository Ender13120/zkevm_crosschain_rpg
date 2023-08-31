import React from "react";
import Phaser from "phaser";
import TutorialScene from "./tutorial/tutorialScene.js";
import PVPMatchmakingScene from "./pvpCombat/combatScene.js";
import CreateNewTeamScene from "./new_team/CreateNewTeam.js";
import ManageTeamScene from "./manage_team/ManageTeamScene.js";
import TravelZKPortalScene from "./travelThroughZK/TravelZKPortalScene.js";
import ClaimRewardsScene from "./claimRewardsFromZK/ClaimRewardsScene.js";
import { ethers } from "ethers";
import { diamondL1ABI } from "./diamondABI.ts";
import { nftL1ABI } from "./nftL1ABI.ts";
import PVPMatchmakingSetupScene from "./pvpCombat/matchmakingSetup.js";

class PhaserGameScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
    this.isCreated = false; // Add this line
  }

  preload() {
    //this.load.image("player", "assets/player.png");

    this.load.image("menubackground", "artwork/menubackground.jpg");
  }

  create() {
    this.background = this.add
      .tileSprite(0, 0, 1024, 768, "menubackground")
      .setOrigin(0, 0);

    // Opacity effect for the background
    this.tweens.add({
      targets: this.background,
      alpha: 0.5, // Target opacity
      duration: 6000,
      yoyo: true, // Makes the tween reverse and repeat
      repeat: -1, // Infinite repetitions
    });

    const menuItems = [
      "Connect Wallet",
      "Tutorial",
      "Create New Team",
      "Manage Team",
      "PVP Matchmaking",
      "Travel through ZK-Portal",
      "Claim Rewards from ZK-Portal",
    ];

    const textStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "48px",
      color: "#ffffff",
      align: "center",
    };

    this.menu = this.add.group();

    menuItems.forEach((item, index) => {
      const menuItem = this.add
        .text(300, 150 + index * 69, item, textStyle)
        .setInteractive()
        .on("pointerdown", () => this.parent.menuItemClicked(item))
        .on("pointerover", function () {
          this.setFill("#ff8800"); // Change to the color you want on hover, e.g., orange
        })
        .on("pointerout", function () {
          this.setFill("#ffffff"); // Revert to original color when hover ends
        });

      menuItem.setFontFamily("PixelArtFont");

      this.menu.add(menuItem);

      // Save reference to the "Connect Wallet" item for later use
      if (item === "Connect Wallet") {
        this.connectWalletMenuItem = menuItem;
      }

      this.connectionBox = this.add
        .rectangle(900, 20, 120, 50)
        .setOrigin(10, 0)
        .setVisible(false);
      this.connectionText = this.add
        .text(905, 30, "Connected", {
          fontFamily: "PixelArtFont",
          fontSize: "24px",
          color: "#ffffff",
        })
        .setVisible(false);
    });

    this.uiCamera = this.cameras
      .add(0, 0, 1024, 768)
      .setName("UICamera");
    this.uiCamera.ignore(this.background); // Ignore all game elements except the UI
    this.uiCamera.ignore(this.menu); // Make sure to add this line for every game element
    this.uiCamera.ignore([this.background, this.menu]);

    this.isWalletStillConnected().then((connected) => {
      this.setWalletConnected(connected);
    });

    this.checkAndSwitchChain();
    this.isCreated = true; // Set the flag to true at the end
  }

  setWalletConnected(connected) {
    if (!this.isCreated) {
      return;
    }

    if (connected) {
      this.connectWalletMenuItem.setFill("#00ff00"); // Change to a positive color like green
      this.connectionBox.setVisible(true);
      this.connectionText.setVisible(true);
    } else {
      this.connectWalletMenuItem.setFill("#ffffff"); // Revert to original color
      this.connectionBox.setVisible(false);
      this.connectionText.setVisible(false);
    }
  }

  async isWalletStillConnected() {
    return new Promise((resolve) => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            resolve(accounts.length > 0);
          })
          .catch(() => {
            resolve(false);
          });
      } else {
        resolve(false);
      }
    });
  }

  async checkAndSwitchChain() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the current network's chain ID
      const currentChainId = await provider.send("eth_chainId");

      // Check if the current chain ID matches Goerli's chain ID (or any desired chain)
      if (currentChainId !== "0x5") {
        // Request the user to switch to the Goerli network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }], // Goerli's chain ID
          });
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            console.error(
              "The requested chain is not added by the user."
            );
          } else {
            console.error(switchError);
          }
          return false;
        }
      }
      return true; // already on the desired chain
    }
    console.error("Ethereum object (MetaMask) not detected!");
    return false;
  }
}

class Game extends React.Component {
  state = {
    contract: null,
    signer: null,
    NFTContract: null,
  };

  componentDidMount() {
    const gameScene = new PhaserGameScene(
      {
        key: "GameScene",
      },
      this
    );

    const config = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
        },
      },
      scene: gameScene,
      parent: "game-container",
    };

    this.game = new Phaser.Game(config);

    this.isWalletConnected().then((connected) => {
      const gameScene = this.game.scene.getScene("GameScene");
      gameScene.setWalletConnected(connected);

      if (connected) {
        this.setupContracts();
      }
    });

    this.checkAndSwitchChain();
  }

  menuItemClicked = (item) => {
    switch (item) {
      case "Tutorial":
        this.game.scene.pause("GameScene");
        if (!this.game.scene.getScene("TutorialScene")) {
          this.game.scene.add(
            "TutorialScene",
            new TutorialScene({ key: "TutorialScene" }, this),
            true
          );
        } else {
          this.game.scene.resume("TutorialScene");
        }
        break;

      case "Connect Wallet":
        this.connectMetaMask();
        break;

      case "PVP Matchmaking":
        this.game.scene.pause("GameScene");
        if (!this.game.scene.getScene("PVPMatchmakingSetupScene")) {
          this.game.scene.stop("GameScene");
          this.game.scene.add(
            "PVPMatchmakingSetupScene",
            new PVPMatchmakingSetupScene(
              {
                key: "PVPMatchmakingSetupScene",
                contract: this.state.contract,
                signer: this.state.signer,
                NFTContract: this.state.NFTContract,
              },
              this
            ),
            true
          );
        } else {
          this.game.scene.resume("PVPMatchmakingSetupScene");
        }
        break;
      //@notice disabled for now, we are doing the proper matchmaking now.
      case "PVP Matchmaking":
        this.game.scene.stop("GameScene");
        this.game.scene.add(
          "PVPMatchmakingScene",
          new PVPMatchmakingScene(
            { key: "PVPMatchmakingScene" },
            this
          ),
          true
        );
        break;
      case "Create New Team":
        this.game.scene.stop("GameScene");
        this.game.scene.add(
          "CreateNewTeamScene",
          new CreateNewTeamScene(
            {
              key: "CreateNewTeamScene",
              contract: this.state.contract,
              signer: this.state.signer,
            },
            this
          ),
          true
        );
        break;
      case "Manage Team":
        this.game.scene.stop("GameScene");

        this.game.scene.add(
          "ManageTeamScene",
          new ManageTeamScene(
            {
              key: "ManageTeamScene",
              contract: this.state.contract,
              signer: this.state.signer,
              NFTContract: this.state.NFTContract,
            },
            this
          ),
          true
        );
        break;

      case "Travel through ZK-Portal":
        this.game.scene.stop("GameScene");
        this.game.scene.add(
          "TravelZKPortalScene",
          new TravelZKPortalScene(
            {
              key: "TravelZKPortalScene",
              contract: this.state.contract,
              signer: this.state.signer,
              NFTContract: this.state.NFTContract,
            },
            this
          ),
          true
        );
        break;

      case "Claim Rewards from ZK-Portal":
        this.game.scene.stop("GameScene");
        this.game.scene.add(
          "ClaimRewardsScene",
          new ClaimRewardsScene(
            {
              key: "ClaimRewardsScene",
              contract: this.state.contract,
              signer: this.state.signer,
              NFTContract: this.state.NFTContract,
            },
            this
          ),
          true
        );
        break;

      default:
        break;
    }
  };

  async isWalletConnected() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts.length > 0;
    }
    return false;
  }

  async connectMetaMask() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      try {
        // Get the current network's chain ID
        const currentChainId = await provider.send("eth_chainId");

        // Check if the current chain ID matches Goerli's chain ID
        if (currentChainId !== "0x5") {
          // Request the user to switch to the Goerli network
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x5" }], // Goerli's chain ID
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              console.error(
                "The requested chain is not added by the user."
              );
              throw switchError; // You want to stop execution if there's an error.
            } else {
              throw switchError;
            }
          }
        }

        // Request connection to the user's MetaMask account
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length === 0) {
          console.error("No accounts found.");
          throw new Error("No accounts found.");
        }

        // This should be executed whether you had to switch chains or not.
        const gameScene = this.game.scene.getScene("GameScene");
        gameScene.setWalletConnected(true);
        this.setupContracts();

        const CONTRACT_ADDRESS_L1 =
          process.env.REACT_APP_CONTRACT_ADDRESS_L1;

        const NFT_ADDRESS_L1 = process.env.REACT_APP_NFT_ADDRESS_L1;

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS_L1,
          diamondL1ABI,
          signer
        );

        const NFTContract = new ethers.Contract(
          NFT_ADDRESS_L1,
          nftL1ABI,
          signer
        );

        this.setState({ contract, signer, NFTContract });
      } catch (error) {
        const gameScene = this.game.scene.getScene("GameScene");
        gameScene.setWalletConnected(false);
      }
    } else {
      console.error("Ethereum object (MetaMask) not detected!");
    }
  }

  async checkAndSwitchChain() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the current network's chain ID
      const currentChainId = await provider.send("eth_chainId");

      // Check if the current chain ID matches Goerli's chain ID (or any desired chain)
      if (currentChainId !== "0x5") {
        // Request the user to switch to the Goerli network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x5" }], // Goerli's chain ID
          });
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            console.error(
              "The requested chain is not added by the user."
            );
          } else {
            console.error(switchError);
          }
          return false;
        }
      }
      return true; // already on the desired chain
    }
    console.error("Ethereum object (MetaMask) not detected!");
    return false;
  }

  render() {
    return <div id="game-container" />;
  }

  async setupContracts() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const CONTRACT_ADDRESS_L1 =
        process.env.REACT_APP_CONTRACT_ADDRESS_L1;

      const NFT_ADDRESS_L1 = process.env.REACT_APP_NFT_ADDRESS_L1;

      console.log("test");
      console.log(process.env.REACT_APP_TESTTTT);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS_L1,
        diamondL1ABI,
        signer
      );
      const NFTContract = new ethers.Contract(
        NFT_ADDRESS_L1,
        nftL1ABI,
        signer
      );

      this.setState({ contract, signer, NFTContract });
    } else {
      console.error("Ethereum object (MetaMask) not detected!");
    }
  }

  componentWillUnmount() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}

export default Game;
