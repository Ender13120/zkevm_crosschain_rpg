// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

//NFTs for EVM-Planewalkers on L1
contract SpiritHeroes is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable
{
    struct PlanewalkersStats {
        string name;
        int health;
        int ATK;
        int DEX;
        int INT;
        int CONST;
        int WIS;
    }
    address public gameDiamond;
    mapping(uint256 => PlanewalkersStats) private _tokenStats;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _gameDiamond) public initializer {
        __ERC721_init("SpiritHeroes", "SPT");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init();
        gameDiamond = _gameDiamond;
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri,
        PlanewalkersStats memory stats
    ) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenStats[tokenId] = stats;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        PlanewalkersStats memory stats = _tokenStats[tokenId];
        string memory json = string(
            abi.encodePacked(
                '{"name": "',
                stats.name,
                '", "health": ',
                int2str(stats.health),
                ', "ATK": ',
                int2str(stats.ATK),
                ', "DEX": ',
                int2str(stats.DEX),
                ', "INT": ',
                int2str(stats.INT),
                ', "CONST": ',
                int2str(stats.CONST),
                ', "WIS": ',
                int2str(stats.WIS),
                "}"
            )
        );
        return
            string(
                abi.encodePacked("data:application/json;charset=utf-8,", json)
            );
    }

    function getTokenStats(
        uint256 tokenId
    ) public view returns (PlanewalkersStats memory) {
        return _tokenStats[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            ERC721URIStorageUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function int2str(int _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        bool negative = _i < 0;
        uint i = uint(negative ? -_i : _i);
        uint j = i;
        uint length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length + (negative ? 1 : 0));
        uint k = bstr.length - 1;
        while (i != 0) {
            bstr[k--] = bytes1(uint8(48 + (i % 10)));
            i /= 10;
        }
        if (negative) {
            bstr[0] = "-";
        }
        return string(bstr);
    }
}
