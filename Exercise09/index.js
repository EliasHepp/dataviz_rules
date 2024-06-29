//Initialize some global variables.
//You may change the variables to fit your needs.
const width  = 1400; 
const height = 1000; 
const margin = {
    left: 50,
    right: 50,
    top: 10,
    bottom: 50,
};
//++++++++++++++++++
//--TASK 1--(1 point)
//++++++++++++++++++
    //Define a categorical color scale to color the different nodes according to their house.
    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.nodes.map(d => d.house))])
        .range(d3.schemeCategory10);

//Initialize the components
function init()
{

    /**
    * IMPORTANT NOTICE:
    * The data is provided and stored as the graphs nodes and links.
    * Check out the console to see the data structure:
    */
    const links = data.links;
    const nodes = data.nodes;
    console.log("Data Structure", data);

    d3.select('svg#chart').attr('width', width).attr('height', height);
    d3.select('g#vis-g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    let svg = d3.select('g#vis-g')

    const visHeight = height - margin.top - margin.bottom;
    const visWidth = width - margin.left - margin.right;

//++++++++++++++++++
//--TASK 1-- (1 point)
//++++++++++++++++++
    //Attach an event handler on the checkbox, and call the updateGraph function.
    //Depending on the checkbox value, the data should be aggregated, or not.
    //Initialize the graph with ungrouped data
    document.getElementById('house_checkbox').addEventListener('change', function() {
        if (this.checked) {
            updateGraph(aggregateData(data, 'house'));
        } else {
            updateGraph(data);
        }
    });
    
    updateGraph(data)
}

 //This function handles the creation of the graph, depending on the passed 'graphData'
 function updateGraph(graphData) {
//++++++++++++++++++
//--TASK 1--(2 points)
//++++++++++++++++++
    //Draw a line for each link (1/2 point)
        //The color of the link should be blue when the value is greater than 0, red when below 0 (0.5/2 points)
        //If the value is below 0, add a dash-array to the stroke (0.5/2 points)

    // Remove any existing links and nodes
    d3.selectAll('.link').remove();
    d3.selectAll('.node').remove();

    const link = d3.select('g#vis-g')
        .selectAll('.link')
        .data(graphData.links)
        .enter().append('line')
        .attr('class', 'link')
        .attr('stroke', d => d.value > 0 ? 'blue' : 'red')
        .attr('stroke-dasharray', d => d.value < 0 ? '5,5' : 'none');
    
//++++++++++++++++++
//--TASK 1--(3 points)
//++++++++++++++++++
    //Create a group element for each node
    const node = d3.select('g#vis-g')
        .selectAll('.node')
        .data(graphData.nodes)
        .enter().append('g')
        .attr('class', 'node');

    //Add a circle 
    node.append('circle')
        .attr('r', d => d.count ? Math.sqrt(d.count) * 5 : 5)
        .attr('fill', d => colorScale(d.house));

        //If aggregated, the radius of the circle should scale according to the count (1/3 point)
        //Color the circle according to the categorical colorScale (1/3 points)
    //Add a text label (1/3 points)
    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => d.name);
     
//++++++++++++++++++
//--TASK 1--(3 points)
//++++++++++++++++++
    //Create a force-directed layout ( https://github.com/d3/d3-force ) using the nodes and links (3/3 points)
    const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked);

    function ticked() {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }
}


//+++++++++++++++++++++++++++++++++
//+++DO NOT MODIFY THIS Function+++
//+++++++++++++++++++++++++++++++++
// This function returns the aggregated data according to an attribute value.
// !!You can use this function to aggregate the data according to the attribute 'house'!!
function aggregateData(unaggregated, attribute) {
    var newData = {}
    //grouping of nodes
    newData.nodes = Array.from(d3.group(unaggregated.nodes, d => d[attribute])).map((d,i) => {
        return {
        name: d[0],
        [attribute]: d[0],
        id: i,
        count: d[1].length
        }
    })

    newData.links = []
    //for each node combination, create a link
    newData.nodes.forEach((n, i) => {
        newData.nodes.slice(i+1).forEach((n2,i2) => {
        newData.links.push({
            source: i,
            target: i+1+i2,
            value: unaggregated.links.filter(d => (
            (d.source[attribute] == n.name && d.target[attribute] == n2.name) || 
            (d.source[attribute] == n2.name && d.target[attribute] == n.name))).map(d => d.value).reduce((curr, acc) => curr+acc, 0)
        })
        })
    })
    
    return newData;
}

//++++++++++++++++++
//--TASK 2--
//++++++++++++++++++
document.addEventListener("DOMContentLoaded", function() {
    const matrixContainer = d3.select("#matrix-container");

    const numNodes = 13;
    const cellDimension = 20;
    const svgDimension = numNodes * cellDimension + 50;

    const adjMatrix = [
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0]
    ];

    const matrixSvg = matrixContainer.append("svg")
        .attr("width", svgDimension)
        .attr("height", svgDimension);

    const matrixRows = matrixSvg.selectAll(".row")
        .data(adjMatrix)
        .enter().append("g")
        .attr("class", "row");

    matrixRows.each(function(rowData, i) {
        const row = d3.select(this);

        row.selectAll(".cell")
            .data(rowData)
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", (d, j) => j * cellDimension + 50)
            .attr("y", i * cellDimension + 50)
            .attr("width", cellDimension)
            .attr("height", cellDimension)
            .attr("stroke", "black")
            .attr("fill", d => d ? "black" : "white");

        // Add labels for rows
        matrixSvg.append("text")
            .attr("x", 35)
            .attr("y", i * cellDimension + 65)
            .attr("class", "matrix-label")
            .text(i + 1);
    });

    // Add labels for columns
    for (let i = 0; i < numNodes; i++) {
        matrixSvg.append("text")
            .attr("x", i * cellDimension + 50 + cellDimension / 2)
            .attr("y", 35)
            .attr("class", "matrix-label")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(i + 1);
    }
});