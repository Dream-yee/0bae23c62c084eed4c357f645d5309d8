// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//模擬用的Swap合約
contract fakeSwap{
  IERC20 immutable fakeWBTC; //交易標的
  IERC20 immutable fakeUSDT; //交易來源
  uint _price; //價格
  constructor(IERC20 fakeUSDT_, IERC20 fakeWBTC_ ) {
    fakeWBTC = fakeWBTC_;
    fakeUSDT = fakeUSDT_;
  }
  function swapBack(uint amount) public {
    fakeWBTC.transferFrom(msg.sender, address(this), amount);
    fakeUSDT.transfer(msg.sender, amount * _price);
  }
  function swap(uint amount) public { //理論上沒那麼簡單
    fakeUSDT.transferFrom(msg.sender, address(this), amount);
    fakeWBTC.transfer(msg.sender, amount / _price);
  }
  function setPrice(uint newPrice) public { //雖然理論上不是這樣運行的，但是為了方便測試
    _price = newPrice;
  }
  function getPrice() view public returns (uint) {
    return _price;
  }
}

