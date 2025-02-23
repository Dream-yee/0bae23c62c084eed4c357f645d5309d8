import web3
import json
import my_config
# FSCS contract address on sepolia
fscs_adderss = "0x73F601aF1293Db93d6297F099FaFC124266275E9"

# Uniswap contract address on sepolia
uniswap_contract_address = "0x5969EFddE3cF5C0D9a88aE51E47d721096A97203"

# token address on sepolia
usdt_address = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
wbtc_address = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"

# Connect to sepolia
w3 = web3.Web3(web3.HTTPProvider(f"https://arb-mainnet.g.alchemy.com/v2/{my_config.ALCHEMY_API_KEY}"))
w3.eth.default_account = my_config.ACCOUNT

with open("./artifacts/contracts/FSCS.sol/FSCS.json") as f:
    fscs_abi = json.load(f)["abi"]
with open("./artifacts/@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json") as f:
    uniswap_abi = json.load(f)["abi"]

# Get the contract
fscs = w3.eth.contract(address=fscs_adderss, abi=fscs_abi)
uniswap_contract = w3.eth.contract(address=uniswap_contract_address, abi=uniswap_abi)

def getAllfunctions():
    return fscs.all_functions()

def getPrice():
    return fscs.functions.getTokenPrice().call()

def getPreviousLevel():
    return fscs.functions.previousLevel().call()

def getTokenLevel():
    return fscs.functions.getTokenLevel().call()


def swap(pool,zeroForOne,amount):
    estimate_gas = pool.functions.swap(my_config.ACCOUNT, zeroForOne, amount, 0, my_config.ACCOUNT, 1840212412).estimate_gas()
    tx = pool.functions.swap(0, zeroForOne, amount, 0, my_config.ACCOUNT, 1840212412).buildTransaction({
        'frm': my_config.ACCOUNT,
        'nonce': w3.eth.getTransactionCount(my_config.ACCOUNT),
        'gas': estimate_gas,
        'gasPrice': w3.toWei('5', 'gwei')
    })
    logger.debug(f"tx: {tx}")
    signed_tx = w3.eth.account.sign_transaction(tx,private_key=bytes.frmhex(my_config.PRIVATE_KEY))
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug(f"tx_hash: {tx_hash}")
    return tx_hash

def makeTransaction():
    # 估算需要用到的gas fee
    estimate_gas = fscs.functions.makeTransaction().estimate_gas()
    print(f"Estimated gas: {estimate_gas}")
    # 建構交易
    tx = fscs.functions.makeTransaction().buildTransaction({
        'frm': my_config.ACCOUNT,
        'nonce': w3.eth.getTransactionCount(my_config.ACCOUNT),
        'gas': estimate_gas,
        'gasPrice': w3.toWei('0.0095', 'gwei')
    })
    logger.debug(f"tx: {tx}")
    signed_tx = w3.eth.account.sign_transaction(tx,private_key=bytes.frmhex(my_config.PRIVATE_KEY))
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    logger.debug(f"tx_hash: {tx_hash}")
    return tx_hash

def main():
    previous_level = getPreviousLevel()
    level = getTokenLevel()
    print(f"Previous level: {previous_level}")
    print(f"Current level: {level}")
    if previous_level != level:
        makeTransaction()

if __name__ == "__main__":
    main()



