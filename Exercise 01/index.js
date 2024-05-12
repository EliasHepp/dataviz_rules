//TASK 4a
//let the console tell that the script is loaded
console.log("script.js loaded");

// TASK 4b

document.addEventListener("DOMContentLoaded", function() {
    // Select all circles in the SVG container
    const circles = document.querySelectorAll("circle");
    
    // Retrieve the x- and y-values and calculate the mean position.
    let totalX = 0;
    let totalY = 0;
    
    circles.forEach(function(circle) {
        // Extract the x and y positions of the circle
        const cx = parseFloat(circle.getAttribute("cx"));
        const cy = parseFloat(circle.getAttribute("cy"));
        
        // Add the x and y positions to the total
        totalX += cx;
        totalY += cy;
    });
    
    const meanX = totalX / circles.length;
    const meanY = totalY / circles.length;
    
    // Add a square to the svg container at the mean coordinates.
    const svg = document.querySelector("svg");
    const svgns = "http://www.w3.org/2000/svg";
    const rect = document.createElementNS(svgns, "rect");  
    rect.setAttribute("x", meanX); // Adjust x-position to center the square
    rect.setAttribute("y", meanY); // Adjust y-position to center the square
    rect.setAttribute("width", "40");
    rect.setAttribute("height", "40");
    rect.setAttribute("fill", "black");
    svg.appendChild(rect);

    // Print the mean values to the console.
    console.log("Mean X Position:", meanX);
    console.log("Mean Y Position:", meanY);
    
    });



