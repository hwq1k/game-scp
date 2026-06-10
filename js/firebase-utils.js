/**
 * @file firebase-utils.js
 * @description Utilidades compartidas para Firestore y validación de datos.
 */
const FirebaseUtils = (() => {
  const MAX_NAME_LENGTH = 20;
  const MAX_SCORE = 999999;

  /**
   * @param {string} name
   * @returns {string}
   */
  function sanitizePlayerName(name) {
    return String(name ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, MAX_NAME_LENGTH);
  }

  /**
   * @param {unknown} value
   * @returns {value is number}
   */
  function isValidScore(value) {
    return Number.isFinite(value) && value >= 0 && value <= MAX_SCORE;
  }

  /**
   * Convierte un timestamp de Firestore a ISO 8601.
   * @param {firebase.firestore.Timestamp | Date | string | number | null | undefined} value
   * @returns {string}
   */
  function toIsoTimestamp(value) {
    if (!value) return new Date().toISOString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (value instanceof Date) return value.toISOString();
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return new Date().toISOString();
  }

  return { sanitizePlayerName, isValidScore, toIsoTimestamp, MAX_NAME_LENGTH, MAX_SCORE };
})();
