/* * * * * * * * * * * *
 * Zezhou Liu and Karine Hsu
 *
 * CS171 Final Project: CryptoCurrency Visualization
 * 04/02/2014
 * 
 * @Brief: Visualization for various cryptocurrencies to show
 *      volume of trade, price of trade, growth, relative growth trends, etc
 * * * * * * * * * * * */


// https://www.cryptocoincharts.info/v2/tools/api

/* * * * * * * * * * * *
 * Basic set-up for visuals:
 *  - margins
 *  - width, height
 *  - main_vis
 *  - main_canvas
 *  - svg
 * * * * * * * * * * * */
// define margins for the visuals
var margin = {
    top: 25,
    right: 50,
    bottom: 25,
    left: 100
};

var canvas_width = parseInt(d3.select("#main_vis").style("width"), 10);
var width =  canvas_width - margin.left - margin.right;
var height = 500 - margin.bottom - margin.top;


// main_vis size attributes
var main_vis = {
    x: 100,
    y: 10,
    w: width,
    h: height
};

var detail_vis = {
    x: main_vis.x,
    y: main_vis.y,
    w: main_vis.w,
    h: main_vis.h / 2

}

// main canvas for our visualization
var main_svg = d3.select("#main_vis").append("svg").attr({
    width: main_vis.w + margin.left + margin.right,
    height: main_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "main_svg").attr("viewBox", "0 0 " + (main_vis.w + margin.left + margin.right) + " " + (main_vis.h + margin.top + margin.bottom));

// Set up the area for the detailed graph, also make sure its clipped
main_svg.append("defs").append("clipPath")
    .attr("id", "main_clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var detail_svg = d3.select("#detail_vis").append("svg").attr({
    width: detail_vis.w + margin.left + margin.right,
    height: detail_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "detail_svg").attr("viewBox", "0 0 " + (detail_vis.w + margin.left + margin.right) + " " + (detail_vis.h + margin.top + margin.bottom));

/* Set up clip paths */
detail_svg.append("defs").append("clipPath")
    .attr("id", "detail_clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("width", detail_vis.w)
    .attr("height", detail_vis.h);

/* Set up dynamically sized visuals */
var svg = $("#main_svg");
var aspect = svg.width() / svg.height();
var container = svg.parent();

$(window).on("resize", function () {
    var targetWidth = container.width();
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
}).trigger("resize");

var d_svg = $("#detail_svg");
var d_aspect = d_svg.width() / d_svg.height();
var d_container = d_svg.parent();

$(window).on("resize", function () {
    var targetWidth = d_container.width();
    d_svg.attr("width", targetWidth);
    d_svg.attr("height", Math.round(targetWidth / d_aspect));
}).trigger("resize");

/* Set up main g's */
var main_g = main_svg.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

var detail_g = detail_svg.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

// tool tip for main
var main_tooltip = d3.select("body")
	.append("div")
    .attr("class", "tooltip1")
	.style("position", "absolute")
	.style("z-index", "10000000000000000000")
	.style("visibility", "hidden");

// Default domains for x_scale_main and y_scale_main.  
// Ranges should take up the entirety of the vis
var x_scale_main = d3.scale.linear().domain([0, 1]).range([0, main_vis.w]);
var y_scale_main = d3.scale.linear().domain([0, 1]).range([main_vis.h - margin.bottom, 0]);

// Default domains for x_scale_detail and y_scale_detail.  
// Ranges should take up the entirety of the vis
var x_scale_detail = d3.scale.linear().domain([0, 1]).range([0, detail_vis.w]);
var y_scale_detail = d3.scale.linear().domain([0, 1]).range([detail_vis.h - margin.bottom, 0]);

// Axis should default orientation to bottom and left
var x_axis_main = d3.svg.axis().scale(x_scale_main).orient("bottom");
var y_axis_main = d3.svg.axis().scale(y_scale_main).orient("left");

// Axis should default orientation to bottom and left
var x_axis_detail = d3.svg.axis().scale(x_scale_detail).orient("bottom");
var y_axis_detail = d3.svg.axis().scale(y_scale_detail).orient("left");

/* Brush feature */
function brushed() {
    x_scale_detail.domain(brush.empty() ? xScaleOverview.domain() : brush.extent());
    svg.select(".timeArea").attr("d", detailArea(dataSet));
    svg.select(".xDetail.axis").call(xAxisDetail);
    svg.selectAll(".detailVis .dataPoint").attr({
        "cx": function (d) { return xScaleDetail(d.month); },
        "cy": function (d) { return yScaleDetail(d.count); }
    });


}

var main_visual_active = false;

var color = d3.scale.category10();

/**
 * CACHE DATA SETS
 **/

/**
 * Object methods
 **/

var BTC_ALL = [];
var BTC_VOLUME = [];


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * main()
 *
 * @Brief: Serves as main() function, will be run at start of script.
 *       You should add ALL pipeline code here to be run at loadtime.
 **/
var main = function () {
    
    loadLeftPanel();
    loadRightPanel();
    loadHistoricalBTCPrices();
    
    //runCryptocoinchartsQuery("listCoins", {}, loadTopTenCurrencies);


}

/*KARINE*/

// var brush = d3.svg.brush().x(x_scale_main).on("brush", brushed);

// function brushed() {
//     xScaleDetail.domain(brush.empty() ? xScaleOverview.domain() : brush.extent());
//     svg.select(".timeArea").attr("d", detailArea(dataSet));
//     svg.select(".xDetail.axis").call(xAxisDetail);
//     svg.selectAll(".detailVis .dataPoint").attr({
//         "cx":function(d) { return xScaleDetail(d.month); },
//         "cy":function(d) { return yScaleDetail(d.count); }
//     });

//     x_scale_main = d3.time.scale().domain(d3.extent(BTC_ALL, function (d) { return d.date; })).range([0, main_vis.w]);
//     y_scale_main.domain(d3.extent(BTC_ALL, function (d) { return d.average; }));

// }

var loadLeftPanel = function () {

    d3.csv("../data/majorbtcevents.csv", function(data) {
        console.log(data);

        // d3.select("#events-dropdown")
    })
}

var loadRightPanel = function () {


}

var loadHistoricalBTCPrices = function () {

    d3.csv("../data/chart-data.csv", function (data) {

        var parseDate = d3.time.format("%m/%d/%Y").parse;
        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.average = parseFloat(d.average);
            d.total_volume = parseFloat(d.total_volume);
        });

        BTC_ALL = data;

        // create visual
        createMainVisual();

        loadBTCLineGraph();

        createVolumeVisual();

        loadBTCVolumeGraph();
    });
}

