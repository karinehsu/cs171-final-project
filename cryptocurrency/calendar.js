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
    right: 25,
    bottom: 25,
    left: 25
};

var canvas_width = parseInt(d3.select("#main_vis").style("width"), 10);
var width = canvas_width - margin.left - margin.right;
var height = 500 - margin.bottom - margin.top;


// main_vis size attributes
var main_vis = {
    x: 100,
    y: 10,
    w: width,
    h: height
};

var mini_vis = {
    x: main_vis.x,
    y: main_vis.y,
    w: main_vis.w,
    h: main_vis.h / 6
};

// main canvas for our visualization
var main_svg = d3.select("#main_vis").append("svg").attr({
    width: main_vis.w + margin.left + margin.right,
    height: main_vis.h + margin.top + margin.bottom
}).attr("preserveAspectRatio", "xMidYMid").attr("id", "main_svg").attr("viewBox", "0 0 " + (main_vis.w + margin.left + margin.right) + " " + (main_vis.h + margin.top + margin.bottom)).attr("background-color", "#666");

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

// Set up the area for the detailed graph, also make sure its clipped
mini_svg.append("defs").append("clipPath")
    .attr("id", "mini_clip")
    .append("rect")
    .attr("width", mini_vis.w)
    .attr("height", mini_vis.h);

/* Set up dynamically sized visuals */
var svg = $("#main_svg");
var m_svg = $("#mini_svg");

var main_aspect = svg.width() / svg.height();
var main_container = svg.parent();
var mini_aspect = m_svg.width() / m_svg.height();
var mini_container = m_svg.parent();

$(window).on("resize", function () {
    var mainWidth = main_container.width();
    var mWidth = mini_container.width();

    svg.attr("width", mainWidth);
    svg.attr("height", Math.round(mainWidth / main_aspect));
    m_svg.attr("width", mWidth);
    m_svg.attr("height", Math.round(mWidth / mini_aspect));


}).trigger("resize");


/* Set up main g's */
var main_g = main_svg.append("g").attr({
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

// Axis should default orientation to bottom and left
var x_axis_main = d3.svg.axis().scale(x_scale_main).orient("bottom");
var y_axis_main = d3.svg.axis().scale(y_scale_main).orient("left");

// Axis should default orientation to bottom and left
var x_axis_mini = d3.svg.axis().scale(x_scale_mini).orient("bottom");
var y_axis_mini = d3.svg.axis().scale(y_scale_mini).orient("left");

var radius_scale = d3.scale.linear().domain([0, 1]).range([10, 150]);

/**
 * CACHE DATA SETS
 **/
var BTC_ALL = [];
var BTC_2013 = [];
var BTC_2013_JUNE = [];
var BTC_2014 = [];

var EVENTS_ALL = [];
var EVENTS_NAMES = [];
var EVENTS_2013 = [];
var EVENTS_2013_JUNE = [];
var EVENTS_2014 = [];

// CURRENTLY selected mode
var BTC_CURRENT = [];
var EVENTS_CURRENT = [];

var CURRENT_LINE;
var CURRENT_LINE2;

var DATE_HASH = {};
var EVENTS_HASH = {};

var isPlay = false;
var timelapse_speed = 1;

// default to average
var CURRENT_ATTRIBUTE = function (d) {
    return d.average;
}


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

var color = d3.scale.category10();

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
    console.log(index);

    // generate upper and lowerbound
    var lbound = d3.time.month.offset(EVENTS_CURRENT[index].startDate, -1);
    var ubound = d3.time.month.offset(EVENTS_CURRENT[index].startDate, 1);

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

        var dec2012 = parseDate("2012,12,01");
        var may2013 = parseDate("2012,05,01");
        var dec2013 = parseDate("2013,12,01");

        EVENTS_NAMES = [];

        EVENTS_ALL.forEach(function (d, i) {

            d.startDate = parseDate(d.startDate);

            if (d.startDate > dec2012) {
                EVENTS_HASH[d.startDate.toLocaleDateString("en-US")] = i;

                EVENTS_2013.push(d);

                if (d.startDate > may2013) {
                    EVENTS_2013_JUNE.push(d);
                }
                else if (d.startDate > dec2013) {
                    EVENTS_2014.push(d);
                }

                EVENTS_NAMES.push(d.headline);

                event_headers += '<li><a href="#" class="event">' + d.headline + '</a></li>';
            }

        });

        EVENTS_CURRENT = EVENTS_2013;

        d3.select("#events-list").html(event_headers);

        $('.event').click(function () {
            updateEventsOnGraph(this);
        });
    })

}

