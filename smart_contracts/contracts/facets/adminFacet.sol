//@TODO administrative functions

import {AppStorage, Modifiers, Spell, SpellType} from "../libraries/AppStorage.sol";

import "../interfaces/polygonBridge.sol";

contract AdminFacet is Modifiers {
    event GENESIS();

    function setAddresses(
        address _heroAddress,
        address _currentSisterContract,
        uint32 _currentChainId,
        uint32 _currentSisterChainId,
        uint _currentChainType,
        bool _sisterBridgeSetup
    ) external onlyOwner {
        s.polygonzkEVMBridgeContractL1 = address(
            0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7
        );
        s.polygonzkEVMBridgeContractL2 = address(
            0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7
        );

        s.heroContractAddress = _heroAddress;

        s.polygonBridge = IPolygonBridgeContract(
            0xF6BEEeBB578e214CA9E23B0e9683454Ff88Ed2A7
        );

        s.currentSisterContract = _currentSisterContract;
        s.goerliChainId = 5;
        s.polygonChainIdZK = 1442; //ChainID polygon zkEVM  Testnet
        s.currentChainId = _currentChainId;
        s.currentSisterChainId = _currentSisterChainId;
        s.currentChainType = _currentChainType;
        s.sisterBridgeSetup = _sisterBridgeSetup;
        s.ownershipDurationInterval = 24 * 60 * 60 * 7;

        emit GENESIS();
    }

    function changeSisterContract(
        address _newSisterContract
    ) external onlyOwner {
        s.currentSisterContract = _newSisterContract;
    }

    function setupSpells() external onlyOwner {
        s.spells[SpellType.Fireball] = Spell({
            name: "Fireball",
            description: "A ball of fire dealing damage to an enemy.",
            damage: 20,
            utilStrength: 0,
            requiresTarget: true
        });

        s.spells[SpellType.LightningStrike] = Spell({
            name: "Lightning Strike",
            description: "A bolt of lightning hitting a random enemy.",
            damage: 30,
            utilStrength: 0,
            requiresTarget: true
        });

        s.spells[SpellType.BlessTheParty] = Spell({
            name: "Bless the Party",
            description: "Heals the party.",
            damage: 0,
            utilStrength: 10,
            requiresTarget: false
        });
    }
}
