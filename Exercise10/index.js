console.log("Data", data);

// Constants
const width = 1800;
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

// Step 1: Convert Dataset to Hierarchical Format
function transformData(data) {
  const root = { name: "Retailer", children: [], sales_EUR: 0 };
  const countries = {};

  data.forEach(d => {
    root.sales_EUR += d.sales_EUR;

    if (!countries[d.country]) {
      countries[d.country] = { name: d.country, children: [], sales_EUR: 0 };
      root.children.push(countries[d.country]);
    }

    const country = countries[d.country];
    country.sales_EUR += d.sales_EUR;

    let city = country.children.find(c => c.name === d.city);

    if (!city) {
      city = { name: d.city, children: [], sales_EUR: 0 };
      country.children.push(city);
    }

    city.sales_EUR += d.sales_EUR;

    let supplier = city.children.find(s => s.name === d.supplier);

    if (!supplier) {
      supplier = { name: d.supplier, children: [], sales_EUR: 0 };
      city.children.push(supplier);
    }

    supplier.sales_EUR += d.sales_EUR;
    supplier.children.push({ name: `${d.id}`, sales_EUR: d.sales_EUR });
  });

  return root;
}

const hierarchicalData = transformData(data);
console.log("Hierarchical Data", hierarchicalData);

// Step 2: Initialize Treemap Layout
const root = d3.hierarchy(hierarchicalData)
  .sum(d => d.sales_EUR);

const treemapLayout = d3.treemap()
  .size([visWidth, visHeight])
  .paddingOuter(16)
  .paddingTop(28)
  .paddingInner(4);

treemapLayout(root);

// Step 3: Add Rectangles and Coloring
const color = d3.scaleOrdinal(d3.schemeCategory10);

const nodes = chart.selectAll('g')
  .data(root.descendants())
  .enter()
  .append('g')
  .attr('transform', d => `translate(${d.x0},${d.y0})`);

nodes.append('rect')
  .attr('width', d => d.x1 - d.x0)
  .attr('height', d => d.y1 - d.y0)
  .attr('fill', d => color(d.depth))
  .attr('stroke', '#fff');

// Step 4: Add Text to Rectangles (Supplier Names)
nodes.filter(d => d.depth === 3)  // Only add text to level 3 nodes (supplier level)
  .append('text')
  .attr('x', d => 4) // Center text horizontally
  .attr('y', d => 8) // Center text vertically
  .attr('dy', '0.35em') // Adjust vertical alignment
  .text(d => d.data.name) // Display supplier name
  .attr('font-size', '10px')
  //.attr('text-anchor', 'middle') // Center align the text
  .attr('fill', 'black');

// Step 5: Add Headings Above Rectangles
nodes.filter(d => d.depth === 1)  // Only add text to level 1 nodes
  .append('text')
  .attr('x', 4)
  .attr('y', 18)
  .text(d => d.data.name)
  .attr('font-size', '14px')
  .attr('fill', 'black');

// Step 6: Add Interactivity
const tooltip = d3.select('body').append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0)
  .style('position', 'absolute')
  .style('background-color', 'white')
  .style('padding', '5px')
  .style('border', '1px solid #ccc');

nodes.on('mouseover', function(event, d) {
  chart.selectAll('rect')
    .filter(node => node.data.name === d.data.name)
    .style('opacity', 1);

  chart.selectAll('rect')
    .filter(node => node.data.name !== d.data.name)
    .style('opacity', 0.1);

  // Define tooltip content based on depth
  let tooltipContent = '';
  if (d.depth === 0) {
    tooltipContent = `Retailer<br><br>Sales: ${d.data.sales_EUR} (EUR)`;
  } else if (d.depth === 1) {
    tooltipContent = `Country: ${d.data.name}<br><br>Sales: ${d.data.sales_EUR} (EUR)`;
  } else if (d.depth === 2) {
    tooltipContent = `City: ${d.data.name}<br><br>Sales: ${d.data.sales_EUR} (EUR)`;
  } else if (d.depth === 3) {
    const city = d.parent.data.name;
    const country = d.parent.parent.data.name;
    tooltipContent = `Supplier: ${d.data.name}<br><br>Sales: ${d.data.sales_EUR} (EUR)<br><br>City: ${city}<br><br>Country: ${country}`;
  }

  // Show tooltip
  tooltip.style('opacity', 1)
    .html(tooltipContent);
})
  
  .on('mousemove', function(event) {
  tooltip.style('left', (event.pageX + 5) + 'px')
    .style('top', (event.pageY + 5) + 'px');
})

  .on('mouseout', function() {
  chart.selectAll('rect').style('opacity', 1);
  tooltip.style('opacity', 0);
});