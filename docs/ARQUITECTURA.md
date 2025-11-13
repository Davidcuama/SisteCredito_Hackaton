# Arquitectura del Sistema - SisteCredito

## Visión General

SisteCredito está diseñado como un sistema descentralizado que utiliza blockchain para registrar y verificar pagos puntuales, manteniendo la privacidad de los usuarios mediante técnicas de hashing.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Frontend (Next.js + React)                 │    │
│  │  - Dashboard de usuario                            │    │
│  │  - Formulario de registro de pagos                 │    │
│  │  - Visualización de estadísticas                   │    │
│  │  - Sistema de recompensas                          │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │         Web3 Provider (ethers.js)                  │    │
│  │  - Conexión con MetaMask                           │    │
│  │  - Gestión de transacciones                        │    │
│  └──────────────────┬─────────────────────────────────┘    │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ Web3 Calls (JSON-RPC)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    CAPA DE BLOCKCHAIN                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Ethereum / Polygon                     │    │
│  │  - Red descentralizada                             │    │
│  │  - Consenso Proof of Stake                         │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────┐    │
│  │         Smart Contracts (Solidity)                  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  PaymentCredential                           │  │    │
│  │  │  - Gestión de usuarios                       │  │    │
│  │  │  - Registro de pagos                         │  │    │
│  │  │  - Cálculo de puntuaciones                   │  │    │
│  │  └──────────────┬───────────────────────────────┘  │    │
│  │                 │                                   │    │
│  │  ┌──────────────▼───────────────────────────────┐  │    │
│  │  │  RewardToken (ERC20)                         │  │    │
│  │  │  - Distribución de tokens                    │  │    │
│  │  │  - Sistema de bonos                          │  │    │
│  │  │  - Tracking de recompensas                   │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  PaymentCredentialWithRewards                │  │    │
│  │  │  - Integración de ambos contratos            │  │    │
│  │  │  - Distribución automática                   │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (Capa de Presentación)

**Tecnologías:**
- Next.js 14 (React Framework)
- TypeScript
- Tailwind CSS
- ethers.js (Web3)

**Responsabilidades:**
- Interfaz de usuario
- Conexión con wallets
- Visualización de datos
- Gestión de estado local
- Generación de hashes (privacidad)

**Estructura:**
```
frontend/
├── app/              # Páginas (App Router)
├── components/       # Componentes React
├── hooks/           # Custom hooks
└── utils/           # Utilidades
```

### 2. Smart Contracts (Capa de Lógica de Negocio)

#### PaymentCredential.sol

**Responsabilidades:**
- Creación y gestión de usuarios
- Registro de pagos
- Cálculo de puntuaciones
- Verificación de autorizaciones
- Prevención de duplicados

**Estructuras de Datos:**
```solidity
UserProfile {
    userHash: bytes32      // Identificador único hasheado
    totalPayments: uint256
    onTimePayments: uint256
    score: uint256         // 0-1000
    lastUpdate: uint256
    exists: bool
}

PaymentRecord {
    userHash: bytes32
    amount: uint256
    dueDate: uint256
    paymentDate: uint256
    isOnTime: bool
    entityHash: bytes32
    category: string
}
```

**Flujo de Registro de Pago:**
1. Validar autorización de entidad
2. Verificar existencia de usuario
3. Calcular si es puntual
4. Generar hash único del pago
5. Verificar no duplicado
6. Almacenar registro
7. Actualizar estadísticas
8. Emitir evento

#### RewardToken.sol

**Responsabilidades:**
- Gestión de tokens ERC20
- Distribución de recompensas
- Sistema de bonos
- Tracking de pagos consecutivos

**Mecánica de Recompensas:**
```
Pago Puntual → +100 tokens
Pago Tardío → Reset contador

Cada 10 consecutivos → Bonus 2x (200 tokens)
```

#### PaymentCredentialWithRewards.sol

**Responsabilidades:**
- Integración de ambos contratos
- Distribución automática de recompensas
- Sincronización de eventos

## Flujos Principales

### Flujo 1: Creación de Usuario

