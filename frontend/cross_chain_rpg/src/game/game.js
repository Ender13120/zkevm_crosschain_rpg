import React from "react";
import Phaser from "phaser";
import TutorialScene from "./tutorial/tutorialScene.js";
import PVPMatchmakingScene from "./pvpCombat/combatScene.js";

class PhaserGameScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;
  }

  preload() {
    //this.load.image("player", "assets/player.png");

    this.load.image("menubackground", "artwork/menubackground.jpg");
  }

  create() {
    this.add.image(0, 0, "menubackground").setOrigin(0, 0);

    const menuItems = [
      "Tutorial",
      "Create New Team",
      "Manage Team",
      "PVP Matchmaking",
      "PVE Matchmaking",
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
    });
  }

  update() {
    // Handle player movement, combat, etc...
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
        this.game.scene.add(
          "TutorialScene",
          new TutorialScene({ key: "TutorialScene" }, this),
          true
        );
        break;
      case "PVP Matchmaking":
        this.game.scene.add(
          "PVPMatchmakingScene",
          new PVPMatchmakingScene(
            { key: "PVPMatchmakingScene" },
            this
          ),
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
