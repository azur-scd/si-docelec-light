import { binaryState, poleState, marcheState, achatperenneState, typeAchatState, typeBddState, typeBase, typeOA, typePerimetre, accessState, typeSignalement , modeSignalement, getStatState, disciplines, deviseState, etatState, etatStatSaisie, years, steps,  metrics,  months,  sushiReportUrlSegment, esgbuDisplayReport, userGroups,  statsCounter } from '../lookupArrays.js';
import {urlBdd, urlGestion, urlGestionCustom, urlGestionGc, urlSignalement, urlSignalementCustom, urlSignalementPrimo, urlGC, urlStatsReports, urlFormStats, urlStats, urlStatsSuivi, urlStatsIndicators, urlStatsEsgbu, urlBddUniqueStatsReports, urlProxySushiTest, urlProxySushi, urlUser, urlBU, urlDisc, urlBdd2Disc, getApiUrl} from '../apiUrls.js';
import {formattingDate, copyObjectProps, object2array, getGroupSum, getGroupCount, groupBy, budgetSuiviSumAndCount} from '../commonFunctions.js';
import {handleResponse, handleError, getItems, updateItems, createItems, deleteItems, getDataEncoded} from '../crud.js';
import {getStackedBar} from '../dxchartComponents/stackedBar.js';
import {getBarLine} from '../dxchartComponents/barLine.js';
import {getGroupedBar} from '../dxchartComponents/groupedBar.js';
import {getPie} from '../dxchartComponents/pie.js';
import {getRotatedBar} from '../dxchartComponents/rotatedBar.js';
import {getSimpleBar} from '../dxchartComponents/simpleBar.js';
import {getSimpleLine} from '../dxchartComponents/simpleLine.js';

