// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.5.0 <0.9.0;


contract Test{
    function getSomething()pure public returns(uint)
    {
        return 1e9+7;
    }
}

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
//import "@uniswap/v2-core/contracts/UniswapV2Pair.sol";
contract FSCS is ERC4626{
    //IUniswapV2Pair immutable _pair; //交易的代幣對
    IERC20 immutable _target;
    constructor(IERC20 asset_ , IERC20 target_)ERC20("FSCS","FSCS") ERC4626(asset_)
    {
        _target = target_;
    }
    /*
    function getTokenPrice(uint amount) view public returns (uint) {
       (uint reserve1 , uint reserve2) = _pair.getReserve(); 
       return (amount*reserve1*_target.decimals())/reserve2;
    }
    */
    function getSomething(address contractAddress)pure public returns(uint)
    {
        return Test(contractAddress).getSomething();
    }
    function totalAssets()view public override returns (uint)
    {
        return ERC4626.totalAssets()+ _target.balanceOf(address(this));
    }

}