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
        "AAPL": 1.00,
        "NVDA": -3.50,
        "MSFT": 0.0,
        "JPM": 0.5,
        "BAC": -2.2,
        "WFC": 1.0,
        "LLY": 1.0,
        "JNJ": 0.5,
        "ABBV": -1.4,
        "GE": 2.9,
        "CAT": 0.8,
        "BA": 0.0,
        "XOM": 0.6,
        "CVX": 4.5,
        "MCD": 1.20,
        "KO": 3.05,
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
    if (fundID === "SPX") {return get_SPX_data();} 
    else if (fundID === "NDX") {return get_NDX_data();} 
    else if (fundID === "UKX") {return get_UKX_data();}
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

    if (stock_return <= -3) {return "#f63538";}  // Deep red
    else if (stock_return <= -2) {return "#bf4045";}  // Red
    else if (stock_return <= -1) {return "#8b444e";}  // Light red
    else if (stock_return >= 1) {return "#35764e";}  // Light green
    else if (stock_return >= 2) {return "#2f9e4f";}  // Green
    else if (stock_return >= 3) {return "#30cc5a";}  // Bright green
    else {return "#414554";}    // Grey (0%)
}


function drawIndustryUnit(ctx, industry_label, start_x, start_y, width, height, bg_color) {
    /* Render industry unit rectangle to canvas */
    
    // Draw unit    
    ctx.fillStyle = bg_color;  // Set unit background color
    ctx.fillRect(start_x, start_y, width, height);
    
    // Draw label in header
    const label_font_size = 14;
    ctx.font = `bold ${label_font_size}px Arial`;
    ctx.fillStyle = "#F7F7F7";  // Light white

    // Margin space for header
    const label_margin_left = 10;
    const label_margin_top = 10 + label_font_size;

    const label_start_x = start_x + label_margin_left;    
    const label_start_y = start_y + label_margin_top;

    ctx.fillText(industry_label, label_start_x, label_start_y);

    let header_height = label_margin_top + 10;  // Create margin for header and get its total height

    return header_height;
}


function drawStockUnit(ctx, ticker_label, start_x, start_y, width, height, bg_color, stock_return) {
    /* Render stock unit rectangle to canvas */
    
    // Draw unit
    ctx.fillStyle = bg_color;  // Set unit background color            
    ctx.fillRect(start_x, start_y, width, height);

    const unit_area = width * height;

    // Draw ticker label
   
    // Dynamic font size proportional to area
    const font_size_sf = 1000
    let ticker_font_size = Math.min(unit_area/font_size_sf, 50);  // Max font size: 50
    //if (ticker_font_size < 10) {ticker_font_size = 0;}  // Min font size: 10, otherwise hide label

    ctx.font = `${ticker_font_size}px Tahoma`;
    ctx.fillStyle = "#F7F7F7";  // Light white
    
    // Text shadow
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#000";

    // Margin for ticker and return labels
    const ticker_margin_left = 10;
    const ticker_margin_top = ticker_font_size;
    
    const ticker_start_x = start_x + ticker_margin_left
    const ticker_start_y = start_y + ticker_margin_top

    ctx.fillText(ticker_label, ticker_start_x, ticker_start_y);

    // Draw stock return
    let returns_font_size = ticker_font_size - 10 // Slightly smaller than stock ticker label
    //if (returns_font_size < 10) {returns_font_size = 0;}  // Min font size: 10, otherwise hide label
    
    ctx.font = `${returns_font_size}px Tahoma`;
    ctx.fillStyle = "white";
    // Text shadow
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = "#000";

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

    let stocks_unit_start_x;
    let stocks_unit_start_y;

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

        // Draw industry unit
        const industry_header_height = drawIndustryUnit(ctx, 
            industry, industry_unit_start_x, industry_unit_start_y, 
            industry_unit_width, industry_unit_height, 
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
            
            const stock_return = stock_returns[stock];
            
            drawStockUnit(ctx, stock, 
                stocks_unit_start_x, stocks_unit_start_y, 
                stocks_unit_width, stocks_unit_height, 
                getStockUnitColor(stock_return),
                stock_return
            );

            stocks_unit_start_x += stocks_unit_width;
        }

        // Move starting x_coord to begin drawing the next unit
        industry_unit_start_x += industry_unit_width;        
    }
}


