/*
Stocks Viz Map Script
*/

function get_SPX_data() {
    /* Hard-coded data for now. API call to be implemented later. */
    
    // Market capitalization data by industry (in billions USD). Note: fictional values
    const fund_market_caps = {
        "TECHNOLOGY": {
            "AAPL": 5200.00,
            "NVDA": 3900.00,
            "MSFT": 3850.00,
            // Add others later 
        },
        "FINANCIAL": {
            "JPM": 900.00,
            "BAC": 350.00,
            "WFC": 100.00,
            // Add others later 
        },
        "HEALTH CARE": {
            "LLY": 1290.00,
            "JNJ": 580.00,
            "ABBV": 125.00,
            // Add others later
        },
        "INDUSTRIALS": {
            "GE": 650.00,
            "CAT": 210.00,
            "BA": 130.00,
            // Add others later
        },
        "ENERGY": {
            "XOM": 730.00,
            "CVX": 400.00,
            // Add others later
        },
        "OTHER": {
            "MCD": 400.00,
            "KO": 250.00,
            // Add others later
        }
    }

    // Daily returns (%). Note: fictional values
    const stocks_returns = {
        "AAPL": 0.73,
        "NVDA": -6.90,
        "MSFT": 0,
        "JPM": 1.0,
        "BAC": -1.0,
        "WFC": 2.0,
        "LLY": 1.0,
        "JNJ": 0.5,
        "ABBV": 1.5,
        "GE": -3.5,
        "CAT": 0.8,
        "BA": 0.0,
        "XOM": 0.6,
        "CVX": 4.5,
        "MCD": 1.20,
        "KO": 3.00,
    }

    const data = {
        "market_caps": fund_market_caps,
        "stocks_returns": stocks_returns
    }

    return data;
}


function get_NDX_data() {/* Add later */}


function get_UKX_data() {/* Add later */}


function getFundData(fundID) {
    if (fundID === "SPX") {
        return get_SPX_data();
    } else if (fundID === "NDX") {
        return get_NDX_data();
    } else if (fundID === "UKX") {
        return get_UKX_data();
    }
}


function getMarketCapAllocation(fund_market_caps) {
    /* Compute the allocation of the industries and stocks within their respective industries */
    let total_fund_market_cap = 0;
    for (const industry in fund_market_caps) {
        for (const stock in fund_market_caps[industry]) {
            total_fund_market_cap += fund_market_caps[industry][stock];
        }
    }

    // Get allocation of industries in the fund
    const industry_allocations = {};
    for (const industry in fund_market_caps) {
        let industry_market_cap = 0;
        // Sum of individual stocks in the industry
        for (const stock in fund_market_caps[industry]) {
            industry_market_cap += fund_market_caps[industry][stock];
        }
        industry_allocations[industry] = industry_market_cap / total_fund_market_cap;
    }

    // Get allocation of stocks in their respective industries
    const stocks_allocations = {};
    for (const industry in fund_market_caps) {
        let industry_total_market_cap = industry_allocations[industry] * total_fund_market_cap;
        stocks_allocations[industry] = {};

        for (const stock in fund_market_caps[industry]) {
            stocks_allocations[industry][stock] = fund_market_caps[industry][stock] / industry_total_market_cap;
        }
    }

    // Sort industry allocations data in descending order
    const sorted_industry_allocations = Object.fromEntries(
        Object.entries(industry_allocations).sort(([, a], [, b]) => b - a)
    );

    // Sort stock allocations data within each industry
    const sorted_stocks_allocations = {};
    for (const industry in stocks_allocations) {
        sorted_stocks_allocations[industry] = Object.fromEntries(
            Object.entries(stocks_allocations[industry]).sort(([, a], [, b]) => b - a)
        );
    }

    const allocation_data = {
        "industry_allocations": sorted_industry_allocations,
        "stocks_allocations": sorted_stocks_allocations
    }

    return allocation_data; 
   
}


function getStockUnitColor(stock_return) {
    /* Color map based on stock returns */
    if (stock_return > 0) {
        return "green";
    } else if (stock_return < 0) {
        return "red";
    } else {
        return "grey";
    }
}


function drawIndustryUnit(ctx, industry_label, start_x, start_y, end_x, end_y, color) {
    /* Render industry unit rectangle to canvas */
    
    // Draw unit
    ctx.fillStyle = color;  // Dark Grey
    ctx.fillRect(start_x, start_y, end_x, end_y);

    // Draw label in header
    const label_font_size = 14;
    ctx.font = `bold ${label_font_size}px Arial`;
    ctx.fillStyle = "white";

    // Margin space for header
    const label_margin_left = 10;
    const label_margin_top = 10 + label_font_size;

    const label_start_x = start_x + label_margin_left    
    const label_start_y = start_y + label_margin_top  

    ctx.fillText(industry_label, label_start_x, label_start_y);

    let header_height = label_margin_top + 10;  // Create margin for header and get its total height

    return header_height;
}


