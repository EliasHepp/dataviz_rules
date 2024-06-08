// Define the dimensions of the plot
const width = 960,
      size = 150,
      padding = 20;

const x = d3.scaleLinear().range([padding / 2, size - padding / 2]);
const y = d3.scaleLinear().range([size - padding / 2, padding / 2]);

const xAxis = d3.axisBottom().scale(x).ticks(5);
const yAxis = d3.axisLeft().scale(y).ticks(5);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', width)
              .append('g')
              .attr('transform', 'translate(' + padding + ',' + padding / 2 + ')');

const domainByTrait = {};
const traits = Object.keys(data[0]).filter(d => typeof data[0][d] === 'number');
const n = traits.length;

traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
});

xAxis.tickSize(size * n);
yAxis.tickSize(-size * n);

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

const cell = svg.selectAll('.cell')
    .data(cross(traits, traits))
    .enter().append('g')
    .attr('class', 'cell')
    .attr('transform', d => 'translate(' + (n - d.i - 1) * size + ',' + d.j * size + ')')
    .each(plot);

cell.filter(d => d.i === d.j).each(histogram);
cell.filter(d => d.i > d.j).each(scatterplot);
cell.filter(d => d.i < d.j).each(correlation);

function plot(p) {
    const cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append('rect')
        .attr('class', 'frame')
        .attr('x', padding / 2)
        .attr('y', padding / 2)
        .attr('width', size - padding)
        .attr('height', size - padding);
}

function histogram(p) {
    const cell = d3.select(this);
    const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
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
        .attr('width', x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr('height', d => size - padding / 2 - yHist(d.length));
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
        .style('fill', d => color(d.price));
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
        for (let j = 0; j < m; j++) {
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

console.log("show succ")