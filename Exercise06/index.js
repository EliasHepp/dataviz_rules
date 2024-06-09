// Define the dimensions of the plot
const svgWidth = 1200;
const svgHeight = 1200;
const padding = 20; // Increased padding for better spacing
const size = 200; // Adjust based on your data and required plot size
const margin = { left: 50, right: 20, bottom: 50 };


const x = d3.scaleLinear().range([padding / 2, size - padding / 2]);
const y = d3.scaleLinear().range([size - padding / 2, padding / 2]);

const xAxis = d3.axisBottom(x).ticks(5)//.tickSize(0).tickFormat('');
const yAxis = d3.axisLeft(y).ticks(5)//.tickSize(0).tickFormat('');

const color = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select('#Task1');
if (svg.empty()) {
    console.error('SVG not found.');
} else {
    console.log('SVG found:', svg);
}

svg.attr('width', svgWidth)
   .attr('height', svgHeight)
   .style('border', '2px solid black') // Add border for visibility
   .append('g')
   .attr('transform', 'translate(' + padding + ',' + padding / 2 + ')');

const domainByTrait = {};
const traits = Object.keys(data[0]).filter(d => typeof data[0][d] === 'number');
const n = traits.length;

traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
});

//xAxis.tickSize(size * n);
//yAxis.tickSize(-size * n);

svg.selectAll('.x.axis')
    .data(traits)
    .enter().append('g')
    .attr('class', 'x axis')
    .attr('transform', (d, i) => 'translate(' + (n - i - 1) * size + ',0)')
    .each(function (d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });


svg.selectAll('.y.axis')
    .data(traits)
    .enter().append('g')
    .attr('class', 'y axis')
    .attr('transform', (d, i) => 'translate(0,' + i * size + ')')
    .each(function (d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

// Add labels at the top
svg.selectAll('.x.axis')
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', 10) //size / 2)
    .attr('y', 10)//-padding / 2-10)
    .attr('dy', '.71em')
    .style('text-anchor', 'middle')
    .text(d => d)
    .style('font-size', '14px');

// Add labels at the left
svg.selectAll('.y.axis')
    .append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    //.attr('x', -size / 2)
    //.attr('y', padding / 2-10)
    .attr('dy', '.71em')
    .style('text-anchor', 'middle')
    .text(d => d)
    .style('font-size', '14px');

//svg.selectAll('.x.axis .domain, .y.axis .domain').remove();

const cell = svg.selectAll('.cell')
    .data(cross(traits, traits))
    .enter().append('g')
    .attr('class', 'cell')
    .attr('transform', d => 'translate(' + d.j * size + ',' + d.i * size + ')')
    .each(plot);

cell.filter(d => d.i  === d.j).each(histogram);
cell.filter(d => d.i > d.j).each(scatterplot);
cell.filter(d => d.i < d.j).each(correlation);

function plot(p) {
    const cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    // Remove the inner lines
    cell.append('rect')
        .attr('class', 'frame')
        .attr('x', padding / 2)
        .attr('y', padding / 2)
        .attr('width', size - padding)
        .attr('height', size - padding)
        .style('fill', 'none') // Remove fill
        .style('stroke', 'black') // Set border color
        .style('stroke-width', '2px'); // Set border width
}

function histogram(p) {
    const cell = d3.select(this);
    const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(6))
        (data.map(d => d[p.x]));

    const yHist = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([size - padding / 2, padding / 2]);

    const bar = cell.selectAll('.bar')
        .data(bins)
        .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', d => 'translate(' + x(d.x0) + ',' + yHist(d.length) + ')');

    bar.append('rect')
        .attr('class', 'histogram-bar')
        .attr('x', 1)
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('height', d => Math.max(0, size - padding / 2 - yHist(d.length)))
        .style('fill', 'steelblue'); // Adjust bar color, ensure no stroke
}

function scatterplot(p) {
    const cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => x(d[p.x]))
        .attr('cy', d => y(d[p.y]))
        .attr('r', 3)
        .style('fill', "black") //black
        .style('stroke', 'none')
        .on('mouseover', function() {
            d3.select(this).attr('class', 'highlight');
        })
        .on('mouseout', function() {
            d3.select(this).attr('class', '');
        });
}

function correlation(p) {
    const cell = d3.select(this);

    const corr = pearsonCorrelation(data.map(d => d[p.x]), data.map(d => d[p.y])).toFixed(2);

    cell.append('text')
        .attr('x', size / 2)
        .attr('y', size / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(corr);
}

function cross(a, b) {
    const c = [];
    const n = a.length;
    const m = b.length;
    for (let i = 0; i < n; i++) {
        for (let j = m - 1; j >= 0; j--) {
            c.push({x: a[i], i: i, y: b[j], j: j});
        }
    }
    return c;
}

function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const numerator = d3.sum(x.map((d, i) => (d - meanX) * (y[i] - meanY)));
    const denominator = Math.sqrt(d3.sum(x.map(d => Math.pow(d - meanX, 2))) * d3.sum(y.map(d => Math.pow(d - meanY, 2))));
    return numerator / denominator;
}

console.log("show succ");