function drawStockUnit(ctx, ticker_label, start_x, start_y, end_x, end_y, color, stock_return) {
    /* Render stock unit rectangle to canvas */
    
    // Draw unit
    ctx.fillStyle = color;  // Set unit color            
    ctx.fillRect(start_x, start_y, end_x, end_y);

    const unit_area = (end_x - start_x) * (end_y - start_y);
    

    // Draw ticker label
   
    // Dynamic font size proportional to area
    const font_size_sf = 1000
    let ticker_font_size = Math.min(unit_area/font_size_sf, 50);  // Max font size: 50
    if (ticker_font_size < 10) {ticker_font_size = 0;}  // Min font size: 10, otherwise hide label

    ctx.font = `${ticker_font_size}px Arial`;
    ctx.fillStyle = "white";

    // Margin for ticker and return labels
    const ticker_margin_left = 10;
    const ticker_margin_top = ticker_font_size;
    
    const ticker_start_x = start_x + ticker_margin_left
    const ticker_start_y = start_y + ticker_margin_top

    ctx.fillText(ticker_label, ticker_start_x, ticker_start_y);

    // Draw stock return
    let returns_font_size = ticker_font_size - 10 // Slightly smaller than stock ticker label
    if (returns_font_size < 10) {returns_font_size = 0;}  // Min font size: 10, otherwise hide label
    
    ctx.font = `${returns_font_size}px Arial`;
    ctx.fillStyle = "white";

    const return_start_x = ticker_start_x
    const return_start_y = ticker_start_y + ticker_font_size
    
    ctx.fillText(stock_return+'%', return_start_x, return_start_y);
}


function drawMapSliceAndDice(ctx, allocation_data, stock_returns, map_width, map_height) {
    /* 
    Slice and Dice Algorithm
    
    Pack rectangles of a given area into a container of size (w, h)
    such that all of the rectangles fill the whole container with no gaps

    The rectangles will be arranged along a single axis: horizontally. This may cause smaller ones to be visually hard to see.
    */
    const total_map_area = map_width * map_height;

    
    let industry_unit_start_x;
    let industry_unit_start_y;
    let industry_unit_end_x;
    let industry_unit_end_y;

    let industry_label_start_x;
    let industry_label_start_y;

    let stocks_unit_start_x;
    let stocks_unit_start_y;
    let stocks_unit_end_x;
    let stocks_unit_end_y;

    let stocks_ticker_start_x;
    let stocks_ticker_start_y;

    let stocks_return_start_x;
    let stocks_return_start_y;

    /* Render industries */
    
    industry_unit_start_x = industry_unit_start_y = 0;  // Intialise starting coords

    // For each industry unit (in descending order by market cap)
    for (const industry in allocation_data["industry_allocations"]) {
        const industry_market_cap_allocation = allocation_data["industry_allocations"][industry];
        
        // Area of individual industry unit is proportional to total map area
        const industry_unit_area = industry_market_cap_allocation * total_map_area;

        // Compute the width by slicing across the horizontal axis of the map
        const industry_unit_width = industry_market_cap_allocation * map_width;
        // Compute the height as remainder given the previous width
        const industry_unit_height = industry_unit_area / industry_unit_width;

        industry_unit_end_x = industry_unit_width;
        industry_unit_end_y = industry_unit_height;

        // Draw industry unit
        const industry_header_height = drawIndustryUnit(ctx, 
            industry, industry_unit_start_x, industry_unit_start_y, 
            industry_unit_end_x, industry_unit_end_y, 
            "#262931"
        );
        
        /* Render stocks */

        // Initialise starting coords
        stocks_unit_start_x = industry_unit_start_x;
        // Add margin space for industry header
        stocks_unit_start_y = industry_unit_start_y + industry_header_height;
        
        const stocks_region_area = industry_unit_width * (industry_unit_height - industry_header_height)  // Region where stocks are rendered is below the header

        // For each stocks unit (in descending order by market cap)
        for (const stock in allocation_data["stocks_allocations"][industry]) {
            const stocks_market_cap_allocation = allocation_data["stocks_allocations"][industry][stock];
            
            // Area of individual stocks unit is proportional to its industry's area
            
            const stocks_unit_area = stocks_market_cap_allocation * stocks_region_area;

            // Compute the width by slicing across the horizontal axis of the industry
            const stocks_unit_width = stocks_market_cap_allocation * industry_unit_width;
            // Compute the height as remainder given the previous width
            const stocks_unit_height = stocks_unit_area / stocks_unit_width;

            stocks_unit_end_x = stocks_unit_start_x + stocks_unit_width;
            stocks_unit_end_y = stocks_unit_start_y + stocks_unit_height;       
            
            const stock_return = stock_returns[stock];
            
            drawStockUnit(ctx, stock, 
                stocks_unit_start_x, stocks_unit_start_y, 
                stocks_unit_end_x, stocks_unit_end_y, 
                getStockUnitColor(stock_return),
                stock_return
            );

            stocks_unit_start_x += stocks_unit_width;
        }

        // Move starting x_coord to begin drawing the next unit
        industry_unit_start_x += industry_unit_width;        
    }
}


