import Phaser from "phaser";

class PVPMatchmakingScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;

    this.combatMenuOptions = [];

    this.selectedEnemyIndex = 0;
    this.attacking = false;
    this.enemies = []; // To store enemy sprites
    this.enemyHighlightGraphic = null;
    this.enemyHPHighlightGraphic = null;
    this.playerTextObjects = []; // Add this to the class constructor or the create method
    this.spells = [
      {
        name: "Fireball",
        description: "A ball of fire dealing damage to an enemy.",
      },
      { name: "Heal", description: "Heals a party member." },
      {
        name: "Lightning Strike",
        description: "A bolt of lightning hitting an enemy.",
      },
      {
        name: "Protection",
        description: "Shields a party member from attacks.",
      },
      { name: "Curse", description: "Weakens an enemy's defenses." },
    ];
    this.selectedSpellIndex = 0;
    this.inSpellMenu = false;
    this.spellMenuGraphics = null;
    this.spellTextObjects = [];
    this.spellDescriptionText = null;
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
    this.backgroundContainer = this.add.container();
    this.foregroundContainer = this.add.container();
    this.menuContainer = this.add.container();

    this.backgroundContainer.add(
      this.add.image(0, 0, "pvpBackground").setOrigin(0, 0)
    );

    this.selectedOptionIndex = 0;

    this.currentPlayerTurn = 0; // 0 = player1, 1 = player2, 2 = player3

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

    this.foregroundContainer.add(backButton);

    backButton.on("pointerdown", () => {
      this.backToMenu();
    });

    // Adding player sprites to the foreground container
    const player1 = this.add.sprite(150, 200, "player1");
    const player2 = this.add.sprite(150, 350, "player2");
    const player3 = this.add.sprite(150, 500, "player3");
    this.foregroundContainer.add([player1, player2, player3]);

    // Adding enemy sprites to the foreground container
    const enemy1 = this.add.sprite(850, 200, "enemy1");
    const enemy2 = this.add.sprite(850, 350, "enemy2");
    const enemy3 = this.add.sprite(850, 500, "enemy3");
    this.foregroundContainer.add([enemy1, enemy2, enemy3]);

    this.enemies = [enemy1, enemy2, enemy3]; // Store the enemy sprites

    this.playerSprites = [player1, player2, player3];

    this.createCombatMenuBackground();
    this.createCombatMenuOptions();
    this.createPlayerHPBars();
    this.createEnemyHPBars();
    this.highlightPlayerTurn();

    this.input.keyboard.on("keydown-UP", () => {
      if (this.inSpellMenu) {
        if (this.selectedSpellIndex > 0) {
          // If we're not at the top of the current page, just move the selection up
          this.selectedSpellIndex--;
        } else if (this.currentSpellPage > 0) {
          // If there are previous spells to show, scroll to the previous page
          this.currentSpellPage--;
          this.selectedSpellIndex = 3; // Set selection to the bottom of the previous page
          this.displaySpells();
        }
        this.updateSelectedSpell();
      } else if (this.attacking) {
        this.selectedEnemyIndex = Math.max(
          0,
          this.selectedEnemyIndex - 1
        );
        this.highlightEnemyHP(this.selectedEnemyIndex);
      } else {
        this.selectedOptionIndex = Math.max(
          0,
          this.selectedOptionIndex - 1
        );
        this.updateSelectedOption();
      }
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      if (this.inSpellMenu) {
        if (this.selectedSpellIndex < this.spells.length - 1) {
          // Added this line to ensure you don't go past the spell list's end.
          if (
            this.selectedSpellIndex <
            this.spellTextObjects.length - 1
          ) {
            // If we're not at the bottom of the current page, just move the selection down
            this.selectedSpellIndex++;
          } else if (
            (this.currentSpellPage + 1) * 4 <
            this.spells.length
          ) {
            // If there are more spells to show, scroll to next page
            this.currentSpellPage++;
            this.selectedSpellIndex = 0; // Reset selection to top of new page
            this.displaySpells();
          }
          this.updateSelectedSpell();
        }
      } else if (this.attacking) {
        this.selectedEnemyIndex = Math.min(
          this.enemies.length - 1,
          this.selectedEnemyIndex + 1
        );
        this.highlightEnemyHP(this.selectedEnemyIndex);
      } else {
        this.selectedOptionIndex = Math.min(
          this.combatMenuOptions.length - 1,
          this.selectedOptionIndex + 1
        );
        this.updateSelectedOption();
      }
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      if (this.inSpellMenu) {
        // Add logic to handle the spell casting here
        console.log(
          `Casting ${this.spells[this.selectedSpellIndex].name}`
        );
        // For now, let's just log the casting and then exit the spell menu
        this.exitSpellMenu();
      }
      if (this.attacking) {
        // Add your attack logic here, using this.selectedEnemyIndex to know which enemy was targeted
        if (this.enemyHighlightGraphic) {
          this.enemyHighlightGraphic.destroy();
        }
        this.attacking = false; // Reset the attack state
        if (this.enemyHPHighlightGraphic) {
          this.enemyHPHighlightGraphic.destroy();
        }
      } else {
        this.handleCombatOption(
          this.combatMenuOptions[this.selectedOptionIndex]
        );
      }
    });
  }

  handleCombatOption(option) {
    switch (option) {
      case "Attack":
        this.attacking = true;
        this.highlightEnemyHP(this.selectedEnemyIndex);
        break;
      case "Spells":
        this.showSpellMenu();
        break;
    }
  }

  showSpellMenu() {
    this.inSpellMenu = true;
    this.removePlayerHPBars();
    this.selectedSpellIndex = 0;
    this.currentSpellPage = 0; // To track which "page" or set of spells we are on

    // Hide player HP bars and arrows
    this.arrows.forEach((arrow) => arrow.setVisible(false));

    // Display the initial set of spells
    this.displaySpells();
    this.updateSelectedSpell();
  }

  displaySpells() {
    // Clear previously displayed spells
    if (this.spellTextObjects && this.spellTextObjects.length) {
      this.spellTextObjects.forEach((text) => text.destroy());
      this.spellTextObjects = [];
    }

    const spellsToShow = this.spells.slice(
      this.currentSpellPage * 4,
      (this.currentSpellPage + 1) * 4
    );
    spellsToShow.forEach((spell, index) => {
      const spellText = this.add
        .text(290, 610 + index * 35, spell.name, {
          fontSize: "14px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
        })
        .setInteractive();
      this.spellTextObjects.push(spellText);
    });
  }

  updateSelectedSpell() {
    // Reset the colors for all spells
    this.spellTextObjects.forEach((spellText) =>
      spellText.setColor("#FFFFFF")
    );

    // Check if the selected index is a valid index within spellTextObjects
    if (
      this.selectedSpellIndex >= 0 &&
      this.selectedSpellIndex < this.spellTextObjects.length
    ) {
      // Highlight the selected spell
      this.spellTextObjects[this.selectedSpellIndex].setColor(
        "#FFD700"
      );

      // Display the spell description on the right
      if (this.spellDescriptionText) {
        this.spellDescriptionText.destroy();
      }
      const selectedSpell = this.spells[this.selectedSpellIndex];
      this.spellDescriptionText = this.add.text(
        390,
        610,
        selectedSpell.description,
        {
          fontSize: "10px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
          wordWrap: { width: 280 },
        }
      );
    }
  }

  exitSpellMenu() {
    this.inSpellMenu = false;
    this.spellTextObjects.forEach((spellText) => spellText.destroy());
    if (this.spellDescriptionText) {
      this.spellDescriptionText.destroy();
    }

    // Redraw the player HP bars and arrows
    this.createPlayerHPBars();
    this.updateSelectedOption();
  }

  highlightEnemyHP(index) {
    // Reset the HP bar highlight for all enemies
    this.enemies.forEach((_, idx) => {
      // Logic to unhighlight the HP bar for enemy at index 'idx'
    });

    // Remove the existing highlight graphic if it exists
    if (this.enemyHighlightGraphic) {
      this.enemyHighlightGraphic.destroy();
    }

    // Remove the existing enemy HP bar highlight graphic if it exists
    if (this.enemyHPHighlightGraphic) {
      this.enemyHPHighlightGraphic.destroy();
    }

    const enemyToHighlight = this.enemies[index];
    this.enemyHighlightGraphic = this.add.graphics({
      lineStyle: { width: 4, color: 0xff0000 }, // Red color highlight
    });
    this.enemyHighlightGraphic.strokeRect(
      enemyToHighlight.x - enemyToHighlight.width / 2 - 5,
      enemyToHighlight.y - enemyToHighlight.height / 2 - 5,
      enemyToHighlight.width + 10,
      enemyToHighlight.height + 10
    );

    // Highlight enemy's HP bar in the menu below
    this.enemyHPHighlightGraphic = this.add.graphics();
    this.enemyHPHighlightGraphic.fillStyle(0xff0000, 0.3); // semi-transparent red
    const hpBarMenuY = 600 + index * 35;
    this.enemyHPHighlightGraphic.fillRect(600, hpBarMenuY, 310, 35);
  }

  highlightPlayerTurn() {
    const currentPlayerSprite =
      this.playerSprites[this.currentPlayerTurn];

    // Create inverted white triangle above the player sprite
    this.createTriangleAboveSprite(currentPlayerSprite);

    // Highlight player's HP bar
    this.hpGraphics = this.add.graphics();
    this.hpGraphics.fillStyle(0xffffff, 0.5); // semi-transparent white
    this.hpGraphics.fillRect(
      270,
      600 + this.currentPlayerTurn * 35,
      310,
      35
    );
  }

  createTriangleAboveSprite(sprite) {
    // If a triangle graphic already exists, destroy it to create a new one
    if (this.triangle) {
      this.triangle.destroy();
    }

    const triangleWidth = 30; // Reduced from 40
    const triangleHeight = 20; // Reduced from 30

    // Drawing the triangle using Phaser's Graphics API
    this.triangle = this.add.graphics({
      lineStyle: { width: 2, color: 0xffffff },
      fillStyle: { color: 0xffffff },
    });
    this.triangle.beginPath();
    this.triangle.moveTo(
      sprite.x - triangleWidth / 2,
      sprite.y - sprite.height / 2 - triangleHeight
    );
    this.triangle.lineTo(sprite.x, sprite.y - sprite.height / 2);
    this.triangle.lineTo(
      sprite.x + triangleWidth / 2,
      sprite.y - sprite.height / 2 - triangleHeight
    );
    this.triangle.closePath();
    this.triangle.strokePath();
    this.triangle.fillPath();
  }

  createCombatMenuBackground() {
    const combatMenuGraphics = this.add.graphics();
    combatMenuGraphics.fillStyle(0x000033, 0.8);
    combatMenuGraphics.fillRoundedRect(53, 603, 918, 144, 7);
    combatMenuGraphics.fillStyle(0x000066, 1);
    combatMenuGraphics.fillRoundedRect(50, 600, 924, 150, 7);
    this.menuContainer.add(combatMenuGraphics);
  }

  createCombatMenuOptions() {
    this.combatMenuOptions = ["Attack", "Spells", "Items", "Concede"];
    this.arrows = [];
    this.combatMenuOptions.forEach((option, index) => {
      const arrow = this.add
        .text(50, 615 + index * 35, "→", {
          fontSize: "20px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
        })
        .setVisible(index === this.selectedOptionIndex);
      this.arrows.push(arrow);
      this.menuContainer.add(arrow);

      const menuItem = this.add
        .text(70, 615 + index * 35, option, {
          fontSize: "20px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
          fontStyle: "normal",
          align: "left",
        })
        .setInteractive();
      this.menuContainer.add(menuItem);
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
      const nameText = this.add.text(
        280,
        610 + index * 35,
        playerName,
        {
          fontSize: "16px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
        }
      );

      const hpValue = `${Math.floor(Math.random() * 100)}/100`;
      const hpText = this.add.text(430, 610 + index * 35, hpValue, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });

      // Store the text objects for later removal
      this.playerTextObjects.push(nameText);
      this.playerTextObjects.push(hpText);
    });
  }

  removePlayerHPBars() {
    if (this.playerTextObjects && this.playerTextObjects.length > 0) {
      this.playerTextObjects.forEach((textObj) => {
        textObj.destroy();
      });

      this.playerTextObjects = [];
    }
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

    this.foregroundContainer.add(combatMenuGraphics);
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
