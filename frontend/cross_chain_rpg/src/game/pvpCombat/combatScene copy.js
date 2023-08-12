import Phaser from "phaser";

class PVPMatchmakingSceneOLD extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;

    this.combatMenuOptions = [];
  }

  preload() {
    this.load.image("pvpBackground", "artwork/pvpBackground.jpg");

    this.load.image(
      "player1",
      "artwork/characters/player1_asset.jpg"
    );
    this.load.image(
      "player2",
      "artwork/characters/player2_asset.jpg"
    );
    this.load.image(
      "player3",
      "artwork/characters/player3_asset.jpg"
    );
    this.load.image("enemy1", "artwork/characters/enemy1_asset.jpg");
    this.load.image("enemy2", "artwork/characters/enemy2_asset.png");
    this.load.image("enemy3", "artwork/characters/enemy3_asset.png");
  }

  create() {
    this.add.image(0, 0, "pvpBackground").setOrigin(0, 0);
    this.selectedOptionIndex = 0;

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

    const player1 = this.add.sprite(150, 200, "player1"); // Reduced y from 300 to 250
    const player2 = this.add.sprite(150, 350, "player2"); // Reduced y from 450 to 400
    const player3 = this.add.sprite(150, 500, "player3"); // Reduced y from 600 to 550

    // Enemy characters
    const enemy1 = this.add.sprite(850, 200, "enemy1"); // Reduced y from 300 to 250
    const enemy2 = this.add.sprite(850, 350, "enemy2"); // Reduced y from 450 to 400
    const enemy3 = this.add.sprite(850, 500, "enemy3"); // Reduced y from 600 to 550

    this.createCombatMenuBackground();
    this.createCombatMenuOptions();
    this.createPlayerHPBars();
    this.createEnemyHPBars();

    this.input.keyboard.on("keydown-UP", () => {
      this.selectedOptionIndex = Math.max(
        0,
        this.selectedOptionIndex - 1
      );
      this.updateSelectedOption();
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      this.selectedOptionIndex = Math.min(
        this.combatMenuOptions.length - 1,
        this.selectedOptionIndex + 1
      );
      this.updateSelectedOption();
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      this.handleCombatOption(
        this.combatMenuOptions[this.selectedOptionIndex]
      );
    });
  }

  handleCombatOption(option) {
    switch (option) {
      case "Attack":
        // Handle the attack logic
        break;
      case "Spells":
        // Handle the spells logic
        break;
      case "Items":
        // Handle the items logic
        break;
      case "Concede":
        this.backToMenu();
        break;
    }
  }

  createCombatMenuBackground() {
    let combatMenuGraphics = this.add.graphics();

    // Background with shadow effect for depth
    combatMenuGraphics.fillStyle(0x000033, 0.8); // Dark blue, slightly transparent
    combatMenuGraphics.fillRoundedRect(53, 603, 918, 144, 7);
    combatMenuGraphics.fillStyle(0x000066, 1); // Solid dark blue
    combatMenuGraphics.fillRoundedRect(50, 600, 924, 150, 7);
  }

  createCombatMenuOptions() {
    this.combatMenuOptions = ["Attack", "Spells", "Items", "Concede"];
    this.arrows = []; // An array to store the arrow icons

    this.combatMenuOptions.forEach((option, index) => {
      const arrow = this.add
        .text(50, 615 + index * 35, "→", {
          fontSize: "20px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
        })
        .setVisible(index === this.selectedOptionIndex); // Set visibility true only for the Attack option initially

      this.arrows.push(arrow); // Store it in the array
    });

    this.combatMenuOptions.forEach((option, index) => {
      const menuItem = this.add
        .text(70, 615 + index * 35, option, {
          fontSize: "20px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
          fontStyle: "normal",
          align: "left",
        })
        .setInteractive();

      menuItem.on("pointerdown", () => {
        this.handleCombatOption(option);
      });
    });
  }

  updateSelectedOption() {
    // First, hide all arrows
    this.arrows.forEach((arrow) => arrow.setVisible(false));

    // Then, show the selected one
    this.arrows[this.selectedOptionIndex].setVisible(true);
  }

  getRandomName() {
    const names = [
      "Aria",
      "Eldric",
      "Luna",
      "Orion",
      "Zara",
      "Kael",
      "Iris",
      "Galen",
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  createPlayerHPBars() {
    const players = ["player1", "player2", "player3"];

    players.forEach((player, index) => {
      const playerName = this.getRandomName();
      this.add.text(280, 610 + index * 35, playerName, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });

      // Assuming a sample HP value here; you should replace with actual HP
      const hpValue = `${Math.floor(Math.random() * 100)}/100`;
      this.add.text(430, 610 + index * 35, hpValue, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });
    });
  }

  createEnemyHPBars() {
    const enemies = ["enemy1", "enemy2", "enemy3"];

    enemies.forEach((enemy, index) => {
      const enemyName = this.getRandomName();
      this.add.text(600, 610 + index * 35, enemyName, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });

      // Assuming a sample HP value here; you should replace with actual HP
      const hpValue = `${Math.floor(Math.random() * 100)}/100`;
      this.add.text(750, 610 + index * 35, hpValue, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });
    });
  }

  createCombatMenuBackground() {
    let combatMenuGraphics = this.add.graphics();

    // Colors and properties
    const bgColor = 0x000066; // Solid dark blue
    const shadowColor = 0x000033; // Dark blue, slightly transparent

    // Left box (combat options)
    combatMenuGraphics.fillStyle(shadowColor, 0.8);
    combatMenuGraphics.fillRoundedRect(53, 603, 206, 144, 7);
    combatMenuGraphics.fillStyle(bgColor, 1);
    combatMenuGraphics.fillRoundedRect(50, 600, 210, 150, 7);

    // Middle box (player HP) - increase x by 20 for spacing
    combatMenuGraphics.fillStyle(shadowColor, 0.8);
    combatMenuGraphics.fillRoundedRect(273, 603, 306, 144, 7);
    combatMenuGraphics.fillStyle(bgColor, 1);
    combatMenuGraphics.fillRoundedRect(270, 600, 310, 150, 7);

    // Right box (enemy HP) - increase x by 20 for spacing
    combatMenuGraphics.fillStyle(shadowColor, 0.8);
    combatMenuGraphics.fillRoundedRect(593, 603, 306, 144, 7);
    combatMenuGraphics.fillStyle(bgColor, 1);
    combatMenuGraphics.fillRoundedRect(590, 600, 310, 150, 7);
  }

  backToMenu() {
    this.scene.bringToTop("GameScene");
    this.scene.stop("PVPMatchmakingScene");
    this.scene.remove("PVPMatchmakingScene"); // Removing the scene
  }

  update() {
    // Update logic if needed...
  }
}

export default PVPMatchmakingScene;
