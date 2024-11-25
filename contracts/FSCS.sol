// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;


interface ICurvePool {
    function exchange(
        int128 i, // 從代幣索引
        int128 j, // 到代幣索引
        uint256 dx, // 輸入代幣數量
        uint256 min_dy // 最小輸出代幣數量
    ) external;
    function last_prices(uint256 k) external view returns (uint256);
}
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
contract FSCS is ERC4626{
    IERC20 immutable _target;          //交易標的
    uint immutable REFERENCE;          //相當於天，但是我們參考的pinescript是寫reference
    uint immutable BOTTOM;             //地
    uint immutable GRID_NUM;           //網格數
    ICurvePool immutable curvePool;
    uint[] buyQty;                     //買入的數量
    uint previousLevel;                //上一次的網格位置
    constructor(IERC20 asset_ , IERC20 target_ ,ICurvePool curvePool_, uint bottom , uint ref , uint gridNum)ERC20("FSCS","FSCS") ERC4626(asset_)
    {
        _target = target_;
        curvePool = curvePool_;
        BOTTOM = bottom;
        REFERENCE = ref;
        GRID_NUM = gridNum;
        buyQty = new uint[](gridNum+1);
        previousLevel = getTokenLevel();
    }
    function getTokenLevel()view public returns(uint)
    {
        uint nowPrice = getTokenPrice();
        if(nowPrice >= REFERENCE)return GRID_NUM;                 //如果現在的價格高於REFERENCE就不做事,i.e.不買
        if(nowPrice < BOTTOM)return 0;                            //如果現在的價格低於BOTTOM就不做事,i.e.不賣
        return GRID_NUM*(nowPrice-BOTTOM)/(REFERENCE - BOTTOM);   //目前位於的網格位置 
    }
    function getTokenPrice() view public returns (uint)
    {
        return curvePool.last_prices(0);
    }
    function totalAssets()view public override returns (uint)
    {
        return ERC4626.totalAssets()+ getTokenPrice()*_target.balanceOf(address(this));
    }
    function assetBalance()view public returns (uint)
    {
        return ERC4626.totalAssets();
    }
    function targetBalance()view public returns (uint)
    {
        return _target.balanceOf(address(this));
    }
    function buySignal()view public returns(bool)
    {
        return getTokenLevel() < previousLevel;
    }
    function sellSignal()view public returns(bool)
    {
        return getTokenLevel() > previousLevel;
    }
    function makeTransaction() public
    {
        uint level = getTokenLevel();
        if(level == previousLevel)return;
        if(level < previousLevel) //買入
        {
            uint price = getTokenPrice();
            uint amount = assetBalance()/previousLevel/price;
            uint totalAmount = 0;
            if(amount != 0)
            {
                for(uint i = level+1; i <= previousLevel; i++)
                {
                    if(buyQty[i] == 0)
                    {
                        buyQty[i] = amount;
                        totalAmount += buyQty[i];
                    }
                }
                ERC20(ERC4626.asset()).approve(address(curvePool),totalAmount);
                curvePool.exchange(0,1,totalAmount*price,0);
            }
        }
        else if(level > previousLevel) //賣出
        {
            uint totalAmount = 0;
            for(uint i = previousLevel + 1;i <= level; i++)
            {
                if(buyQty[i] != 0)
                {
                    totalAmount += buyQty[i];
                    buyQty[i] = 0;
                }
            }
            if(totalAmount != 0)
            {
                _target.approve(address(curvePool),totalAmount);
                curvePool.exchange(1,0,totalAmount,0);
            }
        }
        previousLevel = level;
    }
    function target() view public returns(address)
    {
        return address(_target);
    }
}
