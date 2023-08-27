//@TODO actual zkEVM bridging process

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AppStorage, Modifiers, PlanewalkersStats} from "../libraries/AppStorage.sol";
import "../nft_contract/SpiritHeroes.sol";
import "../interfaces/polygonBridge.sol";
import "../interfaces/IERC721.sol";

// Contract for open access NFT bridge
contract BridgeFacet is Modifiers {
    event bridgeRequestSent(address indexed owner, bytes indexed nftPayload);

    event bridgeSuccessOwnership(
        address newOwner,
        address indexed nftContract,
        uint indexed nftId
    );

    event bridgeData(address indexed sender, bytes32 indexed dataPayload);

    function broadcastOwnershipToL2(uint256[] memory nftIds) external {
        require(nftIds.length > 0, "No NFTs specified");

        bytes[] memory tokenDataArray = new bytes[](nftIds.length);

        for (uint i = 0; i < nftIds.length; i++) {
            require(
                IERC721(s.heroContractAddress).ownerOf(nftIds[i]) == msg.sender,
                "Sender is not the owner of the NFT"
            );

            PlanewalkersStats memory stats = IERC721(s.heroContractAddress)
                .getTokenStats(nftIds[i]);
            tokenDataArray[i] = abi.encode(stats);
        }
        bytes memory data = abi.encode(nftIds, tokenDataArray, msg.sender);

        emit bridgeRequestSent(msg.sender, data);
        sendMessageToL2(s.currentSisterContract, data);
    }

    //sending the message to the bridge with encoded data payload.
    function sendMessageToL2(address _to, bytes memory _calldata) internal {
        uint32 destinationNetwork = 1; //to testnet zkevm
        bool forceUpdateGlobalExitRoot = true;
        s.polygonBridge.bridgeMessage{value: msg.value}(
            destinationNetwork,
            _to,
            forceUpdateGlobalExitRoot,
            _calldata
        );
    }

    function claimBridged(
        bytes memory _dataPayload,
        bytes32[32] calldata _smtProof,
        uint32 index,
        bytes32 mainnetExitRoot,
        bytes32 rollupExitRoot
    ) external {
        //@notice the bridge does call onMessageReceived to communicate with the receiver contract. reverts if it doesnt meet the expectations.
        s.polygonBridge.claimMessage(
            _smtProof,
            index,
            mainnetExitRoot,
            rollupExitRoot,
            0, //network ID goerli
            s.currentSisterContract,
            1, // Destination network
            address(this),
            0,
            _dataPayload
        );
        //@notice this will trigger the onMessageReceived below.
    }

    function onMessageReceived(
        address originAddress,
        uint32 originNetwork,
        bytes memory data
    ) external payable {
        //@TODO reintroduce later(variable setting has to be done correctly cross chain)
        require(originAddress == s.currentSisterContract);

        //from goerli
        if (originNetwork == 0) {
            //@notice this is where the magic happens. we save the ownership of the tokenIds broadcasted date.
            receiveMessageFromL1(data, originAddress);
        }
        //from polygon zkevm
        else if (originNetwork == 1) {
            receiveMessageFromL2(data, originAddress);
        }
    }

    function receiveMessageFromL1(
        bytes memory data,
        address originAddress
    ) internal {
        (
            uint256[] memory tokenIds,
            bytes[] memory tokenDataArray,
            address owner
        ) = abi.decode(data, (uint256[], bytes[], address));

        for (uint i = 0; i < tokenDataArray.length; i++) {
            PlanewalkersStats memory stats = abi.decode(
                tokenDataArray[i],
                (PlanewalkersStats)
            );
            s.tokenStats[tokenIds[i]] = stats;
            s.currentOwner[tokenIds[i]] = owner;
            s.ownershipBroadcastDate[tokenIds[i]] = block.timestamp;

            emit bridgeSuccessOwnership(
                msg.sender,
                address(s.heroContractAddress),
                tokenIds[i]
            );
        }
    }

    function receiveMessageFromL2(
        bytes memory data,
        address originAddress
    ) internal {
        (address _owner, bool _victory, uint256[] memory _nftIds) = abi.decode(
            data,
            (address, bool, uint256[])
        );

        if (_victory) {
            for (uint i = 0; i < _nftIds.length; i++) {
                //@notice flat EXP gain for now.
                s.currentEXPHero[_nftIds[i]] += 100;
            }
        }
    }

    function checkOwnership(
        uint256[] memory nftIds
    ) external view returns (bool) {}
}
