import web3
import json
import my_config
import time
# FSCS contract address on sepolia
fscs_bd_adderss = "0xe71b317dA7Ac7eA327Dad64c5Fa43dB92D343C96"
fscs_ad_adderss = "0x597541Ee4bCd9f28350D1DFCB5E951DbB58641c9"

# Connect to sepolia
w3 = web3.Web3(web3.HTTPProvider(f"https://arb-mainnet.g.alchemy.com/v2/{my_config.ALCHEMY_API_KEY}"))
w3.eth.default_account = my_config.ACCOUNT

with open("./artifacts/contracts/FSCS.sol/FSCS.json") as f:
    fscs_abi = json.load(f)["abi"]

# Get the contract
fscs_bd = w3.eth.contract(address=fscs_bd_adderss, abi=fscs_abi)
fscs_ad = w3.eth.contract(address=fscs_ad_adderss, abi=fscs_abi)


def getPreviousLevel(contract):
    return contract.functions.previousLevel().call()

def getTokenLevel(contract):
    return contract.functions.getTokenLevel().call()

GRID_NUM = 22 #也可以不hardcode，直接call contract的GRID_NUM()
def assetBalance(contract):
    return contract.functions.assetBalance().call()

def buyQty(contract, level):
    return contract.functions.buyQty(level).call()

def shouldMakeTransaction(contract):
    level = getTokenLevel(contract);
    previousLevel = getPreviousLevel(contract);
    if level == previousLevel:
        return False
    if level < previousLevel:
        if previousLevel == GRID_NUM:
            previousLevel = GRID_NUM-1
        if assetBalance(contract)//previousLevel== 0:
            return False
        for i in range(level, previousLevel):
            if buyQty(contract, i) == 0:
                return True
        return False
    elif level > previousLevel:
        if previousLevel == 0:
            previousLevel = 1
        for i in range(previousLevel, level):
            if buyQty(contract, i-1) != 0:
                return True
        return False

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
    with open("log.txt", "a") as f:
        f.write(f"--- {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())} ---\n")
        f.write(f"Previous level: {previousLevel(fscs_ad)}\n")
        f.write(f"Current level: {getTokenLevel(fscs_ad)}\n")
        f.write("\n")
    if shouldMakeTransaction(fscs_ad):
        tx_hash = makeTransaction(fscs_ad)
        with open("log.txt", "a") as f:
            f.write("--- Transaction made \n")
            f.write(f"Tx hash: {tx_hash}\n")

if __name__ == "__main__":
    while True:
        main()
        time.sleep(600)



