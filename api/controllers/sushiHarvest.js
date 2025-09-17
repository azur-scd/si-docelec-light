exports.testHarvest = async function(req, res) {
    console.log(req.params.view)
    return await test_get_sushi(req, res)
}

exports.harvest = async function(req, res) {
    return await get_sushi(req, res)
};

async function test(req, res) {
    try {
        // Attention : pas d’option rejectUnauthorized ici
        const response = await fetch(req.body.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const result = data.Report_Items.map(function(record) {
            var obj = {};
            obj["resource_id"] = req.body.resourceId;
            obj["report_id"] = req.body.reportId;
            record.Performance.map(function(i) {
                var obj1 = {};
                obj1["year"] = i.Period.Begin_Date.split("-")[0];
                obj1["month"] = i.Period.Begin_Date.split("-")[1];
                obj1["period_begin"] = i.Period.Begin_Date;
                obj1["period_end"] = i.Period.End_Date;
                i.Instance
                    .filter(function(d) { return d.Metric_Type == "Total_Item_Requests" })
                    .map(function(d) {
                        obj1["total"] = d.Count;
                        console.log(Object.assign(obj, obj1))
                        return Object.assign(obj, obj1)
                    })
            })
            return obj
        });
        res.json(result)
    } catch (error) {
        res.json(error.message || error);
    }
}

async function test_get_sushi(req, res) {
    console.log(req.body.url)
    console.log(req.body.metric)
    try {
        const response = await fetch(req.body.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const body = await response.text();
        const dataCount = JSON.parse(body).Report_Items.length;
        res.json({ "Nombre d'items : ": dataCount });
    } catch (error) {
        res.json(error.message || error);
    }
}

async function get_sushi(req, res) {
    console.log(req.body.metric)
    var report_filter = req.body.metric
    console.log(req.body.url)
    try {
        const response = await fetch(req.body.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const body = await response.text();
        const data = JSON.parse(body);
        var result = data.Report_Items.map(function(record) {
            return record.Performance.map(function(i) {
                var obj = {};
                obj["month"] = i.Period.Begin_Date.split("-")[1]
                i.Instance
                    .filter(function(d) { return d.Metric_Type == report_filter })
                    .map(function(d) {
                        return obj["total"] = d.Count;
                    })
                return obj
            })
                .filter(function(d) { if (d.hasOwnProperty("total")) { return d } })
        })
        var aggResult = getGroupSum(flatDeep(result), "month", "total")
        res.json(aggResult)
    } catch (error) {
        res.json(error.message || error);
    }
}

function object2array(obj) {
    var arr = []
    Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        arr.push({ "dimension": key, "count": value });
    });
    return arr;
}

function getGroupSum(data, labelField, aggField) {
    var agg = data.reduce(function(memo, item) {
        memo[item[labelField]] = (memo[item[labelField]] || 0) + item[aggField];
        return memo;
    }, {})
    return object2array(agg)
}
function flatDeep(arr) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val) : val), []);
};