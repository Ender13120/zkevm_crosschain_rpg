import Phaser from "phaser";

class CombatScene extends Phaser.Scene {
  constructor(config, parent) {
    super(config);
    this.parent = parent;

    this.combatContract = config.combatContract;
    this.signer = config.signer;
    this.currPlayerAddr = "0x";
    this.currentTurn = "0x";
    this.combatMenuOptions = [];
    this.spellCasted = false;
    this.names = ["warrior", "icemage", "paladin"];
    this.EnemyNames = ["Rat", "Bigger Rat", "Uber Rat"];
    this.hpValueParty = [100, 100, 100];
    this.maxHpValueParty = [100, 100, 100];
    this.hpValueEnemies = [100, 100, 100];
    this.maxHpValueEnemies = [100, 100, 100];
    this.selectedEnemyIndex = 0;
    this.attacking = false;
    this.meditating = false;
    this.combatExecutionObject = {
      Action: ["Attack", "CastSpell", "Defend"],
      targetIds: [0, 1, 2],
      spellTypes: ["Fireball", 1, 2],
    };
    this.currentPlayerTurn = 0;
    this.turnState = "player";

    this.player1 = "0x";
    this.player2 = "0x";
    this.enemies = []; // To store enemy sprites
    this.enemyHighlightGraphic = null;
    this.enemyHPHighlightGraphic = null;
    this.spellMenuRendered = false;
    this.enemyTurnText = null;
    this.playerTextObjects = []; // Add this to the class constructor or the create method
    this.enemyTextObjects = []; // Add this to the class constructor or the create method
    this.spells = [
      {
        name: "Fireball",
        description: "A ball of fire dealing damage to an enemy.",
        damage: 20,
      },
      {
        name: "Lightning Strike",
        description: "Lightning hitting a random enemy.",
        damage: 30,
      },
      {
        name: "Curse",
        description: "Weakens an enemy's defenses.",
        damage: 0,
      },

      //@notice for spells like these, we need to ignore targeting and just cast the spell
      {
        name: "Bless the Party",
        description: "Heals the party.",
        damage: 0,
      },
    ];
    this.selectedSpellIndex = 0;
    this.inSpellMenu = false;
    this.spellMenuGraphics = null;
    this.spellTextObjects = [];
    this.spellDescriptionText = null;
  }

  preload() {
    this.load.image("pvpBackground", "artwork/pvpBackground.jpg");
  }

  async create() {
    //@notice get match data.
    try {
      // Make the contract call

      const playerAddr = await this.signer.getAddress();
      this.currPlayerAddr = playerAddr;
      const matchData = await this.combatContract.getMatchForPlayer(
        playerAddr
      );

      console.log("Length of matchData:", matchData.length);
      console.log(matchData);
      // Extract data from matchData

      const player1 = matchData[0];
      const player2 = matchData[1];
      this.player1 = player1;
      this.player2 = player2;
      const isResolved = matchData[matchData.length - 4];
      const winner = matchData[matchData.length - 3];
      this.currentTurn = matchData[matchData.length - 2];

      //@TODO
      if (playerAddr == this.currentTurn) {
        this.currentPlayerTurn = 0; // 0 = player1, 1 = player2, 2 = player3
        this.turnState = "player";
      } else {
        this.currentPlayerTurn = 3; //@TODO this basically means its the enemies turn
        this.turnState = "enemy";
      }

      const lastActionTimestamp = matchData[matchData.length - 1];

      const statFields = [
        "name",
        "health",
        "ATK",
        "DEX",
        "INT",
        "CONST",
        "WIS",
      ];

      // Slice only the relevant parts of matchData for player stats
      const planeWalkersStatsFlat = matchData.slice(
        2,
        matchData.length - 4
      );

      const player1Flat = matchData[2];
      const player2Flat = matchData[3];

      console.log("player1Flat.length", player1Flat.length);
      console.log("player2Flat.length", player2Flat.length);
      const player1Team = [{}, {}, {}];
      const player2Team = [{}, {}, {}];

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
          player1Team[i][statFields[j]] = player1Flat[i][j];
          player2Team[i][statFields[j]] = player2Flat[i][j];
        }
      }

      console.log("player1Team:", player1Team);
      console.log("player2Team:", player2Team);

      // New code to decide which address to show where
      if (playerAddr === this.player1) {
        this.leftPlayerAddress = this.player1;
        this.rightPlayerAddress = this.player2;
      } else {
        this.leftPlayerAddress = this.player2;
        this.rightPlayerAddress = this.player1;
      }

