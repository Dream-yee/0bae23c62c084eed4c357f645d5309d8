N_COINS: constant(uint256) = 3
A_MULTIPLIER: constant(uint256) = 10000

MIN_GAMMA: constant(uint256) = 10**10
MAX_GAMMA: constant(uint256) = 5 * 10**16

MIN_A: constant(uint256) = N_COINS**N_COINS * A_MULTIPLIER / 100
MAX_A: constant(uint256) = N_COINS**N_COINS * A_MULTIPLIER * 1000

@external
@view
def get_y(
    _ANN: uint256, _gamma: uint256, x: uint256[N_COINS], _D: uint256, i: uint256
) -> uint256[2]:
    """
    @notice Calculate x[i] given other balances x[0..N_COINS-1] and invariant D.
    @dev ANN = A * N**N.
    @param _ANN AMM.A() value.
    @param _gamma AMM.gamma() value.
    @param x Balances multiplied by prices and precisions of all coins.
    @param _D Invariant.
    @param i Index of coin to calculate y.
    """

    # Safety checks
    assert _ANN > MIN_A - 1 and _ANN < MAX_A + 1  # dev: unsafe values A
    assert _gamma > MIN_GAMMA - 1 and _gamma < MAX_GAMMA + 1  # dev: unsafe values gamma
    assert _D > 10**17 - 1 and _D < 10**15 * 10**18 + 1  # dev: unsafe values D

    # 感覺是檢查
    frac: uint256 = 0
    for k in range(3):
        if k != i:
            frac = x[k] * 10**18 / _D
            assert frac > 10**16 - 1 and frac < 10**20 + 1, "Unsafe values x[i]"
            # if above conditions are met, x[k] > 0

    #???這是啥算法
    j: uint256 = 0
    k: uint256 = 0
    if i == 0:
        j = 1
        k = 2
    elif i == 1:
        j = 0
        k = 2
    elif i == 2:
        j = 0
        k = 1

    ANN: int256 = convert(_ANN, int256)
    gamma: int256 = convert(_gamma, int256)
    D: int256 = convert(_D, int256)
    x_j: int256 = convert(x[j], int256)
    x_k: int256 = convert(x[k], int256)
    gamma2: int256 = unsafe_mul(gamma, gamma)

    a = 10**36 / 27
    b = 10**36/9 + 2*10**18*gamma/27 - D**2/x_j*gamma**2*ANN/27**2/convert(A_MULTIPLIER, int256)/x_k
    c = 10**36/9 + gamma*(gamma + 4*10**18)/27 + gamma**2*(x_j+x_k-D)/D*ANN/27/convert(A_MULTIPLIER, int256)
    d = (10**18 + gamma)**2/27
    d0 = abs(3*a*c/b - b)

    divider: int256 = 0
    if d0 > 10**48:
        divider = 10**30
    elif d0 > 10**44:
        divider = 10**26
    elif d0 > 10**40:
        divider = 10**22
    elif d0 > 10**36:
        divider = 10**18
    elif d0 > 10**32:
        divider = 10**14
    elif d0 > 10**28:
        divider = 10**10
    elif d0 > 10**24:
        divider = 10**6
    elif d0 > 10**20:
        divider = 10**2
    else:
        divider = 1
    a = a**2/b/divider
    b = a/divider
    c = c*a/b/divider
    d = d*a/b/divider

    delta0 = 3*a*c/b - b

    delta1 = 9*a*c/b - 2*b - 27*a**2/b*d/b

    sqrt_arg = delta1**2 + 4*delta0**2/b*delta0

    sqrt_val: int256 = 0
    if sqrt_arg > 0:
        sqrt_val = convert(isqrt(convert(sqrt_arg, uint256)), int256)
    else:
        return [self._newton_y(_ANN, _gamma, x, _D, i), 0]

    b_cbrt: int256 = 0
    if b >= 0:
        b_cbrt = convert(self._cbrt(convert(b, uint256)), int256)
    else:
        b_cbrt = -convert(self._cbrt(convert(-b, uint256)), int256)

    second_cbrt: int256 = 0
    if delta1 > 0:
        # convert(self._cbrt(convert((delta1 + sqrt_val), uint256)/2), int256)
        second_cbrt = convert(
            self._cbrt(unsafe_div(convert(delta1 + sqrt_val, uint256), 2)),
            int256
        )
    else:
        second_cbrt = -convert(
            self._cbrt(unsafe_div(convert(-(delta1 - sqrt_val), uint256), 2)),
            int256
        )

    # b_cbrt*b_cbrt/10**18*second_cbrt/10**18
    C1: int256 = unsafe_div(
        unsafe_div(b_cbrt * b_cbrt, 10**18) * second_cbrt,
        10**18
    )

    # (b + b*delta0/C1 - C1)/3
    root_K0: int256 = unsafe_div(b + b * delta0 / C1 - C1, 3)

    # D*D/27/x_k*D/x_j*root_K0/a
    root: int256 = unsafe_div(
        unsafe_div(
            unsafe_div(unsafe_div(D * D, 27), x_k) * D,
            x_j
        ) * root_K0,
        a
    )

    out: uint256[2] = [
        convert(root, uint256),
        convert(unsafe_div(10**18 * root_K0, a), uint256)
    ]

    # due to precision issues, get_y can be off by 2 wei or so wrt _newton_y

    return out
