/*
Stocks Viz Map Script
*/

function get_SPX_data() {
    /* Hard-coded data for now. API call to be implemented later. */
    
    // Market capitalization data by industry (in billions USD). Note: fictional values
    const fund_market_caps = {
        "Technology": {
            "APPL": 5200.00,
            "NVDA": 3900.00,
            "MSFT": 3850.00,
            // Add others later 
        },
        "Financial": {
            "JPM": 900.00,
            "BAC": 350.00,
            "WFC": 100.00,
            // Add others later 
        },
        "Health Care": {
            "LLY": 1290.00,
            "JNJ": 580.00,
            "ABBV": 125.00,
            // Add others later
        },
        "Industrials": {
            "GE": 650.00,
            "CAT": 210.00,
            "BA": 130.00,
            // Add others later
        },
        "Energy": {
            "XOM": 730.00,
            "CVX": 400.00,
            // Add others later
        },
        "Other": {
            "MCD": 400.00,
            "KO": 250.00,
            // Add others later
        }
    }

    // Daily returns (%). Note: fictional values
    const stocks_returns = {
        "APPL": 0.73,
        "NVDA": -6.90,
        "MSFT": 0.72,
        "JPM": 1.0,
        "BAC": -1.0,
        "WFC": 2.0,
        "LLY": 1.0,
        "JNJ": 0.5,
        "ABBV": 1.5,
        "GE": -3.5,
        "CAT": 0.8,
        "BA": 0.3,
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

function drawMapSquareGrid(ctx, allocation_data, stock_returns, map_width, map_height) {
    /* Map: Grid units are squares and their area is the market cap allocation */
    const total_map_area = map_width * map_height;

    // Grid units will be layed out horizontally
    let industry_start_x = 0;

    for (const industry in allocation_data["industry_allocations"]) {
        // Industry grid unit

        // Width and height are square root of the allocation percentage (area) multiplied by a scaling factor
        const industry_market_cap_allocation = allocation_data["industry_allocations"][industry];
        const industry_unit_area = industry_market_cap_allocation * total_map_area;

        // If all units are stacked horizontally, the total width will exceed the canvas width. Dividing by 2 for visibility.
        const industry_unit_width = industry_unit_height = Math.sqrt(industry_unit_area) / 2;
        const total_industry_area = industry_unit_width * industry_unit_height;
        
        ctx.fillStyle = "black";
        ctx.fillRect(industry_start_x, 0, industry_unit_width, industry_unit_height);

        // Industry label
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(industry, industry_start_x, 20);  

        // Stocks grid unit
        let stocks_start_x = industry_start_x;
        for (const stock in allocation_data["stocks_allocations"][industry]) {
            const stocks_market_cap_allocation = allocation_data["stocks_allocations"][industry][stock];
            
            const stocks_unit_area = stocks_market_cap_allocation * total_industry_area;
            // If all units are stacked horizontally, the total width will exceed the canvas width. Dividing by 2 for visibility.
            const stocks_unit_width = stocks_unit_height = Math.sqrt(stocks_unit_area) / 2;

            const stock_return = stock_returns[stock];
            if (stock_return > 0) {
                ctx.fillStyle = "green";
            } else if (stock_return < 0) {
                ctx.fillStyle = "red";
            }

            ctx.fillRect(stocks_start_x, 50, stocks_unit_width, stocks_unit_height);
            
            // Stock label
            ctx.font = "12px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(stock, stocks_start_x, 70);

            // Stock return label
            ctx.font = "12px Arial";
            ctx.fillStyle = "white";
            
            ctx.fillText(stock_return+'%', stocks_start_x, 100);

            stocks_start_x += stocks_unit_width;
        }

        industry_start_x += industry_unit_width;
    }
}

function drawMapSliceAndDice(ctx, allocation_data, stock_returns, map_width, map_height) {
    /* 
    Slice and Dice Algorithm
    
    Pack rectangles of a given area into a container of size (w, h)
    such that all of the rectangles fill the whole container with no gaps

    The rectangles will be arranged across a single axis: horizontally. This may cause some to be visually hard to see 
    */
    const total_map_area = map_width * map_height;

    /* Render industries */
    let industry_unit_start_x = 0;
    let industry_unit_start_y = 0;
    let industry_unit_end_x;
    let industry_unit_end_y;

    // For each industry unit (in descending order by market cap)
    for (const industry in allocation_data["industry_allocations"]) {
        const industry_market_cap_allocation = allocation_data["industry_allocations"][industry];
        
        // Area of individual unit
        const industry_unit_area = industry_market_cap_allocation * total_map_area;

        // First compute the width on the horizontal axis of the map
        const industry_unit_width = industry_market_cap_allocation * map_width;
        const industry_unit_height = industry_unit_area / industry_unit_width;

        industry_unit_end_x =  industry_unit_width;
        industry_unit_end_y =  industry_unit_height;

        ctx.fillStyle = "black";
        ctx.fillRect(industry_unit_start_x, industry_unit_start_y, industry_unit_end_x, industry_unit_end_y);

        // Industry label
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(industry, industry_unit_start_x+10, industry_unit_start_y+20); 

        // Move starting x_coord to begin drawing the next unit
        industry_unit_start_x += industry_unit_width;        
    }
}

function drawMap() {
    /* 
    Squarified Tree Map Algorithm
    
    Pack rectangles of a given area into a container of size (w, h)
    such that all of the rectangles fill the whole container with no gaps

    The aspect ratio of the rectangles should be optimised to a square to help visually for human sight
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

    //drawMapSquareGrid(ctx, allocation_data, stock_returns, map_width=canvas.width, map_height=canvas.height);
    drawMapSliceAndDice(ctx, allocation_data, stock_returns, map_width=canvas.width, map_height=canvas.height);
};

main();