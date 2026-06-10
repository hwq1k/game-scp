/**
 * @file storage.js
 * @description Persistencia del mejor puntaje y tabla de récords (localStorage).
 */
const Storage = (() => {
  const RECORDS_KEY = 'causa_piurana_records';
  const PLAYER_NAME_KEY = 'causa_piurana_player_name';
  const MAX_RECORDS = 10;
  const MAX_PLAYER_NAME = 20;

  /**
   * @returns {Array<{ score: number, stars: number, date: string }>}
   */
  function getRecords() {
    try {
      const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveRecords(records) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }

  /**
   * Estrellas de desempeño según puntaje total de la partida.
   * @param {number} score
   * @returns {0|1|2|3}
   */
  function getStarsForScore(score) {
    if (score >= 150) return 3;
    if (score >= 120) return 2;
    if (score >= 100) return 1;
    return 0;
  }

  /** @returns {number} */
  function getBestScore() {
    const records = getRecords();
    if (records.length === 0) return 0;
    return records.reduce((max, r) => Math.max(max, r.score), 0);
  }

  /**
   * @param {number} score
   * @param {number} stars
   */
  function addRecord(score, stars) {
    const records = getRecords();
    records.push({
      score,
      stars,
      date: new Date().toISOString(),
    });
    records.sort((a, b) => b.score - a.score);
    saveRecords(records.slice(0, MAX_RECORDS));
    return getBestScore();
  }

  function clearRecords() {
    localStorage.removeItem(RECORDS_KEY);
  }

  /** @returns {string} */
  function getPlayerName() {
    try {
      return localStorage.getItem(PLAYER_NAME_KEY)?.trim() ?? '';
    } catch {
      return '';
    }
  }

  /** @param {string} name */
  function setPlayerName(name) {
    try {
      localStorage.setItem(PLAYER_NAME_KEY, name.trim().slice(0, MAX_PLAYER_NAME));
    } catch {
      /* almacenamiento bloqueado */
    }
  }

  return {
    getRecords,
    getBestScore,
    getStarsForScore,
    addRecord,
    clearRecords,
    getPlayerName,
    setPlayerName,
  };
})();
