/**
 * @file firebase-core.js
 * @description Inicialización única de Firebase App, Auth y Firestore.
 */
const FirebaseCore = (() => {
  /** @type {firebase.firestore.Firestore | null} */
  let db = null;
  /** @type {firebase.auth.Auth | null} */
  let auth = null;
  let initialized = false;

  /**
   * Inicializa Firebase una sola vez (idempotente).
   * @returns {Promise<boolean>}
   */
  async function init() {
    if (initialized) return true;
    if (typeof FirebaseConfig === 'undefined' || !FirebaseConfig.isConfigured()) {
      return false;
    }
    if (typeof firebase === 'undefined') {
      console.warn('[FirebaseCore] SDK de Firebase no cargado.');
      return false;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FirebaseConfig.getConfig());
      }
      auth = firebase.auth();
      db = firebase.firestore();
      auth.useDeviceLanguage();
      initialized = true;
      return true;
    } catch (err) {
      console.error('[FirebaseCore] Error al inicializar:', err);
      return false;
    }
  }

  /** @returns {boolean} */
  function isReady() {
    return initialized && db !== null && auth !== null;
  }

  /** @returns {firebase.auth.Auth | null} */
  function getAuth() {
    return auth;
  }

  /** @returns {firebase.firestore.Firestore | null} */
  function getFirestore() {
    return db;
  }

  return { init, isReady, getAuth, getFirestore };
})();