      if (playerAddr === player1) {
        const partyInfo = this.extractTeamInfo(player1Team);
        const enemyInfo = this.extractTeamInfo(player2Team);

        this.names = partyInfo.names;
        this.hpValueParty = partyInfo.hpValues;
        this.maxHpValueParty = partyInfo.maxHpValues;

        this.EnemyNames = enemyInfo.names;
        this.hpValueEnemies = enemyInfo.hpValues;
        this.maxHpValueEnemies = enemyInfo.maxHpValues;
      } else {
        const partyInfo = this.extractTeamInfo(player2Team);
        const enemyInfo = this.extractTeamInfo(player1Team);

        this.names = partyInfo.names;
        this.hpValueParty = partyInfo.hpValues;
        this.maxHpValueParty = partyInfo.maxHpValues;

        this.EnemyNames = enemyInfo.names;
        this.hpValueEnemies = enemyInfo.hpValues;
        this.maxHpValueEnemies = enemyInfo.maxHpValues;
      }

      //console.log("Formatted Match Data:", formattedMatch);
    } catch (error) {
      console.error(
        "An error occurred while fetching the match data:",
        error
      );
    }
    this.backgroundContainer = this.add.container();
    this.foregroundContainer = this.add.container();
    this.menuContainer = this.add.container();

    this.names.forEach((character, index) => {
      this.load.image(
        `player${index + 1}`,
        `artwork/characters/${character}_asset.jpg`
      );
    });

    this.EnemyNames.forEach((character, index) => {
      this.load.image(
        `enemy${index + 1}`,
        `artwork/characters/${character}_asset.jpg`
      );
    });

    this.load.start();

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

    this.backgroundContainer.add(
      this.add.image(0, 0, "pvpBackground").setOrigin(0, 0)
    );

    this.foregroundContainer.add(backButton);

    backButton.on("pointerdown", () => {
      this.backToMenu();
    });

    this.load.once("complete", () => {
      // The new assets have been loaded, now you can use them
      // Here, you can either refresh sprites, draw new elements, etc.
      const player1 = this.add.sprite(150, 200, "player1");
      const player2 = this.add.sprite(150, 350, "player2");
      const player3 = this.add.sprite(150, 500, "player3");
      this.foregroundContainer.add([player1, player2, player3]);

      // Adding enemy sprites to the foreground container
      const enemy1 = this.add
        .sprite(850, 200, "enemy1")
        .setFlipX(true);
      const enemy2 = this.add
        .sprite(850, 350, "enemy2")
        .setFlipX(true);
      const enemy3 = this.add
        .sprite(850, 500, "enemy3")
        .setFlipX(true);

      const leftAddressText = this.add.text(
        60,
        100,
        this.leftPlayerAddress,
        { fontFamily: "PixelArtFont", fill: "#fff", fontSize: "16px" }
      );
      const rightAddressText = this.add.text(
        730,
        100,
        this.rightPlayerAddress,
        { fontFamily: "PixelArtFont", fill: "#fff", fontSize: "16px" }
      );

      this.foregroundContainer.add([
        player1,
        player2,
        player3,
        leftAddressText,
        rightAddressText,
      ]);
      this.initializeEventListener();
      this.initializeWinListener();
      this.enemies = [enemy1, enemy2, enemy3]; // Store the enemy sprites
      this.playerSprites = [player1, player2, player3];
      this.createCombatMenuBackground();
      this.createCombatMenuOptions();
      this.createPlayerHPBars();
      this.createEnemyHPBars();
      this.highlightPlayerTurn();
    });

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

        if (this.enemyHighlightGraphic) {
          this.enemyHighlightGraphic.destroy();
        }

        if (this.enemyHPHighlightGraphic) {
          this.enemyHPHighlightGraphic.destroy();
        }
        this.handleCombatOption("SpellsTargeting");
        this.spellMenuRendered = true;

        console.log(this.selectedSpellIndex);
      } else if (this.attacking) {
        if (this.spellCasted) {
          //do spell

          console.log(
            "current player character: ",
            this.currentPlayerTurn
          );

          this.combatExecutionObject.Action[
            this.currentPlayerTurn
          ] = 1; //"CastSpell"...we dont have enums in js, and porting to typescript will take me a bit.;

          this.combatExecutionObject.targetIds[
            this.currentPlayerTurn
          ] = this.selectedEnemyIndex;

          this.combatExecutionObject.spellTypes[
            this.currentPlayerTurn
          ] = 0; //this.spells[this.selectedSpellIndex].name; //@TODO ENUM MAPPING TO SPELLTYPE..current default is fireball
          //@TODO URGENT FIX AFTER TESTING!

          console.log(this.selectedSpellIndex);
          console.log(this.spells[this.selectedSpellIndex].name);
          console.log(this.selectedEnemyIndex);

          //@notice last character did his action, time to transmit tx:
          if (this.currentPlayerTurn == 2) {
            console.log("ready to execute on-chain combat exec:");
            console.log(this.combatExecutionObject);

            this.executeCombatOnchain();
          }
        } else if (this.meditating) {
          console.log(
            "current player character: ",
            this.currentPlayerTurn
          );

          this.combatExecutionObject.Action[
            this.currentPlayerTurn
          ] = 2; //"Defend"; //@notice @TODO need to rename the enum..

          this.combatExecutionObject.targetIds[
            this.currentPlayerTurn
          ] = this.selectedEnemyIndex; //@notice doesnt matter, since its a self-buff.

          this.combatExecutionObject.spellTypes[
            this.currentPlayerTurn
          ] = 0; //"Fireball"; //@notice..yeah I forgot to add a non-spell option, it doesnt affect anything, but should be cleaned up.

          console.log("meditating!");

          //@notice last character did his action, time to transmit tx:
          if (this.currentPlayerTurn == 2) {
            console.log("ready to execute on-chain combat exec:");
            console.log(this.combatExecutionObject);

            this.executeCombatOnchain();
          }
        } else {
          console.log(
            "current player character: ",
            this.currentPlayerTurn
          );
          this.combatExecutionObject.Action[
            this.currentPlayerTurn
          ] = 0; //"Attack"; //@notice @TODO need to rename the enum..

          this.combatExecutionObject.targetIds[
            this.currentPlayerTurn
          ] = this.selectedEnemyIndex; //@notice doesnt matter, since its a self-buff.

          this.combatExecutionObject.spellTypes[
            this.currentPlayerTurn
          ] = 0; //"Fireball"; //@notice..yeah I forgot to add a non-spell option, it doesnt affect anything, but should be cleaned up.

          console.log("attacking!");
          console.log(this.selectedEnemyIndex);

          //@notice last character did his action, time to transmit tx:
          if (this.currentPlayerTurn == 2) {
            console.log("ready to execute on-chain combat exec:");
            console.log(this.combatExecutionObject);

            this.executeCombatOnchain();
          }
        }

        if (this.enemyHighlightGraphic) {
          this.enemyHighlightGraphic.destroy();
        }
        this.attacking = false; // Reset the attack state
        if (this.enemyHPHighlightGraphic) {
          this.enemyHPHighlightGraphic.destroy();
        }

        this.nextPlayerTurn();
        if (this.spellMenuRendered) {
          this.exitSpellMenu();
        }
      } else {
        this.handleCombatOption(
          this.combatMenuOptions[this.selectedOptionIndex]
        );
      }
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.resetToMainCombatMenu();
    });

    this.input.keyboard.on("keydown-LEFT", () => {
      this.resetToMainCombatMenu();
    });
  }

  async executeCombatOnchain() {
    let tx = await this.combatContract.executeCombatTurnPlayer(
      this.combatExecutionObject.Action,
      this.combatExecutionObject.targetIds,
      this.combatExecutionObject.spellTypes
    );
    console.log("combat exec tx:", tx);

    if (this.enemyTurnText) {
      // If the text already exists, destroy it first
      this.enemyTurnText.destroy();
    }

    this.enemyTurnText = this.add.text(
      375,
      90,
      "executing combat orders",
      {
        fontFamily: "PixelArtFont",
        fill: "#fff",
        fontSize: "36px",
      }
    );
    this.foregroundContainer.add([this.enemyTurnText]);

    await tx.wait();

    console.log("combat exec tx receipt:", tx);
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

      case "Meditating":
        this.meditating = true;
        break;

      case "SpellsTargeting":
        console.log("entered SpellsTargeting");
        this.inSpellMenu = false;
        this.attacking = true;
        this.highlightEnemyHP(this.selectedEnemyIndex);
        break;

      case "Leave":
        console.log(
          "match left(@TODO add surrender function to combatFacet)"
        );

        this.backToMenu();
    }
  }

  nextPlayerTurn() {
    console.log(this.turnState);

    if (this.turnState === "player") {
      // Increment currentPlayerTurn or reset to 0 if we're already at the last player
      this.currentPlayerTurn =
        (this.currentPlayerTurn + 1) % this.playerSprites.length;

      // Transition to enemy turn if needed
      if (this.currentPlayerTurn === 3) {
        this.turnState = "enemy";
        // No need to add "enemies turn!" text here, it should be handled in highlightPlayerTurn
        this.highlightPlayerTurn(); // Moved this here to highlight as soon as turn switches
        return;
      }
      if (this.currentPlayerTurn == null) {
        this.currentPlayerTurn = 0;
      }
    } else if (this.turnState === "enemy") {
      // Uncomment these to reset to player's turn
      this.turnState = "player";
      this.currentPlayerTurn = 0;
    }

    // Now highlight the current player's turn
    this.highlightPlayerTurn();
    this.removePlayerHPBars();
    this.createPlayerHPBars();
  }

  extractTeamInfo(team) {
    return {
      names: team.map((member) => member.name),
      hpValues: team.map((member) => member.health),
      maxHpValues: team.map((member) => member.health),
    };
  }

  showSpellMenu() {
    this.inSpellMenu = true;
    this.spellCasted = true;
    this.removePlayerHPBars();
    if (this.hpGraphics) {
      this.hpGraphics.destroy();
    }

    this.selectedSpellIndex = 0;
    this.currentSpellPage = 0; // To track which "page" or set of spells we are on

    // Hide player HP bars and arrows
    this.arrows.forEach((arrow) => arrow.setVisible(false));

    // Display the initial set of spells
    this.displaySpells();
    this.updateSelectedSpell();
  }

  displaySuccessMessage() {
    const successTextStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "64px",
      color: "#00FF00", // Green color for success
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
        this.sys.game.config.height - 500,
        "You have won!",
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
        this.sys.game.config.height - 250,
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

    // Optionally, you can add a timer to remove this text after a few seconds
    this.time.delayedCall(
      90000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    ); // This will remove the text and button after 5 seconds
  }

  displayLostMessage() {
    const successTextStyle = {
      fontFamily: "PixelArtFont",
      fontSize: "64px",
      color: "#00FF00", // Green color for success
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
        this.sys.game.config.height - 250,
        "You have lost!",
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

    // Optionally, you can add a timer to remove this text after a few seconds
    this.time.delayedCall(
      30000,
      () => {
        successText.destroy();
        backButton.destroy();
      },
      [],
      this
    ); // This will remove the text and button after 5 seconds
  }

  resetToMainCombatMenu() {
    // If currently in spell menu, exit it
    if (this.inSpellMenu) {
      this.exitSpellMenu();
    }

    // If currently attacking, reset attack state
    if (this.attacking) {
      this.attacking = false;
    }

    // If currently attacking, reset attack state
    if (this.meditating) {
      this.meditating = false;
    }

    // Remove any highlights or targeting graphics
    if (this.enemyHighlightGraphic) {
      this.enemyHighlightGraphic.destroy();
    }

    if (this.enemyHPHighlightGraphic) {
      this.enemyHPHighlightGraphic.destroy();
    }

    // Redraw the player HP bars and arrows (if needed)
    this.exitSpellMenu();

    this.updateSelectedOption();
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
    this.spellMenuRendered = false;
    this.spellCasted = true;

    this.spellTextObjects.forEach((spellText) => spellText.destroy());
    if (this.spellDescriptionText) {
      this.spellDescriptionText.destroy();
    }

    // Redraw the player HP bars and arrows
    this.removePlayerHPBars();
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
    if (this.turnState === "enemy") {
      if (this.enemyTurnText) {
        // If the text already exists, destroy it first
        this.enemyTurnText.destroy();
      }

      this.enemyTurnText = this.add.text(375, 80, "enemies turn!", {
        fontFamily: "PixelArtFont",
        fill: "#ff0000",
        fontSize: "64px",
      });
      this.foregroundContainer.add([this.enemyTurnText]);

      // No need to reset to player's turn here as this block is for the enemy's turn
      return;
    } else {
      // This block handles the player's turn
      if (this.enemyTurnText) {
        // If the text exists, destroy it
        this.enemyTurnText.destroy();
        this.enemyTurnText = null; // Reset the reference
      }

      this.enemyTurnText = this.add.text(375, 80, "your turn!", {
        fontFamily: "PixelArtFont",
        fill: "#fff",
        fontSize: "64px",
      });
      this.foregroundContainer.add([this.enemyTurnText]);
    }

    //@TODO enem turn logic
    const currentPlayerSprite =
      this.playerSprites[this.currentPlayerTurn];

    // Create inverted white triangle above the player sprite
    this.createTriangleAboveSprite(currentPlayerSprite);

    if (this.hpGraphics) {
      this.hpGraphics.destroy();
    }

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

    const triangleWidth = 20; // Reduced from 40
    const triangleHeight = 15; // Reduced from 30

    // Drawing the triangle using Phaser's Graphics API
    this.triangle = this.add.graphics({
      lineStyle: { width: 2, color: 0x000000 }, // Black outline
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

  createCombatMenuOptions() {
    this.combatMenuOptions = [
      "Attack",
      "Spells",
      "Meditate",
      "Leave",
    ];
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

  createPlayerHPBars() {
    // Destroy any existing text objects to avoid duplicates
    if (this.playerTextObjects.length > 0) {
      this.playerTextObjects.forEach((textObject) => {
        textObject.destroy();
      });
      this.playerTextObjects = [];
    }

    const players = ["player1", "player2", "player3"];

    players.forEach((player, index) => {
      const playerName = this.names[index];
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

      const hpValue = `${this.hpValueParty[index]}/${this.maxHpValueParty[index]}`;
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

  initializeEventListener() {
    this.combatContract.on(
      "turnStarted",
      async (playersTurn, matchId) => {
        if (true) {
          //(playersTurn == this.currPlayerAddr
          console.log(
            "turnstarted event was triggered and concerns us"
          );
          // Fetch updated contract data
          this.fetchAndUpdateContractData();
        }
      }
    );
  }

  initializeWinListener() {
    this.combatContract.on("MatchResolved", async (winner, loser) => {
      if (this.currPlayerAddr == winner) {
        // Fetch updated contract data
        console.log("you have won!");
        this.displaySuccessMessage();
      } else {
        console.log("you lost!");
        this.displayLostMessage();
      }
    });
  }

  updateGameState(playersTurn) {
    if (playersTurn === this.currPlayerAddr) {
      this.currentPlayerTurn = 0; // Assuming 0 is always the current player's index
      this.turnState = "player";

      this.removePlayerHPBars();
      this.createPlayerHPBars();
    } else {
      this.currentPlayerTurn = 3; // 3 or any index that signifies it's the enemy's turn
      this.turnState = "enemy";
    }

    this.createEnemyHPBars();

    this.highlightPlayerTurn();
  }

  //@TODO fix

  async fetchAndUpdateContractData() {
    try {
      const playerAddr = await this.signer.getAddress();
      const matchData = await this.combatContract.getMatchForPlayer(
        playerAddr
      );

      // ... (Your current logic to unpack matchData goes here)

      const player1 = matchData[0];
      const player2 = matchData[1];
      this.player1 = player1;
      this.player2 = player2;
      const isResolved = matchData[matchData.length - 4];
      const winner = matchData[matchData.length - 3];
      this.currentTurn = matchData[matchData.length - 2];

      //@TODO
      if (playerAddr == this.currentTurn) {
        this.currentPlayerTurn = 0; // 0 = player1, 1 = player2, 2 = player3
        this.turnState = "player";
      } else {
        this.currentPlayerTurn = 3; //@TODO this basically means its the enemies turn
        this.turnState = "enemy";
      }

      const lastActionTimestamp = matchData[matchData.length - 1];

      const statFields = [
        "name",
        "health",
        "ATK",
        "DEX",
        "INT",
        "CONST",
        "WIS",
      ];

      // Slice only the relevant parts of matchData for player stats
      const planeWalkersStatsFlat = matchData.slice(
        2,
        matchData.length - 4
      );

      const player1Flat = matchData[2];
      const player2Flat = matchData[3];

      const player1Team = [{}, {}, {}];
      const player2Team = [{}, {}, {}];

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 7; j++) {
          player1Team[i][statFields[j]] = player1Flat[i][j];
          player2Team[i][statFields[j]] = player2Flat[i][j];
        }
      }

      let hpDifferenceParty = []; // Moved to the top-level scope
      let hpDifferenceEnemies = []; // Moved to the top-level scope

      if (playerAddr === player1) {
        const partyInfo = this.extractTeamInfo(player1Team);
        const enemyInfo = this.extractTeamInfo(player2Team);

        if (this.hpValueParty) {
          hpDifferenceParty = this.hpValueParty.map(
            (oldHp, index) => partyInfo.hpValues[index] - oldHp
          );
        }
        if (this.hpValueEnemies) {
          hpDifferenceEnemies = this.hpValueEnemies.map(
            (oldHp, index) => enemyInfo.hpValues[index] - oldHp
          );
        }
        console.log("MARKER!");
        console.log(partyInfo);
        console.log(enemyInfo);

        // Update new HP values
        this.names = partyInfo.names;
        this.hpValueParty = partyInfo.hpValues;
        this.EnemyNames = enemyInfo.names;
        this.hpValueEnemies = enemyInfo.hpValues;
      } else {
        const partyInfo = this.extractTeamInfo(player2Team);
        const enemyInfo = this.extractTeamInfo(player1Team);

        console.log("hp values:");
        console.log("party:", partyInfo);
        console.log("enemies:", enemyInfo);

        // Reuse the hpDifferenceParty and hpDifferenceEnemies declared at the top-level scope
        if (this.hpValueParty) {
          hpDifferenceParty = this.hpValueParty.map(
            (oldHp, index) => partyInfo.hpValues[index] - oldHp
          );
        }

        this.names = partyInfo.names;
        this.hpValueParty = partyInfo.hpValues;

        if (this.hpValueEnemies) {
          hpDifferenceEnemies = this.hpValueEnemies.map(
            (oldHp, index) => enemyInfo.hpValues[index] - oldHp
          );
        }

        this.EnemyNames = enemyInfo.names;
        this.hpValueEnemies = enemyInfo.hpValues;
      }

      if (hpDifferenceParty.length > 0) {
        this.animateHpChange("party", hpDifferenceParty);
      }
      if (hpDifferenceEnemies.length > 0) {
        this.animateHpChange("enemies", hpDifferenceEnemies);
      }

      //console.log("Formatted Match Data:", formattedMatch);

      // Assume updateHPValues is a method that will update the HP values based on new contract data
      // this.updateHPValues(matchData);

      // Update the game state
      this.updateGameState(this.currentTurn);
    } catch (error) {
      console.error(
        "An error occurred while fetching the match data:",
        error
      );
    }
  }

  animateHpChange(group, hpDifference) {
    console.log(`Animating HP change for ${group}:`, hpDifference);

    let sprites, x_offset, y_offset;

    if (group === "party") {
      sprites = this.playerSprites;
      console.log("sprites", sprites);
      x_offset = 20 + 50;
      y_offset = -95 + 100;
    } else {
      sprites = this.enemies;
      console.log("sprites", sprites);
      x_offset = 20 + 50;
      y_offset = -95 + 100;
    }

    for (let i = 0; i < hpDifference.length; i++) {
      if (hpDifference[i]) {
        const damageText = this.add.text(
          sprites[i].x + x_offset,
          sprites[i].y + y_offset,
          `-${hpDifference[i]}`,
          {
            fontFamily: "PixelArtFont",
            fill: "#990000",
            fontSize: "46px",
            stroke: "#fff",
            strokeThickness: 2,
          }
        );

        this.tweens.add({
          targets: damageText,
          y: sprites[i].y + y_offset - 50,
          alpha: 0,
          duration: 45000, //reduce after testing
          ease: "Power2",
          onComplete: function (tween, targets) {
            damageText.destroy();
          },
        });
      }
    }
  }

  createEnemyHPBars() {
    const enemies = ["enemy1", "enemy2", "enemy3"];

    if (this.enemyTextObjects.length > 0) {
      this.enemyTextObjects.forEach((textObject) => {
        textObject.destroy();
      });
      this.enemyTextObjects = [];
    }

    enemies.forEach((enemy, index) => {
      const enemyName = this.EnemyNames[index];
      const nameText = this.add.text(
        600,
        610 + index * 35,
        enemyName,
        {
          fontSize: "16px",
          fontFamily: "combatfont",
          color: "#FFFFFF",
        }
      );

      // Assuming a sample HP value here; you should replace with actual HP
      const hpValue = `${this.hpValueEnemies[index]}/${this.maxHpValueEnemies[index]}`;
      const hpText = this.add.text(750, 610 + index * 35, hpValue, {
        fontSize: "16px",
        fontFamily: "combatfont",
        color: "#FFFFFF",
      });

      this.enemyTextObjects.push(nameText);
      this.enemyTextObjects.push(hpText);
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
    this.scene.stop("CombatScene");
    this.scene.remove("CombatScene");

    this.game.scene.start("GameScene");
  }

  update() {
    // Update logic if needed...
  }
}

export default CombatScene;
