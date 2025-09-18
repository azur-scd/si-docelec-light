export function getRotatedBar(div,store,argument,valueField1,nameField1,valueField2,nameField2,titleString){
    return  $("#"+div).dxChart({
        title: titleString,
        dataSource: store,
        rotated: true,
        barGroupWidth: 18,
        commonSeriesSettings: {
            type: "stackedbar",
            argumentField: argument
        },
        series: [{
            valueField: valueField1,
            name: nameField1,
            color: "#3F7FBF"
        }, {
            valueField: valueField2,
            name: nameField2,
            color: "#F87CCC"
        }],
        tooltip: {
            enabled: true,
            contentTemplate: function(arg) {
                return "<div class='state-tooltip'>" +
                "<div><span class='caption'>Série</span>: " +
                arg.argumentText +
                "</div><div><span class='caption'>Valeur</span>: " +
                arg.valueText +
                "</div>" + "</div>";
            }
        },
        valueAxis: {
            label: {
                customizeText: function () {
                    //return Math.abs(this.value) + '%';
                    return this.value
                }
            }
        },
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center",
            margin: { left: 50 }
        },
		onPointClick: function(e) {
            e.target.select();
        },
        onLegendClick: function(e) {
            var series = e.target;
            if(series.isVisible()) { 
                series.hide();
            } else {
                series.show();
            }
        }
    });
}