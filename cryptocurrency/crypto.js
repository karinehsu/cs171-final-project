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
    h: main_vis.h / 3

};

var mini_vis = {
    x: main_vis.x,
    y: main_vis.y,
    w: main_vis.w,
    h: main_vis.h / 4
};

// main canvas for our visualization
var main_svg = d3.select("#main_vis").append("svg").attr({
    width: main_vis.w + margin.left + margin.right,
    height: main_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "main_svg").attr("viewBox", "0 0 " + (main_vis.w + margin.left + margin.right) + " " + (main_vis.h + margin.top + margin.bottom));

var detail_svg = d3.select("#detail_vis").append("svg").attr({
    width: detail_vis.w + margin.left + margin.right,
    height: detail_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "detail_svg").attr("viewBox", "0 0 " + (detail_vis.w + margin.left + margin.right) + " " + (detail_vis.h + margin.top + margin.bottom));

var mini_svg = d3.select("#mini_vis").append("svg").attr({
    width: mini_vis.w + margin.left + margin.right,
    height: mini_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "mini_svg").attr("viewBox", "0 0 " + (mini_vis.w + margin.left + margin.right) + " " + (mini_vis.h + margin.top + margin.bottom));

// Set up the area for the detailed graph, also make sure its clipped
main_svg.append("defs").append("clipPath")
    .attr("id", "main_clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

/* Set up clip paths */
detail_svg.append("defs").append("clipPath")
    .attr("id", "detail_clip")
    .append("rect")
    .attr("x", detail_vis.x)
    .attr("width", detail_vis.w)
    .attr("height", detail_vis.h);

// Set up the area for the detailed graph, also make sure its clipped
mini_svg.append("defs").append("clipPath")
    .attr("id", "mini_clip")
    .append("rect")
    .attr("width", mini_vis.w)
    .attr("height", mini_vis.h);

/* Set up dynamically sized visuals */
var svg = $("#main_svg");
var d_svg = $("#detail_svg");
var m_svg = $("#mini_svg");

var main_aspect = svg.width() / svg.height();
var main_container = svg.parent();
var d_aspect = d_svg.width() / d_svg.height();
var d_container = d_svg.parent();
var mini_aspect = m_svg.width() / m_svg.height();
var mini_container = m_svg.parent();

$(window).on("resize", function () {
    var mainWidth = main_container.width();
    var dWidth = d_container.width();
    var mWidth = mini_container.width();

    svg.attr("width", mainWidth);
    svg.attr("height", Math.round(mainWidth / main_aspect));
    d_svg.attr("width", dWidth);
    d_svg.attr("height", Math.round(dWidth / d_aspect));
    m_svg.attr("width", mWidth);
    m_svg.attr("height", Math.round(mWidth / mini_aspect));


}).trigger("resize");


/* Set up main g's */
var main_g = main_svg.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

var detail_g = detail_svg.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

var mini_g = mini_svg.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

// tool tip for main
var main_tooltip = d3.select("body")
	.append("div")
    .attr("class", "tooltip1")
	.style("position", "absolute")
	.style("z-index", "10000000000000000000")
	.style("visibility", "hidden");

// Time scale to brush
var x_scale_mini = d3.scale.linear().domain([0, 1]).range([0, mini_vis.w]);
var y_scale_mini = d3.scale.linear().domain([0, 1]).range([mini_vis.h - margin.bottom, 0]);

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

// Axis should default orientation to bottom and left
var x_axis_mini = d3.svg.axis().scale(x_scale_mini).orient("bottom");
var y_axis_mini = d3.svg.axis().scale(y_scale_mini).orient("left");

var detail_time_scale = d3.time.scale().domain([0, 1]).range([0, 1]);

/**
 * CACHE DATA SETS
 **/
var BTC_ALL = [];
var BTC_CROPPED = [];
var EVENTS_ALL = [];
var EVENTS_CROPPED = [];

// CURRENTLY selected mode
var BTC_CURRENT = [];
var EVENTS_CURRENT = [];
var EVENTS_NAMES = [];
var CURRENT_LINE;

var DATE_HASH = {};


// default to average
var CURRENT_ATTRIBUTE = function (d) {
    return d.average;
}


/* Brush feature */
var brush;
var detailArea;
var line;
var average_line;
var transaction_line;
var unique_addresses_line;
var total_volume_line;
var usd_volume_line;
var transactions_line;


var brushed = function()  {

    var brush_extent = brush.extent();
    var time_diff = Math.abs(brush_extent[0].getTime() - brush_extent[1].getTime());
    if (time_diff <= 127998613) {
        return;
    }

    // update main vis and detail vis
    x_scale_main.domain(brush.empty() ? x_scale_mini.domain() : brush_extent);
    x_scale_detail.domain(brush.empty() ? x_scale_mini.domain() : brush_extent);

    // update the main vis line
    main_g.select(".dataLine").attr({
        "d": CURRENT_LINE(BTC_ALL),
    });
    main_g.selectAll(".x").call(x_axis_main);

    // update main vis dots
    var dots = main_g.selectAll(".dataPoint").attr({
        "cx": function (d) { return x_scale_main(d.date); },
        "cy": function (d) { return y_scale_main(CURRENT_ATTRIBUTE(d)); }
    });

    // update the detail vis bars
    detail_g.selectAll(".x").call(x_axis_detail);
    var oneDay = 24 * 60 * 60 * 1000;
    var bar_width = (detail_vis.w - 2 * detail_vis.x) / (Math.round(time_diff) / (oneDay));
    detail_svg.selectAll(".detailRect")
    .attr("x", function (d) {
        return x_scale_detail(d.date) + detail_vis.x;

    })
    .attr("width", function (d) {
        return bar_width;
    });

}

var color = d3.scale.category10();

/**
 * Object methods
 **/
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

}

var updateEventsOnGraph = function (selected_event) {

    // upon click of event, brushing happens and  detail_vis of transaction volume shown
    console.log(selected_event);

    var index = EVENTS_NAMES.indexOf(selected_event.innerHTML);
    var eventObject = EVENTS_CURRENT[index];

    var correspondingIndex = DATE_HASH[eventObject.startDate];
    console.log(correspondingIndex);
    var d = BTC_CURRENT[correspondingIndex];
    console.log(d);

    $("#right-bar-title").html(eventObject.headline);
    $("#right-bar-subtitle").html(eventObject.startDate);
    $("#right-bar-description").html(eventObject.text + "<br><br>" + "All Transactions: " + d.transactions_all + "<br>Date: " + d.date + "<br>Average: " + d.average + "<br>Volume: " + d.total_volume + "<br>Unique Addresses: " + d.unique_addresses + "<br>Volume in USD: " + d.usd_volume + "<br>Transactions (mins top 100 traders): " + d.transactions);

    


    // generate upper and lowerbound
    var lbound = d3.time.month.offset(eventObject.startDate, -1);
    var ubound = d3.time.month.offset(eventObject.startDate, 1);

    // create brushing range
    brush.extent([lbound, ubound]);
    mini_svg.selectAll(".brush").call(brush);
    brushed();
    
    
}

var loadLeftPanel = function () {

    d3.json("../data/btc-events.json", function (data) {

        // cache the events
        EVENTS_ALL = data.events;

        var parseDate = d3.time.format("%Y,%m,%d").parse;
        var event_headers = '';

        var jan2013 = parseDate("2013,01,01");
        var now2014 = parseDate("2014,04,29");

        EVENTS_NAMES = [];

        EVENTS_ALL.forEach(function (d) {

            d.startDate = parseDate(d.startDate);

            if (d.startDate > jan2013 && d.startDate < now2014) {
                EVENTS_CROPPED.push(d);
                EVENTS_NAMES.push(d.headline);
                event_headers += '<li><a href="#" class="event">' + d.headline + '</a></li>';
            }
            
        });

        EVENTS_CURRENT = EVENTS_CROPPED;

        d3.select("#events-list").html(event_headers);

        $('.event').click(function () {
            updateEventsOnGraph(this);
            
            //$("#right-bar-subtitle").html("<h3>By Alex Liu and Karine Hsu</h3>");
    
        });
    })

}

// var updateEventsOnRight = function (selected_event) {

//    //console.log(eventObject, eventObject.headline, eventObject.startDate, eventObject.text);
//    $("#right-bar-title").html(eventObject);
//    $("#right-bar-subtitle").html("<h3>By Alex Liu and Karine Hsu</h3>");
    
    
// }


var loadRightPanel = function () {
    $("#right-bar-title").html("<h1>Welcome to Bitcoin Explorer!</h1>");
    $("#right-bar-subtitle").html("<h3>By Alex Liu and Karine Hsu</h3>");
    $("#right-bar-description").html("<b>Instructions:</b><br><li>Draw a rectangle over top visualization to specify time range to zoom in (see brushing and linking in action!)</li><br><li>View different graph types by choosing graph type under Line Graph Dropdown</li><br> <li>Select an event under Events Dropdown and see automatic zoom on graph and details on right-hand side</li> <br><li>Hover over specific data points for more details</li><br><li>Toggle buttons on and off to see relationships between different components of Bitcoin</li>");

}

var loadHistoricalBTCPrices = function () {

    d3.csv("../data/chart-data.csv", function (data) {

        
        var parseDate = d3.time.format("%m/%d/%Y").parse;

        var jan2013 = parseDate("01/01/2013");
        var now2014 = parseDate("04/29/2014");

        data.forEach(function (d) {
            d.date = parseDate(d.date);
            d.average = parseFloat(d.average);
            d.total_volume = parseFloat(d.total_volume);
            d.transactions_all = parseFloat(d.transactions_all);
            d.unique_addresses = parseFloat(d.unique_addresses);
            d.usd_volume = parseFloat(d.usd_volume);
            d.transactions = parseFloat(d.transactions);

            if (d.date > jan2013 && d.date < now2014) {
                
                DATE_HASH[d.date] = BTC_CROPPED.length;
                BTC_CROPPED.push(d);
                
            }
        });

        BTC_ALL = data;
        BTC_CURRENT = BTC_CROPPED;

        // create mini-visual for brushing
        createMiniVisual();
        loadMiniVisual();

        // create main visual on the page
        createMainVisual();
        loadBTCLineoGraph();

        // create volume visual on the bottom
        createVolumeVisual();
        loadBTCVolumeGraph();
    });
}

var createMiniVisual = function () {

    // Add the X Axis to the mini vis
    mini_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (mini_vis.h - margin.bottom) + ")")
        .call(x_axis_mini);

}

var loadMiniVisual = function () {

    var time_extent = d3.extent(BTC_CURRENT, function (d) { return d.date; });
    var height_extent = d3.extent(BTC_CURRENT, function (d) { return CURRENT_ATTRIBUTE(d); });

    x_scale_mini = d3.time.scale().domain(time_extent).range([0, mini_vis.w]);
    y_scale_mini.domain(height_extent);
    x_axis_mini.scale(x_scale_mini);

    brush = d3.svg.brush().x(x_scale_mini).on("brush", brushed);

    line = d3.svg.line()
        .interpolate("monotone")
        .x(function (d) { return x_scale_mini(d.date); })
        .y(function (d) {
            return y_scale_mini(CURRENT_ATTRIBUTE(d));
        });

    // Update the X and Y axis for main vis
    mini_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_mini);
    mini_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_mini);

    var dataGroup = mini_g.selectAll(".dataGroup");

    // Add the graph if it's not already added to the visual
    if (dataGroup < 1) {
        dataGroup = mini_g.append("g").attr({
            "class": "dataGroup"
        });
    }
    
    // Add the line if it's not already added to the visual
    if (dataGroup.selectAll("path") < 1) {
        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {
        // else just update the graph
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }

    // Add the brush
    var bEl = mini_svg.append("g").attr({
        class: "brush",
        transform: "translate(" + mini_vis.x + ",0)"
    }).call(brush);
    bEl.selectAll("rect")
        .attr({
            height: mini_vis.h,
            transform: "translate(0,0)"
        });

    detailArea = d3.svg.area()
        .x(function (d) { return x_scale_main(d.date); })
        .y0(main_vis.h)
        .y1(function (d) { return x_scale_main(CURRENT_ATTRIBUTE(d)); });

}

var loadBTCLineGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.average;
    }

    var time_extent = d3.extent(BTC_CURRENT, function (d) { return d.date; });
    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.average; });

    x_scale_main = d3.time.scale().domain(time_extent).range([0, main_vis.w]);
    y_scale_main.domain(height_extent);
    x_axis_main.scale(x_scale_main);

    if (!average_line) {
        average_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                return y_scale_main(d.average);
            });
    }

    CURRENT_LINE = average_line;

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {
        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": average_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": average_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

        var dots = dataGroup.selectAll(".dataPoint");
        dots.attr("r", 0);
    }

}

var loadBTCLineoGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.average;
    }

    var time_extent = d3.extent(BTC_CURRENT, function (d) { return d.date; });
    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.average; });

    x_scale_main = d3.time.scale().domain(time_extent).range([0, main_vis.w]);
    y_scale_main.domain(height_extent);
    x_axis_main.scale(x_scale_main);

    if (!average_line) {
        average_line = d3.svg.line()
        .interpolate("monotone")
        .x(function (d) { return x_scale_main(d.date); })
        .y(function (d) {
            return y_scale_main(d.average);
        });
    }

    CURRENT_LINE = average_line;

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    main_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_main);

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {
        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": average_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": average_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        console.log("new dots");
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.average); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.average < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].average) {
                return "green";
            }
            else {
                return "red";
            }
        })
        .on("mouseover", function (d, i) {

            // if it has a data, then display the data using a tooltip
            main_tooltip.html("All Transactions: " + d.transactions_all + "<br>Date: " + d.date + "<br>Average: " + d.average + "<br>Volume: " + d.total_volume + "<br>Unique Addresses: " + d.unique_addresses + "<br>Volume in USD: " + d.usd_volume + "<br>Transactions (mins top 100 traders): " + d.transactions );
            return main_tooltip.style("visibility", "visible");

        })
        .on("mousemove", function (d) { return main_tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
        .on("mouseout", function (d) { return main_tooltip.style("visibility", "hidden"); });
        
    }
    else {

        console.log("old dots");
        console.log(dots.selectAll("circle"));
        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.average); },
            "r": 2,
        });
    }



}

var loadTransactionGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.transactions_all;
    }

    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.transactions_all; });
    y_scale_main.domain(height_extent);

    if (!transaction_line){
        transaction_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                    return y_scale_main(d.transactions_all);
            });
    }

    CURRENT_LINE = transaction_line;

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);
    d3.select(".main.y.axis-label")
        .text("Transactions");

    var dataGroup = main_g.selectAll(".dataGroup");
    dataGroup.selectAll("path").attr({
        "class": "dataLine",
        "d": transaction_line(BTC_CURRENT),
    }).style("stroke", "lightsteelblue");

    var dots = dataGroup.selectAll(".dataPoint");
    if (dots < 1) {
        console.log("new dots");
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.transactions_all); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.transactions_all < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].transactions_all) {
                return "green";
            }
            else {
                return "red";
            }
        });
        
    }
    else {
        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.transactions_all); },
            "r": 2,
        });
    }


}

var loadUniqueAddressesGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.unique_addresses;
    }

    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.unique_addresses; });
    y_scale_main.domain(height_extent);

    if (!unique_addresses_line){
        unique_addresses_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                    return y_scale_main(d.unique_addresses);
            });
    }
    
    CURRENT_LINE = unique_addresses_line;

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);

    d3.select(".main.y.axis-label")
        .text("Unique Addresses");

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {

        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": unique_addresses_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": unique_addresses_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.unique_addresses); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.unique_addresses < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].unique_addresses) {
                return "green";
            }
            else {
                return "red";
            }
        })
    }
    else {

        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.unique_addresses); },
            "r": 2,
        });
    }


}

var loadUSDVolumeGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.usd_volume;
    }

    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.usd_volume; });
    y_scale_main.domain(height_extent);

    console.log(height_extent);

    if (!usd_volume_line){
        usd_volume_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                    return y_scale_main(d.usd_volume);
            });
    }

    CURRENT_LINE = usd_volume_line;    

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);

    d3.select(".main.y.axis-label")
        .text("Total Volume in USD");

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {

        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": usd_volume_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": usd_volume_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        console.log("new dots");
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.usd_volume); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.usd_volume < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].usd_volume) {
                return "green";
            }
            else {
                return "red";
            }
        })
    }
    else {

        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.usd_volume); },
            "r": 2,
        });
    }


}

var loadTransactionsGraph = function () {

    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.transactions;
    }

    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.transactions; });
    y_scale_main.domain(height_extent);

    console.log(height_extent);

    if (!transactions_line){
        transactions_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                    return y_scale_main(d.transactions);
            });
    }

    CURRENT_LINE = transactions_line;
    

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);

    d3.select(".main.y.axis-label")
        .text("Total Volume");

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {

        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": transactions_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        console.log("old line");

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": transactions_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        console.log("new dots");
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.transactions); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.transactions < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].transactions) {
                return "green";
            }
            else {
                return "red";
            }
        });
    }
    else {

        console.log("old dots");
        console.log(dots.selectAll("circle"));

        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.transactions); },
            "r": 2,
        });
    }


}

