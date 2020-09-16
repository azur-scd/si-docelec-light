function getStackedBar(div,store,argument,series,titleString){
    return  $("#"+div).dxChart({
        dataSource: store,
        commonSeriesSettings: {
            argumentField: argument,
            type: "stackedBar"
        },
        series: series,
        legend: {
            verticalAlignment: "bottom",
            horizontalAlignment: "center",
            itemTextPosition: 'top'
        },
        valueAxis: {
            position: "right"
        },
        title: titleString,
        "export": {
            enabled: true
        },
        customizeLabel: function () {
                return {
                    visible: true,
                    backgroundColor: "#8c8cff",
                    customizeText: function () {
                        return Math.round(this.valueText).toLocaleString();
                    }
                };  
        },
        tooltip: {
            enabled: true,
            location: "edge",
            customizeTooltip: function (arg) {
                return {
                    text: arg.seriesName + " : " + Math.round(arg.valueText).toLocaleString() + " (" + arg.percentText + ")"
                };
            }
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