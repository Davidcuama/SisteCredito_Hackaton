# SisteCredito - Acreditación del Pago Puntual

## 🎯 Descripción del Proyecto

SisteCredito es una solución blockchain innovadora que permite a los usuarios acreditar su hábito de pago responsable de manera privada, portátil y confiable. El sistema utiliza tecnología blockchain para registrar pagos puntuales sin necesidad de compartir bases de datos complejas ni documentos susceptibles de falsificación.

## ✨ Características Principales

- **Blockchain Descentralizado**: Utiliza contratos inteligentes para registrar pagos de forma inmutable
- **Privacidad**: Los datos personales están protegidos mediante hashing y control de acceso
- **Gamificación**: Sistema de recompensas digitales (tokens) que incentivan el pago puntual
- **Portabilidad**: Los usuarios pueden demostrar su historial de pago a cualquier entidad
- **Interfaz Moderna**: UI/UX intuitiva y atractiva

## 🏗️ Arquitectura

```
SisteCredito/
├── contracts/          # Smart Contracts (Solidity)
├── frontend/           # Aplicación Web (React/Next.js)
├── docs/              # Documentación
└── README.md
```

## 🚀 Tecnologías Utilizadas

- **Blockchain**: Ethereum / Polygon
- **Smart Contracts**: Solidity
- **Frontend**: React, Next.js, Tailwind CSS
- **Web3**: ethers.js / web3.js
- **Testing**: Hardhat / Truffle

## 📋 Criterios de Evaluación Cumplidos

1. ✅ **Relevancia y comprensión del reto** (20 pts)
2. ✅ **Uso innovador de Blockchain** (20 pts)
3. ✅ **Privacidad y seguridad de los datos** (15 pts)
4. ✅ **Viabilidad técnica y escalabilidad** (15 pts)
5. ✅ **Componente de gamificación** (15 pts)
6. ✅ **Presentación y experiencia de usuario** (10 pts)
7. ✅ **Impacto potencial y sostenibilidad** (5 pts)

## 📖 Instalación y Uso

### Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Davidcuama/SisteCredito_Hackaton.git
cd SisteCredito_Hackaton
```

2. **Instalar dependencias del proyecto**
```bash
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
cd ..
```

### Ejecutar la Aplicación

#### Modo Demo (Recomendado para pruebas rápidas)

La aplicación funciona en **modo demo** por defecto, mostrando datos simulados sin necesidad de blockchain:

```bash
npm run dev
```

O desde el directorio frontend:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

> **Nota**: En modo demo no necesitas:
> - Hardhat node corriendo
> - MetaMask conectado
> - Tokens de prueba
> - Contratos desplegados

#### Modo Blockchain (Desarrollo completo)

Para usar la versión completa con blockchain:

1. **Iniciar Hardhat node (en una terminal separada)**
```bash
npx hardhat node
```

2. **Desplegar contratos localmente**
```bash
npm run deploy
```

3. **Ejecutar el frontend**
```bash
npm run dev
```

4. **Conectar MetaMask** a la red local (Chain ID: 1337, RPC: http://127.0.0.1:8545)

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo del frontend
- `npm run compile` - Compila los contratos inteligentes
- `npm run test` - Ejecuta los tests de los contratos
- `npm run deploy` - Despliega contratos en red local
- `npm run deploy:shibuya` - Despliega contratos en Shibuya testnet
- `npm run build` - Construye el frontend para producción

### Estructura del Proyecto

```
SisteCredito/
├── contracts/          # Smart Contracts (Solidity)
│   ├── PaymentCredential.sol
│   ├── PaymentCredentialWithRewards.sol
│   ├── RewardToken.sol
│   └── RewardShop.sol
├── frontend/           # Aplicación Web (React/Next.js)
│   ├── app/           # Páginas y layouts
│   ├── components/    # Componentes React
│   ├── hooks/         # Custom hooks
│   └── config/        # Configuración
├── scripts/           # Scripts de deployment
├── test/              # Tests de contratos
└── docs/              # Documentación adicional
```

## 👥 Equipo

Desarrollado para el Reto Blockchain SisteCredito 2025


