// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

// Raffle


// Enter the lottery (paying some amount)

// Pick a random winner (verifable random)

// winner to be selected every X minutes -> Complatly automated

// Chanlink Oracle > Rnadomess, Automated Execution (Chanlink keeper)

error Raffle_NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2{
    uint256 private immutable i_entranceFee; 
    address payable[] private s_players;
    
    // EVENTS
    event RaffleEnter(address);
     
    constructor(address vrfCordinatorV2, uint256 entranceFee) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
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

        // Once get it, start to process transactios


    }
}