var loadTotalVolumeGraph = function () {
    
    // update functor to grab the average
    CURRENT_ATTRIBUTE = function (d) {
        return d.total_volume;
    }

    var height_extent = d3.extent(BTC_CURRENT, function (d) { return d.total_volume; });
    y_scale_main.domain(height_extent);

    console.log(height_extent);

    if (!total_volume_line){
        total_volume_line = d3.svg.line()
            .interpolate("monotone")
            .x(function (d) { return x_scale_main(d.date); })
            .y(function (d) {
                    return y_scale_main(d.total_volume);
            });
    }

    CURRENT_LINE = total_volume_line;    

    // Update the X and Y axis for main vis
    main_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_main);

    d3.select(".main.y.axis-label")
        .text("Total Volume");

    var dataGroup = main_g.selectAll(".dataGroup");

    if (dataGroup < 1) {
        // if we didn't already have the graph
        dataGroup = main_g.append("g").attr({
            "class": "dataGroup"
        });
    }

    if (dataGroup.selectAll("path") < 1) {

        dataGroup.append("svg:path").attr({
            "class": "dataLine",
            "d": total_volume_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");
    }
    else {

        // else just update
        dataGroup.selectAll("path").attr({
            "class": "dataLine",
            "d": total_volume_line(BTC_CURRENT),
        }).style("stroke", "lightsteelblue");

    }

    var dots = dataGroup.selectAll(".dataPoint");

    if (dots < 1) {
        // Add the dots if never put on before
        dots.data(BTC_CURRENT).enter().append("circle").attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.total_volume); },
            "r": 2,
            "class": "dataPoint",
        }).style("fill", function (d) {
            if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.total_volume < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].total_volume) {
                return "green";
            }
            else {
                return "red";
            }
        });
    }
    else {

        dots.attr({
            "cx": function (d) { return x_scale_main(d.date); },
            "cy": function (d) { return y_scale_main(d.total_volume); },
            "r": 2,
        });
    }


}
var loadBTCVolumeGraph = function () {

    x_scale_detail = d3.time.scale().domain(d3.extent(BTC_CURRENT, function (d) { return d.date; })).range([0, main_vis.w]);
    y_scale_detail.domain(d3.extent(BTC_CURRENT, function (d) { return d.total_volume; }));

    x_axis_detail.scale(x_scale_detail);

    x_axis_detail.ticks(5);
    var bar_width = 0.5 * (detail_vis.w - 2 * detail_vis.x) / BTC_CURRENT.length;

    // Update the X and Y axis for main vis
    detail_g.selectAll(".y")
        .style("visibility", "visible")
        .call(y_axis_detail);
    detail_g.selectAll(".x")
        .style("visibility", "visible")
        .call(x_axis_detail);

    var rects = detail_svg.selectAll("rect");

    detail_svg.selectAll("rect")
    .data(BTC_CURRENT)
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
        return bar_width;
    })
    .attr("fill", function (d) {
        if (BTC_CURRENT.indexOf(d) == BTC_CURRENT.length - 1 || d.average < BTC_CURRENT[BTC_CURRENT.indexOf(d) + 1].average) {
            return "green";
        }
        else {
            return "red";
        }
        
    })
    .attr("class", "detailRect");
    
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
       .attr("class", "main y axis-label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0)
       .attr("x", 0 - (main_vis.h / 2) - main_vis.y)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Price ($)");

    main_svg.append("text")
        .attr("class", "main x axis-label")
        .attr("transform", "translate(" + ((main_vis.w + main_vis.x) / 2) + " ," + (main_vis.h + main_vis.y * 3) + ")")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Year");

    main_svg.append("text")
        .attr("class", "main axis-label")
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
       .attr("class", "detail axis-label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0)
       .attr("x", 0 - (detail_vis.h / 2) - detail_vis.y)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Volume (BTC)");

    detail_svg.append("text")
        .attr("class", "detail axis-label")
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
    var graph_type_text = element.attr("id");
    console.log(graph_type_text);

    brush.extent([0,0]);
    mini_svg.selectAll(".brush").call(brush);

    // update GraphType based on ids
    if (graph_type.localeCompare("lineo-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadBTCLineoGraph();
    }
    else if (graph_type.localeCompare("line-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadBTCLineGraph();
    }

    else if (graph_type.localeCompare("transaction-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadTransactionGraph();
    }
    else if (graph_type.localeCompare("unique-addresses-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadUniqueAddressesGraph();
    }
    else if (graph_type.localeCompare("total-volume-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadTotalVolumeGraph();
    }
    else if (graph_type.localeCompare("usd-volume-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadUSDVolumeGraph();
    }
    else if (graph_type.localeCompare("transactions-graph") == 0) {
        d3.select("#graph-type-btn").text(graph_type_text);
        loadTransactionsGraph();
    }
    else {
        return;
    }

    loadMiniVisual();
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