def _exchange(
    i: uint256,
    j: uint256,
    dx: uint256,
    min_dy: uint256,
) -> uint256:

    A_gamma: uint256[2] = self._A_gamma()
    xp: uint256[N_COINS] = self.balances
    precisions: uint256[N_COINS] = self._unpack(self.packed_precisions)
    dy: uint256 = 0

    y: uint256 = xp[j]  # <----------------- if j > N_COINS, this will revert.
    x0: uint256 = xp[i]  # <--------------- if i > N_COINS, this will  revert.
    xp[i] = x0 + dx
    self.balances[i] = xp[i]

    packed_price_scale: uint256 = self.price_scale_packed #將幣之間的價值轉為1：1
    price_scale: uint256[N_COINS - 1] = self._unpack_prices(
        packed_price_scale
    )#這個有external函數可以拿到

    # 將幣給標準化，但我不知道它如何標準化
    xp[0] *= precisions[0]#這些也有external函數可以拿,也可以直接從ERC20那裡拿
    for k in range(1, N_COINS):
        xp[k] = unsafe_div( #可能是原生函數，沒有被curve定義
            xp[k] * price_scale[k - 1] * precisions[k],
            PRECISION
        )  # <-------- Safu to do unsafe_div here since PRECISION is not zero.


    prec_i: uint256 = precisions[i]

    # ----------- Update invariant if A, gamma are undergoing ramps ---------

    t: uint256 = self.future_A_gamma_time
    if t > block.timestamp:

        x0 *= prec_i

        if i > 0:
            x0 = unsafe_div(x0 * price_scale[i - 1], PRECISION)

        x1: uint256 = xp[i]  # <------------------ Back up old value in xp ...
        xp[i] = x0                                                         # |
        self.D = MATH.newton_D(A_gamma[0], A_gamma[1], xp, 0)              #  #定義在別處
        xp[i] = x1  # <-------------------------------------- ... and restore.


    # ----------------------- Calculate dy and fees --------------------------

    D: uint256 = self.D
    prec_j: uint256 = precisions[j]
    y_out: uint256[2] = MATH.get_y(A_gamma[0], A_gamma[1], xp, D, j)
    dy = xp[j] - y_out[0]
    xp[j] -= dy
    dy -= 1

    if j > 0:
        dy = dy * PRECISION / price_scale[j - 1]
    dy /= prec_j

    fee: uint256 = unsafe_div(self._fee(xp) * dy, 10**10)

    dy -= fee  # <--------------------- Subtract fee from the outgoing amount.
    assert dy >= min_dy, "Slippage"

    y -= dy
    self.balances[j] = y  # <----------- Update pool balance of outgoing coin.

    y *= prec_j
    if j > 0:
        y = unsafe_div(y * price_scale[j - 1], PRECISION)
    xp[j] = y  # <------------------------------------------------- Update xp.
    return dy
