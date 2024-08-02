var default_board = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,2,1,0,0,0],[0,0,0,1,2,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
var board = structuredClone(default_board);
var canmove_pos = [
    [-1,-1], [-1,0], [-1,1],
    [0,-1], [0,1],
    [1,-1], [1,0], [1,1]
];
var max_depth = 4;

function reverse_color(color) {
    return color === 1 ? 2 : 1;
}

function list_equals(list1, list2) {
    if (list1.length !== list2.length) return false;
    for (let i = 0; i < list1.length; ++i) {
        if (list1[i] !== list2[i]) return false;
    }
    return true;
}

function in_list(list, target) {
    return list.filter(item => list_equals(item, target)).length!==0;
}

function can_place(board, color, tpos) {
    var y = tpos[0];
    var x = tpos[1];
    var ymax = board.length;
    var xmax = board[0].length;
    var ocolor = reverse_color(color);
    for (let pi = 0; pi < canmove_pos.length; ++pi) {
        var pos = canmove_pos[pi];
        var g_y = y + pos[0];
        var g_x = x + pos[1];
        if (board[g_y] === undefined) continue;
        if (board[g_y] === undefined || board[g_y][g_x] !== ocolor) continue;
        while (g_x < xmax && g_y < ymax && g_x >= 0 && g_y >= 0) {
            g_y = g_y + pos[0];
            g_x = g_x + pos[1];
            if (board[g_y] === undefined) break;
            if (board[g_y][g_x] === 0) break;
            if (board[g_y][g_x] === color) return true;
        }
    }
    return false;
}

function cvt_pos(pos) {
    if (typeof pos === "object") {
        return pos[0]+"_"+pos[1];
    }else{
        pos = pos.split("_");
        return [Number(pos[0]), Number(pos[1])];
    }
}

function get_valid_moves(board, color) {
    var valid_moves = [];
    var ocolor = reverse_color(color);
    var ymax = board.length;
    var xmax = board[0].length;
    for (let y = 0; y < ymax; ++y) {
        for (let x = 0; x < xmax; ++x) {
            if (board[y][x] !== 0) continue;
            canmove_pos.forEach(async function (pos) {
                var g_y = y + pos[0];
                var g_x = x + pos[1];
                if (board[g_y] === undefined || board[g_y][g_x] !== ocolor) return;
                while (g_x <= xmax && g_y <= ymax && g_x >= 0 && g_y >= 0) {
                    g_y = g_y + pos[0];
                    g_x = g_x + pos[1];
                    if (board[g_y] === undefined) return;
                    if (board[g_y][g_x] === 0) return;
                    if (board[g_y][g_x] === color) {
                        valid_moves.push([y,x]);
                        return;
                    }
                }
            });
        }
    }
    return valid_moves;
}

function place(original_board, color, tpos) {
    var board = structuredClone(original_board);
    var ocolor = reverse_color(color);
    var ymax = board.length;
    var xmax = board[0].length;
    var y = tpos[0];
    var x = tpos[1];
    canmove_pos.forEach(async function (pos) {
        var g_y = y + pos[0];
        var g_x = x + pos[1];
        if (board[g_y] === undefined || board[g_y][g_x] !== ocolor) return;
        var changes = [[y,x],[g_y,g_x]];
        while (g_x <= xmax && g_y <= ymax && g_x >= 0 && g_y >= 0) {
            g_y = g_y + pos[0];
            g_x = g_x + pos[1];
            if (board[g_y] === undefined) return;
            if (board[g_y][g_x] === 0) return;
            changes.push([g_y,g_x]);
            if (board[g_y][g_x] === color) {
                changes.forEach(p => {board[p[0]][p[1]] = color;});
                break;
            }
        }
    });
    return board;
}

function write_board(board, color=null) {
    var board_div = document.getElementById("board");
    var valid_moves = [];
    if (color !== null) {
        valid_moves = get_valid_moves(board, color);
    }
    board_div.innerHTML = "";
    var ymax = board.length;
    var xmax = board[0].length;
    for (let y = 0; y < ymax; ++y) {
        var stones = document.createElement("div");
        stones.classList.add("stones");
        for (let x = 0; x < xmax; ++x) {
            var stone = document.createElement("div");
            stone.dataset.color = board[y][x];
            stone.dataset.pos = cvt_pos([y,x]);
            stone.classList.add("stone");
            if (in_list(valid_moves, [y,x])) {
                stone.dataset.color = color;
                stone.classList.add("canplace");
            }
            stones.append(stone);
        }
        board_div.append(stones);
    }
}

var bot_turn = [2];
var turn = 1;
document.getElementById("board").addEventListener("click", async function(e){
    if (e.target.classList.contains("canplace")) {
        var pos = cvt_pos(e.target.dataset.pos);
        var y = pos[0];
        var x = pos[1];
        board = place(board, turn, [y,x]);
        turn = reverse_color(turn);
        if (bot_turn.includes(turn)){
            write_board(board);
            setTimeout(async function(){
                var res = await minimax(board, turn, max_depth);
                board = place(board, turn, res[1]);
                turn = reverse_color(turn);
                write_board(board, turn);
            });
        }else{
            write_board(board, turn);
        }
    }
});

function board_score(board, color, ocolor) {
    var score = 0;
    board.forEach(xb => xb.forEach(yb => {
        if (yb === color){++score;}
        if (yb === ocolor){--score;}
    }));
    return score;
}

async function minimax(board, color, depth, ocolor=null, minimax_rplayer=true, first=false) {
    if (ocolor === null) var ocolor = reverse_color(color);
    var moves = get_valid_moves(board, color);
    if (depth <= 0 || moves.length === 0) {
        return [board_score(board, color, ocolor), null];
    }
    var min = Infinity;
    var max = -Infinity;
    var best = null;
    if (minimax_rplayer) {
        var minimax_res_list = [];
        moves.forEach(async vpos => {
            var minimax_res = minimax(place(board, color, vpos), ocolor, depth - 1, color, false);
            minimax_res_list.push([minimax_res,vpos]);
        });
        for (minimax_res_set of minimax_res_list) {
            var minimax_res = minimax_res_set[0], vpos = minimax_res_set[1];
            var score = (await minimax_res)[0];
            if (score > max) {
                max = score;
                best = vpos;
            }
        }
        return [max, best];
    }else{
        var minimax_res_list = [];
        moves.forEach(vpos => {
            var minimax_res = minimax(place(board, color, vpos), color, depth - 1, ocolor, true);
            minimax_res_list.push([minimax_res,vpos]);
        });
        for (minimax_res_set of minimax_res_list) {
            var minimax_res = minimax_res_set[0], vpos = minimax_res_set[1];
            var score = (await minimax_res)[0];
            if (score < min) {
                min = score;
                best = vpos;
            }
        }
        return [min, best];
    }
}

write_board(default_board,1);