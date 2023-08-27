// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import {PlanewalkersStats} from "../libraries/AppStorage.sol";

interface IERC721 {
    function ownerOf(uint256 _tokenId) external view returns (address);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256 balance);

    function exists(uint256 tokenId) external view returns (bool);

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);

    function getTokenStats(
        uint256 tokenId
    ) external view returns (PlanewalkersStats memory);

    function createTeam(address _to, uint[] memory _heroCoices) external;
}
