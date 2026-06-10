/**
 * @file firebase-auth.js
 * @description Firebase Authentication — Google Sign-in.
 */
const FirebaseAuth = (() => {
  /**
   * @returns {Promise<boolean>}
   */
  async function ensureReady() {
    return FirebaseCore.init();
  }

  /** @returns {firebase.User | null} */
  function getCurrentUser() {
    return FirebaseCore.getAuth()?.currentUser ?? null;
  }

  /** @returns {boolean} */
  function isSignedIn() {
    return getCurrentUser() !== null;
  }

  /** @returns {string} */
  function getDisplayName() {
    return getCurrentUser()?.displayName?.trim() ?? '';
  }

  /** @returns {string} */
  function getUid() {
    return getCurrentUser()?.uid ?? '';
  }

  /**
   * Inicia sesión con Google (popup).
   * @returns {Promise<firebase.User>}
   */
  async function signInWithGoogle() {
    const ready = await ensureReady();
    if (!ready) {
      throw new Error('Firebase no está configurado.');
    }

    const auth = FirebaseCore.getAuth();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    if (!user) {
      throw new Error('No se pudo obtener el usuario de Google.');
    }

    const name = user.displayName?.trim();
    if (name) {
      Storage.setPlayerName(FirebaseUtils.sanitizePlayerName(name));
    }

    return user;
  }

  /** @returns {Promise<void>} */
  async function signOut() {
    const auth = FirebaseCore.getAuth();
    if (!auth) return;
    await auth.signOut();
  }

  /**
   * @param {(user: firebase.User | null) => void} callback
   * @returns {() => void}
   */
  function onAuthStateChanged(callback) {
    const auth = FirebaseCore.getAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }

    return auth.onAuthStateChanged(callback);
  }

  /**
   * Registra listener tras init de Firebase.
   * @param {(user: firebase.User | null) => void} callback
   */
  async function watchAuth(callback) {
    await ensureReady();
    return onAuthStateChanged(callback);
  }

  return {
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isSignedIn,
    getDisplayName,
    getUid,
    onAuthStateChanged,
    watchAuth,
  };
})();
