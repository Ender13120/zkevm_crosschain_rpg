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

    mapping(uint256 => PlanewalkersStats) private heroClassStatsInit;
    uint public totalClasses;

    uint256 private _currentTokenId;

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
        string memory uri,
        PlanewalkersStats memory stats
    ) public onlyOwner {
        _currentTokenId = _currentTokenId + 1;
        _safeMint(to, _currentTokenId);

        //@notice wont need to set the tokenURI manually, since its a onchain-tokenURI here.
        //@notice openseas should work natively with the tokenURI view function, but have to doublecheck.

        _setTokenURI(_currentTokenId, uri);
        _tokenStats[_currentTokenId] = stats;
    }

    function safeMint(address to, PlanewalkersStats memory stats) internal {
        _currentTokenId = _currentTokenId + 1;
        _safeMint(to, _currentTokenId);
        _tokenStats[_currentTokenId] = stats;
    }

    function createTeam(address _to, uint[] memory _heroChoices) external {
        require(
            msg.sender == gameDiamond,
            "only the gameDiamond can create team-members!"
        );

        for (uint i = 0; i < _heroChoices.length; i++) {
            uint heroClassId = _heroChoices[i];

            // Ensure that the hero class ID is valid
            require(
                heroClassStatsInit[heroClassId].health != 0,
                "Invalid hero class ID!"
            );

            // Use the hero class stats for minting the NFT
            PlanewalkersStats memory stats = heroClassStatsInit[heroClassId];

            // Mint the NFT using the safeMint function
            safeMint(_to, stats);
        }
    }

    function createCharacterClasses(
        uint[] memory _heroClassId,
        PlanewalkersStats[] memory _stats
    ) external onlyOwner {
        require(_heroClassId.length == _stats.length, "Mismatched arrays");

        for (uint i = 0; i < _heroClassId.length; i++) {
            heroClassStatsInit[_heroClassId[i]] = _stats[i];
            totalClasses++;
        }
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

    function getOwnedTokensWithStats(
        address _owner
    )
        external
        view
        returns (
            uint256[] memory tokenIds,
            PlanewalkersStats[] memory statsArray
        )
    {
        uint256 tokenCount = balanceOf(_owner);
        tokenIds = new uint256[](tokenCount);
        statsArray = new PlanewalkersStats[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(_owner, i);
            tokenIds[i] = tokenId;
            statsArray[i] = _tokenStats[tokenId];
        }

        return (tokenIds, statsArray);
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
