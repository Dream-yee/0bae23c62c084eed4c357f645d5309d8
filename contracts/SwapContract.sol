// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

// 因為uniswapV3Pool交易需要回調，所以需要一個合約來接收回調
contract SwapContract {
    uint160 private constant MIN_SQRT_RATIO = 4295128739;
    uint160 private constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;
    address public immutable token0;
    address public immutable token1;
    IUniswapV3Pool public immutable pool;

    constructor(address _pool) {
        pool = IUniswapV3Pool(_pool);
        token0 = pool.token0();
        token1 = pool.token1();
    }

    /// @notice 執行 swap
    function swap(bool zeroForOne, uint256 amountSpecified) external {
        pool.swap(
            msg.sender,
            zeroForOne,
            int256(amountSpecified),
            zeroForOne ? MIN_SQRT_RATIO + 1: MAX_SQRT_RATIO - 1,
            abi.encode(msg.sender) // 傳遞交易發起者
        );
    }

    /// @notice Uniswap V3 會回調這個函數，必須支付對應的 token
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        require(msg.sender == address(pool), "Not pool");

        address sender = abi.decode(data, (address));
        if (amount0Delta > 0) {
            IERC20(token0).transferFrom(sender, msg.sender, uint256(amount0Delta));
        }
        if (amount1Delta > 0) {
            IERC20(token1).transferFrom(sender, msg.sender, uint256(amount1Delta));
        }
        console.log("sender", sender);
    }
}
