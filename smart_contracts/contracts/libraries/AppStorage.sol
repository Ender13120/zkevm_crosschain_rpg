// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {LibDiamond} from "./LibDiamond.sol";
import "../interfaces/polygonBridge.sol";
import "../nft_contract/SpiritHeroes.sol";

struct PlanewalkersStats {
    string name;
    int health;
    int ATK;
    int DEX;
    int INT;
    int CONST;
    int WIS;
}

struct Match {
    address player1;
    address player2;
    PlanewalkersStats[3] player1NFTs; // Array of NFT IDs for player 1
    PlanewalkersStats[3] player2NFTs; // Array of NFT IDs for player 2
    bool isResolved;
    address winner;
    address currentTurn;
    uint lastActionTimestamp;
}

enum Action {
    Attack,
    CastSpell,
    Defend
}

enum SpellType {
    Fireball,
    LightningStrike,
    Curse,
    BlessTheParty
}

struct Spell {
    string name;
    string description;
    int256 damage;
    int256 utilStrength;
    bool requiresTarget; // true if the spell requires a target, false otherwise
}

struct AppStorage {
    address heroContractAddress;
    address polygonzkEVMBridgeContractL1;
    address polygonzkEVMBridgeContractL2;
    address currentBridgeSignalContract;
    address currentSisterContract;
    uint32 goerliChainId;
    uint32 polygonChainIdZK;
    uint32 currentChainId;
    uint32 currentSisterChainId;
    uint currentChainType;
    bool sisterBridgeSetup;
    IPolygonBridgeContract polygonBridge;
    mapping(uint256 => PlanewalkersStats) tokenStats;
    mapping(uint => uint) ownershipBroadcastDate;
    mapping(uint => address) currentOwner;
    mapping(address => bool) alreadyCreatedTeam;
    uint256 ownershipDurationInterval;
    mapping(uint => uint) currentEXPHero;
    mapping(address => Match) playerMatches;
    mapping(address => uint256[]) queuedPlayerNFTS;
    mapping(SpellType => Spell) spells;
    address[] matchQueue;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }
}

contract Modifiers {
    AppStorage internal s;

    modifier onlyOwner() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "RegisterFacet: not self");
        _;
    }
}
