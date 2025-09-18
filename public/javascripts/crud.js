/**
 * Gère la réponse des requêtes AJAX.
 * Affiche un log en cas de succès et retourne la donnée utile (response.data si présente).
 * Si la réponse est inattendue, affiche un avertissement.
 * @param {Object} response - La réponse reçue du serveur
 * @param {String} operation - Le type d'opération CRUD effectuée
 * @returns {Object|null} - Les données utiles ou la réponse brute
 */
export function handleResponse(response, operation = "Opération") {
    if (!response) {
        // Cas où la réponse est nulle ou indéfinie
        console.warn(`[${operation}] Réponse nulle ou indéfinie`);
        return null;
    }
    if (typeof response === 'object' && 'data' in response) {
        // Cas standard : la réponse contient une propriété 'data'
        console.log(`[${operation}] Succès, data reçue:`, response.data);
        return response.data;
    }
    // Cas où la réponse ne contient pas 'data'
    console.warn(`[${operation}] La réponse ne contient pas 'data':`, response);
    return response;
}

/**
 * Gère les erreurs des requêtes AJAX.
 * Affiche des logs détaillés, y compris la réponse brute ou JSON si possible.
 * @param {Object} jqXHR - L'objet de la requête AJAX
 * @param {String} textStatus - Le statut de l'erreur
 * @param {String} errorThrown - L'erreur jetée
 */
export function handleError(jqXHR, textStatus, errorThrown) {
    console.error("Erreur AJAX:", textStatus, errorThrown);
    if (jqXHR && jqXHR.responseText) {
        try {
            // Essaye de parser la réponse comme JSON
            const json = JSON.parse(jqXHR.responseText);
            console.error("Réponse d'erreur JSON:", json);
        } catch (e) {
            // Affiche la réponse brute si le parse échoue
            console.error("Réponse d'erreur brute:", jqXHR.responseText);
        }
    }
}

/**
 * Récupère une liste d'items via une requête GET.
 * @param {String} url - L'URL de l'API à interroger
 * @returns {Promise} - Résout avec les données ou la réponse brute
 */
export function getItems(url){
    return $.ajax({
        method: 'GET',
        url: url
    })
    // Gère la réponse en loguant le succès
    .then(response => handleResponse(response, "GET"))
    // Gère l'erreur en loguant le détail
    .catch(handleError);
}

/**
 * Met à jour un item via une requête PUT.
 * @param {String} url - L'URL de base de l'API
 * @param {String} key - L'identifiant de l'item à mettre à jour
 * @param {Object} values - Les valeurs à mettre à jour
 * @returns {Promise} - Résout avec les données ou la réponse brute
 */
export function updateItems(url, key, values){
    return $.ajax({
        method: 'PUT',
        url: `${url}/${key}/update`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: getDataEncoded(values)
    })
    .then(response => handleResponse(response, "UPDATE"))
    .catch(handleError);
}

/**
 * Crée un nouvel item via une requête POST.
 * @param {String} url - L'URL de base de l'API
 * @param {Object} values - Les valeurs du nouvel item
 * @returns {Promise} - Résout avec les données ou la réponse brute
 */
export function createItems(url, values){
    return $.ajax({
        method: 'POST',
        url: `${url}/create`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: getDataEncoded(values)
    })
    .then(response => handleResponse(response, "CREATE"))
    .catch(handleError);
}

/**
 * Supprime un item via une requête DELETE.
 * @param {String} url - L'URL de base de l'API
 * @param {String} key - L'identifiant de l'item à supprimer
 * @returns {Promise} - Résout avec les données ou la réponse brute
 */
export function deleteItems(url, key){
    return $.ajax({
        method: 'DELETE',
        url: `${url}/${key}/delete`
    })
    .then(response => handleResponse(response, "DELETE"))
    .catch(handleError);
}

/**
 * Encode un objet JSON en string pour le body d'un formulaire (application/x-www-form-urlencoded)
 * Gère aussi les valeurs null, undefined et les tableaux.
 * @param {Object} data
 * @returns {string}
 */
export const getDataEncoded = (data) => {
  return Object.entries(data)
    .flatMap(([key, value]) => {
      if (value === null || value === undefined) return []; // ignore null/undefined
      if (Array.isArray(value)) {
        // encode chaque élément du tableau comme key[]=valeur
        return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`);
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
};
