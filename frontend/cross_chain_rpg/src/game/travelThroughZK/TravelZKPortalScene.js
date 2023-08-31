// travelZKPortalScene.js
import Phaser from "phaser";

class TravelZKPortalScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
    this.contract = config.contract;
    this.NFTContract = config.NFTContract;
    this.signer = config.signer;
    this.loadingText = null;
  }

  preload() {
    this.load.image(
      "portalBackground",
      "artwork/portalBackground.jpg"
    );
  }

  create() {
    this.add.image(0, 0, "portalBackground").setOrigin(0, 0);

    if (this.parent && this.parent.state) {
      const { provider, signer, contract } = this.parent.state;
      this.contract = contract;
    }
    console.log(this.contract);
    console.log(this.signer);

    const textStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "64px",
      color: "#F2CA19",
      align: "center",
    };

    const portalText = this.add
      .text(275, 325, "Travel through ZK-Portal", textStyle)
      .setInteractive();
    portalText.on("pointerdown", this.handlePortalClick, this);
    portalText.on("pointerover", function () {
      this.setFill("#ff8800");
      this.scene.game.canvas.style.cursor = "pointer";
    });

    portalText.on("pointerout", function () {
      this.setFill("#ffffff");
      this.scene.game.canvas.style.cursor = "default";
    });

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

    this.getOwnedNFTs();

    this.tweens.add({
      targets: portalText,
      scaleX: 1.035,
      scaleY: 1.035,
      yoyo: true,
      duration: 700,
      repeat: -1,
    });
  }

  async handlePortalClick() {
    try {
      console.log("Broadcasting ownership to L2...");

      const nftIds = this.selectedMembers.map((nft) => nft.tokenId);

      if (nftIds.length > 0) {
        const tx = await this.contract.broadcastOwnershipToL2(nftIds);
        this.displayLoading();
        await tx.wait();
        this.hideLoading();
        console.log("Ownership broadcasted successfully to L2. ");
        this.displaySuccessMessage();
      } else {
        console.log("No NFTs owned by the user.");
      }
    } catch (error) {
      console.error("Error broadcasting ownership to L2:", error);
    }
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
    this.selectedMembers.forEach((nft, index) => {
      const x = 150; // Adjust x position to be constant as we are stacking vertically
      const y = 100 + 90 + index * 200; // Adjust y position to increase by 200 pixels for each NFT

      // Error handling: Check if the image for the nft.key has been loaded.
      if (this.textures.exists(nft.key)) {
        const nftImage = this.add.image(x, y, nft.key).setScale(0.5);
      } else {
        console.error(
          `Image for NFT key ${nft.key} hasn't been preloaded.`
        );
      }

      const nftLabel = this.add
        .text(x, y + 80, nft.name, {
          fontFamily: "PixelArtFont",
          fontSize: "24px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);

      const tokenIdLabel = this.add
        .text(x, y + 110, `token ID: ${nft.tokenId}`, {
          fontFamily: "PixelArtFont",
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    });
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
      15000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    ); // This will remove the text and button after 5 seconds
  }

  displayLoading() {
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
          this.sys.game.config.height - 150,
          "Broadcasting Transaction...",
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

  backToMenu() {
    this.scene.stop("TravelZKPortalScene");
    this.scene.remove("TravelZKPortalScene");
    this.game.scene.start("GameScene");
  }

  update() {
    // Any continuous updates for the scene
  }
}

export default TravelZKPortalScene;
