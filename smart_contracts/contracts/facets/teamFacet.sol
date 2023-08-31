//@TODO Management of Teams, so stat allocation & levelups, skills changes, appearence changes

//@TODO actual zkEVM bridging process

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AppStorage, Modifiers, PlanewalkersStats} from "../libraries/AppStorage.sol";
import "../nft_contract/SpiritHeroes.sol";
import "../interfaces/polygonBridge.sol";
import "../interfaces/IERC721.sol";

// Contract for open access NFT bridge
contract TeamFacet is Modifiers {
    event levelUp(
        uint indexed newLevel,
        uint indexed tokenId,
        address indexed player
    );

    //L1 Function
    //@notice creating a players team based on their choices:
    function selectAndCreateTeam(uint256[] memory _heroChoices) external {
        require(
            s.alreadyCreatedTeam[msg.sender] == false,
            "can only init team once"
        );
        // Ensure the player chooses exactly 3 heroes
        require(_heroChoices.length == 3, "Select exactly 3 heroes!");

        s.alreadyCreatedTeam[msg.sender] = true;
        IERC721(s.heroContractAddress).createTeam(msg.sender, _heroChoices);
    }

    //L2 Function
    function checkOwnershipDetails(
        uint256 _nftId
    ) external view returns (address owner, uint date) {
        owner = s.currentOwner[_nftId];
        date = s.ownershipBroadcastDate[_nftId];
        return (owner, date);
    }

    //L2 Function
    function checkOwnerships(
        uint256[] memory _nftIds,
        address _player
    ) external view returns (bool) {
        for (uint i = 0; i < _nftIds.length; i++) {
            if (
                s.ownershipBroadcastDate[_nftIds[i]] +
                    s.ownershipDurationInterval <
                block.timestamp
            ) {
                return false; //ownershipDurationInterval reached
            }
            if (s.currentOwner[_nftIds[i]] != _player) {
                return false; // One of the NFTs doesn't belong to _player
            }
        }

        return true;
    }

    //L2 Function
    function getAndValidateSpiritTeam(
        uint256[] memory _nftIds,
        address _player
    ) external view returns (PlanewalkersStats[] memory) {
        PlanewalkersStats[] memory statsArray = new PlanewalkersStats[](
            _nftIds.length
        );

        for (uint i = 0; i < _nftIds.length; i++) {
            require(
                s.currentOwner[_nftIds[i]] == _player,
                "Not your spirit NFT!"
            );

            PlanewalkersStats memory stats = IERC721(s.heroContractAddress)
                .getTokenStats(_nftIds[i]);
            statsArray[i] = stats;
        }

        return statsArray;
    }

    function getTeamStatsL1(
        uint256[] memory _nftIds
    ) external view returns (PlanewalkersStats[] memory) {
        PlanewalkersStats[] memory statsArray = new PlanewalkersStats[](
            _nftIds.length
        );

        for (uint i = 0; i < _nftIds.length; i++) {
            PlanewalkersStats memory stats = IERC721(s.heroContractAddress)
                .getTokenStats(_nftIds[i]);
            statsArray[i] = stats;
        }

        return statsArray;
    }

    //L2 function.
    function getTeamStats(
        uint256[] memory _nftIds
    ) external view returns (PlanewalkersStats[] memory) {
        PlanewalkersStats[] memory statsArray = new PlanewalkersStats[](
            _nftIds.length
        );

        for (uint i = 0; i < _nftIds.length; i++) {
            PlanewalkersStats memory stats = s.tokenStats[_nftIds[i]];

            statsArray[i] = stats;
        }

        return statsArray;
    }

    function getEXPTeam(
        uint256[] memory _nftIds
    ) external view returns (uint[] memory) {
        uint[] memory expArray = new uint[](_nftIds.length);

        for (uint i = 0; i < _nftIds.length; i++) {
            expArray[i] = s.currentEXPHero[_nftIds[i]];
        }

        return expArray;
    }

    //L2 Function
    //@notice, this is a temporary placeholder for a subgraph.
    function getNFTsOwnedBroadcastedBy(
        address _owner
    ) external view returns (uint256[] memory) {
        uint256[] memory ownedNFTs = new uint256[](1000); // Assuming a maximum of 1000 NFTs
        uint256 counter = 0;

        // placeholder, 1000 covers for testrounds
        for (uint256 i = 1; i <= 1000; i++) {
            if (s.currentOwner[i] == _owner) {
                ownedNFTs[counter] = i;
                counter++;
            }
        }

        // Resize the array to fit the actual number of NFTs found
        uint256[] memory result = new uint256[](counter);
        for (uint256 i = 0; i < counter; i++) {
            result[i] = ownedNFTs[i];
        }

        return result;
    }

    //L1 Function
    function levelUpHero(uint _nftId) external {
        require(
            IERC721(s.heroContractAddress).ownerOf(_nftId) == msg.sender,
            "Sender is not the owner of the NFT"
        );

        require(s.currentEXPHero[_nftId] >= 100, "not enough EXP to level");

        s.currentLevelHero[_nftId] += 1;

        s.currentEXPHero[_nftId] -= 100;

        emit levelUp(s.currentLevelHero[_nftId], _nftId, msg.sender);
    }


}
