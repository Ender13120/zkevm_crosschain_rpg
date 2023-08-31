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
];
