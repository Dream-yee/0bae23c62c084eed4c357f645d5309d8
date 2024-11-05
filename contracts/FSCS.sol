// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract fakeSwap{
    function swapBack(uint amount) public {
    }
    function swap(uint amount) public {
    }
    function getPrice() view public returns (uint) {
    }
}
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
contract FSCS is ERC4626{
    IERC20 immutable _target; //交易標的
    uint immutable REFERENCE; //相當於天，但是我們參考的pinescript是寫reference
    uint immutable BOTTOM; //地
    uint immutable GRID_NUM; //網格數
    uint tp_top; //take profit top
    uint tp_bottom; //take profit bottom
    uint[] buyQty; //買入的數量
    uint previousLevel; //上一次的網格位置
    fakeSwap immutable _swap; //交易合約
    constructor(IERC20 asset_ , IERC20 target_ ,fakeSwap swap_, uint bottom , uint ref , uint gridNum)ERC20("FSCS","FSCS") ERC4626(asset_)
    {
        _target = target_;
        _swap = swap_;
        previousLevel = getTokenLevel();
        buyQty = new uint[](GRID_NUM);
        BOTTOM = bottom;
        REFERENCE = ref;
        GRID_NUM = gridNum;
    }
    function getTokenLevel()view public returns(uint)
    {
        uint nowPrice = getTokenPrice(1);
        if(nowPrice >= REFERENCE)return GRID_NUM; //如果現在的價格高於REFERENCE就不做事,i.e.不買
        if(nowPrice < BOTTOM)return 0; //如果現在的價格低於BOTTOM就不做事,i.e.不賣
        return GRID_NUM*(nowPrice-BOTTOM)/(REFERENCE - GRID_NUM); //目前位於的網格位置 
    }
    function getTokenPrice(uint amount ) view public returns (uint)
    {
        return amount*_swap.getPrice();
    }
    function totalAssets()view public override returns (uint)
    {
        return ERC4626.totalAssets()+ getTokenPrice(_target.balanceOf(address(this)));
    }
    function assetBalance()view public returns (uint)
    {
        return ERC4626.totalAssets();
    }
    function targetBalance()view public returns (uint)
    {
        return _target.balanceOf(address(this));
    }
    function buySignal()view public returns(uint)
    {
        uint level = getTokenLevel(); 
        uint ret = 0;
        for(uint i = level+1; i <= previousLevel; i++)
        {
            if(buyQty[i] == 0)
            {
                ret += 1;
            }
        }
        return ret;
    }
    function sellSignal()view public returns(uint)
    {
        uint level = getTokenLevel(); 
        uint ret = 0;
        for(uint i = previousLevel + 1;i <= level; i++)
        {
            if(buyQty[i] != 0)
            {
                ret += buyQty[i];
            }
        }
        return ret;
    }
    function makeTransaction() public
    {
        uint level = getTokenLevel();
        if(level > previousLevel)
        {
            uint amount = buySignal()*totalAssets()/GRID_NUM/getTokenPrice(1);
            if(amount != 0)
            {
                for(uint i = level+1; i <= previousLevel; i++)
                {
                    if(buyQty[i] == 0)
                    {
                        buyQty[i] = amount;
                    }
                }
                _swap.swap(amount);
            }
        }
        else if(level < previousLevel)
        {
            uint amount = sellSignal();
            if(amount != 0)
            {
                for(uint i = previousLevel + 1;i <= level; i++)
                {
                    if(buyQty[i] != 0)
                    {
                        buyQty[level] = 0;
                    }
                }
                _swap.swapBack(amount);
            }
        }
        previousLevel = level;
    }
}
