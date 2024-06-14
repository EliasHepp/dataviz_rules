
console.log("Initial Data", data);

// constants
const width = 1600;
const height = 800;
const margin = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50,
};

const visHeight = height - margin.top - margin.bottom;
const visWidth = width - margin.left - margin.right;

const chart = d3.select('#chart')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// clean data
const cleanData = data.filter(d => !Object.values(d).includes(undefined));
console.log("cleaned Data:", cleanData);

// define global variables (and default values)
// dimensions to be displayed as axes (default all)
var dimensions = Object.keys(data[0]);
// possible orderings of dimensions such that each dimension appears as a direct neighbor to every other dimension at least once (using helper function at the end of code)
var orderings = getNeighborOrderings(dimensions);
// order of dimensions to be used in PCP (default as in order of data)
var dimensionsOrder = orderings[0];

// Next, we create a dropdown select element to allow the user to select the ordering of dimensions in the parallel coordinates plot.
// Depending on the user choice to use all dimensions or only numeric dimensions, we need a function to update the options of the ordering dropdown accordingly.
function updateOrderingOptions(options) {
  // remove old options
  d3.select("#ordering-select")
    .selectAll("option")
    .remove();
  // add new options
  d3.select("#ordering-select")
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .attr("value", d => d)
    .html(d => d.join(" - "));  // display ordered dimensions separated by '-' in dropdown
};

// add initial options to ordering dropdown using default orderings
updateOrderingOptions(orderings);

// Next, we add an event listener to the ordering dropdown that calls the main function (create PCP) when the user selects a different ordering.
d3.select("#ordering-select").on("change", function() {
    dimensionsOrder = orderings[this.selectedIndex]; //change global variable
    create_pcp(cleanData, dimensionsOrder); //call main function
}).selectAll("option")
  .data(orderings)
  .enter()
  .append("option")
  .attr("value", d => d)
  .html( d => d.join(" - "));

// We also need to add event listeners to the radio buttons to let the user switch between showing all dimensions and only numeric dimensions on the PCP axes.
d3.select("#all_dim").on("change", function() {
  if (this.checked) {
    // adjust global variables to use all dimensions
    orderings = getNeighborOrderings(dimensions);
    dimensionsOrder = orderings[0];
    // adjust options of ordering select
    updateOrderingOptions(orderings);
    // call main function
    create_pcp(cleanData, dimensionsOrder);
  }
});
  
d3.select("#numeric").on("change", function() {
  if (this.checked) {
    var numerics = dimensions.filter(d => typeof data[0][d] === 'number');
    // adjust global variables to use only numeric dimensions
    orderings = getNeighborOrderings(numerics);
    dimensionsOrder = orderings[0];
    // adjust options of ordering select
    updateOrderingOptions(orderings);
    // call main function
    create_pcp(cleanData, dimensionsOrder);
  }
});


// main function that creates the parallel coordinates plot given a dataset and an ordered list of dimensions
function create_pcp(dataset, dims){
  // seperate numeric and categorical dimensions
  var numerics = dims.filter(d => typeof dataset[0][d] === 'number');
  var categoricals = dims.filter(d => typeof dataset[0][d] === 'string');

  // TASK: remove all (old) elements from the chart svg
  chart.selectAll("*").remove();

  // TASK: build a y scale for each dimension and store them in the form of a dictionary (hint: numeric dimensions need another scale than categorical dimensions)
  var yScales = {}; // object to store y scales 
  
  // Numeric dimensions
  numerics.forEach(dim => {
    yScales[dim] = d3.scaleLinear()
      .domain(d3.extent(dataset, d => +d[dim]))
      .range([visHeight, 0]);
  });

  // Categorical dimensions
  categoricals.forEach(dim => {
    yScales[dim] = d3.scalePoint()
      .domain(dataset.map(d => d[dim]))
      .range([visHeight, 0])
      .padding(1);
  });

  // TASK: build the x scale (hint: each dimension should get a point distributed evenly across the width of the chart svg)
  var xScale = d3.scalePoint()
    .domain(dims)
    .range([0, visWidth])
    .padding(1);

  // TASK: build color scale for the dimension "species"
  var colorScale = d3.scaleOrdinal()
    .domain(dataset.map(d => d.species))
    .range(d3.schemeCategory10);

  // adjust color legend to display species in the respective colors
  d3.select('#legend').selectAll('span')
    .data(colorScale.domain())
    .enter()
    .append('span')
    .text(d => d)
    .style('color', d => colorScale(d));

  // TASK: draw the axes to the chart svg with respective labels underneath
  dims.forEach(dim => {
    chart.append("g")
      .attr("transform", `translate(${xScale(dim)},0)`)
      .each(function() {
        d3.select(this).call(d3.axisLeft(yScales[dim]));
      });

  // Append x-axis labels
  chart.selectAll(".dimension")
    .data(dims)
    .enter().append("text")
    .attr("class", "dimension")
    .attr("x", d => xScale(d))
    .attr("y", visHeight + 20)
    .style("text-anchor", "middle")
    .text(d => d)
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "10px");
  });
   
  // TASK: draw the data lines to the chart svg as path elements; 
    //color the data lines according to the species (stroke attribute); 
    //use opacity 0.5 for better readability
  const line = d3.line()
    .defined(d => d[1] !== undefined) // Ignore undefined values
    .x(d => xScale(d[0]))
    .y(d => yScales[d[0]](d[1]));

  chart.selectAll("path")
    .data(dataset)
    .enter()
    .append("path")
    .attr("d", d => line(dims.map(p => [p, d[p]])))
    .style("fill", "none")
    .style("stroke", d => colorScale(d.species))
    .style("opacity", 0.5);
  
};

// initialize the plot with the default ordering of dimensions
create_pcp(cleanData, dimensionsOrder);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helper functions

// function to generate permutations of an array ensuring each element appears as a direct neighbor to every other element at least once
function getNeighborOrderings(arr) {
  var neighborOrderings = [];

  for (var i = 0; i < arr.length; i++) {
    var temp = arr.slice();
    for (var j = i + 1; j < arr.length; j++) {
      // Swap adjacent dimensions
      var tempDim = temp[i];
      temp[i] = temp[j];
      temp[j] = tempDim;
      neighborOrderings.push(temp.slice());
      // Restore original order
      temp[j] = temp[i];
      temp[i] = tempDim;
    }
  }

  return neighborOrderings;
};

// function to generate all possible permutations of an array
// you can exchange getNeighborOrderings with this function in the code above to allow all possible orderings of dimensions (more accurate) but this will create much more options in the dropdown
function getAllPermutations(arr) {
  var permutations = [];

  function generatePermutations(array, startIndex) {
    if (startIndex === array.length - 1) {
      permutations.push(array.slice());
      return;
    }

    for (var i = startIndex; i < array.length; i++) {
      // Swap elements
      var temp = array[startIndex];
      array[startIndex] = array[i];
      array[i] = temp;

      // Recursively generate permutations
      generatePermutations(array, startIndex + 1);

      // Restore original order
      temp = array[startIndex];
      array[startIndex] = array[i];
      array[i] = temp;
    }
  }

  generatePermutations(arr, 0);
  return permutations;
};