// function getUnitAreas(allocation_data, map_width, map_height) {
    
    
//     const total_map_area = map_width * map_height;

//     let industry_unit_areas = {};

//     // For each industry unit (in descending order by market cap)\\\
//     for (const industry in allocation_data["industry_allocations"]) {
//         const industry_market_cap_allocation = allocation_data["industry_allocations"][industry];
        
//         // Area of individual industry unit is proportional to total map area
//         const industry_unit_area = industry_market_cap_allocation * total_map_area;
//         industry_unit_areas[industry] = industry_unit_area;  // Store industry unit's area
//     }
// }

function get_worst_aspect_ratio(row, shortest_length) {
    const row_area = row.flatMap(obj => Object.values(obj)).reduce((total, v) => total + v, 0);  // Sum of unit areas in the row
    // Worst aspect ratio depends on the largest and smallest unit areas
    return Math.max( ((shortest_length**2 * max_unit_area) / row_area**2), (row_area**2 / (shortest_length**2 * min_unit_area)) );
}


function squarify(children, x, y, container_width, container_height) {
    /* Recursively minimise the aspect ratio of the unit's rectangle being drawn */
    const container_area = container_width * container_height;
    const sum_weights = Object.values(children).reduce((a, b) => a + b, 0);
    
    const shortest_length = Math.min(container_width, container_height);
    let worst_aspect_ratio = Infinity;

    let max_unit_area = 0;
    let min_unit_area = Infinity;
    
    // Get maximum and minimum unit areas
    for (let k=0; k < children.length; k++) {
        const unit_weight = Object.values(children[k])[0];
        // Area of the unit is the weight proportional to the container
        const unit_area = unit_weight * container_area / sum_weights;

        if (unit_area > max_unit_area) {
            max_unit_area = unit_area;
        }
        if (unit_area < min_unit_area) {
            min_unit_area = unit_area;
        }        
    }
    
    let row = [];
    let unit_rects = [];

    // Get each child unit from a tree structure. Start from the second child
    for (let k=0; k < children.length; k++) {
        const unit_label = Object.keys(children[k])[0];
        
        const unit_weight = Object.values(children[k])[0];
        // Area of the unit is the weight proportional to the container
        const unit_area = unit_weight * container_area / sum_weights;

        if (row.length == 0) {row.push({[unit_label]: unit_area})}  // Initialize a new row with the first child
        
        const row_area = row.flatMap(obj => Object.values(obj)).reduce((total, v) => total + v, 0);  // Sum of unit areas in the row
        const row_width = row_area / shortest_length;  // Thickness of the row

        const unit_length = unit_area / row_width;  // Length of the unit along the row
        
        if (k < (children.length - 1)) {
            // Next unit
            const next_unit_label = Object.keys(children[k+1])[0];
        
            const next_unit_weight = Object.values(children[k+1])[0];
            // Area of the unit is the weight proportional to the container
            const next_unit_area = next_unit_weight * container_area / sum_weights;

            new_row = structuredClone(row).push({[next_unit_label]: next_unit_area});

            current_worst_aspect_ratio = get_worst_aspect_ratio(row, shortest_length);
            new_worst_aspect_ratio = get_worst_aspect_ratio(new_row, shortest_length);

            if (new_worst_aspect_ratio <= current_worst_aspect_ratio) {
                // Push current unit to row
                row.push({[unit_label]: unit_area});                        
            } else {
                // Freeze the row and then recursively start a new row
                if (shortest_length == container_width) {
                    // Horizontal strip. To Do: Similar to vertical strip but across longest side
                    for (const unit in row) {
                        let row_unit_label = Object.keys(unit)[0];

                        // To Do: Don't know what these values are
                        let start_x = 0;
                        let start_y = 0;
                        let end_x = 0;
                        let end_y = 0;

                        unit_rects.push({
                            [row_unit_label]:{
                                'start_x': start_x,
                                'start_y': start_y,
                                'end_x': end_x,
                                'end_y': end_y,
                            }
                        });

                        // Update drawing coords. To Do: Don't know what these values are
                        start_x += 0;
                        start_y += 0;
                        end_x += 0;
                        end_y += 0;
                    }

                    new_container_x = 0;
                    new_container_y = 0;
                    new_container_width = container_width;
                    new_container_height = container_height - row_width;
                    // Call squarify on remaining children units
                    return squarify(children.slice(k+1),  new_x, new_y, new_container_width, new_container_height);
                } else {
                    // Vertical strip
                    for (const unit in row) {
                        let row_unit_label = Object.keys(unit)[0];

                        // To Do: Don't know what these values are
                        let start_x = 0;
                        let start_y = 0;
                        let end_x = 0;
                        let end_y = 0;

                        unit_rects.push({
                            [row_unit_label]:{
                                'start_x': start_x,
                                'start_y': start_y,
                                'end_x': end_x,
                                'end_y': end_y,
                            }
                        });

                        // Update drawing coords. To Do: Don't know what these values are
                        start_x += 0;
                        start_y += 0;
                        end_x += 0;
                        end_y += 0;
                    }

                    new_container_x = 0;
                    new_container_y = 0;
                    new_container_width = container_width - row_width;
                    new_container_height = container_height;
                    // Call squarify on remaining children units
                    return squarify(children.slice(k+1),  new_x, new_y, new_container_width, new_container_height);
                }
            }
            
        } else if (k == (children.length - 1)) {
            // To Do: Last unit
            return unit_rects;
        }
    }
}


