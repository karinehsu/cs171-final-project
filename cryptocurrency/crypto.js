// https://www.cryptocoincharts.info/v2/tools/api

// define margins for the visuals
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1280 - margin.left - margin.right;
var height = 760 - margin.bottom - margin.top;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 2 * 100,
    h: height - 2 * 10
};

// main canvas for our visualization
var main_canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
})

// append a svg
var svg = main_canvas.append("g").attr({
        transform: "translate(" + 0 + "," + 0 + ")"
    })
    .append("g")
    .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
});

var runAjaxQuery = function (endpoint, params) {

    console.log("Running");
    $.get("http://www.cryptocoincharts.info/v2/api/" + endpoint, function (data, status) {
        console.log(data);

        // check status, then update accordingly
        if (status == "success") {

        }
        else {
            // if fails, then debug
        }
    })

}

runAjaxQuery("listCoins");



