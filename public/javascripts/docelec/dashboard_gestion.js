import { binaryState, poleState, marcheState, achatperenneState, typeAchatState, typeBddState, typeBase, typeOA, typePerimetre, accessState, typeSignalement , modeSignalement, getStatState, disciplines, deviseState, etatState, etatStatSaisie, years, steps,  metrics,  months,  sushiReportUrlSegment, esgbuDisplayReport, userGroups,  statsCounter } from '../lookupArrays.js';
$(function () {

  // Définition des séries pour les graphiques
  var seriesB = [
    { valueField: "2-budgete", name: "Budgété" },
    { valueField: "3-estime", name: "Estimé" },
    { valueField: "4-facture", name: "Facturé" }
  ]
  var seriesP1 = [
    { valueField: "1-prev-SCD", name: "Prévisionnel SCD" },
    { valueField: "1-prev-STM", name: "Prévisionnel STM" },
    { valueField: "1-prev-SHS", name: "Prévisionnel SHS" }
  ]
  var seriesP2 = [
    { valueField: "1-prev", name: "Prévisionnel" }
  ]
 
  // Initialisation du sélecteur d'année
  $("#selectYear").dxSelectBox({
    width: 150,
    dataSource: years,
    valueExpr: "cle",
    displayExpr: "valeur",
    value: years[7].cle,
    onValueChanged: function (data) {
      // Logs de sélection d'année
      console.log("[selectYear] Année sélectionnée :", data.value);
      $("div[id^='widget']").empty()
      $("div[id^='abstract']").empty()
      $("div[id^='generalResChart']").empty()
      $("div[id^='reliquatRotated']").empty()
      dataDatagrid(data.value,$("#selectMetric").dxSelectBox('instance').option('value'))
      getWidgetsData(data.value,$("#selectMetric").dxSelectBox('instance').option('value'))
        .done(function(results){
          displayWidgets(results,$("#selectStep").dxSelectBox('instance').option('value'));
        })
    }
  })

  // Initialisation du sélecteur d'étape
  $("#selectStep").dxSelectBox({
    width: 150,
    dataSource: steps,
    valueExpr: "cle",
    displayExpr: "valeur",
    value: "exec",
    onValueChanged: function (item) {
      // Logs de sélection d'étape
      console.log("[selectStep] Étape sélectionnée :", item.value);
      $("div[id^='widget']").empty()
      getWidgetsData($("#selectYear").dxSelectBox('instance').option('value'),$("#selectMetric").dxSelectBox('instance').option('value'))
        .done(function(results){
          displayWidgets(results,item.value);
        })
    }
  })

  // Initialisation du sélecteur de métrique
  $("#selectMetric").dxSelectBox({
    width: 250,
    dataSource: metrics,
    valueExpr: "cle",
    displayExpr: "valeur",
    value: "montant_ttc",
    onValueChanged: function (item) {
      // Logs de sélection de métrique
      console.log("[selectMetric] Métrique sélectionnée :", item.value);
      $("div[id^='widget']").empty()
      $("div[id^='abstract']").empty()
      $("div[id^='generalResChart']").empty()
      $("div[id^='reliquatRotated']").empty()
      dataDatagrid($("#selectYear").dxSelectBox('instance').option('value'),item.value)
      getWidgetsData($("#selectYear").dxSelectBox('instance').option('value'),item.value)
        .done(function(results){
          displayWidgets(results,$("#selectStep").dxSelectBox('instance').option('value'));
        })
    }
  })

  // Affichage initial à l'ouverture de la page
  console.log("[init] Affichage initial dashboard gestion");
  dataDatagrid($("#selectYear").dxSelectBox('instance').option('value'),$("#selectMetric").dxSelectBox('instance').option('value'))
  getWidgetsData($("#selectYear").dxSelectBox('instance').option('value'),$("#selectMetric").dxSelectBox('instance').option('value'))
    .done(function(results){
      displayWidgets(results,$("#selectStep").dxSelectBox('instance').option('value'));
    })

  /**
   * Calcule et affiche les statistiques pour un pôle donné selon la sélection de ressources
   * @param {String} pole
   */
  function calculateStatistics(pole) {
    $("#abstract"+pole).empty()
    $('#generalResGrid'+pole).dxDataGrid("instance").getSelectedRowsData().then((rowData) => {
      console.log(`[calculateStatistics] Lignes sélectionnées pour pôle ${pole}:`, rowData);
      $("#abstract"+pole).append("<div class='col-md-2'><a href='#' class='tile tile-default'><p>Nombre de ressources selectionnées</p>"+rowData.length+"</a></div>")
      this['1-prev_total'] = 0
      for (let s of rowData) {
        if(s["1-prev"] === undefined) {s["1-prev"] = 0}
        this['1-prev_total'] += s["1-prev"];
      }
      $("#abstract"+pole).append("<div class='col-md-2'><a href='#' class='tile tile-info'><p>Total Prévisionnel</p>"+Math.round(this['1-prev_total'] || 0)+"</a></div>")
      this['2-budgete_total'] = 0
      for (let s of rowData) {
        if(s["2-budgete"] === undefined) {s["2-budgete"] = 0}
        this['2-budgete_total'] += s["2-budgete"];
      }
      $("#abstract"+pole).append("<div class='col-md-2'><a href='#' class='tile tile-info'><p>Total Budgété</p>"+Math.round(this['2-budgete_total'] || 0)+"</a></div>")
      this['diff_3_4_total'] = 0
      for (let s of rowData) {
        if(s["4-facture"] !== undefined) {this['diff_3_4_total'] += s["4-facture"];}
        else {
          if(s["3-estime"] !== undefined) {this['diff_3_4_total'] += s["3-estime"];}
        }
      }
      $("#abstract"+pole).append("<div class='col-md-2'><a href='#' class='tile tile-info'><p>Total Facturé ou Estimé</p>"+Math.round(this['diff_3_4_total'] || 0)+"</a></div>")
      this['reliquat_total'] = 0
      for (let s of rowData) {
        if(s["reliquat"] === undefined) {s["reliquat"] = 0}
        this['reliquat_total'] += s["reliquat"];
      }
      $("#abstract"+pole).append("<div class='col-md-2'><a href='#' class='tile tile-danger'><p>Total Reliquats</p>"+Math.round(this['reliquat_total'] || 0)+"</a></div>") 
    })
  }

  /**
   * Affiche la grille principale par pôle pour l'année et la métrique sélectionnées
   */
  function dataDatagrid(year,metric) {
    console.log(`[dataDatagrid] Affichage grille principale pour année ${year} et métrique ${metric}`);
    var store = new DevExpress.data.CustomStore({
      key: "bdd_id",
      load: function () {
        var d = new $.Deferred();
        getItems(urlGestionGc + "/?annee=" + year).done(function(results){
          let data ;
          // Log des résultats reçus
          console.log("[dataDatagrid] Résultats reçus :", results);
          if (results.length == 0) {
            $("#noData").append("<div class='alert alert-danger' role='alert'><strong>Pas de données pour cette année</strong></div>")
          }
          data = groupBy(results, "bdd_id",metric)
          d.resolve(data)
        })
        return d.promise();
      }
    });

    poleState.map(function(d) {
      $('#generalResGrid' + d.cle).dxDataGrid({
        dataSource: store,
        keyExpr: 'bdd_id',
        repaintChangesOnly: true,
        showBorders: true,
        columnMinWidth: 50,
        columnMaxWidth: 125,
        rowAlternationEnabled: true,
        allowColumnResizing: true,
        allowColumnReordering: true,
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
          fileName: "suivi_budget_ressources"
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
        filterValue: ["pole", "=", d.cle],
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
        onSelectionChanged(e) {
          console.log(`[dataDatagrid] Sélection changée pour pôle ${d.cle}`);
          calculateStatistics(d.cle);
          e.component.refresh(true);
        },
        selectedRowKeys: [],
        columns: [
          {
            dataField: "bdd",
            caption: "Ressource",
            dataType: 'string',
            width: 150
          },
          {
            dataField: "pole",
            caption: "Pole",
            dataType: 'string',
            visible: false
          },
          {
            dataField: "1-prev",
            caption: "Prévisionnel",
            dataType: 'number',
            alignment: 'left',
            width: 100
          },
          {
            dataField: "2-budgete",
            caption: "Budgete",
            dataType: 'number',
            alignment: 'left',
            width: 100
          },
          {
            dataField: "3-estime",
            caption: "Estimé",
            dataType: 'number',
            alignment: 'left',
            width: 100
          },
          {
            dataField: "4-facture",
            caption: "Facturé",
            dataType: 'number',
            alignment: 'left',
            width: 100
          },
          {
            dataField: "reliquat",
            caption: "Reliquat",
            dataType: 'number',
            alignment: 'left',
            width: 100
          },
          {
            dataField: "period_gc",
            caption: "GC courant",
            dataType: 'string',
            width: 100,
          },
          {
            caption: 'Dynamics',
            minWidth: 200,
            cellTemplate(container, options) {
              let sparkLineStore = object2array(options.data).filter(item => ["1-prev", "2-budgete", "3-estime", "4-facture"].includes(item.key))
              container.addClass('chart-cell');
              $('<div />').dxSparkline({
                dataSource: sparkLineStore,
                argumentField: 'key',
                valueField: 'value',
                type: 'line',
                showMinMax: true,
                minColor: '#f00',
                maxColor: '#2ab71b',
                pointSize: 6,
                size: {
                  width: 150,
                  height: 40,
                },
                tooltip: {
                  enabled: false,
                },
              }).appendTo(container);
            }
          }
        ],
      })

    })
  }

  /**
   * Récupère les données agrégées pour les widgets selon l'année et la métrique
   */
  function getWidgetsData(year,metric) {   
    console.log(`[getWidgetsData] Récupération des données widgets pour année ${year} et métrique ${metric}`);
    var d = new $.Deferred();
    $.get(urlGestionCustom + "/?annee=" + year).done(function (results) {
      console.log("[getWidgetsData] Résultats reçus :", results);
      let data= {}
      if (results.length == 0) {
        $("#noData").append("<div class='alert alert-danger' role='alert'><strong>Pas de données pour cette année</strong></div>")
      }
      data["dataSCD"] = groupBy(results, "bdd_id",metric)
      data["dataSTM"] = data["dataSCD"].filter(function (d) {
        return d.pole == "STM"
      })
      data["dataSHS"] = data["dataSCD"].filter(function (d) {
        return d.pole == "SHS"
      })
      d.resolve(data)
    })
    return d.promise();
  }

  /**
   * Affiche les widgets selon l'étape en cours
   */
  function displayWidgets(data,step) {
    console.log(`[displayWidgets] Affichage des widgets pour étape ${step}`, data);
    switch (step) {
      case 'exec':
        //data pour visus montants consolidés (barchart)
        globalMontantScdPoles(data,seriesB)
        //data pour visus comptage des ressources 
        globalCountScdPoles(data)
        // data détail par ressource (barchart)
        detailPolesChart(data,seriesB, "2-budgete")
        //Reliquats
        reliquatsPoles(data)
        break;
      case 'prev':
        data["storeMontantSCD"] = []
        data["storeMontantSCD"]
          .push({ "state": "SCD", "1-prev-SCD": budgetSuiviSumAndCount(data["dataSCD"]).prevInitial },
            { "state": "Poles", "1-prev-STM": budgetSuiviSumAndCount(data["dataSTM"]).prevOnlySum, "1-prev-SHS": budgetSuiviSumAndCount(data["dataSHS"]).prevOnlySum })
        $("#widgetCostSCD").append("<div id='dxStackedBarSCD' style='height: 340px;width: 340px;'></div>")
        getStackedBar("dxStackedBarSCD", data["storeMontantSCD"], "state", seriesP1, `Prévisions SCD (montants TTC)`)
        // data détail par ressource (barchart)
        detailPolesChart(data,seriesP2,"1-prev")
        break;
    }
  }

  /**
   * Montants consolidés par pôle pour les widgets
   */
  function globalMontantScdPoles(data,series) {
    poleState.map(function (d) {
      data["storeMontant" + d.cle] = []
      data["storeMontant" + d.cle]
        .push({ "state": "Budget initial", "2-budgete": budgetSuiviSumAndCount(data["data" + d.cle]).budgeteInitial },
          { "state": "Budget exécuté", "2-budgete": budgetSuiviSumAndCount(data["data" + d.cle]).budgeteOnlySum, "3-estime": budgetSuiviSumAndCount(data["data" + d.cle]).estimeOnlySum, "4-facture": budgetSuiviSumAndCount(data["data" + d.cle]).factureOnlySum })
      $("#widgetCost" + d.cle).append("<div id='dxStackedBar" + d.cle + "' style='height: 340px;width: 340px;'></div>")
      getStackedBar("dxStackedBar" + d.cle, data["storeMontant" + d.cle], "state", series, `Suivi ${d.cle} (montants)`)
    })
  }

  /**
   * Comptage des ressources par pôle pour les widgets
   */
  function globalCountScdPoles(data) {
    poleState.map(function (d) {
      data["storeCount" + d.cle] = []
      data["storeCount" + d.cle].push({ "state": "Budgété", "value": budgetSuiviSumAndCount(data["data" + d.cle]).budgeteOnlyCount },
        { "state": "Estimé", "value": budgetSuiviSumAndCount(data["data" + d.cle]).estimeOnlyCount },
        { "state": "Facturé", "value": budgetSuiviSumAndCount(data["data" + d.cle]).factureOnlyCount })
      $("#widgetCount" + d.cle).append("<div id='dxPie" + d.cle + "' style='height: 340px;width: 340px;'></div>")
      getPie("dxPie" + d.cle, data["storeCount" + d.cle], "state", "value", `Suivi ${d.cle} (nb de ressources)`)
    })
  }

  /**
   * Détail par ressource pour affichage graphique
   */
  function detailPolesChart(data,series, etat) {
    poleState.filter(function (d) {
      return d.cle != "SCD"
    })
    .map(function (d) {
      $("#generalResChart" + d.cle).append("<div id='dxGroupedBar" + d.cle + "' style='height: 440px;'></div>")
      getGroupedBar("dxGroupedBar" + d.cle, _.sortBy(data["data" + d.cle], function (o) { return - o[etat]; }), "bdd", series, `Détails par ressource ${d.cle}`)
    })
  }

  /**
   * Détail des reliquats pour affichage graphique
   */
  function reliquatsPoles(data) {
    poleState.filter(function (d) {
      return d.cle != "SCD"
    })
    .map(function (d1) {
      $("#reliquatRotatedBar" + d1.cle).append("<div id='dxReliquatRotatedBar" + d1.cle + "' style='height: 440px;'></div>")   
      data["tseries" + d1.cle] = data["data" + d1.cle].filter(function (d2) {
        return d2["3-estime"] || d2["4-facture"]
      })
      .map(function (d3) {      
        if (d3["3-estime"]) {
          console.log({ "bdd": d3.bdd, "reliquat-estime": d3["reliquat"], "reliquat-facture": 0 });
          return { "bdd": d3.bdd, "reliquat-estime": d3["reliquat"], "reliquat-facture": 0 }
        }
        else if (d3["4-facture"]) {
          return { "bdd": d3.bdd, "reliquat-facture": d3["reliquat"], "reliquat-estime": 0 }
        }
      })
      console.log(d1.cle,data["tseries" + d1.cle])
      getRotatedBar("dxReliquatRotatedBar" + d1.cle, data["tseries" + d1.cle], "bdd", "reliquat-estime", "Reliquat estimé", "reliquat-facture", "Reliquat facturé", `Reliquats par ressource ${d1.cle}`)
    })
  }
})
