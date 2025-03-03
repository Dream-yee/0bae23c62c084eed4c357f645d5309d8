# Interfaces
本文檔描述了FSCS的所有介面及其功能。
## Functions

## Events
### Buy
紀錄購買時的價格以及購買量(單位:USDT)
```solidity
    event Buy(uint price, uint amount);
```
### Sell
紀錄賣出時的價格以及賣出量(單位:USDT)
```solidity
    event Sell(uint price, uint amount);
```
## ERC4626
因為我們的智能合約是基於ERC4626標準實現的，所以我們的合約支持幾乎所有ERC4626的功能。
至於ERC4626的介面，請參考[這裡](https://docs.openzeppelin.com/contracts/4.x/api/interfaces#IERC4626)
但是我們的合約有修改ERC4626的`_withdraw`和`totalAssets`功能(介面不變)。
### `_withdraw`
`_withdraw`是一個內部用來處理將用戶的FSCS代幣換為USDT的函數。
我們在這個函數中加入了檢查合約的USDT存量是否足夠的功能。當USDT存量不足時，將會先將wBTC換為USDT，在將USDT轉給用戶。惟滑價及手續費將由用戶承擔。
:::spoiler source code
```solidity
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
```
:::
### `totalAssets`
`totalAssets`是一個用來查詢合約的總資產的函數。
因為我們的合約會同時持有USDT和wBTC，所以我們需要將這兩種資產的價值加總起來。
:::spoiler source code
```solidity
function totalAssets()view public override returns (uint)
{
    return ERC4626.totalAssets()+ getTokenPrice()*_target.balanceOf(address(this))/pricePrecision;
}

