// Setup SVG dimensions
const margin = { top: 20, right: 20, bottom: 30, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Parse the date / time
const parseTime = d3.timeParse("%Y-%m-%d");

// Format the data
data.forEach(d => {
  d.date = parseTime(d.date);
  d.close = +d.close;
});

// Set the ranges
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Define the area function with proper interpolation and closing paths
const area = d3.area()
  .x(d => x(d.date))
  .y0(d => y(d.low))
  .y1(d => y(d.high))
  .curve(d3.curveLinear);

// Define the line function with proper interpolation
const line = d3.line()
  .x(d => x(d.date))
  .y(d => y(d.close))
  .curve(d3.curveLinear);

// Function to get area segments
function getAreaSegments(data) {
  const nested = d3.groups(data, d => d.date);
  const areas = [];

  nested.forEach(([date, values]) => {
    values.sort((a, b) => a.close - b.close); // Sort ascending by close value
    for (let i = 0; i < values.length; i++) {
      const low = i === 0 ? 0 : values[i - 1].close;
      const high = values[i].close;
      areas.push({
        date: date,
        low: low,
        high: high,
        name: values[i].Name
      });
    }
  });

  return areas;
}

// Get the area segments with adjusted z-index
const areaSegments = getAreaSegments(data);

// Group the data by name
const dataNest = d3.groups(data, d => d.Name);

// Scale the range of the data
x.domain(d3.extent(data, d => d.date));
y.domain([0, d3.max(data, d => d.close)]);

// Set the color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Group by name to draw the areas
const areaNest = d3.groups(areaSegments, d => d.name);

// Add the areas, sorting by z-index (lowest value last)
areaNest.forEach(([key, values]) => {
  svg.append("path")
    .datum(values)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", color(key));  // Use color scale to differentiate areas
});

// Add the lines
dataNest.forEach(([key, values]) => {
  svg.append("path")
    .datum(values)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", color(key)); // Use color scale to differentiate lines
});

// Add the X Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
  .call(d3.axisLeft(y));

// Add legend
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(20,20)");

// Create legend color squares
legend.selectAll("rect")
  .data(dataNest)
  .enter().append("rect")
  .attr("x", (d, i) => i * 70)
  .attr("y", -10)
  .attr("width", 10)
  .attr("height", 10)
  .style("fill", d => color(d[0]));

// Create legend text
legend.selectAll("text")
  .data(dataNest)
  .enter().append("text")
  .attr("x", (d, i) => i * 70 + 15)
  .attr("y", 0)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(d => d[0]);