var loadBTCLineGraph = function () {

    x_scale_main = d3.time.scale().domain(d3.extent(BTC_ALL, function (d) { return d.date; })).range([0, main_vis.w]);
    y_scale_main.domain(d3.extent(BTC_ALL, function (d) { return d.average; }));
    x_axis_main.scale(x_scale_main);

    x_axis_main.ticks(5);

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return x_scale_main(d.date); })
        .y(function (d) {
                return y_scale_main(d.average);
        });

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var rects = main_svg.selectAll("rect").remove();

    var dataGroup = main_g.selectAll(".dataGroup");
    console.log(dataGroup);

    if (dataGroup < 1) {
        console.log("adding g");
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {

        console.log("new line");
        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": line(BTC_ALL),
        }).style("stroke", "red");
    }
    else {

        console.log("old line");

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": line(BTC_ALL),
        }).style("stroke", "red");

        var dots = dataGroup.selectAll(".dataPoint");
        dots.attr("r", 0);
    }

}

var loadBTCVolumeGraph = function () {

    x_scale_detail = d3.time.scale().domain(d3.extent(BTC_ALL, function (d) { return d.date; })).range([0, main_vis.w]);
    y_scale_detail.domain(d3.extent(BTC_ALL, function (d) { return d.total_volume; }));
    console.log(d3.extent(BTC_ALL, function (d) { return d.total_volume; }));
    console.log(d3.extent(BTC_ALL, function (d) { return d.date; }));

    x_axis_detail.scale(x_scale_detail);

    x_axis_detail.ticks(5);

    // Update the X and Y axis for main vis
    detail_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_detail);
    detail_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_detail);

    var rects = detail_svg.selectAll("rect");

    detail_svg.selectAll("rect")
    .data(BTC_ALL)
    .enter().append("svg:rect")
    .attr("x", function (d) {
        return x_scale_detail(d.date) + detail_vis.x;
    })
    .attr("y", function (d) {
        return y_scale_detail(d.total_volume);

    })
    .attr("height", function (d) {
        return detail_vis.h - y_scale_detail(d.total_volume);
    })
    .attr("width", function (d) {
        return 0.5 * (detail_vis.w - 2 * detail_vis.x) / BTC_ALL.length;
    })
    .attr("fill", function (d) {
        return "green";
    })
    .attr("class", "detailRect");
    
}


