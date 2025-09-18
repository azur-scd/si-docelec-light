$(function () {

  // Initialisation du sélecteur d'année
  $("#selectYear").dxSelectBox({
    width: 150,
    dataSource: years, // Source de données (tableau d'années)
    valueExpr: "cle",  // Clé utilisée pour la valeur (ex: "2025")
    displayExpr: "valeur", // Texte affiché (ex: "2025")
    value: years[7].cle, // Valeur sélectionnée par défaut (ici l'année à l'index 7)
    onValueChanged: function (data) {
      // Log de la nouvelle année sélectionnée
      console.log("[selectYear] Année sélectionnée :", data.value);
      // Mise à jour des affichages BDD et GC selon l'année et l'étape courante
      return bddDisplay(data.value, $("#selectStep").dxSelectBox('instance').option('value')),
        gcDisplay(data.value, $("#selectStep").dxSelectBox('instance').option('value'))
    }
  })

  // Initialisation du sélecteur d'étape budgétaire
  $("#selectStep").dxSelectBox({
    width: 150,
    dataSource: steps, // Source de données (tableau des étapes)
    valueExpr: "cle",  // Clé utilisée pour la valeur (ex: "exec")
    displayExpr: "valeur", // Texte affiché (ex: "Exécution")
    value: "exec", // Valeur sélectionnée par défaut
    onValueChanged: function (data) {
      // Log de la nouvelle étape sélectionnée
      console.log("[selectStep] Étape sélectionnée :", data.value);
      // Mise à jour des affichages BDD et GC selon l'année et l'étape courante
      return bddDisplay($("#selectYear").dxSelectBox('instance').option('value'), data.value),
        gcDisplay($("#selectYear").dxSelectBox('instance').option('value'), data.value)
    }
  })

  // Affichage initial des données BDD et GC dès le chargement de la page
  console.log("[init] Affichage initial BDD et GC avec année", $("#selectYear").dxSelectBox('instance').option('value'), "et étape", $("#selectStep").dxSelectBox('instance').option('value'));
  bddDisplay($("#selectYear").dxSelectBox('instance').option('value'), $("#selectStep").dxSelectBox('instance').option('value'));
  gcDisplay($("#selectYear").dxSelectBox('instance').option('value'), $("#selectStep").dxSelectBox('instance').option('value'))

  /**
   * Affiche le graphique annuel du suivi des ressources sélectionnées
   * Utilisé lors de la sélection de lignes dans le dataGrid BDD
   */
  function annualSuiviChartDisplay() {
    // Récupération des lignes sélectionnées dans le dataGrid BDD
    $("#containerListBdd").dxDataGrid("instance").getSelectedRowsData().then((rowData) => {
      console.log("[annualSuiviChartDisplay] Lignes sélectionnées :", rowData);
      if (rowData.length != 0) {
        // Affichage du graphique à barres avec les montants TTC par ressource
        getSimpleBar("annualSuivi", rowData, "bdd", "montant_ttc", "etat", "Montant TTC par ressource")
      }
    })
  }

  /**
   * Affiche le graphique de répartition par pôle des ressources sélectionnées
   */
  function poleSuiviChartDisplay() {
    $("#containerListBdd").dxDataGrid("instance").getSelectedRowsData().then((rowData) => {
      console.log("[poleSuiviChartDisplay] Lignes sélectionnées :", rowData);
      if (rowData.length != 0) {
        // Agrégation des montants par pôle
        var aggData = getGroupSum(rowData, "pole", "montant_ttc")
        console.log("[poleSuiviChartDisplay] Données agrégées par pôle :", aggData);
        // Affichage du graphique en secteur (pie chart) des montants par pôle
        getPie("poleSuivi", aggData, "key", "value", "Montants TTC agrégés par pôle")
      }
    })
  }

  /**
   * Calcule et affiche les statistiques budgétaires sur les ressources sélectionnées
   */
  function calculateBddStatistics() {
    $("#widgetBdd").empty()
    $('#containerListBdd').dxDataGrid("instance").getSelectedRowsData().then((rowData) => {
      console.log("[calculateBddStatistics] Lignes sélectionnées BDD :", rowData);

      // Calcul du total TTC avec récup
      var ttc_total = 0
      for (let s of rowData) {
        ttc_total += s["montant_ttc"];
      }
      console.log("[calculateBddStatistics] Total TTC avec récup :", ttc_total);

      // Calcul du total TTC avant récup
      var ttc_avant_recup_total = 0
      for (let s of rowData) {
        ttc_avant_recup_total += s["montant_ttc_avant_recup"];
      }
      console.log("[calculateBddStatistics] Total TTC avant récup :", ttc_avant_recup_total);

      // Affichage des statistiques dans le widget
      $("#widgetBdd").append(
        "<div class='col-md-3'><a href='#' class='tile tile-info'><p>Total TTC</p>" + Math.round(ttc_total || 0) + "</a></div>" +
        "<div class='col-md-3'><a href='#' class='tile tile-info'><p>Total TTC avant récup</p>" + Math.round(ttc_avant_recup_total || 0) + "</a></div>"
        // Ajoutez d'autres statistiques ici si besoin
      )
    })
  }

  /**
   * Calcule et affiche les statistiques GC sur les contrats sélectionnés
   */
  function calculateGcStatistics() {
    $("#widgetGc").empty()
    $('#containerListGc').dxDataGrid("instance").getSelectedRowsData().then((rowData) => {
      console.log("[calculateGcStatistics] Lignes sélectionnées GC :", rowData);

      // Calcul du total TTC des GC sélectionnés
      var ttc_total = 0
      for (let s of rowData) {
        ttc_total += s["montant_ttc"];
      }
      console.log("[calculateGcStatistics] Total TTC GC :", ttc_total);

      // Affichage dans le widget GC
      $("#widgetGc").append(
        "<div class='col-md-3'><a href='#' class='tile tile-info'><p>Total TTC</p>" + Math.round(ttc_total || 0) + "</a></div>"
      )
    })
  }

  /**
   * Affiche la grille des ressources BDD pour une année et une étape
   * @param {String|Number} year - Année sélectionnée
   * @param {String} step - Étape budgétaire sélectionnée
   */
  function bddDisplay(year, step) {
    console.log("[bddDisplay] Affichage BDD pour année =", year, "et étape =", step);

    var storeBdd = new DevExpress.data.CustomStore({
      loadMode: "raw",
      key: "id",
      load: function () {
        var d = new $.Deferred();
        // Requête AJAX pour récupérer les données budgétaires de l'année
        console.log("[bddDisplay] Requête GET :", urlGestionGc + "?annee=" + year);
        $.get(urlGestionGc + "?annee=" + year).done(function (results) {
          let data;
          console.log("[bddDisplay] Données reçues :", results);

          if (step == "prev") {
            // Filtrage des résultats pour l'étape "prev"
            data = results.filter(function (d) { return d.etat == "1-prev" })
            console.log("[bddDisplay] Données filtrées étape prev :", data);
          }
          else {
            // Regroupement des résultats par bdd_id
            var groupResults = (_.groupBy(results, "bdd_id"))
            console.log("[bddDisplay] Données groupées par bdd_id :", groupResults);

            var arr = []
            for (let key in groupResults) {
              // Priorisation : "4-facture" > "3-estime" > "2-budgete"
              if (groupResults[key].some(item => item.etat === '4-facture')) {
                arr.push(groupResults[key].filter(function (du) { return du.etat == "4-facture" })[0])
              }
              else if (!groupResults[key].some(item => item.etat === '4-facture') && groupResults[key].some(item => item.etat === '3-estime')) {
                arr.push(groupResults[key].filter(function (du) { return du.etat == "3-estime" })[0])
              }
              else {
                arr.push(groupResults[key].filter(function (du) { return du.etat == "2-budgete" })[0])
              }
            }
            // Filtrage des éléments non nuls
            data = arr.filter(function (elt) { return elt != null; })
            console.log("[bddDisplay] Données finales affichées :", data);
          }
          d.resolve(data)
        })
        return d.promise();
      }
    });
    // Affichage du dataGrid des ressources BDD
    $("#containerListBdd").dxDataGrid({
      dataSource: storeBdd,
      keyExpr: 'id',
      repaintChangesOnly: true,
      showBorders: true,
      rowAlternationEnabled: true,
      allowColumnReordering: true,
      columnMinWidth: 50,
      columnMaxWidth: 125,
      columnAutoWidth: true,
      columnHidingEnabled: true,
      columnChooser: {
        enabled: true,
        mode: "select"
      },
      scrolling: {
        useNative: false,
        scrollByContent: true,
        scrollByThumb: true,
        showScrollbar: "onHover" // Affiche la barre de scroll au survol
      },
      sorting: {
        mode: "multiple"
      },
      paging: {
        pageSize: 10
      },
      pager: {
        showPageSizeSelector: true,
        allowedPageSizes: [5, 10, 20, 50, 100],
        showInfo: true
      },
      "export": {
        enabled: true,
        fileName: "suivi_budget_annuel"
      },
      headerFilter: {
        visible: true
      },
      filterRow: {
        visible: true,
        applyFilter: "auto"
      },
      filterPanel: { visible: true },
      searchPanel: {
        visible: true
      },
      selection: {
        mode: 'multiple',
        selectAllMode: 'allPages',
        showCheckBoxesMode: 'onClick',
        deferred: true,
      },
      // Callback appelé quand la sélection change
      onSelectionChanged(e) {
        console.log("[bddDisplay] Selection changed, rafraîchissement des statistiques et graphiques.");
        e.component.refresh(true);
        calculateBddStatistics();
        annualSuiviChartDisplay();
        poleSuiviChartDisplay();
      },
      columns: [
        {
          dataField: "pole",
          caption: "Pôle"
        },
        {
          dataField: "bdd",
          caption: "Ressource",
          width: 125
        },
        {
          dataField: "etat",
          caption: "Dernier montant à jour",
        },
        {
          dataField: "montant_ttc_avant_recup",
          caption: "Montant TTC",
          dataType: 'number',
          alignment: 'left'
        },
        {
          dataField: "montant_ttc",
          caption: "Montant TTC avec récup",
          dataType: 'number',
          alignment: 'left'
        },
        {
          dataField: "debut_gc",
          caption: "Début du GC en cours"
        },
        {
          dataField: "fin_gc",
          caption: "Fin du GC en cours",
        },
        {
          dataField: "updatedAt",
          caption: "Mise à jour le",
          dataType: "date",
          visible: false
        }
      ],
      /*onInitialized: function (e) {
        e.component.selectAll();
      },*/
    })

  }

  /**
   * Affiche la grille des GC (Gestion Contrats) pour une année donnée
   * @param {String|Number} year - Année sélectionnée
   */
  function gcDisplay(year) {
    console.log("[gcDisplay] Affichage GC pour année =", year);

    var storeFilteredGc = new DevExpress.data.CustomStore({
      loadMode: "raw",
      key: "id",
      load: function () {
        var d = new $.Deferred();
        // Requête AJAX pour récupérer les GC de l'année
        console.log("[gcDisplay] Requête GET :", urlGC + "?debut=" + year);
        $.get(urlGC + "?debut=" + year).done(function (results) {
          console.log("[gcDisplay] Données GC reçues :", results);
          d.resolve(results)
        })
        return d.promise();
      }
    });

    // Affichage du dataGrid des GC
    $("#containerListGc").dxDataGrid({
      dataSource: storeFilteredGc,
      keyExpr: 'id',
      repaintChangesOnly: true,
      showBorders: true,
      columnMinWidth: 50,
      columnMaxWidth: 125,
      rowAlternationEnabled: true,
      allowColumnResizing: true,
      allowColumnReordering: true,
      paging: {
        pageSize: 50
      },
      pager: {
        showPageSizeSelector: true,
        allowedPageSizes: [5, 10, 20, 50, 100],
        showInfo: true
      },
      "export": {
        enabled: true,
        fileName: "suivi_gc"
      },
      headerFilter: {
        visible: true
      },
      filterRow: {
        visible: true,
        applyFilter: "auto"
      },
      filterPanel: { visible: true },
      searchPanel: {
        visible: true
      },
      columnChooser: {
        enabled: true,
        mode: "select"
      },
      selection: {
        mode: 'multiple',
        selectAllMode: 'allPages',
        showCheckBoxesMode: 'onClick',
        deferred: true,
      },
      // Callback appelé quand la sélection change
      onSelectionChanged(e) {
        console.log("[gcDisplay] Selection changed, rafraîchissement des statistiques GC.");
        e.component.refresh(true);
        calculateGcStatistics()
      },
      columns: [
        {
          dataField: "nom",
          caption: "GC",
        },
        {
          dataField: "debut",
          caption: "Début",
        },
        {
          dataField: "fin",
          caption: "Fin",
        },
        {
          dataField: "montant_ttc",
          caption: "Montant TTC",
          dataType: 'number',
          alignment: 'left'
        },
        {
          dataField: "updatedAt",
          caption: "Mise à jour le",
          dataType: "date",
          visible: false
        }
      ],
      /* onInitialized: function(e) {  
        e.component.selectAll();  
      } ,*/
    })
  }
})