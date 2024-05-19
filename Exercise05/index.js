//++++++++++++++++++++++++++++++++++++++++
//+This function initializes the Exercise+
//++++++++++++++++++++++++++++++++++++++++
function init() 
{
    console.log("JavaScript loaded!")
    const data = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    //Change the index position to select different colors.
    const circles4 = selectColorsByIndices(data, [1,2,3,5]);
    
    //This is the Set3 colormap from colorbrewer2.org
    var myColor = d3.scaleOrdinal().domain(data)
        .range(d3.schemeSet3);
    let svg = d3.select("#Task1");
    
    //Visualize the different colors with circles of sufficient size.
    svg.selectAll("circle").data(data).enter().append("circle")
            .attr("cx", function(d,i){return 10 + i*20})
            .attr("cy", 15).attr("r", 10)
            .attr("fill", function(d){return myColor(d) })
    
    //Visualize the 4 selected colors with circles of sufficient size.
    //svg.selectAll(".colors4Circle").data(circles4).enter().append("circle")
    //.attr("cx", function(d,i){return 10 + i*20})
    //.attr("cy", 40).attr("r", 10)
    //.attr("fill", function(d){return myColor(d) })

    //+++++++++++
    //++Task 1c++
    //+++++++++++

    //You might use functions already implemented in conversion.js
    //Examples:
    //get the RGB values of a circle
    //function extractRGBFromSVG
    //let index = 0;
    //const circles = svg.selectAll("circle").nodes();
    //console.log(extractRGBFromSVG(d3.select(circles[index])));

    //conversion from RGB values to CIELab
    //function rgbToCIELAB
    //console.log(rgbToCIELAB(141, 211, 199));
    const circles = svg.selectAll("circle").nodes();

    let rgbColors = [];
    for (let i = 0; i < circles.length; i++) {
        if ([0, 6, 10].includes(i)) continue;
        let rgb = extractRGBFromSVG(d3.select(circles[i]));
        if (rgb) rgbColors.push(rgb);
    }

    // Convert the list of RGB colors to XYZ
    let xyzColors = rgbColors.map(({ r, g, b }) => rgbToXYZ(r, g, b));

    // Create a dictionary that maps XYZ color to RGB color
    const XYZtoRGBDict = {};
    rgbColors.forEach(({ r, g, b }, index) => {
        const [x, y, z] = rgbToXYZ(r, g, b);
        XYZtoRGBDict[`${x},${y},${z}`] = { r, g, b };
    });

    // Find the set of 4 colors with the greatest mean distance between each other in XYZ space
    const bestColorSetXYZ = findMaxDistanceColors(xyzColors);
    console.log("Best set of 4 colors (XYZ):", bestColorSetXYZ);

    // Get the bestColorSetRGB with the XYZtoRGBDict and create circles4
    const bestColorSetRGB = bestColorSetXYZ.map(([x, y, z]) => {
        const key = `${x},${y},${z}`;
        return XYZtoRGBDict[key];
    });
    console.log("Best set of 4 colors (RGB):", bestColorSetRGB);

    // Visualize the 4 selected colors with circles of sufficient size
    svg.selectAll(".colors4Circle").data(bestColorSetRGB).enter().append("circle")
        .attr("class", "colors4Circle")
        .attr("cx", function(d, i) { return 10 + i * 20; })
        .attr("cy", 40).attr("r", 10)
        .attr("fill", function(d) { return `rgb(${d.r}, ${d.g}, ${d.b})`; });
}


    //+++++++++++
    //++Task 2a++
    //+++++++++++

    // Mapping rules
document.addEventListener("DOMContentLoaded", function() {
    function mapNumberToColor(number) {
        // Color extremes
        const color0 = [220, 50, 32]; // red
        const color100 = [0, 90, 181]; //blue
    
        const proportion = number / 100;
        const color = [
            Math.round(color0[0] + (color100[0] - color0[0]) * proportion),
            Math.round(color0[1] + (color100[1] - color0[1]) * proportion),
            Math.round(color0[2] + (color100[2] - color0[2]) * proportion)
        ];
    
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
    
    // Update circle color based on value
    function updateColor2a(value) {
        const circle = document.getElementById('currentLimit');
        circle.setAttribute('fill', mapNumberToColor(value));
    }
    
    // Example usage
    const inputValue = 60; // Change this to test different values
    updateColor2a(inputValue);

        //+++++++++++
        //++Task 2b++
        //+++++++++++
    function updateColor2b(value, id) {
        const circle = document.getElementById('currentLimit' + id);
        circle.setAttribute('fill', mapNumberToColor(value));
    }
        
        // Generate five random numbers between 1 and 100
    const randomNumbers = [];
    for (let i = 0; i < 5; i++) {
        randomNumbers.push(Math.floor(Math.random() * 100) + 1);
    }
        
        // Display the random numbers on traffic lights
    for (let i = 0; i < 5; i++) {
        updateColor2b(randomNumbers[i], i + 1);
    }    
});

//++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++No need to touch this function++++++++++
//+A function to select a subset of a given array+
//++++++++++++++++++++++++++++++++++++++++++++++++
function selectColorsByIndices(array, indices) 
{
    const selectedColors = indices.map(index => array[index]);
    return selectedColors;
}