$(function () {
	
    // Masque le panel-footer pour les invités
    if ($('#usergroup').val() == "guest") {
      $(".panel-footer").hide()
    }
	
    // Logs pour l'initialisation
	// selected_bdd = id d'un input caché. Si vide on ne charge rien
    console.log("[init] Lancement des requêtes initiales stats")

// Initialisation (uniquement si selected_bdd non vide)
if ($("#selected_bdd").val()) {
    getAvalaibleReports($("#selected_bdd").val());
    getFormData($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val());
    getSushiParam($("#selected_bdd").val());
    annualTotalBar($("#selected_bdd").val(), $("#selected_report").val());
    monthTotalLine($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val());
    indicators($("#selected_bdd").val(), $("#selected_report").val());
}

// Exécution automatique dès modification de selected_bdd
$("#selected_bdd").on("change", function() {
    if ($(this).val()) {
        getAvalaibleReports($(this).val());
        getFormData($("#selected_year").val(), $(this).val(), $("#selected_report").val());
        getSushiParam($(this).val());
        annualTotalBar($(this).val(), $("#selected_report").val());
        monthTotalLine($("#selected_year").val(), $(this).val(), $("#selected_report").val());
        indicators($(this).val(), $("#selected_report").val());
    }
});

    // Store BDD filtrant sur stats_collecte année sélectionnée
    var storeBdd = new DevExpress.data.CustomStore({
        loadMode: "raw",
        load: function () {
            var d = new $.Deferred();
            $.get(urlBdd).done(function(results){
                var data = results
                    .filter(function(d){
                        return d.stats_collecte[$("#selectbox-years").dxSelectBox('instance').option('value')]
                    }) // affiche les bdds du menu déroulant si la date sélectionnée est cochée dans le json stats_collecte
                console.log("[storeBdd] Données chargées et filtrées :", data)
                d.resolve(data)
            })
            return d.promise();
        }
    });

    // Store stats CRUD
    var storeStats = new DevExpress.data.CustomStore({
        key: "id",
        load: function () {
            console.log("[storeStats] Chargement stats")
            return getItems(urlStats)
        },
        update: function (key, values) {
            console.log("[storeStats] Mise à jour :", key, values)
            return updateItems(urlStats, key, values);
        },
        insert: function (values) {
            console.log("[storeStats] Insertion :", values)
            return createItems(urlStats, values);
        },
        remove: function (key) {
            console.log("[storeStats] Suppression :", key)
            return deleteItems(urlStats, key);
        }
    });

    // Store des rapports stats
var storeStatsReports = new DevExpress.data.CustomStore({
    loadMode: "raw",
    load: function () {
        var selectedYear = $("#selected_year").val();
        var selectedBdd = $("#selected_bdd").val();
        if (selectedYear && selectedBdd) {
            console.log("[storeStatsReports] Année et BDD renseignés, chargement stats reports");
            return getItems(urlStatsReports);
        } else {
            console.log("[storeStatsReports] Année ou BDD non renseignée, aucun chargement");
            // Retourne une promesse résolue avec un tableau vide pour éviter une erreur DevExpress
            var d = new $.Deferred();
            d.resolve([]);
            return d.promise();
        }
    }
});



    // Sélecteur d'année
    $("#selectbox-years").dxSelectBox({
        width: 150,
        items: years,
        valueExpr: "cle",
        displayExpr: "valeur",
        value: parseInt($("#selected_year").val()),
        onValueChanged: function (data) {
            console.log("[selectbox-years] Année sélectionnée :", data.value)
            $("#selected_year").val(data.value)
            $("#selectbox-bdd").dxSelectBox("getDataSource").reload(); // reload du select bdds en fonction de l'année sélectionnée
            return getFormData($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val()),
                monthTotalLine($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val())
        }
    });

    // Sélecteur BDD
    $("#selectbox-bdd").dxSelectBox({
        dataSource: storeBdd,
        valueExpr: "id",
        displayExpr: "bdd",
        value: parseInt($("#selected_bdd").val()),
        searchEnabled: true,
        isRequired: true,
        onValueChanged: function (data) {
            console.log("[selectbox-bdd] BDD sélectionnée :", data.value)
            $("#selected_bdd").val(data.value)
            return getAvalaibleReports($("#selected_bdd").val()),
			    getFormData($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val()),
                annualTotalBar($("#selected_bdd").val(), $("#selected_report").val()),
                monthTotalLine($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val()),
                getSushiParam($("#selected_bdd").val())
        }
    }).dxValidator({
        validationRules: [{ type: 'required' }]
    });

    // Sélecteur de rapport stats
    $("#selectbox-reports").dxSelectBox({
        dataSource: storeStatsReports,
        valueExpr: "id",
        displayExpr: "mesure",
        value: parseInt($("#selected_report").val()),
        validationRules: [{
            type: "required",
            message: "Name is required"
        }],
        onValueChanged: function (data) {
            console.log("[selectbox-reports] Rapport sélectionné :", data.value)
            $("#selected_report").val(data.value)
            return getFormData($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val()),
                annualTotalBar($("#selected_bdd").val(), $("#selected_report").val()),
                monthTotalLine($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val())
        }
    });


    // Bouton pour enregistrer le formulaire
    $("#insertFormData").click(function () {
        console.log("[insertFormData] Enregistrement des données du formulaire")
        months.map(function (m) {
            if ($("#id_" + m.cle).val() != '') {
                return updateItems(urlStats, $("#id_" + m.cle).val(), { "count": $("#" + m.cle).val() });
            }
            else if (($("#id_" + m.cle).val() == '') && ($("#" + m.cle).val() != 0)) {
                var monthDataToInsert = {
                    "bdd_id": $("#selected_bdd").val(),
                    "stats_reports_id": $("#selected_report").val(),
                    "periodeDebut": $("#selected_year").val() + m.start,
                    "periodeFin": $("#selected_year").val() + m.end,
                    "count": $("#" + m.cle).val(),
                    "dimension": m.cle
                }
                return createItems(urlStats, monthDataToInsert)
            }
        })
        return getFormData($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val()),
            annualTotalBar($("#selected_bdd").val(), $("#selected_report").val()),
            monthTotalLine($("#selected_year").val(), $("#selected_bdd").val(), $("#selected_report").val())
    })

    // Bouton calculer le total annuel
    $("#calculateTotal").click(function () {
        console.log("[calculateTotal] Calcul du total annuel")
        return calculateSum()
    })
	
    // Affiche les rapports disponibles pour une ressource
    function getAvalaibleReports(bdd){
		console.log ("[getAvalaibleReports] : bdd="+ bdd);
        $("#avalaibleReports").empty()
        return getItems(urlBddUniqueStatsReports + "/bddid/" + bdd)
        .then(function (result) {
            console.log("[getAvalaibleReports] Rapports disponibles :", result)
            $("#avalaibleReports").append("Statistiques disponibles (déjà collectées) pour cette ressource : ")
            result.map(function(d){
                return $("#avalaibleReports").append("<span class='label label-danger label-form' style='margin-right:5px;'>"+d.StatReport.mesure+"</span>")
            })
        })
    }

    // Récupère et affiche les données de formulaire pour BDD/année/rapport
    function getFormData(year, bdd, report) {
		console.log ("[getFormData] : year="+ year+", bdd="+bdd+", report="+report);
        $("#form").empty()
        displayForm();
        return getItems(urlFormStats + "/?bddId=" + bdd + "&reportId=" + report + "&year=" + year)
            .then(function (data) {
                console.log("[getFormData] Données reçues :", data)
                if (typeof year !== "undefined" && typeof bdd !== "undefined" && typeof report !== "undefined" && data.length != 0) {
                    $("#alertData").hide()
                    months.map(function (m) {
                        var filterDataByMonth = data.filter(function (i) { return i.dimension === m.cle });
                        if (filterDataByMonth.length != '0') {
                            $("#" + m.cle).val(filterDataByMonth[0].count);
                            $("#id_" + m.cle).val(filterDataByMonth[0].id);
                        }
                        else {
                            return $("#" + m.cle).val(0);
                        }
                    })
                }
                else if (typeof year !== "undefined" && typeof bdd !== "undefined" && typeof report !== "undefined" && data.length == 0) {
                    $("#alertData").show()
                    months.map(function (m) {
                        return $("#" + m.cle).val(0);
                    })
                }
            })
    }

    // Affiche le formulaire (un champ par mois)
    function displayForm() {
		console.log ("[displayForm]");
        months.map(function (m) {
            $("#form").append("<div class='form-group'><label for='" + m.cle + "' class='control-label col-md-4'>" + m.valeur + "</label><div class='col-md-6'><input type='text' class='form-control' id='" + m.cle + "'><input type='hidden' id='id_" + m.cle + "'></div></div>")
        })
    }

    // Calcule la somme annuelle
    function calculateSum() {
		console.log ("[calculateSum]");
        var sum = 0;
        $("#janvier,#fevrier,#mars,#avril,#mai,#juin,#juillet,#aout,#septembre,#octobre,#novembre,#decembre").each(function () {
            if (!isNaN(this.value) && this.value.length != 0) {
                sum += parseInt(this.value);
            }
        });
        $("#total").val(sum);
    }

    // Récupère et affiche les paramètres Sushi pour la BDD
    function getSushiParam(id) {
		console.log ("[getSushiParam] : id="+ id);
        return getItems(urlBdd + "/" + id)
            .then(function (result) {
                // On remet ici les valeurs de l'array sushiReportUrlSegment car blocage dans l'UI sinon ?
                var sushiReportUrlSegment = [
                    { "cle": "0-tr_j1", "metric":"Total_Item_Requests","valeur": "Revues - Téléchargements (tr_j1) - Total Item Requests", "mapReportId": 1 },
                    { "cle": "1-tr_j1",  "metric":"Unique_Item_Requests", "valeur": "Revues - Téléchargements (tr_j1) - Unique Item Requests", "mapReportId": 8 },
                    { "cle": "2-tr_b1",  "metric":"Total_Item_Requests", "valeur": "Ebooks - Téléchargements (tr_b1)  - Total Item Requests", "mapReportId": 1 },
                    { "cle": "3-tr_b1",  "metric":"Unique_Item_Requests", "valeur": "Ebooks - Téléchargements (tr_b1)  - Unique Item Requests", "mapReportId": 8 },
                    { "cle": "4-pr_p1",  "metric":"Searches_Platform","valeur": "Plateformes - Recherches (pr_p1)", "mapReportId": 4 },
                    { "cle": "5-pr_p1", "metric":"Total_Item_Requests","valeur": "Plateformes - Téléchargements (pr_j1) - Total Item Requests", "mapReportId": 1 },
                    { "cle": "6-pr_p1",  "metric":"Unique_Item_Requests", "valeur": "Plateformes - Téléchargements (pr_p1) - Unique Item Requests", "mapReportId": 8 },
                    { "cle": "7-tr_j2",  "metric":"Total_Item_Requests", "valeur": "Revues - Refus d'accès (tr_j2)", "mapReportId": 3 },       
                    { "cle": "8-tr_b2",  "metric":"Total_Item_Requests", "valeur": "Ebooks - Refus d'accès (tr_b2)", "mapReportId": 3 },
                    { "cle": "9-dr_d1", "valeur": "Base de données - Recherches (dr_d1)", "mapReportId": 4 },
                ]
                if (result.stats_get_mode == "sushi") {
                    $("#sushiPanel").show()
                    $("#resourceSushiUrl").val(result.stats_url_sushi);
                    $("#resourceRequestorId").val(result.sushi_requestor_id);
                    $("#resourceCustomerId").val(result.sushi_customer_id);
                    $("#resourceApiKey").val(result.sushi_api_key);
                    $("#selectbox-sushi-reports").dxSelectBox({
                        width: 250,
                        items: sushiReportUrlSegment,
                        valueExpr: "cle",
                        displayExpr: "valeur",
                        value: $("#selected_sushi_report").val(),
                        onValueChanged: function (data) {
                            $("#selected_sushi_report").val(data.value.split("-")[1])
                            $("#selected_metric").val(sushiReportUrlSegment.filter(function (d) { return d.cle == data.value })[0].metric)
                            createSushiUrl($("#beginSushiDate").val(), $("#endSushiDate").val(), $("#selected_sushi_report").val())
                            var reportId = sushiReportUrlSegment.filter(function (d) { return d.cle == data.value })[0].mapReportId
                            $("#selectbox-reports")  
                               .dxSelectBox("instance")  
                               .option("value", reportId); 
                        }
                    });
                    $("#sushi-start").dxDateBox({
                        type: "date",
                        showClearButton: true,
                        useMaskBehavior: true,
                        displayFormat: 'yyyy-MM-dd',
                        value: $("#beginSushiDate").val(),
                        onValueChanged: function (data) {
                            var date = formatingDate(data.value)
                            $("#beginSushiDate").val(date)
                            createSushiUrl($("#beginSushiDate").val(), $("#endSushiDate").val(), $("#selected_sushi_report").val())
                            $("#selectbox-years")  
                            .dxSelectBox("instance")  
                            .option("value", parseInt(date.split("-")[0])); 
                        }
                    });
                    $("#sushi-end").dxDateBox({
                        type: "date",
                        showClearButton: true,
                        useMaskBehavior: true,
                        displayFormat: 'yyyy-MM-dd',
                        value: $("#endSushiDate").val(),
                        onValueChanged: function (data) {
                            $("#endSushiDate").val(formatingDate(data.value))
                            createSushiUrl($("#beginSushiDate").val(), $("#endSushiDate").val(), $("#selected_sushi_report").val())
                        }
                    });
                }
                else {
                    $("#sushiPanel").hide()
                }
            })
    }

    // Génère l'URL Sushi complète
    function createSushiUrl(start, end, sushi_url_segment) {
		console.log ("[createSushiUrl] : start="+start+", end="+end+", sushi_url_segment"+sushi_url_segment);
        var obj = {}; var resourceSushi; var completeUrl;
        if ($("#resourceSushiUrl").val().endsWith("/")) {
            resourceSushi = $("#resourceSushiUrl").val() + "reports/" + sushi_url_segment
        }
        else {
            resourceSushi = $("#resourceSushiUrl").val() + "/reports/" + sushi_url_segment
        }
        if ($("#resourceRequestorId").val() != "") {
            obj["requestor_id"] = $("#resourceRequestorId").val()
        }
        if ($("#resourceCustomerId").val() != "") {
            obj["customer_id"] = $("#resourceCustomerId").val()
        }
        if ($("#resourceApiKey").val() != "") {
            obj["api_key"] = $("#resourceApiKey").val()
        }
        obj["begin_date"] = start
        obj["end_date"] = end
        completeUrl = resourceSushi + "?" + getDataEncoded(obj)
        console.log("[createSushiUrl] URL générée :", completeUrl)
        return $("#completeSushiUrl").val(completeUrl)
    }

    // Bouton test Sushi
    $("#testSushi").click(function () {
		console.log ("Evenement #testSushi.click");
        var completeUrl = $("#completeSushiUrl").val()
        console.log("[testSushi] URL test :", completeUrl)
        var reportId = sushiReportUrlSegment.filter(function (d) { return d.cle = $("#selected_sushi_report").val() }).map(function (d) { return d.mapReportId })
        return $.ajax({
            method: 'POST',
            url: urlProxySushiTest,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: { "url": completeUrl, "metric" : $("#selected_metric").val() },
            beforeSend: function() {
                $("#loaderDiv").show();
            },
            success: function (response) {
                $("#loaderDiv").hide();
                alert(JSON.stringify(response))
            },
            error: function (response) { console.log(response); alert(response.statusText); }
        })
    })

    // Bouton récupération Sushi avec logs détaillés
    $("#getSushi").click(function () {
		console.log ("Evenement #getSushi.click");
        var completeUrl = $("#completeSushiUrl").val();
        console.log("[getSushi] URL complète utilisée :", completeUrl);
        var reportId = sushiReportUrlSegment.filter(function (d) { return d.cle = $("#selected_sushi_report").val() }).map(function (d) { return d.mapReportId });
        return $.ajax({
            method: 'POST',
            url: urlProxySushi + $("#selected_sushi_report").val(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: { "url": completeUrl, "metric": $("#selected_metric").val() },
            beforeSend: function () {
                console.log("[getSushi] Démarrage de la requête AJAX...");
                $("#loaderDiv").show();
            },
            success: function (response) {
                $("#loaderDiv").hide();
                // Logs de debug sur la réponse
                console.log("[getSushi] Réponse brute reçue :", response);
                console.log("[getSushi] Type de la réponse :", typeof response);
                // Conversion en tableau si nécessaire
                const responseArray = Array.isArray(response) ? response : (typeof response === 'object' && response !== null ? Object.values(response) : []);
                console.log("[getSushi] Tableau utilisé pour le filtrage :", responseArray);

                months.map(function (m) {
                    var filterDataByMonth = responseArray.filter(function (i) { return i.dimension === m.code });
                    console.log("[getSushi] Mois :", m.code, "| Données filtrées :", filterDataByMonth);
                    if (filterDataByMonth.length != 0) {
                        $("#" + m.cle).val(filterDataByMonth[0].count);
                    }
                });
            },
            error: function (response) { 
                console.log("[getSushi] Erreur AJAX :", response); 
                alert(response.statusText); 
            }
        });
    });

    // Store total annuel
    function annualTotalStore(bdd, report) {
		console.log ("[annualTotalStore] : bdd="+bdd+", report="+report);
        return new DevExpress.data.CustomStore({
            key: "id",
            load: function () {
                return getItems(urlStats + "?bdd_id=" + bdd + "&stats_reports_id=" + report + "&dimension=total")
                    .then(function (data) {
                        var result = data.map(function (d) {
                            return { "date": d.periodeDebut.substring(0, 4), "total": d.count }
                        })
                        .sort(function (a, b) {
                            return a.date - b.date;
                        })
                        return result
                    })
            }
        });
    }

    // Store total mensuel
    function monthlyTotalStore(year, bdd, report) {
		console.log ("[monthlyTotalStore] : bdd="+bdd+", report="+report+", year="+year);
        return new DevExpress.data.CustomStore({
            key: "id",
            load: function () {
                return getItems(urlStats + "/bddid/" + bdd)
                    .then(function (data) {
                        var sortingMonths = months.map(function (d) { return d.cle })
                        var result = data
                            .filter(function (d) {
                                return d.stats_reports_id == report && d.periodeDebut.substring(0, 4) == year && d.dimension != "total"
                            })
                            .map(function (d) {
                                return { "mois": d.dimension, "total": d.count }
                            })
                            .sort(function (a, b) {
                                return sortingMonths.indexOf(a.mois) - sortingMonths.indexOf(b.mois);
                            });
                        return result
                    })
            }
        })
    }

    // Store pour les données de gestion (facturé)
    function gestionData(bdd) {
		console.log ("[gestionData] : bdd="+bdd);
        return new DevExpress.data.CustomStore({
            key: "id",
            load: function () {
                return getItems(urlGestion + "/bddid/" + bdd)
                    .then(function (data) {
                        var result = data
                            .filter(function (d) {
                                return d.etat == "4-facture"
                            })
                            .map(function (d) {
                                return { "date": d.annee, "cout": d.montant_ttc }
                            })
                            .sort(function (a, b) {
                                return a.date - b.date;
                            });
                        return result
                    })
            }
        })
    }

    // Affichage des graphiques
    function annualTotalBar(bdd, report) {
		console.log ("[annualTotalBar] : bdd="+bdd+", report"+report);
        return getSimpleBar("totalBarChart", annualTotalStore(bdd, report), "date", "total", "date", "")
    }

    function monthTotalLine(year, bdd, report) {
		console.log ("[monthTotalLine] : bdd="+bdd+", report"+report+", year="+year);
        var series = [{ valueField: "total", name: "Total" }]
        return getSimpleLine("monthLineChart", monthlyTotalStore(year, bdd, report), "mois", series, "")
    }

    function indicators(bdd, report) {
		console.log ("[indicators] : bdd="+bdd+", report"+report);

        // Possibilité d'afficher les indicateurs ici
        //console.log(annualTotalStore(bdd,report))
        //console.log(gestionData(bdd))
    }

    // Nettoyage des IDs mensuels
    function cleanIds() {
		console.log ("[cleanIds]");
        $("input[id^=id_]").each(function () {
            if ($(this).val() != '') {
                deleteItems(urlStats, $(this).val());
            }
        })
    }
})