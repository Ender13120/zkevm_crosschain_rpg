import Phaser from "phaser";

class TutorialScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
  }

  preload() {
    this.load.image("background", "artwork/background_menu3.png");
  }

  create() {
    // Add the background image
    this.add.image(0, 0, "background").setOrigin(0, 0);

    // Create the textbox graphics at the bottom of the screen
    const textboxWidth = 800;
    const textboxHeight = 150;
    const textboxX = this.game.config.width / 2;
    const textboxY = this.game.config.height - 50;

    let textboxGraphics = this.add.graphics();
    textboxGraphics.fillStyle(0x000033, 0.8); // Shadow color
    textboxGraphics.fillRoundedRect(
      textboxX - textboxWidth / 2 + 3,
      textboxY - textboxHeight + 3,
      textboxWidth,
      textboxHeight,
      7
    );
    textboxGraphics.fillStyle(0x000066, 1); // Main color
    textboxGraphics.fillRoundedRect(
      textboxX - textboxWidth / 2,
      textboxY - textboxHeight,
      textboxWidth,
      textboxHeight,
      7
    );

    // Create the text and anchor it to the textbox
    this.text = this.add.text(
      textboxX - textboxWidth / 2 + 20, // +20 for padding
      textboxY - textboxHeight + 10, // +10 for padding
      "Welcome to the tutorial!",
      {
        fontFamily: "combatfont",
        fontSize: "24px",
        color: "#FFFFFF",
        align: "left",
        wordWrap: { width: textboxWidth - 40, useAdvancedWrap: true }, // -40 for padding
      }
    );

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
    this.game.scene.resume("GameScene");
    this.scene.bringToTop("GameScene");
    this.scene.stop("TutorialScene");
    this.scene.remove("TutorialScene"); // Removing the scene
  }

  update() {
    // Tutorial update logic...
  }
}

export default TutorialScene;
