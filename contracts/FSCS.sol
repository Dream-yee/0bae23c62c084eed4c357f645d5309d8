// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;


interface ICurvePool {
    function exchange(
        uint256 i, // 從代幣索引
        uint256 j, // 到代幣索引
        uint256 dx, // 輸入代幣數量
        uint256 min_dy // 最小輸出代幣數量
    ) external payable;
    function last_prices(uint256 k) external view returns (uint256);
    function balances(uint256 index) external view returns (uint256);
    function price_scale(uint256 k) external view returns (uint256);
    function fee() external view returns (uint256);
    function coins(uint256 index) external view returns (address);
}
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
contract FSCS is ERC4626{
    uint256 constant assetNo = 1;      //資產的索引
    uint256 constant targetNo = 0;     //交易標的的索引
    uint256 constant FEE_PRECISION = 10**10; //curve內部的常數
    IERC20 immutable _target;          //交易標的
    uint immutable REFERENCE;          //相當於天，但是我們參考的pinescript是寫reference
    uint immutable BOTTOM;             //地
    uint immutable GRID_NUM;           //網格數
    ICurvePool immutable curvePool;    //curve的合約
    uint[] buyQty;                     //買入的數量
    uint previousLevel;                //上一次的網格位置
    constructor(ICurvePool curvePool_, uint bottom , uint ref , uint gridNum)ERC20("FSCS","FSCS") ERC4626(IERC20(curvePool_.coins(assetNo)))
    {
        _target = IERC20(curvePool_.coins(targetNo));
        curvePool = curvePool_;
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
        uint nowPrice = getTokenPrice();
        if(nowPrice >= REFERENCE)return GRID_NUM;                 //如果現在的價格高於REFERENCE就不做事,i.e.不買
        if(nowPrice < BOTTOM)return 0;                            //如果現在的價格低於BOTTOM就不做事,i.e.不賣
        return GRID_NUM*(nowPrice-BOTTOM)/(REFERENCE - BOTTOM);   //目前位於的網格位置 
    }
    function getTokenPrice() view public returns (uint)
    {
        // last_price(k) 表示第k+1個代幣相對於第0個代幣的價格的10**18倍
        // 這些if在編譯器優化下會被死碼移除
        if(assetNo == 0)
            return curvePool.last_prices(targetNo - 1); 
        if(targetNo == 0)
            return 10**36/curvePool.last_prices(assetNo - 1); 
        return curvePool.last_prices(targetNo - 1)*10**18/curvePool.last_prices(assetNo - 1); 
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
    function targetAddress() view public returns(address)
    {
        return address(_target);
    }
    function curvePoolAddress() view public returns(address)
    {
        return address(curvePool);
    }
    /************************************************************************************************
     * transaction function
     ************************************************************************************************/
    function makeTransaction() public 
    {
        uint level = getTokenLevel();
        if(level == previousLevel)return;
        if(level < previousLevel) //買入
        {
            uint amount = assetBalance()/previousLevel; //10**20是為了避免小數點
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
                SafeERC20.forceApprove(IERC20(ERC4626.asset()), address(curvePool), amount*cnt);
                curvePool.exchange(assetNo, targetNo, amount*cnt, 0);
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
            if(totalAmount != 0)
            {
                _target.approve(address(curvePool),totalAmount);
                curvePool.exchange(targetNo,assetNo,totalAmount,0);
            }
        }
        previousLevel = level;
        return;
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
            balance = assets - balance;
            uint xp0 = curvePool.balances(assetNo);
            uint xp1 = curvePool.balances(targetNo);
            xp0 = FEE_PRECISION*xp0/(FEE_PRECISION - curvePool.fee()) + 1; //revert  dy -= self._fee(xp) * dy / 10**10
            //這個計算過程要再確認
            uint256 dx = xp0*xp1/(xp0-balance) - xp1 + 1;
            _target.approve(address(curvePool),dx);
            curvePool.exchange(targetNo,assetNo,dx,balance); 
        }
        SafeERC20.safeTransfer(IERC20(ERC4626.asset()), receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }
}
