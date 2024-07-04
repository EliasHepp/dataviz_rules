console.log("Data", data);

// constants
const width = 1800;
const height = 800;
const margin = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50,
};

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
    supplier.children.push({ name: `Purchase ${d.id}`, sales_EUR: d.sales_EUR });
  });

  return root;
}

const hierarchicalData = transformData(data);
console.log("Hierarchical Data", hierarchicalData);

const visHeight = height - margin.top - margin.bottom;
const visWidth = width - margin.left - margin.right;

const chart = d3.select('#chart')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create a hierarchy from the data
const root = d3.hierarchy(hierarchicalData)
  .sum(d => d.sales_EUR);

// Create a tree layout
const treeLayout = d3.tree().size([visWidth, visHeight]);
treeLayout(root);

// Generate the links
const link = chart.selectAll('.link')
  .data(root.links())
  .enter()
  .append('line')
  .attr('class', 'link')
  .attr('x1', d => d.source.x)
  .attr('y1', d => d.source.y)
  .attr('x2', d => d.target.x)
  .attr('y2', d => d.target.y)
  .attr('stroke', '#ccc');

// Generate the nodes
const node = chart.selectAll('.node')
  .data(root.descendants())
  .enter()
  .append('g')
  .attr('class', 'node')
  .attr('transform', d => `translate(${d.x},${d.y})`);

node.append('circle')
  .attr('r', d => Math.sqrt(d.data.sales_EUR) / 100) // Encode the sales as node size (adjust scaling as needed)
  .attr('fill', '#69b3a2');

node.filter(d => d.depth < 4) // Only append text for nodes with depth less than 3
  .append('text')
  .attr('dy', '0.35em')
  .attr('text-anchor', 'middle')
  .style('font-size', '10px')  // Set the font size
  .text(d => d.data.name);
