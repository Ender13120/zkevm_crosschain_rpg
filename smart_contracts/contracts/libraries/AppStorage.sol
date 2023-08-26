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
