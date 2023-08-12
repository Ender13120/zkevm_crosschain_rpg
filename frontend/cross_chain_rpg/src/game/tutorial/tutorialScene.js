import Phaser from "phaser";

class TutorialScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
  }

  preload() {
    this.load.image("background", "artwork/background_menu3.png");
    this.load.image("textbox", "artwork/textbox.jpg");
  }
  create() {
    // Add the background image
    this.add.image(0, 0, "background").setOrigin(0, 0);

    // Add the textbox at the bottom of the screen
    const textbox = this.add
      .image(400, this.game.config.height - 50, "textbox")
      .setOrigin(0.5, 1);

    // Create the text and anchor it to the textbox
    this.text = this.add.text(
      textbox.x - textbox.width / 2,
      textbox.y - textbox.height,
      "Welcome to the tutorial!",
      {
        fontFamily: '"Unscii"', // Replace with your desired font family
        fontSize: "24px",
        fontStyle: "bold", // Set the font to bold
        color: "#0000ff", // Blue color
        align: "left",
        wordWrap: { width: textbox.width, useAdvancedWrap: true },
        stroke: "#000000",
        strokeThickness: 2,
        shadow: {
          // Add a bit of shadow
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 2,
          stroke: true,
          fill: true,
        },
      }
    );
    this.text.setOrigin(0, 0); // Top left align the text

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
    this.scene.bringToTop("GameScene");
    this.scene.stop("TutorialScene");
    this.scene.remove("TutorialScene"); // Removing the scene
  }

  update() {
    // Tutorial update logic...
  }
}

export default TutorialScene;
