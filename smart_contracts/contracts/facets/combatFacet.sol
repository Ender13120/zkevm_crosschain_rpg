//@TODO actual combat mechanics implementation//@TODO Management of Teams, so stat allocation & levelups, skills changes, appearence changes

//@TODO actual zkEVM bridging process

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AppStorage, Modifiers, PlanewalkersStats, Match, Action, Spell, SpellType} from "../libraries/AppStorage.sol";
import "../nft_contract/SpiritHeroes.sol";
import "../interfaces/polygonBridge.sol";
import "../interfaces/IERC721.sol";
import "./teamFacet.sol";

// Contract for open access NFT bridge
contract CombatFacet is Modifiers {
    event NewMatch(address indexed player1, address indexed player2);
    event MatchResolved(address indexed winner, address indexed loser);

    event rewardsSentToL1(address indexed owner, bytes indexed nftPayload);

    event turnStarted(address indexed playersTurn, uint indexed matchId);

    // Players join a queue to find a match
    function lookForMatch(uint256[] memory _nftIds) external {
        // Ensure the player chooses exactly 3 heroes
        require(_nftIds.length == 3, "Select exactly 3 heroes!");

        require(
            TeamFacet(address(this)).checkOwnerships(_nftIds, msg.sender),
            "ownership not confirmed!"
        );

        require(
            s.playerMatches[s.currentMatchId[msg.sender]].lastActionTimestamp ==
                0,
            "match already running!"
        );

        // Store the NFTs associated with the player
        s.queuedPlayerNFTS[msg.sender] = _nftIds;
        s.matchQueue.push(msg.sender);

        if (s.matchQueue.length >= 2) {
            address player1 = s.matchQueue[0];
            address player2 = s.matchQueue[1];

            //@TODO matchQueue shouldnt trigger when player 1 and 2 are the same
            require(player1 != player2, "cannot play against yourself!");
            PlanewalkersStats[] memory stats1 = TeamFacet(address(this))
                .getTeamStats(s.queuedPlayerNFTS[player1]);
            PlanewalkersStats[] memory stats2 = TeamFacet(address(this))
                .getTeamStats(s.queuedPlayerNFTS[player2]);

            Match storage newMatch = s.playerMatches[s.currentMatchCount];
            s.currentMatchId[player1] = s.currentMatchCount;
            s.currentMatchId[player2] = s.currentMatchCount;
            s.currentMatchCount++;

            newMatch.player1 = player1;
            newMatch.player2 = player2;
            for (uint i = 0; i < 3; i++) {
                newMatch.player1NFTs[i] = stats1[i];
                newMatch.player2NFTs[i] = stats2[i];
            }
            newMatch.isResolved = false;
            newMatch.winner = address(0);

            newMatch.currentTurn = player1;
            newMatch.lastActionTimestamp = block.timestamp;

            // Emit event to notify of the new match
            emit NewMatch(player1, player2);

            // Remove the two players from the queue
            s.matchQueue.pop();
            s.matchQueue.pop();
        }
    }

    function getMatchForPlayer(
        address _player
    ) external view returns (Match memory) {
        Match memory playerMatch = s.playerMatches[
            s.currentMatchId[msg.sender]
        ];
        require(
            playerMatch.player1 == _player || playerMatch.player2 == _player,
            "No match found for player"
        );
        return playerMatch;
    }

    function executeCombatTurnPlayer(
        Action[3] memory heroActions,
        uint256[3] memory targetIds, // used for actions that need a target, ignored otherwise
        SpellType[3] memory spellTypes
    ) external {
        Match storage currentPlayerMatch = s.playerMatches[
            s.currentMatchId[msg.sender]
        ];

        // Ensure the match exists and it's the player's turn
        require(
            currentPlayerMatch.player1 == msg.sender ||
                currentPlayerMatch.player2 == msg.sender,
            "You're not part of the match"
        );
        require(
            currentPlayerMatch.currentTurn == msg.sender,
            "It's not your turn"
        );

        for (uint i = 0; i < 3; i++) {
            PlanewalkersStats memory currentHero;

            if (msg.sender == currentPlayerMatch.player1) {
                currentHero = currentPlayerMatch.player1NFTs[i];
            } else {
                currentHero = currentPlayerMatch.player2NFTs[i];
            }
            //@notice only do hero action if they have more than 0 hp.
            if (currentHero.health > 0) {
                if (heroActions[i] == Action.Attack) {
                    _attackHero(currentPlayerMatch, i, targetIds[i]);
                } else if (heroActions[i] == Action.CastSpell) {
                    _castSpell(
                        currentPlayerMatch,
                        i,
                        targetIds[i],
                        spellTypes[i]
                    );
                } else if (heroActions[i] == Action.Defend) {
                    _meditateHero(currentPlayerMatch, i);
                }
            }
        }

        // Switch the turn to the other player after executing actions
        currentPlayerMatch.currentTurn = currentPlayerMatch.player1 ==
            msg.sender
            ? currentPlayerMatch.player2
            : currentPlayerMatch.player1;
        currentPlayerMatch.lastActionTimestamp = block.timestamp;

        //@TODO when you see this event, update match data on frontend to refresh hp
        emit turnStarted(
            currentPlayerMatch.currentTurn,
            s.currentMatchId[msg.sender]
        );
        // Check if the opposing team has been defeated
        if (
            msg.sender == currentPlayerMatch.player1 &&
            _isTeamDefeated(currentPlayerMatch.player2NFTs)
        ) {
            _resolveMatch(currentPlayerMatch, currentPlayerMatch.player1);
        } else if (
            msg.sender == currentPlayerMatch.player2 &&
            _isTeamDefeated(currentPlayerMatch.player1NFTs)
        ) {
            _resolveMatch(currentPlayerMatch, currentPlayerMatch.player2);
        }
    }

    // Placeholder functions for the actions. You'll need to implement the details.

    function _attackHero(
        Match storage _match,
        uint256 heroIndex,
        uint256 targetId
    ) internal {
        address attacker = msg.sender;
        PlanewalkersStats memory attackingHero;
        if (attacker == _match.player1) {
            attackingHero = _match.player1NFTs[heroIndex];
        } else {
            attackingHero = _match.player2NFTs[heroIndex];
        }

        // Damage is simply the attacker's ATK for now, can be expanded later
        int damage = attackingHero.ATK;

        _dealDamage(_match, targetId, damage);
    }

    function _castSpell(
        Match storage _match,
        uint256 heroIndex,
        uint256 targetId,
        SpellType spellType
    ) internal {
        Spell memory chosenSpell = s.spells[spellType];

        // Ensure target is selected if required by the spell
        /*
        require(
            chosenSpell.requiresTarget == (targetId != 0),
            "Invalid target specification for spell"
        );

        */

        if (spellType == SpellType.Fireball) {
            _dealDamage(_match, targetId, chosenSpell.damage);
        } else if (spellType == SpellType.LightningStrike) {
            uint256 randomTarget = _getRandomTarget();
            _dealDamage(_match, randomTarget, chosenSpell.damage);
        } else if (spellType == SpellType.BlessTheParty) {
            _healParty(_match);
        }
    }

    function _dealDamage(
        Match storage _match,
        uint256 targetId,
        int damage
    ) internal {
        // Decide the target player
        PlanewalkersStats storage targetHero;
        if (msg.sender == _match.player1) {
            targetHero = _match.player2NFTs[targetId];
        } else {
            targetHero = _match.player1NFTs[targetId];
        }

        // Subtract the damage from target's health
        targetHero.health -= damage;

        // Optional: Check if the target hero's health goes below 0
        if (targetHero.health < 0) {
            targetHero.health = 0;
        }
    }

    function _healParty(Match storage _match) internal {
        PlanewalkersStats[3] storage heroes;

        if (msg.sender == _match.player1) {
            heroes = _match.player1NFTs;
        } else {
            heroes = _match.player2NFTs;
        }

        Spell memory healingSpell = s.spells[SpellType.BlessTheParty];
        int healingAmount = healingSpell.utilStrength;

        for (uint i = 0; i < 3; i++) {
            heroes[i].health += healingAmount;

            // To be readded later, healthcap
            // if (heroes[i].health > SOME_MAX_VALUE) {
            //     heroes[i].health = SOME_MAX_VALUE;
            // }
        }
    }

    function _meditateHero(Match storage _match, uint256 heroIndex) internal {
        PlanewalkersStats storage meditatingHero;
        if (msg.sender == _match.player1) {
            meditatingHero = _match.player1NFTs[heroIndex];
        } else {
            meditatingHero = _match.player2NFTs[heroIndex];
        }

        if (meditatingHero.health > 0) {
            // Increase the stats of the hero.

            meditatingHero.health =
                meditatingHero.health +
                (meditatingHero.health * 5) /
                100; // +10% health
            meditatingHero.ATK =
                meditatingHero.ATK +
                (meditatingHero.ATK * 5) /
                100; // +5% attack
            meditatingHero.CONST =
                meditatingHero.CONST +
                (meditatingHero.CONST * 5) /
                100; // +5% constitution
            meditatingHero.INT =
                meditatingHero.INT +
                (meditatingHero.INT * 5) /
                100; // +5% intelligence
        }
    }

    function _getRandomTarget() internal view returns (uint256) {
        uint256 randomness = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        return randomness % 3; // returns 0, 1, or 2, representing the heroes' positions
    }

    // Check if all heroes in a team are defeated (their health <= 0)
    function _isTeamDefeated(
        PlanewalkersStats[3] storage team
    ) internal view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            if (team[i].health > 0) {
                return false;
            }
        }
        return true;
    }

    function _resolveMatch(Match storage _match, address winner) internal {
        _match.isResolved = true;
        _match.winner = winner;

        // Emit an event for match resolution
        emit MatchResolved(
            winner,
            winner == _match.player1 ? _match.player2 : _match.player1
        );

        //send rewards to l1
        _sendResultToL1(winner, true, s.queuedPlayerNFTS[winner]);


        delete s.queuedPlayerNFTS[_match.player1];
        delete s.playerMatches[s.currentMatchId[_match.player1]];
        delete s.currentMatchId[_match.player1];

        delete s.queuedPlayerNFTS[_match.player2];
        delete s.currentMatchId[_match.player2];
     
    }

    function _sendResultToL1(
        address _winner,
        bool _victory,
        uint[] memory _nftIds
    ) internal {
        bytes memory data = abi.encode(_winner, _victory, _nftIds);
        sendMessageToL1(s.currentSisterContract, data);
        emit rewardsSentToL1(msg.sender, data);
    }

    //@TODO refactor out to bridgeFacet
    //sending the message to the bridge with encoded data payload.
    function sendMessageToL1(address _to, bytes memory _calldata) internal {
        uint32 destinationNetwork = 1; //to testnet zkevm
        bool forceUpdateGlobalExitRoot = true;
        s.polygonBridge.bridgeMessage{value: msg.value}(
            destinationNetwork,
            _to,
            forceUpdateGlobalExitRoot,
            _calldata
        );
    }
}
