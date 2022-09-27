// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {
    uint256 number;

    struct People {
        uint256 number;
        string name;
    }

    People[] public peopleList;
    mapping(string => uint256) public _nameToNum;

    function addPerson(string memory _name, uint256 _number) public {
        People memory person = People({number: _number, name: _name});

        peopleList.push(person);
        _nameToNum[_name] = _number;
    }

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public virtual {
        number = num;
    }

    /**
     * @dev Return value
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256) {
        return number;
    }
}

// 0xd9145CCE52D386f254917e481eB44e9943F39138
