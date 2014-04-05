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
    left: 75
};

var width = 1080 - margin.left - margin.right;
var height = 300 - margin.bottom - margin.top;

// main_vis size attributes
var main_vis = {
    x: 100,
    y: 10,
    w: width,
    h: height
};

// main canvas for our visualization
var main_canvas = d3.select("#main_vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
})

// append a svg
var main_svg = main_canvas.append("g").attr({
        transform: "translate(" + 0 + "," + 0 + ")"
    })
    .append("g")
    .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
});

// Default domains for x_scale_main and y_scale_main.  
// Ranges should take up the entirety of the vis
var x_scale_main = d3.scale.linear().domain([0, 1]).range([0, main_vis.w]);
var y_scale_main = d3.scale.linear().domain([0, 1]).range([0, main_vis.h]);

// Axis should default orientation to bottom and left
var x_axis_main = d3.svg.axis().scale(x_scale_main).orient("bottom");
var y_axis_main = d3.svg.axis().scale(y_scale_main).orient("left");

/**
 * main()
 *
 * @Brief: Serves as main() function, will be run at start of script.
 *       You should add ALL pipeline code here to be run at loadtime.
 **/
var main = function () {
    
    // Landing page should be a bar chart of top 10 most
    // actively-traded cryptocurrencies by volume
    runCryptocoinchartsQuery("listCoins", {}, loadTopTenCurrencies);


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

    // Add the X Axis
    main_svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis_main);

    // Add the Y Axis
    main_svg.append("g")
        .attr("class", "y axis")
        .call(y_axis_main);

    var barWidth = width / data_ten.length;

    var bar = main_svg.selectAll(".bars")
        .data(data_ten)
        .enter().append("a")
        .attr("transform", function (d, i) { return "translate(" + i * barWidth + ",0)"; });

    bar.append("rect")
        .attr("y", function (d) { return y_scale_main(d.volume_btc); })
        .attr("height", function (d) { return main_vis.h - y_scale_main(d.volume_btc); })
        .attr("width", barWidth - 1)
        .attr("fill", "lightsteelblue");

    bar.append("text")
        .attr("x", barWidth / 2)
        .attr("y", function (d) { return main_vis.h + 3; }) // slightly below the axis
        .attr("dy", ".75em")
        .text(function (d) { return d.id; });

    //var bars = main_svg.selectAll("rect")
    //    .data(data_ten)
    //    .enter()
    //    .append("rect")
    //    .attr("x", function (d, i) {
    //        return (main_vis.w / 10) * i;
    //    })
    //    .attr("y", function (d, i) {
    //        return y_scale_main(d.volume_btc);;
    //    })
    //    .attr("width", function (d, i) {
    //        return main_vis.w / 10;
    //    })
    //    .attr("height", function (d, i) {
    //        return main_vis.h - y_scale_main(d.volume_btc);
    //    })
    //    .attr("fill", "lightsteelblue");

    //main_svg.selectAll("text")
    //    .data(data_ten)
    //    .enter()
    //    .append("text")
    //    .attr("x", function (d, i) {
    //        console.log(d);
    //        return (main_vis.w / 10) * i;
    //    })
    //    .attr("y", function (d, i) {
    //        return y_scale_main(d.volume_btc);
    //    })
    //    .attr("dy", ".75em")
    //    .text(function (d) { return d.id; });
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

/** 
 * EXECUTION CODE
 **/
main();




