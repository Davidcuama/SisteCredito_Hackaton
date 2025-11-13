// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RewardToken.sol";

/**
 * @title RewardShop
 * @dev Tienda de canje de tokens SCRT por beneficios y servicios
 * Los usuarios pueden canjear sus tokens ganados por diversos beneficios
 */
contract RewardShop is Ownable, ReentrancyGuard {
    
    RewardToken public rewardToken;
    
    // Estructura de un beneficio canjeable
    struct Benefit {
        uint256 id;
        string name;
        string description;
        uint256 cost; // Costo en tokens SCRT
        uint256 stock; // Stock disponible (0 = ilimitado)
        bool active; // Si el beneficio está disponible
        BenefitType benefitType;
    }
    
    enum BenefitType {
        DISCOUNT_RATE,      // Descuento en tasa de interés (0-100%)
        FEE_REDUCTION,      // Reducción de comisiones
        PREMIUM_ACCESS,     // Acceso a productos premium
        CERTIFICATE,        // Certificado NFT de buen pagador
        CASHBACK,           // Cashback en transacciones
        CREDIT_LINE         // Acceso a línea de crédito preferencial
    }
    
    // Mapeo de beneficios
    mapping(uint256 => Benefit) public benefits;
    uint256 public nextBenefitId;
    
    // Historial de canjes por usuario
    mapping(address => mapping(uint256 => uint256)) public userRedemptions; // usuario => beneficioId => cantidad canjeada
    mapping(address => uint256[]) public userRedemptionHistory; // Historial de canjes del usuario
    
    // Eventos
    event BenefitCreated(
        uint256 indexed benefitId,
        string name,
        uint256 cost,
        BenefitType benefitType
    );
    
    event BenefitRedeemed(
        address indexed user,
        uint256 indexed benefitId,
        uint256 amount,
        uint256 totalCost
    );
    
    event BenefitUpdated(uint256 indexed benefitId, bool active);
    event StockUpdated(uint256 indexed benefitId, uint256 newStock);
    
    /**
     * @dev Constructor
     * @param _rewardToken Dirección del contrato RewardToken
     */
    constructor(address _rewardToken) Ownable(msg.sender) {
        require(_rewardToken != address(0), "Invalid reward token address");
        rewardToken = RewardToken(_rewardToken);
        nextBenefitId = 1;
    }
    
    /**
     * @dev Crear un nuevo beneficio canjeable
     * @param _name Nombre del beneficio
     * @param _description Descripción del beneficio
     * @param _cost Costo en tokens SCRT
     * @param _stock Stock disponible (0 = ilimitado)
     * @param _benefitType Tipo de beneficio
     */
    function createBenefit(
        string memory _name,
        string memory _description,
        uint256 _cost,
        uint256 _stock,
        BenefitType _benefitType
    ) external onlyOwner {
        require(_cost > 0, "Cost must be positive");
        
        uint256 benefitId = nextBenefitId++;
        benefits[benefitId] = Benefit({
            id: benefitId,
            name: _name,
            description: _description,
            cost: _cost,
            stock: _stock,
            active: true,
            benefitType: _benefitType
        });
        
        emit BenefitCreated(benefitId, _name, _cost, _benefitType);
    }
    
    /**
     * @dev Canjear un beneficio
     * @param _benefitId ID del beneficio a canjear
     * @param _quantity Cantidad a canjear
     */
    function redeemBenefit(uint256 _benefitId, uint256 _quantity) external nonReentrant {
        require(_quantity > 0, "Quantity must be positive");
        
        Benefit storage benefit = benefits[_benefitId];
        require(benefit.active, "Benefit is not active");
        require(benefit.stock == 0 || benefit.stock >= _quantity, "Insufficient stock");
        
        uint256 totalCost = benefit.cost * _quantity;
        require(
            rewardToken.balanceOf(msg.sender) >= totalCost,
            "Insufficient token balance"
        );
        
        // Transferir tokens del usuario al contrato
        bool success = rewardToken.transferFrom(msg.sender, address(this), totalCost);
        require(success, "Token transfer failed");
        
        // Quemar tokens
        rewardToken.burn(totalCost);
        
        // Actualizar stock
        if (benefit.stock > 0) {
            benefit.stock -= _quantity;
        }
        
        // Registrar canje
        userRedemptions[msg.sender][_benefitId] += _quantity;
        userRedemptionHistory[msg.sender].push(_benefitId);
        
        emit BenefitRedeemed(msg.sender, _benefitId, _quantity, totalCost);
    }
    
    /**
     * @dev Obtener información de un beneficio
     * @param _benefitId ID del beneficio
     */
    function getBenefit(uint256 _benefitId) external view returns (Benefit memory) {
        return benefits[_benefitId];
    }
    
    /**
     * @dev Obtener todos los beneficios activos
     * @return Array de IDs de beneficios activos
     */
    function getActiveBenefits() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](nextBenefitId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextBenefitId; i++) {
            if (benefits[i].active) {
                activeIds[count] = i;
                count++;
            }
        }
        
        // Redimensionar array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Obtener historial de canjes de un usuario
     * @param _user Dirección del usuario
     */
    function getUserRedemptionHistory(address _user) external view returns (uint256[] memory) {
        return userRedemptionHistory[_user];
    }
    
    /**
     * @dev Obtener cantidad canjeada de un beneficio por usuario
     * @param _user Dirección del usuario
     * @param _benefitId ID del beneficio
     */
    function getUserRedemptionCount(address _user, uint256 _benefitId) external view returns (uint256) {
        return userRedemptions[_user][_benefitId];
    }
    
    /**
     * @dev Activar/desactivar un beneficio
     * @param _benefitId ID del beneficio
     * @param _active Estado
     */
    function setBenefitActive(uint256 _benefitId, bool _active) external onlyOwner {
        require(benefits[_benefitId].id != 0, "Benefit does not exist");
        benefits[_benefitId].active = _active;
        emit BenefitUpdated(_benefitId, _active);
    }
    
    /**
     * @dev Actualizar stock de un beneficio
     * @param _benefitId ID del beneficio
     * @param _newStock Nuevo stock
     */
    function updateStock(uint256 _benefitId, uint256 _newStock) external onlyOwner {
        require(benefits[_benefitId].id != 0, "Benefit does not exist");
        benefits[_benefitId].stock = _newStock;
        emit StockUpdated(_benefitId, _newStock);
    }
    
    /**
     * @dev Actualizar costo de un beneficio
     * @param _benefitId ID del beneficio
     * @param _newCost Nuevo costo
     */
    function updateCost(uint256 _benefitId, uint256 _newCost) external onlyOwner {
        require(benefits[_benefitId].id != 0, "Benefit does not exist");
        require(_newCost > 0, "Cost must be positive");
        benefits[_benefitId].cost = _newCost;
    }
    
    /**
     * @dev Obtener cantidad total de beneficios
     */
    function getBenefitCount() external view returns (uint256) {
        return nextBenefitId - 1;
    }
}

