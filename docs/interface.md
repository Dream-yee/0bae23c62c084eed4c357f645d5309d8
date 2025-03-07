# Interfaces
本文檔描述了FSCS的所有介面及其功能。
## Functions
### REFERENCE
`REFERENCE`是一個只讀的`uint`變數，是網格交易當中的參數，表示網格交易的最高價格。
```solidity
function REFERENCE()view public returns(uint)
```
### BOTTOM
`BOTTOM`是一個只讀的`uint`變數，是網格交易當中的參數，表示網格交易當中的最低價格。
```solidity
function BOTTOM()view public returns(uint)
```
### GRID_NUM
`GRID_NUM`是一個只讀的`uint`變數，是網格交易當中的參數，表示網格數量。
```solidity
function GRID_NUM()view public returns(uint)
```
### buyQty
`buyQty`是一個`uint`陣列，用來記錄每個網格中的買入數量(單位: wBTC)。
```solidity
function buyQty(uint i) public view returns(uint)
```
### previousLevel
`previousLevel`是一個`uint`變數，用來記錄上一次的網格位置。
```solidity
function previousLevel() public view returns(uint)
```
### assetBalance
`assetBalance`是一個只讀的`uint`函數，用來查詢合約持有的USDT數量。
```solidity
function assetBalance()view public returns (uint)
```
### getTokenLevel
`getTokenLevel`是一個只讀的`uint`函數，用來查詢當前的網格位置。
```solidity
function getTokenLevel()view public returns(uint)
```
### getTokenPrice
`getTokenPrice`是一個只讀的`uint`函數，用來查詢當前的價格，回傳值不考慮decimal，且為了避免精度損失，回傳直視原始價格的2**64倍。
```solidity
function getTokenPrice() view public returns (uint)
```
### poolAddress
`poolAddress`是一個只讀的`address`函數，用來查詢合約使用的Uniswap V3 Pool的地址。
```solidity
function poolAddress() view public returns(address)
```
### targetBalance
`targetBalance`是一個只讀的`uint`函數，用來查詢合約持有的wBTC數量。
```solidity
function targetBalance()view public returns (uint)
```
### targetAddress
`targetAddress`是一個只讀的`address`函數，用來查詢合約持有的wBTC的合約地址。
```solidity
function targetAddress() view public returns(address)
```
### makeTransaction
`makeTransaction`是一個`external`函數，用來觸發網格交易。
```solidity
function makeTransaction() external 
```
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
```solidity
function _withdraw( address caller, address receiver, address owner, uint256 assets, uint256 shares) internal 
```
### `totalAssets`
`totalAssets`是一個用來查詢合約的總資產的函數。
因為我們的合約會同時持有USDT和wBTC，所以我們需要將這兩種資產的價值加總起來。
```solidity
function totalAssets()view public returns (uint)