var loadBTCLineoGraph = function () {

    x_scale_main = d3.time.scale().domain(d3.extent(BTC_ALL, function (d) { return d.date; })).range([0, main_vis.w]);
    y_scale_main.domain(d3.extent(BTC_ALL, function (d) { return d.average; }));
    x_axis_main.scale(x_scale_main);

    x_axis_main.ticks(5);

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) { return x_scale_main(d.date); })
        .y(function (d) {
            return y_scale_main(d.average);
        });

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var rects = main_svg.selectAll("rect").remove();

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup.selectAll("path") < 1) {

        console.log("new line");
        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": line(BTC_ALL),
        }).style("stroke", "red");
    }
    else {

        console.log("old line");

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": line(BTC_ALL),
        }).style("stroke", "red");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        console.log("new dots");
        // Add the dots if never put on before
        dots.data(BTC_ALL).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.average); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", "blue");
    }
    else {

        console.log("old dots");
        console.log(dots.selectAll("circle"));
        dots.selectAll("circle").data(BTC_ALL).attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.average); },
            "r": 2,
            "class": "dataPoint",
        }).style("border", "blue");

        dots.attr("r", 2);
    }
    
}

var loadBTCCandlestickGraph = function () {

    x_scale_main = d3.time.scale().domain(d3.extent(BTC_ALL, function (d) { return d.date; })).range([0, main_vis.w]);
    y_scale_main.domain([(d3.min (BTC_ALL, function (d) { return d.low; })), (d3.max(BTC_ALL, function (d) { return d.high; }))]);
    console.log([(d3.min(BTC_ALL, function (d) { return d.low; })), (d3.max(BTC_ALL, function (d) { return d.high; }))]);
    x_axis_main.scale(x_scale_main);

    x_axis_main.ticks(5);

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var dataGroup = main_g.selectAll(".dataGroup");
    var dots = dataGroup.selectAll(".dataPoint");
    dots.remove();
    dataGroup.selectAll("path").remove();

    var rects = main_svg.selectAll("rect");

    if (rects < 1) {
        main_svg.selectAll("rect")
        .data(BTC_ALL)
        .enter().append("svg:rect")
        .attr("x", function (d) {
            return x_scale_main(d.date) + margin.left;
        })
        .attr("y", function (d) {
            if (d.low) {
                return y_scale_main(d.low) - margin.top;
            }
            else {
                return y_scale_main(d.average) - margin.top;
            }

        })
        .attr("height", function (d) {
            if (d.high) {
                return y_scale_main(d.low) - y_scale_main(d.high);
            }
            else {
                return 3;
            }
        })
        .attr("width", function (d) {
            return 0.5 * (main_vis.w - 2 * main_vis.x) / BTC_ALL.length;
        })
        .attr("fill", function (d) {
            if (d.low && d.high) {
                return "green";
            }
            else {
                return "red";
            }
        });
    }
    else {
        main_svg.selectAll("rect")
        .data(BTC_ALL)
        .attr("height", function (d) {
            if (d.high) {
                return y_scale_main(d.low) - y_scale_main(d.high);
            }
            else {
                return 3;
            }
        });
    }
    

}

var loadbidAskSpread = function () {
}

/**
 * loadWorldMap()
 *
 * @Brief: Loads the world map in the main vis
 *
 **/
var loadWorldMap = function (data) {
    console.log(data);
}


/**
 * getWorldMap()
 *
 * @Brief: Gets the data for the world map
 *
 **/
