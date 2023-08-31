export const diamondL1ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "newLevel",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "levelUp",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nftId",
        type: "uint256",
      },
    ],
    name: "checkOwnershipDetails",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_nftIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "_player",
        type: "address",
      },
    ],
    name: "checkOwnerships",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_nftIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "_player",
        type: "address",
      },
    ],
    name: "getAndValidateSpiritTeam",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "int256",
            name: "health",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "ATK",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "DEX",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "INT",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "CONST",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "WIS",
            type: "int256",
          },
        ],
        internalType: "struct PlanewalkersStats[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_nftIds",
        type: "uint256[]",
      },
    ],
    name: "getEXPTeam",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "getNFTsOwnedBroadcastedBy",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_nftIds",
        type: "uint256[]",
      },
    ],
    name: "getTeamStats",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "int256",
            name: "health",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "ATK",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "DEX",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "INT",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "CONST",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "WIS",
            type: "int256",
          },
        ],
        internalType: "struct PlanewalkersStats[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_nftId",
        type: "uint256",
      },
    ],
    name: "levelUpHero",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_heroChoices",
        type: "uint256[]",
      },
    ],
    name: "selectAndCreateTeam",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "dataPayload",
        type: "bytes32",
      },
    ],
    name: "bridgeData",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "nftPayload",
        type: "bytes",
      },
    ],
    name: "bridgeRequestSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "nftContract",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "nftId",
        type: "uint256",
      },
    ],
    name: "bridgeSuccessOwnership",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "nftIds",
        type: "uint256[]",
      },
    ],
    name: "broadcastOwnershipToL2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "nftIds",
        type: "uint256[]",
      },
    ],
    name: "checkOwnership",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_dataPayload",
        type: "bytes",
      },
      {
        internalType: "bytes32[32]",
        name: "_smtProof",
        type: "bytes32[32]",
      },
      {
        internalType: "uint32",
        name: "index",
        type: "uint32",
      },
      {
        internalType: "bytes32",
        name: "mainnetExitRoot",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "rollupExitRoot",
        type: "bytes32",
      },
    ],
    name: "claimBridged",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "originAddress",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "originNetwork",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "onMessageReceived",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "loser",
        type: "address",
      },
    ],
    name: "MatchResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player1",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player2",
        type: "address",
      },
    ],
    name: "NewMatch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "nftPayload",
        type: "bytes",
      },
    ],
    name: "rewardsSentToL1",
    type: "event",
  },

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "playersTurn",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "matchId",
        type: "uint256",
      },
    ],
    name: "turnStarted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "enum Action[3]",
        name: "heroActions",
        type: "uint8[3]",
      },
      {
        internalType: "uint256[3]",
        name: "targetIds",
        type: "uint256[3]",
      },
      {
        internalType: "enum SpellType[3]",
        name: "spellTypes",
        type: "uint8[3]",
      },
    ],
    name: "executeCombatTurnPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_player",
        type: "address",
      },
    ],
    name: "getMatchForPlayer",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player1",
            type: "address",
          },
          {
            internalType: "address",
            name: "player2",
            type: "address",
          },
          {
            components: [
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "int256",
                name: "health",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "ATK",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "DEX",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "INT",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "CONST",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "WIS",
                type: "int256",
              },
            ],
            internalType: "struct PlanewalkersStats[3]",
            name: "player1NFTs",
            type: "tuple[3]",
          },
          {
            components: [
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "int256",
                name: "health",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "ATK",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "DEX",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "INT",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "CONST",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "WIS",
                type: "int256",
              },
            ],
            internalType: "struct PlanewalkersStats[3]",
            name: "player2NFTs",
            type: "tuple[3]",
          },
          {
            internalType: "bool",
            name: "isResolved",
            type: "bool",
          },
          {
            internalType: "address",
            name: "winner",
            type: "address",
          },
          {
            internalType: "address",
            name: "currentTurn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "lastActionTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct Match",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_nftIds",
        type: "uint256[]",
      },
    ],
    name: "lookForMatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
