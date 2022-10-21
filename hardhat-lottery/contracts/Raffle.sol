// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

// Raffle

// Enter the lottery (paying some amount)

// Pick a random winner (verifable random)

// winner to be selected every X minutes -> Complatly automated

// Chanlink Oracle > Rnadomess, Automated Execution (Chanlink keeper)

error Raffle_NotEnoughETHEntered();
error Raffle_NotOpen();
error Raffle_TranferFailed();

contract Raffle is VRFConsumerBaseV2 {
    /** Type description  */ 
    enum RaffleState {
        Open, Close
    }

    /** State variables */
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
    event WinnerPicked(address);

    // Lottery vars
    address private s_recentWinner;
    // uint256 private s_state; // open, close
    RaffleState private s_state;
    uint256 private s_timeStamp = block.timestamp;
    uint256 private immutable i_interval;

    constructor(
        address vrfCordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_state = RaffleState.Open;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        // require msg.value > i_entranceFee, "Not enough fee"

        if (msg.value < i_entranceFee) {
            revert Raffle_NotEnoughETHEntered();
        }

        if(s_state != RaffleState.Open) {
            revert Raffle_NotOpen();
        }

        s_players.push(payable(msg.sender));

        // emit updates when update a dynamic array or mapping
        // => EVM emit logs
        emit RaffleEnter(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256 indexOfOwner = randomWords[0] % s_players.length;

        address payable rencentWinner = s_players[indexOfOwner];

        s_recentWinner = rencentWinner;
        s_state = RaffleState.Open;
        s_players = new address payable[](0);

        (bool success, ) = rencentWinner.call{value: address(this).balance}("");

        if (!success) {
            revert Raffle_TranferFailed();
        }

        emit WinnerPicked(s_recentWinner);
    }

    function requestRandomeNumber()
        external
    /* external is cheper than internal */
    {
        // request random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // Once get it, start to process transactios

        emit RequestedWaffleWinner(requestId);
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    /**
     * @dev this is functio that chainlink check the keeper nodes call
     * https://docs.chain.link/docs/chainlink-automation/compatible-contracts/#checkupkeep-function
     * The folowing should be true in order to return true:
     * 1. Our time iinterval should have passed
     * 2. The lottery should have at least one player, and have some ETH
     * 3. Our subscription is funded with chainlink
     * 4. The lottery should be open state
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (RaffleState.Open == s_state);
        bool timePassed = ((block.timestamp - s_timeStamp) > i_interval );
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && hasPlayers && hasBalance);
    }
}
