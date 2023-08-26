//@TODO administrative functions

import {AppStorage, Modifiers} from "../libraries/AppStorage.sol";

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
        emit GENESIS();
    }

    function changeSisterContract(
        address _newSisterContract
    ) external onlyOwner {
        s.currentSisterContract = _newSisterContract;
    }
}
