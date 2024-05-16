//+++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++No need to touch this JavaScript file++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Function to extract RGB values from an SVG element
function extractRGBFromSVG(svgElement) 
{
    // Get the 'fill' attribute from the SVG element
    const fillAttribute = svgElement.style("fill");

    // Check if the 'fill' attribute is specified and is in RGB format
    if (fillAttribute && fillAttribute.startsWith('rgb')) {
        // Extract RGB values from the 'fill' attribute
        const rgbValues = fillAttribute.match(/\d+/g);

        if (rgbValues.length === 3) {
            // Parse RGB values
            const r = parseInt(rgbValues[0], 10);
            const g = parseInt(rgbValues[1], 10);
            const b = parseInt(rgbValues[2], 10);

            // Return RGB values as an object
            return { r, g, b };
        }
    }

    // If RGB values couldn't be extracted, return null
    return null;
}

// Function to convert RGB to CIELAB
function rgbToCIELAB(r, g, be) {
    // Normalize RGB values
    let [nr, ng, nb] = [r / 255, g / 255, be / 255];

    // Apply gamma correction
    [nr, ng, nb] = [gammaCorrection(nr), gammaCorrection(ng), gammaCorrection(nb)];

    // Convert RGB to XYZ
    const [x, y, z] = rgbToXYZ(nr, ng, nb);

    // Convert XYZ to CIELAB
    const [L, a, b] = xyzToCIELAB(x, y, z);

    return {L, a, b };
}

// Gamma correction function
function gammaCorrection(value) {
    if (value > 0.04045) {
        return Math.pow((value + 0.055) / 1.055, 2.4);
    } else {
        return value / 12.92;
    }
}

// Convert RGB to XYZ
function rgbToXYZ(r, g, b) {
    // Transformation matrix for sRGB to XYZ
    const matrix = [
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041]
    ];

    const x = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
    const y = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
    const z = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;

    return [x, y, z];
}

// Convert XYZ to CIELAB
function xyzToCIELAB(x, y, z) {
    // Reference white D65 (standard illuminant)
    const xn = 0.95047;
    const yn = 1.00000;
    const zn = 1.08883;

    // Normalize XYZ values
    const fx = f(x / xn);
    const fy = f(y / yn);
    const fz = f(z / zn);

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);

    return [l, a, b];
}

// Helper function for xyzToCIELAB
function f(t) {
    if (t > 0.008856) {
        return Math.pow(t, 1/3);
    } else {
        return 7.787 * t + 16/116;
    }
}