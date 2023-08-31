// createNewTeamScene.js
import Phaser from "phaser";
import { ethers } from "ethers";

class CreateNewTeamScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
    this.contract = config.contract; // Access the contract
    this.signer = config.signer; // Access the signer
    this.selectedMembers = [];

    this.characterNames = [
      "warrior",
      "paladin",
      "icemage",
      "bard",
      "burglar",
      "archer",
    ];
  }

  preload() {
    // Preload the images for the character options using a loop
    this.characterNames.forEach((character, index) => {
      this.load.image(
        `character${index + 1}`,
        `artwork/characters/${character}_asset.jpg`
      );
    });

    this.load.image("background", "artwork/background_menu3.png");
  }

  create() {
    this.errorMessage = null;

    console.log(this.contract); // For debugging purposes
    console.log(this.signer); // For debugging purposes

    if (this.parent && this.parent.state) {
      const { provider, signer, contract } = this.parent.state;
      this.contract = contract;
    }
    this.add.image(0, 0, "background").setOrigin(0, 0);

    this.partySlotImages = [
      this.add
        .image(925, 210, this.characterNames[0])
        .setVisible(false)
        .setScale(0.5),
      this.add
        .image(925, 410, this.characterNames[1])
        .setVisible(false)
        .setScale(0.5),
      this.add
        .image(925, 610, this.characterNames[2])
        .setVisible(false)
        .setScale(0.5),
    ];

    // 1. Create a Graphics object for drawing borders
    this.borders = this.add.graphics();

    // 2. Store character image references in an array
    this.characterImages = [];

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

    this.characterNames.forEach((character, index) => {
      const x = 200 + Math.floor(index / 3) * 200;
      const y = 225 + (index % 3) * 200;

      const charImage = this.add
        .image(x, y, `character${index + 1}`) // Change here
        .setInteractive()
        .on("pointerdown", () => {
          this.selectMember(character, index % 3);
          this.updateBorders(`character${index + 1}`); // And here
        });
      this.characterImages.push(charImage);
    });

    const textStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "32px",
      color: "#ffffff",
      align: "center",
    };
    this.partySlotTexts = [
      this.add.text(
        600,
        200,
        "Party Slot 1: " + (this.selectedMembers[0] || "None"),
        textStyle
      ),
      this.add.text(
        600,
        400,
        "Party Slot 2: " + (this.selectedMembers[1] || "None"),
        textStyle
      ),
      this.add.text(
        600,
        600,
        "Party Slot 3: " + (this.selectedMembers[2] || "None"),
        textStyle
      ),
    ];

    this.embarkButton = this.add
      .text(600, 700, "Embark on Adventure", {
        font: "32px Courier",
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
      .setAlpha(0.5);

    this.updateEmbarkButtonInteractivity();
  }

  updateEmbarkButtonInteractivity() {
    // Check if all slots in the array are filled
    if (
      this.selectedMembers.length === 3 &&
      !this.selectedMembers.includes(undefined)
    ) {
      this.embarkButton.setAlpha(1);
      if (!this.embarkButton._isInteractiveSet) {
        this.embarkButton.setInteractive().on("pointerdown", () => {
          this.startAdventure();
        });
        this.embarkButton._isInteractiveSet = true; // Mark it as interactive
      }
    } else {
      this.embarkButton.setAlpha(0.5);
      this.embarkButton.removeInteractive();
      this.embarkButton._isInteractiveSet = false; // Mark it as non-interactive
    }
  }

  updateBorders(selectedCharacter) {
    this.borders.clear();

    this.characterImages.forEach((image) => {
      this.borders.lineStyle(3, 0x808080);
      this.borders.strokeRect(
        image.x - image.width / 2,
        image.y - image.height / 2,
        image.width,
        image.height
      );
    });

    const selectedImage = this.characterImages.find(
      (img) => img.texture.key === selectedCharacter
    );
    if (selectedImage) {
      this.borders.lineStyle(3, 0x00ff00);
      this.borders.strokeRect(
        selectedImage.x - selectedImage.width / 2,
        selectedImage.y - selectedImage.height / 2,
        selectedImage.width,
        selectedImage.height
      );
    }
  }

  backToMenu() {
    this.scene.stop("CreateNewTeamScene");
    this.scene.remove("CreateNewTeamScene");
    this.game.scene.start("GameScene");
  }

  selectMember(character, slotIndex) {
    const validSelections = [
      [this.characterNames[0], this.characterNames[3]],
      [this.characterNames[1], this.characterNames[4]],
      [this.characterNames[2], this.characterNames[5]],
    ];

    if (validSelections[slotIndex].includes(character)) {
      this.selectedMembers[slotIndex] = character;
      this.partySlotTexts[slotIndex].setText(
        `Party Slot ${slotIndex + 1}: ${character}`
      );

      const charIndex = this.characterNames.indexOf(character);
      this.partySlotImages[slotIndex]
        .setTexture(`character${charIndex + 1}`)
        .setVisible(true);
    } else {
      console.warn(
        `You can't select ${character} for slot ${slotIndex + 1}`
      );
    }

    this.triggerPlaceholderFunction();

    this.updateEmbarkButtonInteractivity();
  }

  async startAdventure() {
    if (
      this.selectedMembers.length === 3 &&
      !this.selectedMembers.includes(undefined)
    ) {
      try {
        const heroChoices = this.selectedMembers.map(
          (member) => this.characterNames.indexOf(member) + 1
        );
        console.log("heroChoices::", heroChoices);
        const tx = await this.contract.selectAndCreateTeam(
          heroChoices
        );

        this.displayLoading(
          "waiting for transaction to be broadcasted"
        );
        await tx.wait();
        this.hideLoading();
        console.log(
          "Team created successfully! Transaction Hash:",
          tx.hash
        );

        this.displaySuccessMessage();

        this.hideErrorMessage();
      } catch (error) {
        console.error("Error while creating team:", error);

        if (error.message.includes("can only init team ")) {
          this.displayErrorMessage(
            "You can only create a team once!"
          );
        }
      }
    }
  }

  displayLoading(text) {
    const loadingTextStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "32px",
      color: "#FFFF00",
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
      color: "#00FF00",
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
        "Team successfully created on the L1! You can go back to the menu",
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

    this.time.delayedCall(
      30000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    );
  }

  displayErrorMessage(message) {
    // If an error message already exists, just update its text

    if (this.errorMessage) {
      this.errorMessage.setText(message);
      this.errorMessage.setVisible(true);
    } else {
      // If it doesn't exist, create a new text object for the error
      this.errorMessage = this.add
        .text(this.game.config.width / 2, 50, message, {
          font: "24px Courier",
          fill: "#ff0000",
          align: "center",
          backgroundColor: "#000000",
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
        })
        .setOrigin(0.5, 0);
      this.errorMessage.setDepth(1000);
    }
  }

  hideErrorMessage() {
    if (this.errorMessage) {
      this.errorMessage.setVisible(false);
    }
  }

  triggerPlaceholderFunction() {
    console.log("Selected members: ", this.selectedMembers);
  }
}

export default CreateNewTeamScene;