var loadRightPanel = function () {
    $("#right-bar-title").html("<h3>Bitcoin TimeLapse Visual!</h3>");
    $("#right-bar-subtitle").html("<h4>By Alex Liu and Karine Hsu</h4><br>");
    $("#right-bar-description").html("<b>Instructions:</b><br><li>Draw a rectangle over top visualization to specify time range to zoom in (see brushing and linking in action!)</li><br><li>View different graph types by choosing graph type under Line Graph Dropdown</li><br> <li>Select an event under Event Dropdown and see automatic zoom on graph</li> <br><li>Hover over or select specific data points for more details</li>");

}

var loadHistoricalBTCPrices = function () {

    d3.csv("../data/chart-data.csv", function (data) {

        var parseDate = d3.time.format("%m/%d/%Y").parse;

        var dec2012 = parseDate("12/01/2012");
        var now2014 = parseDate("04/29/2014");

        data.forEach(function (d, i) {
            d.date = parseDate(d.date);
            d.average = parseFloat(d.average);
            d.total_volume = parseFloat(d.total_volume);
            d.transactions_all = parseFloat(d.transactions_all);
            d.unique_addresses = parseFloat(d.unique_addresses);
            d.usd_volume = parseFloat(d.usd_volume);
            d.transactions = parseFloat(d.transactions);
            DATE_HASH[d.date.toLocaleDateString("en-US")] = i;
        });


        var dec2012 = parseDate("12/01/2012");

        BTC_ALL = data;
        BTC_2013 = BTC_ALL.filter(function (d) { return d.date > dec2012; });
        BTC_CURRENT = BTC_2013; 

        createMiniVisual();
        createMainVisual();
        loadMainForceVisual();

    });
}

var createMainVisual = function () {
    
}

var createMiniVisual = function () {

    var time_extent = d3.extent(BTC_CURRENT, function (d) { return d.date; });
    x_scale_mini= d3.time.scale().domain(time_extent).range([0, main_vis.w]);
    x_axis_mini.scale(x_scale_mini);

    // Add the X Axis to the mini vis
    mini_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)")
        .call(x_axis_mini);



}

var loadMainForceVisual = function () {

    radius_scale.domain(d3.extent(BTC_CURRENT, function (d) { return d.average; }));

    //var btc = { id: "btc" };

    //var nodes = [btc],
    // foci = [{ x: main_vis.w / 2, y: main_vis.h / 2 }];

    //var force = d3.layout.force()
    //    .nodes(nodes)
    //    .links([])
    //    .gravity(0)
    //    .size([main_vis.w, main_vis.h])
    //    .on("tick", tick);

    //var node = main_svg.selectAll("circle")
    //    .data(nodes)
    //    .enter().append("circle")
    //    .attr("class", "node")
    //    .attr("id", function (d) { return d.id })
    //    .attr("cx", main_vis.w / 2)
    //    .attr("cy", main_vis.h / 2)
    //    .attr("r", 0)
    //    .style("fill", function (d) { return color(d.id); })
    //    .style("stroke", function (d) { return d3.rgb(color(d.id)).darker(2); })
    //    .call(force.drag);

    //var counter = 0;
    //function tick(e) {

    //}

    //var si = setInterval(function () {
    //    force.start();
    //    counter += timelapse_speed;

    //    if (counter >= BTC_CURRENT.length) {
    //        clearInterval(si);
    //    }

    //    node = node.data(nodes);

    //    console.log(counter);
    //    node.attr("r", radius_scale(BTC_CURRENT[counter].average));
    //}, 100);

}

var playTimeLapse = function () {

    console.log("Time Lapse");

    var options;

    if (isPlay == false) { //not currently playing
        isPlay = true;
        console.log("play mode");
        options = {
            label: "pause",
            icons: {
                primary: "ui-icon-pause"
            }
        }; // its currently playing
    }
    else {
        isPlay = false;
        timeslider.slider("value", timeslider.slider("value") - 1);
        //  console.log("pause mode");
        options = {
            label: "play",
            icons: {
                primary: "ui-icon-play"
            }
        };
    }
    jQuery(this).button("option", options);
    //playSlider();

}

$(document).ready(function () {

    jQuery("#play").button({ text: false, icons: { primary: "ui-icon-play" } }).click(function () {
        playTimeLapse();
    });

    main();
});