// Very basic snake game in JS (placeholder)
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let x = 200, y = 200;
document.addEventListener("keydown", move);
function move(e) {
    ctx.clearRect(0, 0, 400, 400);
    if (e.key === "ArrowUp") y -= 10;
    if (e.key === "ArrowDown") y += 10;
    if (e.key === "ArrowLeft") x -= 10;
    if (e.key === "ArrowRight") x += 10;
    ctx.fillStyle = "lime";
    ctx.fillRect(x, y, 20, 20);
}
move({ key: "" }); // initial draw
