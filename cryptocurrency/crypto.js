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
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1280 - margin.left - margin.right;
var height = 250 - margin.bottom - margin.top;

// main_vis size attributes
var main_vis = {
    x: 100,
    y: 10,
    w: width - 2 * 100,
    h: height - 2 * 10
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
 * @post: invalidates previous x_axis/y_axis and x_scale/y_scale
 **/
var loadTopTenCurrencies = function (data) {

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

    console.log("Running");
    $.get("http://www.cryptocoincharts.info/v2/api/" + endpoint, function (data, status) {
        console.log(data);

        // check status, then make callback
        if (status == "success") {
            callback(data);
        }
        else {
            // if fails, then debug
        }
    })

}





