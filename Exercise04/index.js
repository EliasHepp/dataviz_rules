/**
 * IMPORTANT NOTICE:
 * 
 * The data is provided by the data.js file.
 * Make sure the data.js file is loaded before the index.js file, so that you can acces it here!
 * The data is provided in an array called: data
 * const data = [
  {
    "species": "Adelie",
    "island": "Torgersen",
    "culmen_length_mm": 39.1,
    "culmen_depth_mm": 18.7,
    "flipper_length_mm": 181,
    "body_mass_g": 3750,
    "sex": "MALE"
  } ....
 */

console.log("Initial Data", data);

// constants
const width = 600;
const height = 600;
const margin = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50,
};

d3.select('svg#chart').attr('width', width).attr('height', height);
d3.select('g#vis-g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

const visHeight = height - margin.top - margin.bottom;
const visWidth = width - margin.left - margin.right;

//TASK: get all dimensions in the dataset
var allDimensions = Object.keys(data[0]);

console.log("Dimensions of the dataset: ", allDimensions);

//TASK: Data cleaning
// filter out any datapoints where a value is undefined
// 334 datapoints should remain
var cleanData = data.filter(function(entry) {
  return Object.values(entry).every(function(value) {
      return value !== undefined;
});
});

console.log("cleaned Data:", cleanData);

//TASK: seperate numeric and categorical dimensions
var numerics = allDimensions.filter(function(dim) {
  // Check if all values in the dimension are numeric
  return cleanData.every(function(entry) {
    return !isNaN(entry[dim]);
  });
});

var categoricals = allDimensions.filter(function(dim) {
  // Check if at least one value in the dimension is non-numeric
  return cleanData.some(function(entry) {
    return isNaN(entry[dim]);
  });
});

console.log("numerical dimensions", numerics);
console.log("categorical dimensions", categoricals);


//append a circle for each datapoint
// for cx, cy, fill and r we set dummy values for now 
var selection = d3.select('g#scatter-points').selectAll('circle').data(cleanData)
  .enter().append('circle')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', 3)
  .attr('fill', 'black');
//add labels for x and y axis
var yLabel = d3.select('g#vis-g').append('text').attr('class', 'axis-label').text(' ');
var xLabel = d3.select('g#vis-g').append('text').attr('class', 'axis-label')
  .attr('transform', 'translate(' + visWidth + ', ' + visHeight + ')')
  .text(' ');


//TASK: add options to the select tags:
// for all <select>'s we have to add <options> for each data dimension
// the select for the x-axis, y-axis and size should only have numeric dimensions as options
// the select for the color should only have categorical dimensions as options
// add an event listener to the <select> tag
//    call the appropriate change function (xAxisChange(newDim), yAxisChange(newDim), colorChange(newDim) or sizeChange(newDim))
// X Axis Select
d3.select("#x-axis-select")
  .selectAll("option")
  .data(numerics)
  .enter()
  .append("option")
  .text(d => d);

// Y Axis Select
d3.select("#y-axis-select")
  .selectAll("option")
  .data(numerics)
  .enter()
  .append("option")
  .text(d => d);

// Size Select
d3.select("#size-select")
  .selectAll("option")
  .data(numerics)
  .enter()
  .append("option")
  .text(d => d);

// Color Select
d3.select("#color-select")
  .selectAll("option")
  .data(categoricals)
  .enter()
  .append("option")
  .text(d => d);


// Add event listeners to select tags
d3.select("#x-axis-select").on("input", function() {
  xAxisChange(this.value);
});

d3.select("#y-axis-select").on("input", function() {
  yAxisChange(this.value);
});

d3.select("#size-select").on("input", function() {
  sizeChange(this.value);
});

d3.select("#color-select").on("input", function() {
  colorChange(this.value);
});

// TASK: x axis update:
// Change the x Axis according to the passed dimension
// update the cx value of all circles  
// update the x Axis label 
xAxisChange = (newDim) =>  {
  // Your implementation here
  console.log("X axis changed to:", newDim);
};

// TASK: y axis update:
// Change the y Axis according to the passed dimension
// update the cy value of all circles  
// update the y Axis label 
yAxisChange = (newDim) => {
  // Your implementation here
  console.log("Y axis changed to:", newDim);
};

// TASK: color update:
// Change the color (fill) according to the passed dimension
// update the fill value of all circles  
//
// add a <span> for each categorical value to the legend div 
// (see #color-select-legend in the html file)
// the value text should be colored according to the color scale 
colorChange = (newDim) => {
  // Your implementation here
  console.log("Color changed to:", newDim);
};

// TASK: size update:
// Change the size according to the passed dimension
// update the r value of all circles  
sizeChange = (newDim) => {
  // Your implementation here
  console.log("Size changed to:", newDim);
};

//initialize the scales
xAxisChange('culmen_length_mm');
yAxisChange('culmen_depth_mm');
colorChange('species');
sizeChange('flipper_length_mm');

