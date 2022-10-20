// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

// Raffle


// Enter the lottery (paying some amount)

// Pick a random winner (verifable random)

// winner to be selected every X minutes -> Complatly automated

// Chanlink Oracle > Rnadomess, Automated Execution (Chanlink keeper)

error Raffle_NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2{
    uint256 private immutable i_entranceFee; 
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 2;
    uint32 private constant NUM_WORDS = 2;
    
    // EVENTS
    event RaffleEnter(address);
    event RequestedWaffleWinner(uint256);

     
    constructor(
        address vrfCordinatorV2, uint256 entranceFee, 
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
        ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit  = callbackGasLimit;
    }

    function enterRaffle() public payable {
        // require msg.value > i_entranceFee, "Not enough fee"

        if(msg.value < i_entranceFee) {
            revert Raffle_NotEnoughETHEntered();
        }

        s_players.push(payable(msg.sender));

        // emit updates when update a dynamic array or mapping 
        // => EVM emit logs
        emit RaffleEnter(msg.sender);

    }

    function getEntranceFee() public view  returns (uint256) {
        return i_entranceFee;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override{

    }

    function requestRandomeNumber( ) external /* external is cheper than internal */ {
        // request random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(i_gasLane, i_subscriptionId, 
        REQUEST_CONFIRMATION, i_callbackGasLimit, NUM_WORDS);
        // Once get it, start to process transactios

        emit RequestedWaffleWinner(requestId);
    }
}