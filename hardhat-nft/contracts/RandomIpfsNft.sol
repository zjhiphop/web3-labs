// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract RandomIpfsNft is VRFConsumerBaseV2{
    // use chainlink VRF call to get a random number
    // using the number we will get a random NFT

    // users have to pay to mint an NFT
    // owner of the contract can withdraw the ETH

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION =2;
    uint32 private constant NUM_WORDS =1;
    bytes32 private immutable i_gasLane;

    constructor(address vrfCoordinator, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(i_vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNft () {
        requestId = i_vrfCoordinator.requestRandomWords(i_gasLane, i_subscriptionId, REQUEST_CONFIRMATION, i_callbackGasLimit, NUM_WORDS);
    }

    function fullfillRandomWords(uint256 reqId, uint256[] memory randomWords) internal override{

    }

    function tokenURI(uint256) public {

    }
}