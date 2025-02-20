const USDT_CONTRACT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const RECIPIENT_ADDRESS = "YOUR_WALLET_ADDRESS";
const ETH_TO_USDT_RATE = 2000; // Example rate: 1 ETH = 2000 USDT

let userAddress = null;

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }],
        });
        
        return userAddress;
    } else {
        throw new Error('MetaMask não encontrada');
    }
}

async function sendUSDT(ethAmount) {
    if (!userAddress) throw new Error("Carteira não conectada");

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract([
        {
            "inputs": [
                {"name": "recipient", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "name": "transfer",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], USDT_CONTRACT);

    const usdtAmount = ethAmount * ETH_TO_USDT_RATE;
    const decimals = 6;
    const amountInWei = web3.utils.toBN(Math.floor(usdtAmount * 10**decimals));

    return await contract.methods.transfer(RECIPIENT_ADDRESS, amountInWei)
        .send({ from: userAddress });
}

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.createElement('button');
    connectButton.className = 'btn';
    connectButton.textContent = 'Conectar MetaMask';
    document.querySelector('.buy-form').prepend(connectButton);

    const ethInput = document.getElementById('ethAmount');
    const buyButton = document.getElementById('buyCryptBtn');

    connectButton.addEventListener('click', async () => {
        try {
            const address = await connectMetaMask();
            connectButton.textContent = `Conectado: ${address.slice(0, 6)}...${address.slice(-4)}`;
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Instale a MetaMask ou verifique se está conectado');
        }
    });

    buyButton.addEventListener('click', async () => {
        if (!userAddress) {
            alert('Por favor, conecte sua carteira primeiro');
            return;
        }

        const ethAmount = parseFloat(ethInput.value);
        if (!ethAmount || ethAmount <= 0) {
            alert('Por favor, insira uma quantidade válida de ETH');
            return;
        }

        try {
            const transaction = await sendUSDT(ethAmount);
            alert('Transação enviada! Hash: ' + transaction.transactionHash);
        } catch (error) {
            console.error('Erro na transação:', error);
            alert('Erro na transação. Verifique o console para mais detalhes.');
        }
    });
});