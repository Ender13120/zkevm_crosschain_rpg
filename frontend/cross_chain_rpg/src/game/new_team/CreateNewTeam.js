// createNewTeamScene.js
import Phaser from "phaser";

class CreateNewTeamScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
    this.selectedMembers = [];

    this.characterNames = [
      "warrior",
      "icemage",
      "burglar",
      "paladin",
      "bard",
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

  startAdventure() {
    if (
      this.selectedMembers.length === 3 &&
      !this.selectedMembers.includes(undefined)
    ) {
      console.log("Starting Adventure with: ", this.selectedMembers);
      // You can now transition to the game scene or whichever scene represents the adventure
      // this.scene.start('YourAdventureScene');
    }
  }

  triggerPlaceholderFunction() {
    console.log("Selected members: ", this.selectedMembers);
  }
}

export default CreateNewTeamScene;
