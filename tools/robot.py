import web3
import json
import my_config
import time
# FSCS contract address on sepolia
fscs_bd_adderss = "0x21b15d7f0259739487ba72A69a7f8e70FFBA032c"
fscs_ad_adderss = "0xeB9d36D046FAA4D0a0f9d9A08d55d8A8B117065d"

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
fscs_bd = w3.eth.contract(address=fscs_bd_adderss, abi=fscs_abi)
fscs_ad = w3.eth.contract(address=fscs_ad_adderss, abi=fscs_abi)
uniswap_contract = w3.eth.contract(address=uniswap_contract_address, abi=uniswap_abi)


def getPreviousLevel(contract):
    return contract.functions.previousLevel().call()

def getTokenLevel(contract):
    return contract.functions.getTokenLevel().call()


def makeTransaction(contract):
    # 估算需要用到的gas fee
    estimate_gas = contract.functions.makeTransaction().estimate_gas()
    # 建構交易
    tx = contract.functions.makeTransaction().build_transaction({
        'from': my_config.ACCOUNT,
        'nonce': w3.eth.get_transaction_count(my_config.ACCOUNT),
        'gas': estimate_gas,
        'gasPrice': w3.eth.gas_price
    })
    signed_tx = w3.eth.account.sign_transaction(tx,private_key=bytes.fromhex(my_config.PRIVATE_KEY))
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return tx_hash

def main():
    previous_level = getPreviousLevel(fscs_ad)
    level = getTokenLevel(fscs_ad)
    with open("log.txt", "a") as f:
        f.write(f"--- {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())} ---\n")
        f.write(f"Previous level: {previous_level}\n")
        f.write(f"Current level: {level}\n")
        f.write("\n")
    if previous_level != level:
        tx_hash = makeTransaction(fscs_ad)
        with open("log.txt", "a") as f:
            f.write("--- Transaction made \n")
            f.write(f"Tx hash: {tx_hash}\n")

if __name__ == "__main__":
    while True:
        main()
        time.sleep(600)



