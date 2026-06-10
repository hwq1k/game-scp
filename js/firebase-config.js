/**
 * @file firebase-config.js
 * @description Configuración del proyecto Firebase game-scp (493545401091).
 * App Web: El Secreto de la Causa Piurana
 */
const FirebaseConfig = (() => {
  const config = {
    apiKey: 'AIzaSyC06lp44ezdhZzCADZfL0h54qbmrQJEt4U',
    authDomain: 'game-scp.firebaseapp.com',
    projectId: 'game-scp',
    storageBucket: 'game-scp.firebasestorage.app',
    messagingSenderId: '493545401091',
    appId: '1:493545401091:web:d87ef65751d316366dd736',
    measurementId: 'G-LPQE8Z1V1F',
  };

  /** @returns {boolean} */
  function isConfigured() {
    return Boolean(config.apiKey && config.projectId);
  }

  function getConfig() {
    return { ...config };
  }

  function getProjectId() {
    return config.projectId;
  }

  return { getConfig, isConfigured, getProjectId };
})();
