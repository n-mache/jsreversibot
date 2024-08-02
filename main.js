var default_board = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,2,0,0,0],[0,0,0,2,1,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
var canmove_pos = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1], [0,1],
    [1,-1], [1,0], [1,1]
]

function reverse_color(color) {
    return color === 1 ? 2 : 1;
}

async function get_valid_moves(board, color) {
    var valid_moves = [];
    var ocolor = reverse_color(color);
    var xmax = board.length;
    var ymax = board[0].length;
    for (let x = 0; x < xmax; ++x) {
        for (let y = 0; y < ymax; ++y) {
            if (board[x][y] !== 0) continue;
            canmove_pos.forEach(async function (pos) {
                var g_x = x + pos[0];
                var g_y = y + pos[1];
                if (board[g_y] === undefined || board[g_y][g_x] !== ocolor) return;
                while (g_x <= xmax && g_y <= ymax && g_x > 0 && g_y > 0) {
                    g_x = g_x + pos[0];
                    g_y = g_y + pos[1];
                    console.log(g_x,g_y);
                    if (board[g_y][g_x] === 0) return;
                    if (board[g_y][g_x] === color) {
                        valid_moves.push([x,y]);
                        break;
                    }
                }
            });
        }
    }
    return valid_moves
}

function write_board(board) {
    var board_div = document.getElementById("board");
    board_div.innerHTML = "";
    var xmax = board.length;
    var ymax = board[0].length;
    for (let x = 0; x < xmax; ++x) {
        var stones = document.createElement("div");
        stones.classList.add("stones");
        for (let y = 0; y < ymax; ++y) {
            var stone = document.createElement("div");
            stone.dataset.color = board[x][y];
            stone.classList.add("stone");
            stones.append(stone);
        }
        board_div.append(stones);
    }
}

async function get_next() {
}

write_board(default_board);