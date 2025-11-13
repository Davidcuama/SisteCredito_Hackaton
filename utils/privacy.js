/**
 * Utilidades para privacidad y hashing
 * Genera hashes de identificadores para proteger la privacidad de los usuarios
 */

const { ethers } = require("ethers");

/**
 * Genera un hash único para un usuario basado en su identificador
 * @param {string} identifier - Identificador único del usuario (ej: cédula, email)
 * @param {string} salt - Salt opcional para mayor seguridad
 * @returns {string} Hash del usuario (bytes32)
 */
function generateUserHash(identifier, salt = "") {
  const input = identifier + salt;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

/**
 * Genera un hash para una entidad/comercio
 * @param {string} entityName - Nombre de la entidad
 * @param {string} entityId - ID único de la entidad
 * @returns {string} Hash de la entidad (bytes32)
 */
function generateEntityHash(entityName, entityId) {
  const input = entityName + entityId;
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

/**
 * Verifica si un hash corresponde a un identificador
 * @param {string} identifier - Identificador a verificar
 * @param {string} hash - Hash a comparar
 * @param {string} salt - Salt usado en la generación
 * @returns {boolean} Si el hash corresponde
 */
function verifyUserHash(identifier, hash, salt = "") {
  const computedHash = generateUserHash(identifier, salt);
  return computedHash === hash;
}

/**
 * Genera un hash único para un pago (evitar duplicados)
 * @param {object} paymentData - Datos del pago
 * @returns {string} Hash del pago
 */
function generatePaymentHash(paymentData) {
  const input = JSON.stringify(paymentData);
  return ethers.keccak256(ethers.toUtf8Bytes(input));
}

module.exports = {
  generateUserHash,
  generateEntityHash,
  verifyUserHash,
  generatePaymentHash
};

