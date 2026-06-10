/**
 * @file storage.js
 * @description Persistencia del mejor puntaje y tabla de récords (localStorage).
 */
const Storage = (() => {
  const RECORDS_KEY = 'causa_piurana_records';
  const MAX_RECORDS = 10;

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

  return { getRecords, getBestScore, addRecord, clearRecords };
})();