var getWorldMap = function () {

    var params = new Object();
    params["json"] = "onlineNow";
    runBlockchainQuery("nodes-globe", params, loadWorldMap)
}

var runBlockchainQuery = function (endpoint, params, callback) {
    console.log("Running runBlockchainQuery");

    var BLOCKCHAIN_API_BASE = "https://blockchain.info/";
    var url = BLOCKCHAIN_API_BASE + endpoint;

    if (Object.size(params) > 0) {
        url += "?";
        for (var key in params) {
            url += key + "=" + params[key];
        }
    }

    console.log(url);

    //xhr = new XMLHttpRequest();
    //xhr.open('GET', "http://www.bitcoinglobe.com/bitcoin.json", true);
    //xhr.onreadystatechange = function(e) {
    //    if (xhr.readyState === 4) {
    //        if (xhr.status === 200) {
    //            var data = JSON.parse(xhr.responseText);

    //            console.log(data);
    //            //window.data = data;
    //            //var i = 0;
    //            //for (i = 0; i < data.length; i++) {
    //            //    globe.addData(data[i][1], {
    //            //        format : 'magnitude',
    //            //        name : data[i][0],
    //            //        animated : true
    //            //    });
    //            //}
    //            //new TWEEN.Tween(globe).to({time: 0},500).easing(TWEEN.Easing.Cubic.EaseOut).start();

    //            //globe.createPoints();
    //            //globe.animate();
    //        }
    //    }
    //};
    
    //xhr.send(null);


    //$.get(url, function (data, status) {

    //    // check status, then make callback
    //    if (status == "success") {
    //        callback(data);
    //    }
    //    else {
    //        // if fails, then debug
    //    }
    //}, "jsonp");

    $.ajax({
        url: url + "&cors=true",
        async: false,
        jsonpCallback: 'getdata',
        dataType: 'jsonp',
        success: function (data, status) {

            // check status, then update data if status == success 200
            if (status == "success") {
                console.log(data);
             
            }

        }

    });
}


var createMainVisual = function () {

    // Add the X Axis to the main vis
    main_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (main_vis.h - margin.bottom) + ")")
        .call(x_axis_main);

    // Add the Y Axis to the main vis
    main_g.append("g")
        .attr("class", "y axis")
        .call(y_axis_main);

    // Add the axis label for the y axis
    main_svg.append("text")
       .attr("class", "axis-label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0)
       .attr("x", 0 - (main_vis.h / 2) - main_vis.y)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Price ($)");

    main_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(" + ((main_vis.w + main_vis.x) / 2) + " ," + (main_vis.h + main_vis.y * 3) + ")")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Year");

    main_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(" + ((main_vis.w + main_vis.x) / 2) + " ," + 0 + ")")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Price of Bitcoin Over Time");
}

var createVolumeVisual = function () {

    // Add the X Axis to the detail vis
    detail_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (detail_vis.h - margin.bottom) + ")")
        .call(x_axis_detail);

    // Add the Y Axis to the main vis
    detail_g.append("g")
        .attr("class", "y axis")
        .call(y_axis_detail);

    // Add the axis label for the y axis
    detail_svg.append("text")
       .attr("class", "axis-label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0)
       .attr("x", 0 - (detail_vis.h / 2) - detail_vis.y)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Volume (BTC)");

    detail_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "translate(" + ((detail_vis.w + detail_vis.x) / 2) + " ," + (detail_vis.h + detail_vis.y * 3) + ")")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Year");
}

/**
 * loadTopTenCurrencies(data)
 *
 * @Brief: Loads a bar-chart that displays top 10 currencies by volume
 *
 * @param[in]: data JS array that contains all the currencies
 * @post: creates bar-chart visualization
 * @post: invalidates previous x_axis_main/y_axis_main and x_scale_main/y_scale_main
 **/
