// Define the dimensions of the plot
const svgWidth = 1200;
const svgHeight = 1200;
const padding = 20; // Increased padding for better spacing
const size = 200; 
const margin = { top: 100, right: 20, bottom: 50, left: 0 };


//Correlation bottom
const rButton = d3.select("#rButton")
const spearButton = d3.select("#spearButton")

//Axis
const x = d3.scaleLinear().range([padding / 2, size - padding / 2]);
const y = d3.scaleLinear().range([size - padding / 2, padding / 2]);

const xAxis = d3.axisBottom(x).ticks(5).tickSize(0).tickFormat('');
const yAxis = d3.axisLeft(y).ticks(5).tickSize(0).tickFormat('');

//SVG creation
const svg = d3.select('#Task1');

svg.attr('width', svgWidth)
   .attr('height', svgHeight)
   .append('g')
   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


//Traits loading from data
const domainByTrait = {};
const traits = Object.keys(data[0]).filter(d => typeof data[0][d] === 'number');
const n = traits.length;

traits.forEach(trait => {
    domainByTrait[trait] = d3.extent(data, d => d[trait]);
});

//Axis for each trait
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

svg.selectAll('.x.axis .domain, .y.axis .domain').remove();

//Cells for all traits crossings
const cell = svg.selectAll('.cell')
    .data(cross(traits, traits))
    .enter().append('g')
    .attr('class', 'cell')
    .attr('transform', d => 'translate(' + d.j * size + ',' + d.i * size + ')')
    .each(plot);

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

//Implementation of different functions depending on graph area
cell.filter(d => d.i  === d.j).each(histogram);
cell.filter(d => d.i > d.j).each(scatterplot);
cell.filter(d => d.i < d.j).each(correlation);

//Add labels for the first column (left) and first row (top)
svg.selectAll('.row-label')
    .data(traits)
    .enter().append('text')
    .attr('class', 'row-label')
    .attr('transform', (d, i) => `translate(${margin.left-10}, ${i * size + size / 2}) rotate(-90)`)
    .style('text-anchor', 'middle')
    .style('font-size', '22px')  
    .style('font-weight', 'bold') 
    .text(d => d);

svg.selectAll('.column-label')
    .data(traits)
    .enter().append('text')
    .attr('class', 'column-label')
    .attr('x', (d, i) => i * size + size / 2)
    .attr('y', -margin.top/10)
    .style('text-anchor', 'middle')
    .style('font-size', '22px')  
    .style('font-weight', 'bold')
    .text(d => d);

//Cells
function plot(p) {
    const cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append('rect')
        .attr('class', 'frame')
        .attr('x', padding/2)
        .attr('y', padding/2)
        .attr('width', size - padding)
        .attr('height', size - padding)
        .style('fill', 'none') //Remove the inner lines
        .style('stroke', 'black') 
        .style('stroke-width', '2px');

    //Add hover events to highlight related elements
    cell.on('mouseover', function(event, d) {
        highlight(d, true);
    })
    .on('mouseout', function(event, d) {
        highlight(d, false);
    });
    }

//Histograms for diagonal
function histogram(p) {
    const cell = d3.select(this);

    //Set up scales based on the current trait (p.x)
    const extent = d3.extent(data, d => d[p.x]);
    const x = d3.scaleLinear()
        .domain(extent)
        .range([padding / 2, size - padding / 2]);

    const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(9)
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
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => size - padding / 2 - yHist(d.length))
        .style('fill', 'steelblue')
        .attr('stroke', 'white');
}

//Scatterplot for lower part
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
}

//Function to update the plot based on correlation type
function updatePlot(correlationType) {
    cell.selectAll('text').remove(); //Clear previous correlation text

    cell.filter(d => d.i < d.j).each(function (p) { //update upper cells
        const cell = d3.select(this);
        const corr = correlation(data.map(d => d[p.x]), data.map(d => d[p.y]), correlationType);
        cell.append('text')
            .attr('x', size / 2) //text positioning in middle of cell
            .attr('y', size / 2)
            .attr('text-anchor', 'middle')
            .text(corr)
            .style('font-size', '30px')
            .style('font-weight', 'bold');
    });
}

//Event listener for the update button
document.getElementById('updateButton').addEventListener('click', function () {
    const correlationType = document.getElementById('correlationSelect').value;
    updatePlot(correlationType);
});

//Initial corr type
updatePlot('pearson');

//Correlation function
function correlation(X, Y, correlationType) {
    if (correlationType === 'pearson') {
        return pearsonCorrelation(X, Y);
    } else if (correlationType === 'spearman') {
        return spearmanCorrelation(X, Y);
    }
}

//Pearson corr
function pearsonCorrelation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const numerator = d3.sum(x.map((d, i) => (d - meanX) * (y[i] - meanY)));
    const denominator = Math.sqrt(d3.sum(x.map(d => Math.pow(d - meanX, 2))) * d3.sum(y.map(d => Math.pow(d - meanY, 2))));
    return(numerator / denominator).toFixed(2);
}

//Spearman corr
function spearmanCorrelation(X, Y) {
    // Compute ranks
    var rankX = getRanks(X);
    var rankY = getRanks(Y);

    // Calculate squared differences between ranks
    var diffSquared = X.map(function (d, i) {
        return Math.pow(rankX[i] - rankY[i], 2);
    });

    // Sum of squared differences
    var sumDiffSquared = d3.sum(diffSquared);

    // Number of data points
    var n = X.length;

    // Calculate Spearman's rho
    var spearmanRho = 1 - (6 * sumDiffSquared) / (n * (n * n - 1));

    return spearmanRho.toFixed(2); // Truncate to 2 decimal places
}

//Function to compute ranks
function getRanks(arr) {
    var sorted = arr.slice().sort(function (a, b) {
        return a - b;
    });
    var ranks = arr.slice().map(function (v) {
        return sorted.indexOf(v) + 1;
    });
    return ranks;
}

//Highlight for mouse hoovering
function highlight(d, highlight) {
    const highlightColor = highlight ? 'red' : 'black';

    // Highlight the scatter plot cell
    svg.selectAll('.cell')
        .filter(p => (p.i === d.i && p.j === d.j) || (p.i === d.j && p.j === d.i))
        .select('rect').style('stroke', highlightColor);

    // Highlight the correlation text cell
    svg.selectAll('.correlation-text')
        .filter(p => (p.i === d.i && p.j === d.j) || (p.i === d.j && p.j === d.i))
        .style('fill', highlightColor);

    // Highlight the histogram cells for the traits involved
    svg.selectAll('.cell')
        .filter(p => (p.i === d.i && p.i === p.j) || (p.j === d.j && p.i === p.j))
        .select('rect').style('stroke', highlightColor);
}