// ClaimRewardsScene.js

import Phaser from "phaser";

class ClaimRewardsScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
    this.contract = config.contract;
    this.signer = config.signer;
    this.NFTContract = config.NFTContract;
  }

  preload() {
    this.load.image(
      "claimRewardsMenu",
      "artwork/claimRewardsMenu.jpg"
    );
  }

  create() {
    this.add.image(0, 0, "claimRewardsMenu").setOrigin(0, 0);

    const textStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "48px",
      color: "#ffffff",
      align: "center",
    };

    const claimButton = this.add
      .text(280, 600, "Claim your Rewards from the ZK-EVM Realm", {
        fontFamily: "PixelArtFont",
        fontSize: "32px",
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

    claimButton.on("pointerdown", async () => {
      try {
        const tx = await this.contract.claimBridged();

        this.displayLoading(
          "waiting for transaction to be broadcasted"
        );
        await tx.wait(); // Wait for the transaction to be mined
        this.hideLoading();
        console.log(
          "Team created successfully! Transaction Hash:",
          tx.hash
        );

        this.displaySuccessMessage();
      } catch (error) {
        console.error("Error claiming rewards:", error);
      }
    });

    claimButton.on("pointerover", function () {
      this.setFill("#ff8800"); // Change to the color you want on hover, e.g., orange
      this.scene.game.canvas.style.cursor = "pointer";
    });

    claimButton.on("pointerout", function () {
      this.setFill("#ffffff"); // Change back to the original color, e.g., white
      this.scene.game.canvas.style.cursor = "default";
    });

    this.tweens.add({
      targets: claimButton,
      scaleX: 1.025, // Scales the button to 102.5% of its original size
      scaleY: 1.025,
      yoyo: true, // Yoyo means it will go back to its original scale after reaching 102.5%
      duration: 700,
      repeat: -1, // Repeat indefinitely
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
    this.scene.stop("ClaimRewardsScene");
    this.scene.remove("ClaimRewardsScene");
    this.game.scene.start("GameScene");
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
          this.sys.game.config.height - 150,
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
        "Rewards successfully claimed on the L1! You can go back to the menu",
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
      30000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    ); // This will remove the text and button after 5 seconds
  }
}

export default ClaimRewardsScene;
