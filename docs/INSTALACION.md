# Guía de Instalación - SisteCredito

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Git
- MetaMask (extensión del navegador)
- Editor de código (VS Code recomendado)

## Paso 1: Clonar/Descargar el Proyecto

```bash
# Si tienes el proyecto en un repositorio
git clone <url-del-repositorio>
cd SisteCredito

# O simplemente navega a la carpeta del proyecto
cd SisteCredito
```

## Paso 2: Instalar Dependencias del Proyecto Principal

```bash
# Instalar dependencias de Hardhat y contratos
npm install
```

Esto instalará:
- Hardhat y herramientas de desarrollo
- OpenZeppelin Contracts
- ethers.js
- Otras dependencias necesarias

## Paso 3: Instalar Dependencias del Frontend

```bash
# Navegar a la carpeta del frontend
cd frontend

# Instalar dependencias de Next.js
npm install

# Volver a la raíz
cd ..
```

## Paso 4: Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Para deployment en redes de prueba
PRIVATE_KEY=tu_private_key_aqui
RPC_URL=https://sepolia.infura.io/v3/tu_api_key
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/tu_api_key

# Para desarrollo local (opcional)
LOCAL_RPC_URL=http://127.0.0.1:8545
```

**⚠️ IMPORTANTE**: Nunca compartas tu private key. El archivo `.env` está en `.gitignore`.

## Paso 5: Compilar los Smart Contracts

```bash
# Compilar contratos
npm run compile
```

Esto generará los archivos de artefactos en la carpeta `artifacts/`.

## Paso 6: Ejecutar Tests (Opcional pero Recomendado)

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests con cobertura
npx hardhat coverage
```

## Paso 7: Desplegar Contratos (Red Local)

### Opción A: Red Local de Hardhat

```bash
# Terminal 1: Iniciar nodo local
npx hardhat node

# Terminal 2: Desplegar contratos
npm run deploy
```

Las direcciones de los contratos desplegados se guardarán en `deployment-addresses.json`.

### Opción B: Red de Prueba (Sepolia/Mumbai)

```bash
# Desplegar en Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# O en Polygon Mumbai
npx hardhat run scripts/deploy.js --network mumbai
```

## Paso 8: Configurar Frontend con Direcciones de Contratos

Después del deployment, actualizar las direcciones en el frontend:

1. Copiar las direcciones de `deployment-addresses.json`
2. Crear archivo `frontend/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  paymentCredential: "0x...", // Dirección del contrato
  rewardToken: "0x...",        // Dirección del token
  network: "localhost"         // o "sepolia", "mumbai", etc.
};
```

## Paso 9: Iniciar el Frontend

```bash
# Desde la raíz del proyecto
cd frontend
npm run dev
```

O desde la raíz:

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## Paso 10: Conectar MetaMask

1. Abrir MetaMask en el navegador
2. Si usas red local:
   - Agregar red personalizada:
     - Nombre: Hardhat Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 1337
     - Símbolo: ETH
3. Importar cuenta de prueba (desde Hardhat node)
4. En la aplicación, click en "Conectar Wallet"

## Verificación de Instalación

### ✅ Checklist

- [ ] Dependencias instaladas
- [ ] Contratos compilados
- [ ] Tests pasando
- [ ] Contratos desplegados
- [ ] Frontend corriendo
- [ ] MetaMask conectado
- [ ] Puedes ver el dashboard

## Solución de Problemas

### Error: "Cannot find module"

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Nonce too high"

```bash
# Resetear cuenta en MetaMask
# O usar una cuenta diferente
```

### Error: "Insufficient funds"

- Asegúrate de tener ETH/tokens de prueba en la cuenta
- Para red local, usa las cuentas del nodo Hardhat

### Frontend no se conecta a contratos

- Verificar que las direcciones en `contracts.ts` sean correctas
- Verificar que estás en la red correcta en MetaMask
- Verificar que los contratos están desplegados

## Próximos Pasos

1. Leer la [Documentación Técnica](./DOCUMENTACION.md)
2. Revisar los [Tests](../test/) para entender el funcionamiento
3. Explorar el código de los [Smart Contracts](../contracts/)
4. Personalizar el [Frontend](../frontend/) según necesidades

## Soporte

Si encuentras problemas durante la instalación:

1. Revisar los logs de error
2. Verificar que todos los requisitos están instalados
3. Consultar la documentación completa
4. Revisar issues conocidos en el repositorio

---

¡Listo! Ya tienes SisteCredito funcionando localmente. 🎉