```
Usuario → Frontend
  ↓
Generar hash(identificador + salt)
  ↓
Frontend → Web3 → PaymentCredential.createUser()
  ↓
Smart Contract valida y crea perfil
  ↓
Emitir evento UserCreated
  ↓
Frontend actualiza UI
```

### Flujo 2: Registro de Pago

```
Entidad → Frontend (formulario)
  ↓
Frontend valida datos
  ↓
Frontend → Web3 → PaymentCredential.registerPayment()
  ↓
Smart Contract:
  1. Valida autorización
  2. Verifica usuario existe
  3. Calcula puntualidad
  4. Genera hash único
  5. Verifica no duplicado
  6. Almacena registro
  7. Actualiza estadísticas
  ↓
Si es puntual → RewardToken.distributeReward()
  ↓
Emitir eventos
  ↓
Frontend actualiza dashboard
```

### Flujo 3: Consulta de Estadísticas

```
Usuario → Frontend (Dashboard)
  ↓
Frontend → Web3 → PaymentCredential.getUserStats()
  ↓
Smart Contract retorna datos
  ↓
Frontend → Web3 → RewardToken.getUserRewardStats()
  ↓
Smart Contract retorna recompensas
  ↓
Frontend renderiza gráficos y estadísticas
```

## Privacidad y Seguridad

### Estrategia de Privacidad

1. **Hashing de Identificadores**
   ```
   userHash = keccak256(identifier + salt)
   ```
   - No se almacenan datos personales
   - Solo el usuario conoce su hash
   - Salt opcional para mayor seguridad

2. **Control de Acceso**
   - Solo entidades autorizadas pueden registrar
   - Owner gestiona autorizaciones
   - Usuarios solo pueden consultar su propio perfil

3. **Prevención de Duplicados**
   ```
   paymentHash = keccak256(userHash + amount + dates + entity + timestamp)
   ```
   - Hash único por pago
   - Verificación antes de almacenar

### Seguridad

- **ReentrancyGuard**: Protección contra ataques de reentrancy
- **Ownable**: Control de acceso a funciones administrativas
- **Validaciones**: Verificación exhaustiva de inputs
- **Eventos**: Transparencia y auditabilidad

## Escalabilidad

### Optimizaciones Implementadas

1. **Gas Optimization**
   - Uso de `uint256` eficiente
   - Packing de structs donde es posible
   - Eventos en lugar de storage cuando es apropiado

2. **Arquitectura Modular**
   - Contratos separados por responsabilidad
   - Fácil actualización individual
   - Reutilización de código

3. **Redes L2**
   - Compatible con Polygon
   - Reducción de costos de gas
   - Mayor throughput

### Consideraciones Futuras

- **Oracles**: Para verificación automática
- **IPFS**: Para almacenar metadata off-chain
- **Layer 2**: Optimización adicional
- **Sharding**: Si escala masivamente

## Integraciones

### Actuales

- MetaMask (wallet)
- ethers.js (Web3 library)
- Hardhat (desarrollo)

### Futuras

- WalletConnect (más wallets)
- The Graph (indexing)
- Chainlink (oracles)
- IPFS (storage)

## Monitoreo y Analytics

### Eventos Emitidos

```solidity
event PaymentRegistered(...)
event UserCreated(...)
event RewardDistributed(...)
event EntityAuthorized(...)
```

### Métricas Clave

- Total de usuarios
- Total de pagos registrados
- Tasa de puntualidad promedio
- Tokens distribuidos
- Transacciones por día

## Deployment

### Redes Soportadas

1. **Local (Hardhat)**: Desarrollo y testing
2. **Sepolia**: Testnet de Ethereum
3. **Polygon Mumbai**: Testnet de Polygon
4. **Mainnet**: Producción (futuro)

### Proceso de Deployment

1. Compilar contratos
2. Ejecutar tests
3. Verificar código (opcional)
4. Desplegar en red
5. Verificar deployment
6. Actualizar frontend con direcciones

---

Esta arquitectura proporciona una base sólida, escalable y segura para el sistema SisteCredito.

