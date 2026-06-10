/**
 * @file leaderboard.js
 * @description Highscores online con Firestore (requiere Google Sign-in).
 */
const Leaderboard = (() => {
  const COLLECTION = 'scores';
  const TOP_LIMIT = 20;

  /** @returns {Promise<boolean>} */
  async function init() {
    return FirebaseCore.init();
  }

  /** @returns {boolean} */
  function isReady() {
    return FirebaseCore.isReady();
  }

  /**
   * @param {string} [nameOverride]
   * @param {number} score
   * @returns {Promise<{ id: string, name: string, score: number, timestamp: string, uid: string }>}
   */
  async function submitScore(nameOverride, score) {
    if (!isReady()) {
      throw new Error('Firebase no disponible.');
    }
    if (!FirebaseAuth.isSignedIn()) {
      throw new Error('Inicia sesión con Google para enviar tu puntaje.');
    }

    const user = FirebaseAuth.getCurrentUser();
    const cleanName = FirebaseUtils.sanitizePlayerName(
      nameOverride || FirebaseAuth.getDisplayName() || Storage.getPlayerName()
    );

    if (!cleanName) {
      throw new Error('No se pudo obtener tu nombre. Vuelve a iniciar sesión.');
    }
    if (!FirebaseUtils.isValidScore(score)) {
      throw new Error('Puntaje inválido.');
    }

    const db = FirebaseCore.getFirestore();
    const payload = {
      uid: user.uid,
      name: cleanName,
      score: Math.floor(score),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION).add(payload);
    Storage.setPlayerName(cleanName);

    return {
      id: docRef.id,
      uid: user.uid,
      name: cleanName,
      score: Math.floor(score),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * @param {number} [limit=TOP_LIMIT]
   * @returns {Promise<Array<{ id: string, name: string, score: number, timestamp: string, uid?: string }>>}
   */
  async function fetchTopScores(limit = TOP_LIMIT) {
    if (!isReady()) {
      throw new Error('Firebase no disponible.');
    }

    const db = FirebaseCore.getFirestore();
    const safeLimit = Math.min(Math.max(1, limit), TOP_LIMIT);
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy('score', 'desc')
      .limit(safeLimit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid,
        name: String(data.name ?? 'Anónimo'),
        score: Number(data.score) || 0,
        timestamp: FirebaseUtils.toIsoTimestamp(data.timestamp),
      };
    });
  }

  return {
    init,
    isReady,
    submitScore,
    fetchTopScores,
    TOP_LIMIT,
  };
})();
