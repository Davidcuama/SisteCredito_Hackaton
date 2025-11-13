// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentCredential
 * @dev Contrato principal para gestionar la acreditación de pagos puntuales
 * Implementa privacidad mediante hashing de datos personales
 */
contract PaymentCredential is Ownable, ReentrancyGuard {
    
    // Estructura para almacenar información de un pago
    struct PaymentRecord {
        bytes32 userHash;          // Hash del identificador del usuario (privacidad)
        uint256 amount;            // Monto del pago
        uint256 dueDate;           // Fecha de vencimiento
        uint256 paymentDate;       // Fecha de pago real
        bool isOnTime;             // Si el pago fue puntual
        bytes32 entityHash;        // Hash de la entidad/comercio
        string category;           // Categoría del pago (ej: "servicios", "credito")
    }
    
    // Estructura para el perfil del usuario
    struct UserProfile {
        bytes32 userHash;          // Hash único del usuario
        uint256 totalPayments;     // Total de pagos registrados
        uint256 onTimePayments;    // Pagos puntuales
        uint256 score;             // Puntuación de confiabilidad (0-1000)
        uint256 lastUpdate;        // Última actualización
        bool exists;               // Si el usuario existe
    }
    
    // Mapeos
    mapping(bytes32 => UserProfile) public userProfiles;
    mapping(bytes32 => PaymentRecord[]) public userPayments;
    mapping(address => bool) public authorizedEntities; // Entidades autorizadas a registrar pagos
    mapping(bytes32 => bool) public paymentHashes; // Evitar duplicados
    
    // Eventos
    event PaymentRegistered(
        bytes32 indexed userHash,
        bytes32 indexed paymentHash,
        uint256 amount,
        bool isOnTime,
        uint256 newScore
    );
    
    event UserCreated(bytes32 indexed userHash, address indexed creator);
    event EntityAuthorized(address indexed entity, bool authorized);
    
    // Modificadores
    modifier onlyAuthorized() {
        require(authorizedEntities[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier validUser(bytes32 _userHash) {
        require(userProfiles[_userHash].exists, "User does not exist");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // El deployer es automáticamente una entidad autorizada
        authorizedEntities[msg.sender] = true;
    }
    
    /**
     * @dev Crear un nuevo usuario en el sistema
     * @param _userHash Hash del identificador del usuario (debe generarse off-chain)
     */
    function createUser(bytes32 _userHash) external {
        require(!userProfiles[_userHash].exists, "User already exists");
        
        userProfiles[_userHash] = UserProfile({
            userHash: _userHash,
            totalPayments: 0,
            onTimePayments: 0,
            score: 500, // Puntuación inicial neutral
            lastUpdate: block.timestamp,
            exists: true
        });
        
        emit UserCreated(_userHash, msg.sender);
    }
    
    /**
     * @dev Crear usuario y asociar dirección (para integración con RewardToken)
     * @param _userHash Hash del identificador del usuario
     * @param _userAddress Dirección del usuario para recibir recompensas
     */
    function createUserWithAddress(bytes32 _userHash, address _userAddress) external {
        require(!userProfiles[_userHash].exists, "User already exists");
        require(_userAddress != address(0), "Invalid address");
        
        userProfiles[_userHash] = UserProfile({
            userHash: _userHash,
            totalPayments: 0,
            onTimePayments: 0,
            score: 500,
            lastUpdate: block.timestamp,
            exists: true
        });
        
        emit UserCreated(_userHash, msg.sender);
    }
    
    /**
     * @dev Registrar un pago puntual
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
    ) public virtual onlyAuthorized validUser(_userHash) nonReentrant {
        require(_paymentDate <= block.timestamp, "Payment date in future");
        require(_dueDate > 0, "Invalid due date");
        
        // Calcular si el pago fue puntual (con margen de 1 día)
        bool isOnTime = _paymentDate <= _dueDate + 1 days;
        
        // Crear hash único del pago para evitar duplicados
        bytes32 paymentHash = keccak256(abi.encodePacked(
            _userHash,
            _amount,
            _dueDate,
            _paymentDate,
            _entityHash,
            block.timestamp
        ));
        
        require(!paymentHashes[paymentHash], "Duplicate payment");
        paymentHashes[paymentHash] = true;
        
        // Crear registro de pago
        PaymentRecord memory newPayment = PaymentRecord({
            userHash: _userHash,
            amount: _amount,
            dueDate: _dueDate,
            paymentDate: _paymentDate,
            isOnTime: isOnTime,
            entityHash: _entityHash,
            category: _category
        });
        
        userPayments[_userHash].push(newPayment);
        
        // Actualizar perfil del usuario
        UserProfile storage profile = userProfiles[_userHash];
        profile.totalPayments++;
        
        if (isOnTime) {
            profile.onTimePayments++;
        }
        
        // Calcular nueva puntuación (0-1000)
        // Fórmula: (pagos puntuales / total pagos) * 1000
        if (profile.totalPayments > 0) {
            profile.score = (profile.onTimePayments * 1000) / profile.totalPayments;
        }
        
        profile.lastUpdate = block.timestamp;
        
        emit PaymentRegistered(_userHash, paymentHash, _amount, isOnTime, profile.score);
    }
    
    /**
     * @dev Obtener el perfil de un usuario
     * @param _userHash Hash del usuario
     * @return Perfil del usuario
     */
    function getUserProfile(bytes32 _userHash) 
        external 
        view 
        validUser(_userHash) 
        returns (UserProfile memory) 
    {
        return userProfiles[_userHash];
    }
    
    /**
     * @dev Obtener historial de pagos de un usuario
     * @param _userHash Hash del usuario
     * @return Array de registros de pago
     */
    function getUserPayments(bytes32 _userHash) 
        external 
        view 
        validUser(_userHash) 
        returns (PaymentRecord[] memory) 
    {
        return userPayments[_userHash];
    }
    
    /**
     * @dev Obtener estadísticas de un usuario
     * @param _userHash Hash del usuario
     * @return totalPayments Total de pagos
     * @return onTimePayments Pagos puntuales
     * @return score Puntuación (0-1000)
     * @return onTimePercentage Porcentaje de puntualidad
     */
    function getUserStats(bytes32 _userHash) 
        external 
        view 
        validUser(_userHash) 
        returns (
            uint256 totalPayments,
            uint256 onTimePayments,
            uint256 score,
            uint256 onTimePercentage
        ) 
    {
        UserProfile memory profile = userProfiles[_userHash];
        totalPayments = profile.totalPayments;
        onTimePayments = profile.onTimePayments;
        score = profile.score;
        
        if (totalPayments > 0) {
            onTimePercentage = (onTimePayments * 100) / totalPayments;
        }
    }
    
    /**
     * @dev Autorizar/desautorizar una entidad para registrar pagos
     * @param _entity Dirección de la entidad
     * @param _authorized Estado de autorización
     */
    function setEntityAuthorization(address _entity, bool _authorized) external onlyOwner {
        authorizedEntities[_entity] = _authorized;
        emit EntityAuthorized(_entity, _authorized);
    }
    
    /**
     * @dev Verificar si una dirección está autorizada
     * @param _entity Dirección a verificar
     * @return Si está autorizada
     */
    function isAuthorized(address _entity) external view returns (bool) {
        return authorizedEntities[_entity] || _entity == owner();
    }
}