function drawMapSquarifiedTreeMap(ctx, allocation_data, stock_returns, map_width, map_height) {
    /* 
    Squarified Tree Map Algorithm
    
    Pack rectangles of a given area into a container of size (W, H),
    such that all of the rectangles fill the whole container with no gaps

    The aspect ratio of these rectangles are minimised to be closer to a square, which is visually better for human sight
    */
    
    /* Industry unit rects */
    industry_allocation_list = Object.entries(allocation_data["industry_allocations"]).map(([key, value]) => ({ [key]: value }));
    industry_unit_rects = squarify(industry_allocation_list, 0, 0, map_width, map_height);

    /* Stocks unit rects */
    // For each industry, get the stocks unit rects
    for (const industry in allocation_data["stocks_allocations"]) {
        // Draw industry unit
        // To Do: Enter actual arguments
        drawIndustryUnit(ctx, industry_label, start_x, start_y, end_x, end_y, color);

        stocks_allocation_list = Object.entries(allocation_data["stocks_allocations"][industry]).map(([key, value]) => ({ [key]: value }));
        stocks_unit_rects = squarify(stocks_allocation_list, 0, 0, map_width, map_height);

        for (const stock of stock_rects[industry]) {
            const ticker_label = Object.keys(stock)[0];
            const stock_return = stock_returns[ticker_label];

            // Draw stock unit
            // To Do: Enter actual arguments
            drawStockUnit(ctx, ticker_label, start_x, start_y, end_x, end_y, color, stock_return);
        }
    }
    
    /*
    Example structure of unit_rects:
    industry_unit_rects: {
        "TECHNOLOGY": {
            'start_x': 0,
            'start_y': 0,
            'end_x': 100,
            'end_y': 100,
        },
        "ENERGY": {
            'start_x': 100,
            'start_y': 0,
            'end_x': 200,
            'end_y': 100,
        },
        . . .
    }
    stocks_unit_rects: {
        "TECHNOLOGY": {
            'AAPL': {
                'start_x': 0,
                'start_y': 0,
                'end_x': 100,
                'end_y': 100,
            },
            'NVDA': {
                'start_x': 0,
                'start_y': 0,
                'end_x': 100,
                'end_y': 100,
            },
            . . .
        },
        "FINANCIAL": {
            'JPM': {
                'start_x': 0,
                'start_y': 0,
                'end_x': 100,
                'end_y': 100,
            },
            'BAC': {
                'start_x': 0,
                'start_y': 0,
                'end_x': 100,
                'end_y': 100,
            },
            . . .
        },
        . . .        
    }
    */
}

function main() {
    const fund_data = getFundData("SPX");
    const fund_market_caps = fund_data["market_caps"];
    const stock_returns = fund_data["stocks_returns"];
    const allocation_data = getMarketCapAllocation(fund_market_caps);

    console.log("Allocation Data:", allocation_data);

    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    drawMapSliceAndDice(ctx, allocation_data, stock_returns, canvas.width, canvas.height);
    //drawMapSquarifiedTreeMap(ctx, allocation_data, stock_returns, canvas.width, canvas.height)
};

main();