function get_worst_aspect_ratio(row_areas, shortest_length) {
    const row_total_area = row_areas.reduce((a, b) => a + b, 0);  // Sum of unit areas in the row
    const max_unit_area = row_areas[0];  // First area item is the largest
    const min_unit_area = row_areas[row_areas.length - 1];  // Last area item is the largest

    // Worst aspect ratio depends on the largest and smallest unit areas
    return Math.max( ((shortest_length**2 * max_unit_area) / row_total_area**2), (row_total_area**2 / (shortest_length**2 * min_unit_area)) );
}


function squarify(children, unit_rects, container_x, container_y, container_width, container_height) {
    /* Recursively minimise the aspect ratio of the unit's rectangle being drawn */    
    const container_area = container_width * container_height;
    const sum_weights = children.reduce((total, obj) => total + Object.values(obj)[0], 0);
    
    const shortest_length = Math.min(container_width, container_height);

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
    
    let row_areas = [];  // Stores unit areas in a row
    let labels = [];  // Stores unit labels

    // Get each child unit from a tree structure. Start from the second child
    for (let k=0; k < children.length; k++) {
        const unit_label = Object.keys(children[k])[0];
        const unit_weight = Object.values(children[k])[0];

        // Area of the unit is the weight proportional to the container
        const unit_area = unit_weight * container_area / sum_weights;

        if (row_areas.length == 0) {
            // Initialize a new row with the first unit
            row_areas.push(unit_area);
            labels.push(unit_label);
        }
        
        const row_total_area = row_areas.reduce((a, b) => a + b, 0);  // Sum of unit areas in the row
        const row_thickness = row_total_area / shortest_length;  // Thickness of the row
        
        // Check if unit is not the last
        if (k < (children.length - 1)) {
            // Next unit      
            const next_unit_label = Object.keys(children[k+1])[0]; 
            const next_unit_weight = Object.values(children[k+1])[0];

            // Area of the unit is the weight proportional to the container
            const next_unit_area = next_unit_weight * container_area / sum_weights;

            let new_row_areas = structuredClone(row_areas);
            new_row_areas.push(next_unit_area);

            const current_worst_aspect_ratio = get_worst_aspect_ratio(row_areas, shortest_length);
            const new_worst_aspect_ratio = get_worst_aspect_ratio(new_row_areas, shortest_length);

            // Check if new unit will make the aspect ratio lower
            if (new_worst_aspect_ratio <= current_worst_aspect_ratio) {
                // Push next unit's area to row and store its label
                row_areas.push(next_unit_area);
                labels.push(next_unit_label);
            } else {
                /* Lay out the current row */
                if (shortest_length == container_width) {
                    // Horizontal strip
                    let start_x = container_x;

                    // For each item in the row
                    for (let i=0; i < row_areas.length; i++) {
                        const unit_width = row_areas[i] / row_thickness;
                        const row_unit_label = labels[i];

                        unit_rects.push({
                            [row_unit_label]:{
                                'start_x': start_x,
                                'start_y': container_y,  // Unit starting y-coord is fixed
                                'width': unit_width,
                                'height': row_thickness,  // Unit height is fixed by row thickness
                            }
                        });

                        // Update starting x by unit length
                        start_x += unit_width;
                    }                    

                    const new_x = container_x;
                    const new_y = container_y + row_thickness;  // Move new container vertically by row thickness

                    const new_container_width = container_width;
                    const new_container_height = container_height - row_thickness;

                    // Call squarify recursively on remaining children units
                    return squarify(children.slice(k+1), unit_rects, new_x, new_y, new_container_width, new_container_height);
                } else {
                    // Vertical strip
                    let start_y = container_y;

                    // For each item in the row
                    for (let i=0; i < row_areas.length; i++) {
                        const unit_height = row_areas[i] / row_thickness;
                        const row_unit_label = labels[i];

                        unit_rects.push({
                            [row_unit_label]:{
                                'start_x': container_x,  // Unit starting x-coord is fixed
                                'start_y': start_y,
                                'width': row_thickness,  // Unit width is fixed by row thickness
                                'height': unit_height,
                            }
                        });

                        // Update starting y by unit length
                        start_y += unit_height;
                    }

                    const new_x = container_x + row_thickness;  // Move new container horizontally by row thickness
                    const new_y = container_y;

                    const new_container_width = container_width - row_thickness;
                    const new_container_height = container_height;

                    // Call squarify recursively on remaining children units
                    return squarify(children.slice(k+1), unit_rects, new_x, new_y, new_container_width, new_container_height);
                }
            }
            
        } else if (k == (children.length - 1)) {
            /* Last unit in the row */
            
            // Area of the unit is the remaining amount left in the container
            const unit_area = container_area - row_total_area

            // Push current unit's area to row and store its label
            row_areas.push(unit_area);
            labels.push(unit_label);            
            
            /* Lay out the current row */
            if (shortest_length == container_width) {
                // Horizontal strip
                let start_x = container_x;

                const unit_width = row_areas[0] / row_thickness;
                const row_unit_label = labels[0];

                unit_rects.push({
                    [row_unit_label]:{
                        'start_x': start_x,
                        'start_y': container_y,  // Unit starting y-coord is fixed
                        'width': unit_width,
                        'height': row_thickness,  // Unit height is fixed by row thickness
                    }
                });

                // Update starting x by unit length
                start_x += unit_width;
                
                return unit_rects;
            } else {
                // Vertical strip
                let start_y = container_y;

                const unit_height = row_areas[0] / row_thickness;
                const row_unit_label = labels[0];

                unit_rects.push({
                    [row_unit_label]:{
                        'start_x': container_x,  // Unit starting x-coord is fixed
                        'start_y': start_y,
                        'width': row_thickness,  // Unit width is fixed by row thickness
                        'height': unit_height,
                    }
                });

                // Update starting y by unit length
                start_y += unit_height;
            
                return unit_rects;
            }
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
    
    let industry_unit_rects = [];
    // Initialise at (0,0) on the container of size (map_width, map_height)
    industry_unit_rects = squarify(industry_allocation_list, industry_unit_rects, 
        0, 0, 
        map_width, map_height
    );
    
    industry_unit_rects = Object.assign({}, ...industry_unit_rects);  // Unwrap list of unit rect objects
    
    // For each industry, get the stocks unit rects
    for (const industry in allocation_data["stocks_allocations"]) {
        let border_size = 2;
        // Draw industry unit
        const start_x = industry_unit_rects[industry].start_x + border_size;
        const start_y = industry_unit_rects[industry].start_y + border_size;
        const industry_unit_width = industry_unit_rects[industry].width - border_size;
        const industry_unit_height = industry_unit_rects[industry].height - border_size;
        const bg_color = "#262931";  // Dark grey

        const industry_header_height = drawIndustryUnit(ctx, industry, 
            start_x, start_y, 
            industry_unit_width, industry_unit_height, 
            bg_color
        );

        /* Stocks unit rects */
        // Add margin space for industry header
        const stocks_region_area = industry_unit_width * (industry_unit_height - industry_header_height)  // Region where stocks are rendered is below the header

        let stocks_unit_rects = [];
        // Get stocks for the current industry
        stocks_allocation_list = Object.entries(allocation_data["stocks_allocations"][industry]).map(([key, value]) => ({ [key]: value }));
        // The current industry's width and height form the container for the stocks
        stocks_unit_rects = squarify(stocks_allocation_list, stocks_unit_rects, 
            start_x, start_y+industry_header_height, 
            industry_unit_width, (industry_unit_height - industry_header_height)
        );
        
        stocks_unit_rects = Object.assign({}, ...stocks_unit_rects);  // Unwrap list of unit rect objects
        for (const stock_ticker in stocks_unit_rects) {
            border_size = 1;
            const stock_return = stock_returns[stock_ticker];

            // Draw stock unit
            const start_x = stocks_unit_rects[stock_ticker].start_x + border_size;
            const start_y = stocks_unit_rects[stock_ticker].start_y + border_size;
            const stock_width = stocks_unit_rects[stock_ticker].width - border_size;
            const stock_height = stocks_unit_rects[stock_ticker].height - border_size;
            const bg_color = getStockUnitColor(stock_return);

            drawStockUnit(ctx, stock_ticker, 
                start_x, start_y, 
                stock_width, stock_height, 
                bg_color, 
                stock_return
            );
        }
    }
}


function main() {
    const fund_data = getFundData("SPX");
    const fund_market_caps = fund_data["market_caps"];
    const stock_returns = fund_data["stocks_returns"];
    const allocation_data = getMarketCapAllocation(fund_market_caps);

    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    //drawMapSliceAndDice(ctx, allocation_data, stock_returns, canvas.width, canvas.height);
    drawMapSquarifiedTreeMap(ctx, allocation_data, stock_returns, canvas.width, canvas.height)
};


main();