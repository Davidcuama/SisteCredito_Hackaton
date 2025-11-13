// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PaymentCredential.sol";
import "./RewardToken.sol";

/**
 * @title PaymentCredentialWithRewards
 * @dev Contrato que integra PaymentCredential con RewardToken
 * Distribuye recompensas automáticamente cuando se registran pagos puntuales
 */
contract PaymentCredentialWithRewards is PaymentCredential {
    
    RewardToken public rewardToken;
    bool public rewardsEnabled;
    
    event RewardsEnabled(bool enabled);
    event RewardTokenSet(address indexed token);
    
    /**
     * @dev Constructor
     * @param _rewardToken Dirección del contrato RewardToken
     */
    constructor(address _rewardToken) PaymentCredential() {
        rewardToken = RewardToken(_rewardToken);
        rewardsEnabled = true;
    }
    
    /**
     * @dev Registrar pago con distribución automática de recompensas
     * Override de registerPayment para agregar distribución de recompensas
     * @param _userHash Hash del usuario
     * @param _amount Monto del pago
     * @param _dueDate Fecha de vencimiento
     * @param _paymentDate Fecha de pago
     * @param _entityHash Hash de la entidad
     * @param _category Categoría del pago
     */
    function registerPayment(
        bytes32 _userHash,
        uint256 _amount,
        uint256 _dueDate,
        uint256 _paymentDate,
        bytes32 _entityHash,
        string memory _category
    ) public override onlyAuthorized validUser(_userHash) nonReentrant {
        // Llamar a la función padre para registrar el pago
        super.registerPayment(_userHash, _amount, _dueDate, _paymentDate, _entityHash, _category);
        
        // Obtener si el pago fue puntual
        bool isOnTime = _paymentDate <= _dueDate + 1 days;
        
        // Distribuir recompensa si está habilitado
        if (rewardsEnabled && address(rewardToken) != address(0)) {
            try rewardToken.distributeReward(_userHash, isOnTime) {
                // Recompensa distribuida exitosamente
            } catch {
                // Si falla la distribución de recompensa, no revertir el pago
                // El pago ya fue registrado, solo no se distribuyó la recompensa
            }
        }
    }
    
    /**
     * @dev Crear usuario y registrar su dirección para recompensas
     * @param _userHash Hash del usuario
     * @param _userAddress Dirección del usuario
     */
    function createUserWithRewards(bytes32 _userHash, address _userAddress) external {
        require(!userProfiles[_userHash].exists, "User already exists");
        require(_userAddress != address(0), "Invalid address");
        
        // Crear usuario
        userProfiles[_userHash] = UserProfile({
            userHash: _userHash,
            totalPayments: 0,
            onTimePayments: 0,
            score: 500,
            lastUpdate: block.timestamp,
            exists: true
        });
        
        // Registrar dirección en RewardToken
        if (address(rewardToken) != address(0)) {
            rewardToken.registerUserAddress(_userHash, _userAddress);
        }
        
        emit UserCreated(_userHash, msg.sender);
    }
    
    /**
     * @dev Habilitar/deshabilitar sistema de recompensas
     * @param _enabled Estado
     */
    function setRewardsEnabled(bool _enabled) external onlyOwner {
        rewardsEnabled = _enabled;
        emit RewardsEnabled(_enabled);
    }
    
    /**
     * @dev Actualizar dirección del contrato de tokens
     * @param _newToken Nueva dirección
     */
    function setRewardToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid address");
        rewardToken = RewardToken(_newToken);
        emit RewardTokenSet(_newToken);
    }
}

