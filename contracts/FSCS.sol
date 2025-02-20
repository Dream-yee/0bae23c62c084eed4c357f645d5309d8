// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
library TickMath {
    /// @dev The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    /// @dev The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
    uint160 internal constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;
}
contract FSCS is ERC4626{
    bool constant zeroForOne = false;
    uint constant pricePrecision = 2**64;
    IERC20 immutable _target;          //交易標的
    IUniswapV3Pool immutable uniswapPool; //交易所
    uint immutable public REFERENCE;          //相當於天，但是我們參考的pinescript是寫reference
    uint immutable public BOTTOM;             //地
    uint immutable public GRID_NUM;           //網格數
    uint[] buyQty;                     //買入的數量
    uint public previousLevel;                //上一次的網格位置
    event Buy(uint price, uint amount);
    event Sell(uint price, uint amount);
    constructor(IUniswapV3Pool Pool_, uint bottom , uint ref , uint gridNum)ERC20("FSCS","FSCS") ERC4626(IERC20(zeroForOne?Pool_.token0():Pool_.token1()))
    {
        _target = IERC20(zeroForOne?Pool_.token1():Pool_.token0());
        uniswapPool = Pool_;
        BOTTOM = bottom;
        REFERENCE = ref;
        GRID_NUM = gridNum;
        buyQty = new uint[](gridNum+1);
        previousLevel = getTokenLevel();
    }
    
    /************************************************************************************************
     * view function
     ************************************************************************************************/
    function getTokenLevel()view public returns(uint)
    {
      return _calcTokenLevel(getTokenPrice());
    }
    function getTokenPrice() view public returns (uint)
    {
        //回傳價格，其值是真實價格的2^64倍(不考慮每個幣的decimal，即1USDT視為1e6個)
        (uint256 sqrtPriceX96,,,,,,) = uniswapPool.slot0();
        if(zeroForOne)
        {
            return (2**192/sqrtPriceX96)*pricePrecision/sqrtPriceX96;
        }
        else
        {
            return sqrtPriceX96*sqrtPriceX96/(2**192/pricePrecision);
        }
    }
    function totalAssets()view public override returns (uint)
    {
        return ERC4626.totalAssets()+ getTokenPrice()*_target.balanceOf(address(this))/pricePrecision;
    }
    function assetBalance()view public returns (uint)
    {
        return ERC4626.totalAssets();
    }
    function targetBalance()view public returns (uint)
    {
        return _target.balanceOf(address(this));
    }
    function targetAddress() view public returns(address)
    {
        return address(_target);
    }
    function poolAddress() view public returns(address)
    {
        return address(uniswapPool);
    }
    /************************************************************************************************
     * transaction function
     ************************************************************************************************/
    function makeTransaction() external 
    {
        uint nowPrice = getTokenPrice();
        uint level = _calcTokenLevel(nowPrice);
        if(level == previousLevel)return;
        if(level < previousLevel) //買入
        {
            uint amount = assetBalance()/previousLevel; 
            uint cnt = 0;
            uint targetBalance0 = targetBalance();
            if(amount != 0)
            {
                for(uint i = level; i < previousLevel; i++)
                {
                    if(buyQty[i] == 0)
                    {
                        cnt += 1;
                    }
                }
                require(cnt != 0,"totalAmount is 0");
                emit Buy(nowPrice,amount*cnt);
                uniswapPool.swap(address(this),zeroForOne,int(amount*cnt),zeroForOne?TickMath.MIN_SQRT_RATIO+1:TickMath.MAX_SQRT_RATIO-1,"");
                uint dTargetBalance = targetBalance() - targetBalance0;
                uint k = level;
                for(uint j = 0 ; j < cnt; k++)
                {
                    if(buyQty[k] == 0)
                    {
                        buyQty[k] = (dTargetBalance+j)/cnt;
                        j++;
                    }
                }
            }
        }
        else if(level > previousLevel) //賣出
        {
            uint totalAmount = 0;
            for(uint i = previousLevel ; i < level; i++)
            {
                if(buyQty[i] != 0)
                {
                    totalAmount += buyQty[i];
                    buyQty[i] = 0;
                }
            }
            if(totalAmount > 0)
            {
                emit Sell(nowPrice,totalAmount);
                uniswapPool.swap(address(this),!zeroForOne,int(totalAmount),!zeroForOne?TickMath.MIN_SQRT_RATIO+1:TickMath.MAX_SQRT_RATIO-1,"");
            }
        }
        previousLevel = level;
        return;
    }
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        require(msg.sender == address(uniswapPool), "Not pool");

        if (amount0Delta > 0) {
            (zeroForOne?IERC20(ERC4626.asset()):_target).transfer( msg.sender, uint256(amount0Delta));
        }
        if (amount1Delta > 0) {
            (!zeroForOne?IERC20(ERC4626.asset()):_target).transfer( msg.sender, uint256(amount1Delta));
        }
    }
    //When the contract does not have enough usdt, exchange wbtc to usdt
    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }

        // If _asset is ERC-777, `transfer` can trigger a reentrancy AFTER the transfer happens through the
        // `tokensReceived` hook. On the other hand, the `tokensToSend` hook, that is triggered before the transfer,
        // calls the vault, which is assumed not malicious.
        //
        // Conclusion: we need to do the transfer after the burn so that any reentrancy would happen after the
        // shares are burned and after the assets are transferred, which is a valid state.
        _burn(owner, shares);
        uint balance = assetBalance();
        if(assets > balance)
        {
            // 當資產不足時，需要先換回資產
            // 交易的滑價、手續費由投資者吸收
            uint256 dx = (assets - balance)*pricePrecision / getTokenPrice();  //需要拿去換的量是需要的量除以價格
            uniswapPool.swap(address(this),!zeroForOne,int(dx),!zeroForOne?TickMath.MIN_SQRT_RATIO+1:TickMath.MAX_SQRT_RATIO-1,"");
            assets = assetBalance(); //換回來的數量加上原先的量就是要轉的錢
        }
        SafeERC20.safeTransfer(IERC20(ERC4626.asset()), receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }
    /************************************************************************************************
     * internal function
     ************************************************************************************************/
    function _calcTokenLevel(uint256 price) internal view returns (uint256) {
        if(price >= REFERENCE)return GRID_NUM;                 //如果現在的價格高於REFERENCE就不做事,i.e.不買
        if(price < BOTTOM)return 0;                            //如果現在的價格低於BOTTOM就不做事,i.e.不賣
        return GRID_NUM*(price-BOTTOM)/(REFERENCE - BOTTOM);   //目前位於的網格位置 
    }
}
