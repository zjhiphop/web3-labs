// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Raffle


// Enter the lottery (paying some amount)

// Pick a random winner (verifable random)

// winner to be selected every X minutes -> Complatly automated

// Chanlink Oracle > Rnadomess, Automated Execution (Chanlink keeper)

error Raffle_NotEnoughETHEntered();

contract Raffle {
    uint256 private immutable i_entranceFee; 
    address payable[] private s_players;

    contractor(uint256 entranceFee) {
        i_entranceFee = entranceFee
    }

    function enterRaffle() public payable {
        // require msg.value > i_entranceFee, "Not enough fee"

        if(msg.value < i_entranceFee) {
            revert Raffle_NotEnoughETHEntered;
        }

        s_players.push(payable(msg.sender));

        // emit updates when update a dynamic array or mapping 
        // => EVM emit logs


    }

    function getEntranceFee() public view  returns (uint256) {
        return i_entranceFee;
    }

    function pickRandomeNumber() {}
}