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

//1. Convert the provided dataset into an appropriate hierarchical format using your structure from Task 1a) iii.
//retailer (root) → country → city → supplier
function transformData(data) {
  const root = { name: "Retailer", children: [], sales_EUR: 0 }; //root
  const countries = {};

  data.forEach(d => {
    root.sales_EUR += d.sales_EUR;

    if (!countries[d.country]) {                                //level 1: country
      countries[d.country] = { name: d.country, children: [], sales_EUR: 0 };
      root.children.push(countries[d.country]);
    }

    const country = countries[d.country];
    country.sales_EUR += d.sales_EUR;

    let city = country.children.find(c => c.name === d.city);

    if (!city) {                                              //level 2: city
      city = { name: d.city, children: [], sales_EUR: 0 };
      country.children.push(city);
    }

    city.sales_EUR += d.sales_EUR;

    let supplier = city.children.find(s => s.name === d.supplier);

    if (!supplier) {                                        //level 3: supplier
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

const root = d3.hierarchy(hierarchicalData) //adapt data for treemap
  .sum(d => d.sales_EUR);

//2. Use d3.treemap() to initialize the Treemap layout
const treemapLayout = d3.treemap()
  .size([visWidth, visHeight])
  .paddingOuter(16)
  .paddingTop(28)
  .paddingInner(4);

treemapLayout(root);

//Coloring setting
const color = d3.scaleOrdinal(d3.schemeCategory10);

const countryColors = new Map();    //Map to store colors for each country
root.children.forEach((d, i) => {
  countryColors.set(d.data.name, color(i));
});

function lightenColor(color, percent) { //For lower levels use variants of country color
  const d3Color = d3.color(color);
  d3Color.opacity = percent;
  return d3Color.brighter(percent).toString();
}

//3. Add the rectangles to the chart svg.
const nodes = chart.selectAll('g')
  .data(root.descendants())
  .enter()
  .append('g')
  .attr('transform', d => `translate(${d.x0},${d.y0})`);

nodes.append('rect')
  .attr('width', d => d.x1 - d.x0)
  .attr('height', d => d.y1 - d.y0)
  .attr('fill', d => {
    if (d.depth === 1) {
      return countryColors.get(d.data.name);
    } else if (d.depth === 2) {                  //lighten other levels colors rectangles
      return lightenColor(countryColors.get(d.ancestors()[1].data.name), 0.5);
    } else if (d.depth === 3) {
      return lightenColor(countryColors.get(d.ancestors()[2].data.name), 1);
    }
    return '#ccc';
  })
  .attr('stroke', '#fff');

//4. Add a text element for level 3 (suppliers)
nodes.filter(d => d.depth === 3)
  .append('text')
  .attr('x', d => 4) 
  .attr('y', d => 8)
  .attr('dy', '0.35em')
  .text(d => d.data.name)
  .attr('font-size', '10px')

//5. Add a text element for level 1 (suppliers)
nodes.filter(d => d.depth === 1) 
  .append('text')
  .attr('x', 6)
  .attr('y', -6)
  .text(d => d.data.name.toUpperCase()) //Upper case as in FinViz example
  .attr('font-size', '20px')
  .attr('fill', d => countryColors.get(d.data.name)) // Set label color
  .attr('font-weight', 'bold');

//6. Add interactivity
const tooltip = d3.select('body').append('div')
  .attr('class', 'own-tooltip'); // Use the CSS class for styling

nodes.on('mouseover', function(event, d) {
  chart.selectAll('rect')
    .filter(node => node.data.name === d.data.name)
    .style('opacity', 1);

  chart.selectAll('rect')
    .filter(node => node.data.name !== d.data.name)
    .style('opacity', 0.1);

  let tooltipContent = '';   // tooltip content based on depth
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

  tooltip.style('display', 'block')
    .html(tooltipContent);
})
  
  .on('mousemove', function(event) {
    tooltip.classed('own-tooltip', true)
    tooltip.style('left', (event.pageX + 20) + 'px') //better visibility of the tooltip
    .style('top', (event.pageY + 5) + 'px');
})

  .on('mouseout', function() {
  chart.selectAll('rect').style('opacity', 1);
  tooltip.style('display', 'none');
});