/**
 * @file firebase-config.example.js
 * @description Plantilla — copia como firebase-config.js si partes de cero.
 * Proyecto: game-scp (493545401091)
 */
const FirebaseConfig = (() => {
  const config = {
    apiKey: 'TU_API_KEY',
    authDomain: 'game-scp.firebaseapp.com',
    projectId: 'game-scp',
    storageBucket: 'game-scp.firebasestorage.app',
    messagingSenderId: '493545401091',
    appId: 'TU_APP_ID',
    measurementId: 'TU_MEASUREMENT_ID',
  };

  function isConfigured() {
    return Boolean(config.apiKey && config.projectId && config.apiKey !== 'TU_API_KEY');
  }

  function getConfig() {
    return { ...config };
  }

  function getProjectId() {
    return config.projectId;
  }

  return { getConfig, isConfigured, getProjectId };
})();
