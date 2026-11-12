/*
Stocks Viz Map Script
*/

function drawTest(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 500, 500);

    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Hello World", 125, 250);
}

function main() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    drawTest(ctx);
};

main();