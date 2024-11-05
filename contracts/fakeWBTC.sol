// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//模擬用的WBTC合約
contract fakeWBTC is ERC20 {
    constructor() ERC20("wBTC", "wBTC") {
        _mint(msg.sender, 1000000000000000000000000000);
    }
}