var loadTopTenCurrencies = function (data) {

    // Debug if no data was returned
    if (!data) {
        return;
    }

    var dataGroup = main_g.selectAll(".dataGroup");
    var dots = dataGroup.selectAll(".dataPoint");
    dots.remove();
    dataGroup.selectAll("path").remove();
    main_g.selectAll('rect').remove();

    // parse out the values and store as floats
    data.forEach(function (d, i) {
        d.volume_btc = parseFloat(d.volume_btc);
    });

    // Sort the data by volume
    data.sort(function (a, b) {
        return b.volume_btc - a.volume_btc;
    })

    // grab our necessary data by reference.
    var start_index = 0; end_index = 9;
    var data_ten = [];
    for (var i = start_index; i <= end_index; ++i) {
        data_ten[i - start_index] = data[i];
    }

    console.log(data_ten);

    // update the x_main_scale and y_main_scale
    x_scale_main.domain([data_ten[0].id, data_ten[9].id]);
    y_scale_main.domain([data_ten[0].volume_btc, data_ten[9].volume_btc]);

    // Update the X and Y axis for main vis
    main_svg.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_svg.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var barWidth = width / data_ten.length;

    var bar = main_svg.selectAll(".bars")
        .data(data_ten)
        .enter().append("a")
        .attr("transform", function (d, i) { return "translate(" + i * barWidth + ",0)"; });

    bar.append("rect")
        .attr("y", function (d) { return y_scale_main(d.volume_btc); })
        .attr("height", function (d) { return main_vis.h - margin.bottom - y_scale_main(d.volume_btc); })
        .attr("width", barWidth - 1)
        .attr("fill", "steelblue")
        .on("mouseover", function (d, i) {

            // if it has a data, then display the data using a tooltip
            main_tooltip.html("<b>" + d.name + " (" + d.id + ")</b><br>Trading Price (" + d.id + "/BTC): " + d.price_btc + "<br>Trading Volumn (BTC/day): " + d.volume_btc);
            return main_tooltip.style("visibility", "visible");

        })
        .on("mousemove", function (d) { return main_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
        .on("mouseout", function (d) { return main_tooltip.style("visibility", "hidden"); });

    bar.append("text")
        .attr("x", barWidth / 3)
        .attr("y", function (d) { return main_vis.h - margin.bottom + 3; }) // slightly below the axis
        .attr("dy", ".75em")
        .text(function (d) { return d.name; })
        .on("mouseover", function (d, i) {

            // if it has a data, then display the data using a tooltip
            main_tooltip.html("<b>" + d.name + " (" + d.id + ")</b><br>Trading Price (" + d.id + "/BTC): " + d.price_btc + "<br>Trading Velocity (BTC/day): " + d.volume_btc);
            return main_tooltip.style("visibility", "visible");

        })
        .on("mousemove", function (d) { return main_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
        .on("mouseout", function (d) { return main_tooltip.style("visibility", "hidden"); });
}

/**
 * runCryptocoinchartsQuery(endpoint, params, callback)
 * 
 * @Brief: Makes API call to http://www.cryptocoincharts.info/v2/api/
 * @param[in]: endpoint is the endpoint to call
 * @param[in]: params is a dictionary of the GET params
 * @param[in]: callback is a function to call when request returns
 * @post: makes synchronous API call then calls callback fx on return
 **/
var runCryptocoinchartsQuery = function (endpoint, params, callback) {

    console.log("Running runCryptocoinchartsQuery");
    $.get("http://www.cryptocoincharts.info/v2/api/" + endpoint, function (data, status) {

        // check status, then make callback
        if (status == "success") {
            callback(data);
        }
        else {
            // if fails, then debug
        }
    })

}


var updateGraphType = function (element) {
    
    var graph_type = element.attr("id");

    // update GraphType based on ids
    if (graph_type.localeCompare("line-graph") == 0) {
        loadBTCLineGraph();
    }
    else if (graph_type.localeCompare("lineo-graph") == 0) {
        loadBTCLineoGraph();
    }
    else if (graph_type.localeCompare("candlestick-graph") == 0) {
        loadBTCCandlestickGraph();

    } 
}
/** 
 * EXECUTION CODE
 **/

$(document).ready(function () {
    $('.graph-type').click(function () {
        updateGraphType($(this));
    })

    $('#topTen').click(function () {
        runCryptocoinchartsQuery("listCoins", {}, loadTopTenCurrencies);
    })

    main();
});