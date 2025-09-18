import { binaryState, poleState, marcheState, achatperenneState, typeAchatState, typeBddState, typeBase, typeOA, typePerimetre, accessState, typeSignalement , modeSignalement, getStatState, disciplines, deviseState, etatState, etatStatSaisie, years, steps,  metrics,  months,  sushiReportUrlSegment, esgbuDisplayReport, userGroups,  statsCounter } from '../lookupArrays.js';
$(function () {
	// Détermine le mode édition selon le groupe utilisateur
	let editMode = true;
    if ($('#usergroup').val() == "guest") {
      editMode = false
    }

    /**
     * Génère le tableau de suivi stats pour l'année sélectionnée
     * Crée une entrée de suivi stats pour chaque ressource cochée en stats_collecte
     */
    function batchLoad() {
        $.get(urlBdd).done(function(results){
            var data = results
                      .filter(function(d){
                          // On ne garde que les ressources qui ont stats_collecte activé pour l'année sélectionnée
                          return d.stats_collecte[$("#selectYear").dxSelectBox('instance').option('value')]
                      }) 
                      .map(function(d){return d.id})
            // Log de la génération des items
            console.log("[batchLoad] Ressources sélectionnées pour stats :", data)
            data.map(function(d) {
                console.log({id: d, annee: $("#selectYear").dxSelectBox('instance').option('value'), etat: etatStatSaisie[0].cle})
                return createItems(urlStatsSuivi, {
                    "bdd_id": d,
                    "annee": $("#selectYear").dxSelectBox('instance').option('value'),
                    "etat": etatStatSaisie[0].cle
                })
            })
            dataGrid.refresh();
        })
    }

    // Store des ressources BDD filtrées pour stats_collecte sur l'année sélectionnée
    var storeBdds = new DevExpress.data.CustomStore({  
        key: "id",
        loadMode: "raw",
        cacheRawData: false,
        load: function () {
            var d = new $.Deferred();
            $.get(urlBdd).done(function(results){
                var data = results
                    .filter(function(d){
                        return d.stats_collecte[$("#selectYear").dxSelectBox('instance').option('value')]
                    }) 
                console.log("[storeBdds] Données chargées et filtrées :", data)
                d.resolve(data)
            })
            return d.promise();
        } 
    })  
      
    // Sélecteur d'année
    $("#selectYear").dxSelectBox({
        dataSource: years,
        value: years[8].cle,
        valueExpr: "cle",
        displayExpr: "valeur",
        onValueChanged: function (data) {
            console.log("[selectYear] Année sélectionnée :", data.value)
            dataGrid.refresh();
            dataGrid.clearFilter();
            dataGrid.filter(["annee", "=", data.value]);
        }
    });

    // Bouton pour générer un nouveau tableau pour l'année sélectionnée
    $("#newDataButton").dxButton({
        text: "Générer un nouveau tableau pour l'année sélectionnée",
        onClick: function () {
            console.log("[newDataButton] Génération tableau stats pour l'année :", $("#selectYear").dxSelectBox('instance').option('value'))
            batchLoad();
        }
    });

    // Store pour le suivi des stats
    var storeStatSuivi = new DevExpress.data.CustomStore({
        key: "id",
        load: function () {
            console.log("[storeStatSuivi] Chargement suivi stats")
            return getItems(urlStatsSuivi)
        },
        update: function (key, values) {
            console.log("[storeStatSuivi] Mise à jour", key, values)
            return updateItems(urlStatsSuivi, key, values);
        },
        insert: function (values) {
            console.log("[storeStatSuivi] Insertion", values)
            return createItems(urlStatsSuivi, values);
        },
        remove: function (key) {
            console.log("[storeStatSuivi] Suppression", key)
            return deleteItems(urlStatsSuivi, key);
        }
    });

    // DataGrid principal de suivi stats
    var dataGrid =  $("#gridContainerSuiviStats").dxDataGrid({
        dataSource: storeStatSuivi,
        repaintChangesOnly: true,
        showBorders: true,
        columnAutoWidth: true,
        allowColumnResizing: true,
        allowColumnReordering: true,
        filterValue: ["annee", "=", $("#selectYear").dxSelectBox('instance').option('value')],
        paging: {
            pageSize: 50
        },
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [10, 20, 50, 100, 150],
            showInfo: true
        },
        "export": {
            enabled: true,
            fileName: "stats_suivi_"+$("#selectYear").dxSelectBox('instance').option('value')
        },
        groupPanel: {
            emptyPanelText: "Drag & Drop colonnes pour effectuer des regroupements",
            visible: true
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
        editing: {
            mode: 'form',
            allowUpdating: editMode,
            allowAdding: editMode,
            allowDeleting: editMode,
            useIcons: true,
        },
        columns: [
            {
                type: "buttons",
                caption: "Actions",
                buttons: ["edit","delete"]
            },
            {
                dataField: "bdd_id",
                caption: "Ressource",
                lookup: {
                    dataSource: storeBdds,
                    valueExpr: "id",
                    displayExpr: "bdd"
                }
            },
            {
                dataField: "bdd_id",
                caption: "Conforme Counter",
                lookup: {
                    dataSource: storeBdds,
                    valueExpr: "id",
                    displayExpr: "stats_counter"
                },
                allowEditing: false
            },
            {
                dataField: "bdd_id",
                caption: "Modalité de collecte",
                lookup: {
                    dataSource: storeBdds,
                    valueExpr: "id",
                    displayExpr: "stats_get_mode"
                },
                allowEditing: false
            },
            {
                dataField: "annee",
                caption: "Année",
                editorOptions: {  
                    step: 0  
                },
            },
            {
                dataField: "etat",
                caption: "Etape de saisie",
                lookup: {
                    dataSource: etatStatSaisie,
                    displayExpr: "valeur",
                    valueExpr: "cle"
                }
            },
            {
                dataField: "commentaire",
                caption: "Commentaire",
                width: 350
            },
            {
                dataField: "createdAt",
                caption: "Créé",
                dataType: "date"
            },
            {
                dataField: "updatedAt",
                caption: "Mise à jour le",
                dataType: "date"
            }
        ],
        onCellPrepared: function (e) {
            if (e.rowType === "data") {
                if (e.column.dataField === "etat") {
                    switch (e.data.etat) {
                        case '1-vide':
                            e.cellElement.css({ "background-color": "rgb(238, 76, 76)"});
                            break;
                        case '2-encours':
                            e.cellElement.css({ "background-color": "rgb(236, 187, 217)"});
                            break;
                        case '3-fait':
                            e.cellElement.css({ "background-color": "#C9ECD7"});
                            break;
                    }
                }
            }
        },
    }).dxDataGrid("instance");
});