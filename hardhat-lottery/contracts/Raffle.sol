// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

// Raffle

// Enter the lottery (paying some amount)

// Pick a random winner (verifable random)

// winner to be selected every X minutes -> Complatly automated

// Chanlink Oracle > Rnadomess, Automated Execution (Chanlink keeper)

error Raffle_NotEnoughETHEntered();
error Raffle_NotOpen();
error Raffle_TranferFailed();
error Raffle_UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
 * @title A same raffle app
 * @author Jade 
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /** Type description  */ 
    enum RaffleState {
        Open, Close, CALCULATING
    }

    /** State variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 2;
    uint32 private constant NUM_WORDS = 1;

    // EVENTS
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed player);

    // Lottery vars
    address private s_recentWinner;
    // uint256 private s_state; // open, close
    RaffleState private s_state;
    uint256 private s_timeStamp = block.timestamp;
    uint256 private immutable i_interval;

    constructor(
        address vrfCordinatorV2, // Contract
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
        s_timeStamp = block.timestamp;
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

    function fulfillRandomWords(uint256, uint256[] memory randomWords)
        internal
        override
    {
        uint256 indexOfOwner = randomWords[0] % s_players.length;

        address payable rencentWinner = s_players[indexOfOwner];

        s_recentWinner = rencentWinner;
        s_state = RaffleState.Open;
        s_players = new address payable[](0);
        s_timeStamp = block.timestamp;

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

        emit RequestedRaffleWinner(requestId);
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
        bytes memory/* calldata  checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (RaffleState.Open == s_state);
        bool timePassed = ((block.timestamp - s_timeStamp) > i_interval );
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && hasPlayers && hasBalance && timePassed);

        return (upkeepNeeded, "0x00");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        
        if(!upkeepNeeded) {
            revert Raffle_UpKeepNotNeeded(address(this).balance, s_players.length, uint256(s_state));
        }

        s_state = RaffleState.CALCULATING;

           // request random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // Once get it, start to process transactios

        emit RequestedRaffleWinner(requestId);
    }

    function getRaffleState() public view returns (RaffleState){
        return s_state;
    }

    function getNumWords() public pure  returns (uint32) {
        return NUM_WORDS;
    }

     function getNumOfPlayers() public view  returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_timeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

}
