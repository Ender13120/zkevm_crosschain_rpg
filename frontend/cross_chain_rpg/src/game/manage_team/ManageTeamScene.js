// manageTeamScene.js
import Phaser from "phaser";

class ManageTeamScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);

    this.parent = parent;
    this.contract = config.contract; // Access the contract
    this.NFTContract = config.NFTContract;
    this.signer = config.signer; // Access the signer
    this.currTokenIdSelected = 0;
  }

  init() {
    // Mock input: taking the first three characters as our team roster
    this.selectedMembers = [
      { key: "warrior", name: "Warrior" },
      { key: "icemage", name: "Ice Mage" },
      { key: "burglar", name: "Burglar" },
    ];
  }

  preload() {
    this.characterStats = {
      character1: {
        HP: 100,
        ATK: 50,
        DEX: 40,
        INT: 20,
        CONST: 20,
        WIS: 20,
        EXP: 0,
      },
      character2: {
        HP: 100,
        ATK: 50,
        DEX: 40,
        INT: 20,
        CONST: 20,
        WIS: 20,
        EXP: 0,
      },
      character3: {
        HP: 100,
        ATK: 50,
        DEX: 40,
        INT: 20,
        CONST: 20,
        WIS: 20,
        EXP: 0,
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
    /*
    this.characterNames.forEach((character, index) => {
      this.load.image(
        `character${index + 1}`,
        `artwork/characters/${character}_asset.jpg`
      );
    });
    */
    this.load.image("background", "artwork/background_menu3.png");
  }

  create() {
    console.log(this.contract); // For debugging purposes
    console.log(this.NFTContract);
    console.log(this.signer); // For debugging purposes
    this.getTeam(); // Call it at the beginning to fetch stats

    if (this.parent && this.parent.state) {
      const { provider, signer, contract } = this.parent.state;
      this.contract = contract;
    }

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
  }

  backToMenu() {
    this.scene.stop("ManageTeamScene");
    this.scene.remove("ManageTeamScene");
    this.game.scene.start("GameScene");
  }

  displayCharacters() {
    this.selectedMembers.forEach((characterObj, index) => {
      const x = 200 + Math.floor(index / 3) * 200;
      const y = 225 + (index % 3) * 200;

      const charImage = this.add
        .image(x, y, characterObj.key)
        .setScale(1)
        .setInteractive()
        .on("pointerdown", () => {
          this.inspectMember(characterObj.key);
          this.currTokenIdSelected = characterObj.tokenId;
        });

      this.characterImages.push(charImage); // Pushing character image to the array

      const charLabel = this.add
        .text(x, y + 90, characterObj.name, {
          fontFamily: "PixelArtFont",
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);

      const charLabel2 = this.add
        .text(x, y + 110, "tokenID:" + characterObj.tokenId, {
          fontFamily: "PixelArtFont",
          fontSize: "20px", // Reduced font size
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    });
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

    const x = this.game.config.width / 2 + 100; // Pushes the textbox 100 pixels to the right.

    const y = this.game.config.height / 2;

    // Draw the textbox
    const textbox = this.add.graphics();
    textbox.fillStyle(0x000000, 0.5);
    textbox.fillRect(x - 250, y - 100, 500, 200); // Increased width for better spacing

    this.currentTextbox = textbox;

    // Draw the character image on the top-right corner of the textbox
    const charImage = this.add
      .image(x + 225, y - 68, characterKey)
      .setScale(0.5);
    this.currentTextboxContents.push(charImage);

    const padText = (text, length) => {
      return text.padEnd(length);
    };

    const attributes = [
      "HP",
      "ATK",
      "DEX",
      "INT",
      "CONST",
      "WIS",
      "EXP",
    ];
    const maxLength = attributes.reduce(
      (max, attr) => Math.max(max, attr.length),
      0
    );

    attributes.forEach((attr, index) => {
      const attributeText = this.add.text(
        x - 220, // Shifted a bit to the left
        y - 80 + index * 25,
        `${padText(`${attr}:`, maxLength + 2)} ${stats[attr]}`,
        {
          color: "#ffffff",
          fontSize: "16px",
        }
      );
      this.currentTextboxContents.push(attributeText);
    });

    const levelUpButton = this.add
      .text(x + 157, y + 64, "LevelUp", {
        fontFamily: "PixelArtFont",
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
        console.log("Leveling up!");

        try {
          const tx = this.contract.levelUpHero(
            this.currTokenIdSelected
          );
          this.displayLoading("Leveling up Hero...");
          tx.wait();
        } catch (error) {
          if (error.message && error.message.includes("enough")) {
            this.displayLoading("Hero doesnt have enough EXP");
          }
        }
      })
      .on("pointerover", function () {
        this.setFill("#ff8800");
        this.scene.game.canvas.style.cursor = "pointer";
      })
      .on("pointerout", function () {
        this.setFill("#ffffff"); // Change back to the original color, e.g., white
        this.scene.game.canvas.style.cursor = "default";
      });

    this.currentTextboxContents.push(levelUpButton);
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

  async getTeam() {
    // Fetching all owned tokenIds

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
        console.log(`Token ID for index ${i}:`, tokenId.toString());
        ownedTokenIds.push(Number(tokenId));
      } catch (err) {
        console.error(`Error fetching token ID for index ${i}:`, err);
      }
    }

    const responseTeamStats = await this.contract.getTeamStatsL1(
      ownedTokenIds
    );

    const responseTeamEXP = await this.contract.getEXPTeam(
      ownedTokenIds
    );

    console.log("response array:");

    console.log(responseTeamStats[0]);
    console.log(responseTeamStats[1]);
    console.log(responseTeamStats[2]);

    console.log("exp:", responseTeamEXP[0]);

    // Update character stats with fetched data
    for (let i = 0; i < responseTeamStats.length; i++) {
      const rawStats = responseTeamStats[i];
      const rawEXPStat = responseTeamEXP[i];

      console.log(rawStats[0]);
      console.log(rawStats[1]);
      console.log(rawStats[2]);
      console.log(rawStats[3]);
      if (rawStats) {
        const structuredStats = {
          characterType: rawStats[0],
          HP: Number(rawStats[1]), // converting bigint to number for simplicity
          ATK: Number(rawStats[2]),
          DEX: Number(rawStats[3]),
          INT: Number(rawStats[4]),
          CONST: Number(rawStats[5]),
          WIS: Number(rawStats[6]),
          EXP: Number(responseTeamEXP[0]),
        };

        this.load.image(
          `character${i + 1}`,
          `artwork/characters/${rawStats[0].toString()}_asset.jpg`
        );

        this.characterStats[`character${i + 1}`] = structuredStats;
        this.selectedMembers[i] = {
          key: `character${i + 1}`,
          name: rawStats[0],
          tokenId: ownedTokenIds[i], // Storing tokenId
        };
      }
    }
    // This is essential to make sure the images are actually loaded before you try to display them
    this.load.once("complete", () => {
      this.displayCharacters();
    });

    this.load.start();
  }
}

export default ManageTeamScene;
