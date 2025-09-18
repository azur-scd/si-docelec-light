/**
 * Encode un objet JSON en string pour le body d'un formulaire (application/x-www-form-urlencoded)
 * @param {Object} jsonData
 * @returns {string}
 */
const getDataEncoded = jsonData => {
  console.log('[getDataEncoded] Entrée:', jsonData);
  const result = Object.entries(jsonData)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  console.log('[getDataEncoded] Résultat:', result);
  return result;
};

/**
 * Formate une date en 'YYYY-MM-DD'
 * @param {Date|string|number} date
 * @returns {string}
 */
const formattingDate = date => {
  console.log('[formattingDate] Entrée:', date);
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const result = `${year}-${month}-${day}`;
  console.log('[formattingDate] Résultat:', result);
  return result;
};

/**
 * Copie certaines propriétés d'un objet source dans un nouvel objet
 * @param {Object} source
 * @param {Array<string>} keys
 * @returns {Object}
 */
const copyObjectProps = (source, keys) => {
  console.log('[copyObjectProps] Source:', source, 'Clés:', keys);
  const result = keys.reduce((obj, key) => {
    if (source[key] != null) obj[key] = source[key];
    return obj;
  }, {});
  console.log('[copyObjectProps] Résultat:', result);
  return result;
};

/**
 * Transforme un objet {key: value, ...} en array [{key, value}, ...]
 * @param {Object} obj
 * @returns {Array<{key: string, value: any}>}
 */
const object2array = obj => {
  console.log('[object2array] Entrée:', obj);
  const result = Object.entries(obj).map(([key, value]) => ({ key, value }));
  console.log('[object2array] Résultat:', result);
  return result;
};

/**
 * Calcule la somme d'un champ agrégé par groupe
 * @param {Array<Object>} data
 * @param {string} labelField
 * @param {string} aggField
 * @returns {Array<{key: string, value: number}>}
 */
const getGroupSum = (data, labelField, aggField) => {
  console.log('[getGroupSum] Entrée:', { data, labelField, aggField });
  const agg = data
    .filter(Boolean)
    .reduce((memo, item) => {
      const label = item[labelField];
      memo[label] = (memo[label] || 0) + (item[aggField] || 0);
      return memo;
    }, {});
  const result = object2array(agg);
  console.log('[getGroupSum] Résultat:', result);
  return result;
};

/**
 * Compte le nombre d'occurrences par valeur d'un champ
 * @param {Array<Object>} data
 * @param {string} aggField
 * @returns {Array<{key: string, value: number}>}
 */
const getGroupCount = (data, aggField) => {
  console.log('[getGroupCount] Entrée:', { data, aggField });
  const result = object2array(_.countBy(data, aggField));
  console.log('[getGroupCount] Résultat:', result);
  return result;
};

/**
 * Agrège des données selon une clé, en sommant les métriques et recopiant certains champs
 * @param {Array<Object>} data
 * @param {string} groupKey
 * @param {string} metric
 * @returns {Array<Object>}
 */
const groupBy = (data, groupKey, metric) => {
  console.log('[groupBy] Entrée:', { data, groupKey, metric });
  const agg = _.groupBy(data, groupKey);
  const result = Object.entries(agg).map(([key, items]) =>
    items.reduce((memo, item) => {
      memo[item.etat] = (memo[item.etat] || 0) + (item[metric] || 0);
      memo.reliquat = item.reliquat;
      memo.bdd_id = item.bdd_id;
      memo.bdd = item.bdd;
      memo.pole = item.pole;
      memo.soutien_oa = item.soutien_oa;
      memo.surcout_uca = item.surcout_uca;
      memo.debut_gc = item.debut_gc;
      memo.fin_gc = item.fin_gc;
      if (item.debut_gc) memo.period_gc = `${item.debut_gc}-${item.fin_gc}`;
      return memo;
    }, {})
  );
  console.log('[groupBy] Résultat:', result);
  return result;
};

/**
 * Calculs agrégés sur le suivi budgétaire
 * @param {Array<Object>} data
 * @returns {Object}
 */
const budgetSuiviSumAndCount = data => {
  console.log('[budgetSuiviSumAndCount] Entrée:', data);
  const sum = (arr, field) =>
    arr.reduce((acc, v) => acc + (v[field] || 0), 0);

  const prevOnly = data.filter(d => d['1-prev']);
  const budgeteOnly = data.filter(
    d => d['2-budgete'] && !d['3-estime'] && !d['4-facture']
  );
  const estimeOnly = data.filter(d => d['3-estime'] && !d['4-facture']);
  const factureOnly = data.filter(d => !d['3-estime'] && d['4-facture']);

  const result = {
    budgeteInitial: sum(data, '2-budgete'),
    totalReliquat: sum(data, 'reliquat'),
    prevInitial: sum(prevOnly, '1-prev'),
    prevOnlySum: sum(prevOnly, '1-prev'),
    prevOnlyCount: prevOnly.length,
    budgeteOnlySum: sum(budgeteOnly, '2-budgete'),
    budgeteOnlyCount: budgeteOnly.length,
    budgeteOnlyReliquat: sum(budgeteOnly, 'reliquat'),
    estimeOnlySum: sum(estimeOnly, '3-estime'),
    estimeOnlyCount: estimeOnly.length,
    estimeOnlyReliquat: sum(estimeOnly, 'reliquat'),
    factureOnlySum: sum(factureOnly, '4-facture'),
    factureOnlyCount: factureOnly.length,
    factureOnlyReliquat: sum(factureOnly, 'reliquat')
  };
  console.log('[budgetSuiviSumAndCount] Résultat:', result);
  return result;
};