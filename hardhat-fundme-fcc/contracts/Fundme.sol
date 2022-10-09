//  Get funds from users
//  withdraw funds

// SPDX-License-Identifier: MIT
// Pragma
pragma solidity >=0.7.0 <0.9.0;

// Notes: manunally declare interface
// interface AggregatorV3Interface {
//   function decimals() external view returns (uint8);

//   function description() external view returns (string memory);

//   function version() external view returns (uint256);

//   function getRoundData(uint80 _roundId)
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );

//   function latestRoundData()
//     external
//     view
//     returns (
//       uint80 roundId,
//       int256 answer,
//       uint256 startedAt,
//       uint256 updatedAt,
//       uint80 answeredInRound
//     );
// }

// // import directly from github
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// custme error to save gas 
error FundMe__NotOwner();
/**
 * @title A contract for crowd funding
 * @author Jade
 * @notice this contract is used to demo fund 
 * @dev This implements price feed as a library
 */
contract FundMe {
    // Type Descriptions

    // 1e18 = 10 * 1000000000000000000
    // use Constant and Immutable to gas efficient
    uint256 public constant MINIMAL_USD = 50 * 1e18; // use BlockChain Oracle Network to query the USD value to eth

    address[] private s_funders; // private variable use less gas cost

    mapping(address => uint256) private s_addressToAmountFunded;

    using PriceConverter for uint256;

    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddres) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddres);
    }

    /**
     * @notice this functions fund this contract
     * @dev This implements fund
     */
    function fund() public payable{
        // 1. how to send eth?
        // require(getConversionRate(msg.value) >= MINIMAL_USD, "Didn't send  enough"); // make sure the amount to sending at least 1 et

        require(getConversionRate(msg.value, s_priceFeed) >= MINIMAL_USD, "Didn't send  enough"); // make sure the amount to sending at least 1 et
        // what is reverting?
        // undo any antion before, and send remaining 
        s_funders.push(msg.sender);    
        s_addressToAmountFunded[msg.sender] = msg.value;
    }


    function withdraw() public onlyOwner {
        // Note: for loop using storage cost a lot of gas
        for(uint256 funderIndex =0 ; funderIndex < s_funders.length; funderIndex++) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        // send to eth
        // transfer
        //  send
        // call
        // payable(msg.sender).transfer(address(this).balance);

        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed!");

        // call 
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed!");

    }
    function cheaperWithDraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // Notes: !!!!mappings can't be in memory!!!

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = payable(i_owner).call{value: address(this).balance}("");
        require(callSuccess, "call failed!");
    }

    modifier onlyOwner {
        // require(msg.sender == owner, "Sender is not owner");
        if(msg.sender != i_owner) { revert FundMe__NotOwner();}
        _; // do the rest of the code
    }


    // Functions Order:
    // constructor
    // receive
    // fallback
    // external
    // public
    // internal
    // private
    // view / pure

    receive() external payable {
        fund();
    }


    fallback() external payable{
        fund();
    }

    function getPrice(AggregatorV3Interface priceFeed) public view returns(uint256){
        // 1. ABI
        // 2. Address of chainlink 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

        return uint256(price * 1e10);
    }

    function getVersion(AggregatorV3Interface priceFeed) public view returns(uint256) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);

        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) public view returns(uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUsd;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

}