/**
 * Fichier des URLs d'API
 * Ajout de logs pour chaque accès à une URL
 */

const urlBdd = "./api/bdds";
const urlGestion = "./api/gestion";
const urlGestionCustom = "./api/gestion_custom";
const urlGestionGc = "./api/gcs_custom";
const urlSignalement = "./api/signalement";
const urlSignalementCustom = "./api/signalement_custom";
const urlSignalementPrimo = "./api/signalement_primo";
const urlGC = "./api/gcs";
const urlStatsReports = "./api/stats_reports";
const urlFormStats = "./api/bdds_form_stats";
const urlStats = "./api/bdds_stats";
const urlStatsSuivi = "./api/stats_suivi";
const urlStatsIndicators = "./api/bdds_indicators";
const urlStatsEsgbu = "./api/bdds_esgbu";
const urlBddUniqueStatsReports = "./api/unique_stats_reports"; //unique stats reports collected by database -> display badges by report on admin stats view
const urlProxySushiTest = "./api/sushi_harvest_test";
const urlProxySushi = "./api/sushi_harvest/";

const urlUser = "./api/users";
const urlBU = "./api/bus";
const urlDisc = "./api/discs";
const urlBdd2Disc = "./api/bdd2disc";

/**
 * Helper pour logger et retourner l'URL
 * @param {string} urlName
 * @param {string} urlValue
 * @returns {string}
 */
function getApiUrl(urlName, urlValue) {
  console.log(`[apiUrls] Accès à l'URL : ${urlName} → ${urlValue}`);
  return urlValue;
}

// Exemple d'usage : getApiUrl('urlBdd', urlBdd)
// Idéalement à utiliser partout où on accède à une URL d'API, ex : fetch(getApiUrl('urlStats', urlStats))

// Export des URLs et du helper
export {
  urlBdd,
  urlGestion,
  urlGestionCustom,
  urlGestionGc,
  urlSignalement,
  urlSignalementCustom,
  urlSignalementPrimo,
  urlGC,
  urlStatsReports,
  urlFormStats,
  urlStats,
  urlStatsSuivi,
  urlStatsIndicators,
  urlStatsEsgbu,
  urlBddUniqueStatsReports,
  urlProxySushiTest,
  urlProxySushi,
  urlUser,
  urlBU,
  urlDisc,
  urlBdd2Disc,
  getApiUrl
};