import React from "react";
import Phaser from "phaser";

class PhaserGameScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
  }

  preload() {
    //this.load.image("player", "assets/player.png");
  }

  create() {
    const menuItems = [
      "Tutorial",
      "Start PVP Matchmaking",
      "Start PVE Game",
      "Change Your Team",
      "Claim Rewards",
    ];

    const textStyle = {
      font: "16px Courier",
      fill: "#ffffff",
      align: "center",
    };

    this.menu = this.add.group();

    menuItems.forEach((item, index) => {
      const menuItem = this.add
        .text(400, 100 + index * 50, item, textStyle)
        .setInteractive()
        .on("pointerdown", () => this.parent.menuItemClicked(item));

      this.menu.add(menuItem);
    });
  }

  update() {
    // Handle player movement, combat, etc...
  }
}

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
  }

  update() {
    // Tutorial update logic...
  }
}

class Game extends React.Component {
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
  }

  menuItemClicked = (item) => {
    switch (item) {
      case "Tutorial":
        // Start the tutorial scene
        this.game.scene.add(
          "TutorialScene",
          new TutorialScene({ key: "TutorialScene" }, this),
          true
        );
        break;
      // Add other cases here...
      default:
        break;
    }
  };

  render() {
    return <div id="game-container" />;
  }

  componentWillUnmount() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}

export default Game;
