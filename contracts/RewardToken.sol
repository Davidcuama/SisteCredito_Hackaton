// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PaymentCredential.sol";

/**
 * @title RewardToken
 * @dev Token ERC20 para el sistema de gamificación
 * Los usuarios ganan tokens por pagos puntuales
 */
contract RewardToken is ERC20, ERC20Burnable, Ownable {
    
    PaymentCredential public paymentCredential;
    mapping(address => bool) public authorizedContracts; // Contratos autorizados a distribuir recompensas
    
    // Configuración de recompensas
    uint256 public rewardPerOnTimePayment = 100 * 10**18; // 100 tokens por pago puntual
    uint256 public bonusRewardThreshold = 10; // Bonus después de 10 pagos puntuales consecutivos
    uint256 public bonusMultiplier = 2; // 2x bonus
    
    // Mapeos para tracking
    mapping(bytes32 => uint256) public consecutiveOnTimePayments; // Pagos puntuales consecutivos
    mapping(bytes32 => uint256) public lastPaymentDate; // Última fecha de pago
    mapping(bytes32 => uint256) public totalEarned; // Total ganado por usuario
    mapping(bytes32 => address) public userHashToAddress; // Mapeo de userHash a address del usuario
    
    // Eventos
    event RewardDistributed(
        bytes32 indexed userHash,
        uint256 amount,
        bool isBonus,
        uint256 consecutiveCount
    );
    
    event RewardConfigUpdated(
        uint256 newRewardPerPayment,
        uint256 newBonusThreshold,
        uint256 newBonusMultiplier
    );
    
    /**
     * @dev Constructor
     * @param _paymentCredential Dirección del contrato PaymentCredential
     */
    constructor(address _paymentCredential) ERC20("SisteCredito Reward Token", "SCRT") Ownable(msg.sender) {
        paymentCredential = PaymentCredential(_paymentCredential);
        authorizedContracts[_paymentCredential] = true; // Autorizar PaymentCredential
        // Mint inicial para el contrato (se distribuirá como recompensas)
        _mint(address(this), 1000000 * 10**18); // 1 millón de tokens
    }
    
    /**
     * @dev Autorizar un contrato adicional para distribuir recompensas
     * @param _contract Dirección del contrato a autorizar
     */
    function authorizeContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        authorizedContracts[_contract] = true;
    }
    
    /**
     * @dev Desautorizar un contrato
     * @param _contract Dirección del contrato a desautorizar
     */
    function deauthorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }
    
    /**
     * @dev Registrar dirección de usuario asociada a un hash
     * @param _userHash Hash del usuario
     * @param _userAddress Dirección del usuario
     */
    function registerUserAddress(bytes32 _userHash, address _userAddress) external {
        require(authorizedContracts[msg.sender] || msg.sender == address(paymentCredential), "Not authorized");
        require(_userAddress != address(0), "Invalid address");
        require(userHashToAddress[_userHash] == address(0) || userHashToAddress[_userHash] == _userAddress, "Address already set");
        userHashToAddress[_userHash] = _userAddress;
    }
    
    /**
     * @dev Distribuir recompensa por pago puntual
     * Solo puede ser llamado por el contrato PaymentCredential
     * @param _userHash Hash del usuario
     * @param _isOnTime Si el pago fue puntual
     */
    function distributeReward(bytes32 _userHash, bool _isOnTime) external {
        require(authorizedContracts[msg.sender] || msg.sender == address(paymentCredential), "Not authorized");
        
        address userAddress = userHashToAddress[_userHash];
        require(userAddress != address(0), "User address not registered");
        
        if (!_isOnTime) {
            // Resetear contador de pagos consecutivos
            consecutiveOnTimePayments[_userHash] = 0;
            return;
        }
        
        // Incrementar contador de pagos consecutivos
        consecutiveOnTimePayments[_userHash]++;
        uint256 consecutiveCount = consecutiveOnTimePayments[_userHash];
        
        // Calcular recompensa base
        uint256 reward = rewardPerOnTimePayment;
        bool isBonus = false;
        
        // Aplicar bonus si alcanza el umbral
        if (consecutiveCount >= bonusRewardThreshold && consecutiveCount % bonusRewardThreshold == 0) {
            reward = reward * bonusMultiplier;
            isBonus = true;
        }
        
        // Transferir tokens al usuario (desde el balance del contrato)
        require(balanceOf(address(this)) >= reward, "Insufficient contract balance");
        _transfer(address(this), userAddress, reward);
        
        totalEarned[_userHash] += reward;
        lastPaymentDate[_userHash] = block.timestamp;
        
        emit RewardDistributed(_userHash, reward, isBonus, consecutiveCount);
    }
    
    /**
     * @dev Obtener estadísticas de recompensas de un usuario
     * @param _userHash Hash del usuario
     * @return consecutiveCount Pagos puntuales consecutivos
     * @return totalEarnedTokens Total de tokens ganados
     * @return userBalance Balance actual del usuario
     * @return userAddress Dirección del usuario
     */
    function getUserRewardStats(bytes32 _userHash) 
        external 
        view 
        returns (
            uint256 consecutiveCount,
            uint256 totalEarnedTokens,
            uint256 userBalance,
            address userAddress
        ) 
    {
        consecutiveCount = consecutiveOnTimePayments[_userHash];
        totalEarnedTokens = totalEarned[_userHash];
        userAddress = userHashToAddress[_userHash];
        if (userAddress != address(0)) {
            userBalance = balanceOf(userAddress);
        } else {
            userBalance = 0;
        }
    }
    
    /**
     * @dev Actualizar configuración de recompensas (solo owner)
     * @param _newReward Nueva recompensa por pago puntual
     * @param _newThreshold Nuevo umbral para bonus
     * @param _newMultiplier Nuevo multiplicador de bonus
     */
    function updateRewardConfig(
        uint256 _newReward,
        uint256 _newThreshold,
        uint256 _newMultiplier
    ) external onlyOwner {
        require(_newReward > 0, "Reward must be positive");
        require(_newThreshold > 0, "Threshold must be positive");
        require(_newMultiplier > 0, "Multiplier must be positive");
        
        rewardPerOnTimePayment = _newReward;
        bonusRewardThreshold = _newThreshold;
        bonusMultiplier = _newMultiplier;
        
        emit RewardConfigUpdated(_newReward, _newThreshold, _newMultiplier);
    }
    
    /**
     * @dev Mint tokens adicionales (solo owner, para mantener liquidez)
     * @param _amount Cantidad a mintear
     */
    function mintAdditionalTokens(uint256 _amount) external onlyOwner {
        _mint(address(this), _amount);
    }
    
    /**
     * @dev Obtener información de recompensas
     * @return rewardPerPayment Recompensa por pago puntual
     * @return threshold Umbral para bonus
     * @return multiplier Multiplicador de bonus
     * @return contractBalance Balance disponible en el contrato
     */
    function getRewardInfo() 
        external 
        view 
        returns (
            uint256 rewardPerPayment,
            uint256 threshold,
            uint256 multiplier,
            uint256 contractBalance
        ) 
    {
        rewardPerPayment = rewardPerOnTimePayment;
        threshold = bonusRewardThreshold;
        multiplier = bonusMultiplier;
        contractBalance = balanceOf(address(this));
    }
}

