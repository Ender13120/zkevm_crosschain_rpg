// manageTeamScene.js
import Phaser from "phaser";

class ManageTeamScene extends Phaser.Scene {
  constructor() {
    super("ManageTeamScene");
  }

  init() {
    // Mock input: taking the first three characters as our team roster
    this.selectedMembers = ["warrior", "icemage", "burglar"];
  }

  preload() {
    this.characterStats = {
      character1: {
        health: 100,
        attack: 50,
        defense: 40,
        magic: 20,
      },
      character2: {
        health: 44,
        attack: 50,
        defense: 40,
        magic: 20,
      },
      character3: {
        health: 66,
        attack: 50,
        defense: 40,
        magic: 20,
      },
    };

    // Preload the character images
    this.characterNames = [
      "warrior",
      "icemage",
      "burglar",
      "paladin",
      "bard",
      "archer",
    ];
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
    this.characterImages = []; // An array to hold the character images
    this.borders = this.add.graphics(); // Graphics object for the borders
    this.currentTextbox = null;
    this.currentTextboxContents = [];

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

    this.selectedMembers.forEach((character, index) => {
      const charIndex = this.characterNames.indexOf(character);
      const x = 200 + Math.floor(index / 3) * 200;
      const y = 225 + (index % 3) * 200;

      const charImage = this.add
        .image(x, y, `character${charIndex + 1}`)
        .setScale(1)
        .setInteractive()
        .on("pointerdown", () => {
          this.inspectMember(`character${charIndex + 1}`);
        });

      this.characterImages.push(charImage); // Pushing character image to the array

      const charLabel = this.add
        .text(x, y + 100, character, {
          fontFamily: "PixelArtFont",
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    });
  }

  backToMenu() {
    this.scene.stop("ManageTeamScene");
    this.scene.remove("ManageTeamScene");
    this.game.scene.start("GameScene");
  }

  createStatButton(x, y, label, onClick) {
    const button = this.add
      .text(x, y, label, {
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          left: 5,
          right: 5,
          top: 2,
          bottom: 2,
        },
      })
      .setInteractive();

    button.on("pointerdown", onClick);
    this.currentTextboxContents.push(button);
    return button;
  }

  inspectMember(characterKey) {
    this.updateBorders(characterKey);
    console.log(`Inspecting ${characterKey}`);

    // Clear previous textbox if it exists
    if (this.currentTextbox) {
      this.currentTextbox.destroy();
      this.currentTextboxContents.forEach((content) =>
        content.destroy()
      );
      this.currentTextboxContents = [];
    }

    const stats = this.characterStats[characterKey];
    if (!stats) return; // If no stats data found for the character

    const x = this.game.config.width / 2;
    const y = this.game.config.height / 2;

    // Draw the textbox
    const textbox = this.add.graphics();
    textbox.fillStyle(0x000000, 0.5);
    textbox.fillRect(x - 200, y - 100, 400, 200);
    this.currentTextbox = textbox;

    // Draw the character image on the top-right corner of the textbox
    const charImage = this.add
      .image(x + 130, y - 70, characterKey)
      .setScale(0.5);
    this.currentTextboxContents.push(charImage);

    const padText = (text, length) => {
      return text.padEnd(length);
    };

    const attributes = ["Health", "Attack", "Defense", "Magic"];
    const maxLength = attributes.reduce(
      (max, attr) => Math.max(max, attr.length),
      0
    );

    const updateAttributeText = (attr, yCoord) => {
      const attributeText = this.add.text(
        x - 180,
        yCoord,
        `${padText(`${attr}:`, maxLength + 1)} ${
          stats[attr.toLowerCase()]
        }`,
        {
          color: "#ffffff",
          fontSize: "16px",
        }
      );
      this.currentTextboxContents.push(attributeText);
      this.createStatButton(x - 30, yCoord, "+", () => {
        stats[attr.toLowerCase()] += 10;
        attributeText.setText(
          `${padText(`${attr}:`, maxLength + 1)} ${
            stats[attr.toLowerCase()]
          }`
        );
      });
      this.createStatButton(x - 60, yCoord, "-", () => {
        stats[attr.toLowerCase()] = Math.max(
          0,
          stats[attr.toLowerCase()] - 10
        );
        attributeText.setText(
          `${padText(`${attr}:`, maxLength + 1)} ${
            stats[attr.toLowerCase()]
          }`
        );
      });
    };

    attributes.forEach((attr, index) => {
      updateAttributeText(attr, y - 90 + index * 20);
    });

    const confirmButton = this.add
      .text(x + 70, y + 70, "Confirm", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5,
        },
      })
      .setInteractive()
      .on("pointerdown", () => {
        // Logic for confirming changes goes here
        console.log("Stats confirmed!");
      });

    this.currentTextboxContents.push(confirmButton);
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
}

export default ManageTeamScene;
