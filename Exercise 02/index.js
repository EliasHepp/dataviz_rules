/**
 * IMPORTANT NOTICE:
 * 
 * The data is provided by the data.js file.
 * Make sure the data.js file is loaded before the index.js file, so that you can access it here!
 * The data is provided in an array called: data
 * const data = [
    { id: 1001, state: "Alabama", county: "Autauga County", rate: 5.1 },
        ....
 ];**/

//const data = require("./data.js")

// Constants
const width = 700;
const height = 500;
const margin = { left: 50, right: 20, bottom: 50 };

// Task 1.1: Data Preprocessing
// This task ensures that all data values are within a logical range.
function preprocessData(data) {
    // Use filter to remove entries with rates outside the valid range (0 to 100)
    let cleanedData = data.filter(entry => entry.rate >= 0 && entry.rate <= 100);
    return cleanedData;
}


// Setting up the histogram visualization using the processed data.
//function createHistogram(processedData, numbins) {
    // Task 1.2: Create equal-width bins for the histogram
    // This subtask groups the data into a specified number of bins based on the unemployment rate.
    // Hint: look at the binning function of d3.bin https://observablehq.com/@d3/d3-bin
    // Your code here

    // Task 2.1: Create Histogram with Equal Width Binning
    // Create a linear x- and y-scale
    // The x-scale maps unemployment rates to pixel values for the width of the histogram.
    // Your code here
    // The y-scale maps the count of entries in each bin to pixel values for the height of the bars.
    // Your code here

    // Bind the bins data to rectangles in the SVG
    // This subtask manages the rectangles that represent the bars of the histogram.
    // Your code here

    // Enter and update phase for rectangles
    // Rectangles are added or updated based on the data. This subtask also defines the bar dimensions.
    // Your code here

    // Add axes to the histogram
    // This subtask adds horizontal and vertical axes to the chart, with appropriate labels and scaling.
    // Your code here

//}
function createHistogram(processedData, numbins) {
    // Select the SVG element
    const svg = d3.select("#chart");

    // Get SVG dimensions
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    // Task 1.2: Create equal-width bins for the histogram
    // This subtask groups the data into a specified number of bins based on the unemployment rate.
    // Hint: look at the binning function of d3.bin https://observablehq.com/@d3/d3-bin
    const binsGenerator = d3.bin()
        .value(d => d.rate)
        .domain([0, d3.max(processedData, d => d.rate)]) // Domain from 0 to maximum unemployment rate
        .thresholds(numbins);

    const bins = binsGenerator(processedData);

    // Task 2.1: Create Histogram with Equal Width Binning
    // Create a linear x- and y-scale
    // The x-scale maps unemployment rates to pixel values for the width of the histogram.
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.rate)]) // Domain from 0 to maximum unemployment rate
        .range([0, width]); // Adjust width as needed for your visualization

    // The y-scale maps the count of entries in each bin to pixel values for the height of the bars.
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]) // Domain from 0 to maximum count of entries in a bin
        .range([height, 0]); // Adjust height as needed for your visualization

    // Add x-axis
    const xAxis = d3.axisBottom(xScale);
    svg.select("#xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add y-axis
    const yAxis = d3.axisLeft(yScale);
    svg.select("#yaxis")
        .call(yAxis);

    // Bind the bins data to rectangles in the SVG
    const bars = svg.selectAll("rect")
        .data(bins);

    // Enter and update phase for rectangles
    // Rectangles are added or updated based on the data. This subtask also defines the bar dimensions.
    bars.enter()
        .append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0))
        .attr("height", d => height - yScale(d.length))
        .attr("fill", "steelblue");
}


// Execute the preprocessing and create the histogram
const processedData = preprocessData(data);
createHistogram(processedData, 20);
