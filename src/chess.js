"use strict";
var Pieces;
(function (Pieces) {
    Pieces[Pieces["King"] = 0] = "King";
    Pieces[Pieces["Queen"] = 1] = "Queen";
    Pieces[Pieces["Bishop"] = 2] = "Bishop";
    Pieces[Pieces["Knight"] = 3] = "Knight";
    Pieces[Pieces["Rook"] = 4] = "Rook";
    Pieces[Pieces["Pawn"] = 5] = "Pawn";
})(Pieces || (Pieces = {}));
;
const VALUE = new Map([[Pieces.Queen, 8], [Pieces.Bishop, 7],
    [Pieces.Knight, 6], [Pieces.Rook, 5], [Pieces.Pawn, 4]]);
var Color;
(function (Color) {
    Color[Color["Black"] = 0] = "Black";
    Color[Color["White"] = 1] = "White";
})(Color || (Color = {}));
const PAWN_PROMOTE_RANK = new Map([[Color.White, 7], [Color.Black, 0]]);
const FILES = "abcdefgh";
const RANKS = "12345678";
function directions(color) {
    if (color === Color.White) {
        return 1;
    }
    return -1;
}
function pawn_rank(color) {
    if (color === Color.White) {
        return 1;
    }
    return 6;
}
function opponent(color) {
    if (color === Color.White) {
        return Color.Black;
    }
    return Color.White;
}
function value(piece) {
    let value = VALUE.get(piece);
    if (value == undefined) {
        return 0;
    }
    return value;
}
class Coordinate {
    constructor(rank, file) {
        this.rank = rank;
        this.file = file;
    }
    toString() {
        return "[" + this.rank + "," + this.file + "]";
    }
}
Coordinate.prototype.toString = function coordToString() {
    return "[" + this.rank + "," + this.file + "]";
};
class Piece {
    constructor(color, piece) {
        this.color = color;
        this.piece = piece;
    }
    same(other) {
        return other.color == this.color && other.piece == this.piece;
    }
    toString() {
        return this.color.toString() + this.piece.toString();
    }
    can_move(coordinate_from, coordinate_to, board) {
        return true;
    }
    can_attack(coordinate_from, coordindate_to, board) {
        return this.can_move(coordinate_from, coordindate_to, board);
    }
}
function get_sign_diff(start, end) {
    if (start == end)
        return 0;
    if (start > end)
        return -1;
    return 1;
}
function is_diagonal(start, end) {
    let rank_delta = Math.abs(start.rank - end.rank);
    let file_delta = Math.abs(start.file - end.file);
    return rank_delta === file_delta && !(rank_delta === 0 && file_delta === 0);
}
function is_horizontal_or_vertical(start, end) {
    let rank_delta = start.rank - end.rank;
    let file_delta = start.file - end.file;
    return rank_delta == 0 || file_delta == 0 && !(rank_delta == 0 && file_delta == 0);
}
class King extends Piece {
    constructor(color) {
        super(color, Pieces.King);
    }
    can_move(coordinate_from, coordinate_to, board) {
        let rank_delta = Math.abs(coordinate_from.rank - coordinate_to.rank);
        let file_delta = Math.abs(coordinate_from.file - coordinate_to.file);
        return (rank_delta == 1 && file_delta == 1) ||
            (rank_delta == 0 && file_delta == 1) ||
            (rank_delta == 1 && file_delta == 0);
    }
}
class Pawn extends Piece {
    constructor(color) {
        super(color, Pieces.Pawn);
    }
    can_move(coordinate_from, coordinate_to, board) {
        let rank_delta = coordinate_to.rank - coordinate_from.rank;
        let file_delta = coordinate_to.file - coordinate_from.file;
        let direction = directions(this.color);
        if (file_delta === 0) {
            if (pawn_rank(this.color) === coordinate_from.rank) {
                let all_empty = board.all_empty(coordinate_from, coordinate_to);
                return rank_delta == direction || (all_empty && rank_delta == 2 * direction);
            }
        }
        else {
            return rank_delta === direction;
        }
        return false;
    }
    can_attack(coordinate_from, coordinate_to, board) {
        let rank_delta = coordinate_to.rank - coordinate_from.rank;
        let file_delta = Math.abs(coordinate_to.file - coordinate_from.file);
        let direction = directions(this.color);
        return file_delta == 1 && rank_delta == direction;
    }
}
class Rook extends Piece {
    constructor(color) {
        super(color, Pieces.Rook);
    }
    can_move(coordinate_from, coordinate_to, board) {
        return is_horizontal_or_vertical(coordinate_from, coordinate_to) &&
            board.all_empty(coordinate_from, coordinate_to);
    }
}
class Knight extends Piece {
    constructor(color) {
        super(color, Pieces.Knight);
    }
    can_move(coordinate_from, coordinate_to, board) {
        let rank_delta = Math.abs(coordinate_from.rank - coordinate_to.rank);
        let file_delta = Math.abs(coordinate_from.file - coordinate_to.file);
        return (rank_delta == 1 && file_delta == 2) || (rank_delta == 2 && file_delta == 1);
    }
}
class Bishop extends Piece {
    constructor(color) {
        super(color, Pieces.Bishop);
    }
    can_move(coordinate_from, coordinate_to, board) {
        return is_diagonal(coordinate_from, coordinate_to) &&
            board.all_empty(coordinate_from, coordinate_to);
    }
}
class Queen extends Piece {
    constructor(color) {
        super(color, Pieces.Queen);
    }
    can_move(coordinate_from, coordinate_to, board) {
        return (is_horizontal_or_vertical(coordinate_from, coordinate_to) ||
            is_diagonal(coordinate_from, coordinate_to)) &&
            board.all_empty(coordinate_from, coordinate_to);
    }
}
function get_coordinates(start, end) {
    let rank_start = start.rank;
    let rank_end = end.rank;
    let file_start = start.file;
    let file_end = end.file;
    let rank_sign = get_sign_diff(rank_start, rank_end);
    let file_sign = get_sign_diff(file_start, file_end);
    let rank_diff = Math.abs(rank_start - rank_end);
    let file_diff = Math.abs(file_start - file_end);
    let num_squares = Math.max(rank_diff, file_diff) - 1;
    let rank = rank_start;
    let file = file_start;
    let coordinates = [];
    for (let square = 0; square < num_squares; square++) {
        rank = rank + rank_sign;
        file = file + file_sign;
        coordinates.push(new Coordinate(rank, file));
    }
    return coordinates;
}
class Board {
    constructor() {
        this.pieces = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.pieces[i] = new Array(8);
        }
    }
    initPieces(pieces) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                this.pieces[rank][file] = pieces[rank][file];
            }
        }
    }
    toString() {
        let result = "";
        for (let rank = 7; rank >= 0; rank--) {
            let row = "";
            for (let file = 0; file < 8; file++) {
                let piece = this.get_piece_at(new Coordinate(rank, file));
                if (piece == undefined) {
                    row = row + "   ";
                }
                else {
                    row = row + piece.toString() + " ";
                }
            }
            result = result + "\n" + row;
        }
        return result;
    }
    find_piece(piece) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const pieceHere = this.pieces[rank][file];
                if (pieceHere != undefined && pieceHere.same(piece)) {
                    return new Coordinate(rank, file);
                }
            }
        }
        return undefined;
    }
    king_in_check(color) {
        let coordinate_king = this.find_piece(new King(color));
        if (coordinate_king != undefined) {
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    let piece = this.pieces[rank][file];
                    if (piece != undefined && piece.color !== color) {
                        if (piece.can_attack(new Coordinate(rank, file), coordinate_king, this)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    put_piece(coordinate, piece) {
        this.pieces[coordinate.rank][coordinate.file] = piece;
    }
    initialize() {
        let rank = 1;
        for (let file = 0; file < 8; file++) {
            this.put_piece(new Coordinate(rank, file), new Pawn(Color.White));
        }
        this.put_piece(new Coordinate(0, 0), new Rook(Color.White));
        this.put_piece(new Coordinate(0, 7), new Rook(Color.White));
        this.put_piece(new Coordinate(0, 1), new Knight(Color.White));
        this.put_piece(new Coordinate(0, 6), new Knight(Color.White));
        this.put_piece(new Coordinate(0, 2), new Bishop(Color.White));
        this.put_piece(new Coordinate(0, 5), new Bishop(Color.White));
        this.put_piece(new Coordinate(0, 3), new Queen(Color.White));
        this.put_piece(new Coordinate(0, 4), new King(Color.White));
        rank = 6;
        for (let file = 0; file < 8; file++) {
            this.put_piece(new Coordinate(rank, file), new Pawn(Color.Black));
        }
        this.put_piece(new Coordinate(7, 0), new Rook(Color.Black));
        this.put_piece(new Coordinate(7, 7), new Rook(Color.Black));
        this.put_piece(new Coordinate(7, 1), new Knight(Color.Black));
        this.put_piece(new Coordinate(7, 6), new Knight(Color.Black));
        this.put_piece(new Coordinate(7, 2), new Bishop(Color.Black));
        this.put_piece(new Coordinate(7, 5), new Bishop(Color.Black));
        this.put_piece(new Coordinate(7, 3), new Queen(Color.Black));
        this.put_piece(new Coordinate(7, 4), new King(Color.Black));
    }
    all_empty(start, end) {
        let coordinates = get_coordinates(start, end);
        for (let coordinate of coordinates) {
            if (this.pieces[coordinate.rank][coordinate.file] != undefined) {
                return false;
            }
        }
        return true;
    }
    get_piece_at(coordinate) {
        return this.pieces[coordinate.rank][coordinate.file];
    }
    get_not_empty(color) {
        let coordinates = [];
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                let piece = this.pieces[rank][file];
                if (piece != undefined && piece.color === color) {
                    coordinates.push(new Coordinate(rank, file));
                }
            }
        }
        return coordinates;
    }
    get_empty(color) {
        let coordinates = [];
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                let piece = this.pieces[rank][file];
                if (piece == undefined) {
                    coordinates.push(new Coordinate(rank, file));
                }
            }
        }
        return coordinates;
    }
    move(coordinate_from, coordinate_to) {
        let new_board = new Board();
        new_board.initPieces(this.pieces);
        let piece = new_board.pieces[coordinate_from.rank][coordinate_from.file];
        let piece_to_replace = new_board.pieces[coordinate_to.rank][coordinate_to.file];
        if (piece != undefined && piece.piece == Pieces.Pawn && coordinate_to.rank == PAWN_PROMOTE_RANK.get(piece.color)) {
            piece_to_replace = new Queen(piece.color);
        }
        if (piece_to_replace !== undefined) {
            new_board.pieces[coordinate_to.rank][coordinate_to.file] = piece_to_replace;
        }
        new_board.pieces[coordinate_from.rank][coordinate_from.file] = undefined;
        return new_board;
    }
    get_moves(my_coordinates, blank_coordinates, color) {
        let moves = [];
        for (let blank_coordinate of blank_coordinates) {
            for (let my_coordinate of my_coordinates) {
                let my_piece = this.get_piece_at(my_coordinate);
                if (my_piece != undefined && my_piece.can_move(my_coordinate, blank_coordinate, this)) {
                    let move = new Move(my_coordinate, blank_coordinate, this);
                    if (!move.in_check.get(color)) {
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }
    get_captures(my_coordinates, others_coordinates, color) {
        let moves = [];
        for (let other_coordinate of others_coordinates) {
            for (let my_coordinate of my_coordinates) {
                let my_piece = this.get_piece_at(my_coordinate);
                if (my_piece != undefined && my_piece.can_attack(my_coordinate, other_coordinate, this)) {
                    let move = new Move(my_coordinate, other_coordinate, this);
                    if (!move.in_check.get(color)) {
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }
    not_matches_king(coordinate) {
        let piece = this.get_piece_at(coordinate);
        return (piece != undefined && piece.piece != Pieces.King);
    }
    remove_king(others_coordinates) {
        return others_coordinates.filter(coordinate => this.not_matches_king(coordinate));
    }
    any_moves(color) {
        let opp = opponent(color);
        let others_coordinates = this.get_not_empty(opp);
        others_coordinates = this.remove_king(others_coordinates);
        let empty_coordinates = this.get_empty(color);
        let my_coordinates = this.get_not_empty(color);
        let captures = this.get_captures(my_coordinates, others_coordinates, color);
        if (captures.length > 0) {
            return true;
        }
        let non_captures = this.get_moves(my_coordinates, empty_coordinates, color);
        return non_captures.length > 0;
    }
}
function value_captured(move) {
    if (move.captured === undefined) {
        return 0;
    }
    else {
        return value(move.captured.piece);
    }
}
class Move {
    constructor(coordinate_from, coordinate_to, board_before) {
        this.coordinate_to = coordinate_to;
        this.coordinate_from = coordinate_from;
        this.board_before = board_before;
        this.board_after = board_before.move(coordinate_from, coordinate_to);
        this.in_check = new Map([[Color.Black, this.board_after.king_in_check(Color.Black)],
            [Color.White, this.board_after.king_in_check(Color.White)]]);
        this.captured = this.board_before.get_piece_at(this.coordinate_to);
    }
    toString() {
        let capture = "";
        if (this.captured != undefined) {
            capture = "x";
        }
        let piece = this.board_before.get_piece_at(this.coordinate_from);
        let piece_str = "";
        if (piece != undefined) {
            if (piece.piece == Pieces.Pawn) {
                piece_str = "";
            }
            else {
                piece_str = piece.toString();
            }
        }
        return piece_str + capture + this.coordinate_to.toString();
    }
}
function get_check_moves(moves, color) {
    let check_moves = [];
    let opp = opponent(color);
    for (let move of moves) {
        let in_check = move.in_check.get(opp);
        if (in_check != undefined && in_check) {
            check_moves.push(move);
        }
    }
    return check_moves;
}
function get_check_mate_moves(check_moves, color) {
    let check_mate_moves = [];
    for (let move of check_moves) {
        if (!move.board_after.any_moves(opponent(color))) {
            check_mate_moves.push(move);
        }
    }
    return check_mate_moves;
}
function get_best_move_captured(moves) {
    if (moves.length == 1) {
        return moves[0];
    }
    moves.sort(value_captured);
    return moves[moves.length - 1];
}
function get_best_move_non_captured(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
}
class Game {
    constructor() {
        this.board = new Board();
        this.board.initialize();
    }
    next_move(color) {
        let opponent_color = opponent(color);
        let others_coordinates = this.board.get_not_empty(opponent_color);
        others_coordinates = this.board.remove_king(others_coordinates);
        let empty_coordinates = this.board.get_empty(color);
        let my_coordinates = this.board.get_not_empty(color);
        let captures = this.board.get_captures(my_coordinates, others_coordinates, color);
        let non_captures = this.board.get_moves(my_coordinates, empty_coordinates, color);
        let check_moves = get_check_moves(captures.concat(non_captures), color);
        let check_mate_moves = get_check_mate_moves(check_moves, color);
        let move = undefined;
        if (check_mate_moves.length > 0) {
            move = check_mate_moves[0];
        }
        if (move === undefined && check_moves.length > 0) {
            move = check_moves[0];
        }
        if (move === undefined && captures.length > 0) {
            move = get_best_move_captured(captures);
        }
        if (move === undefined && non_captures.length > 0) {
            move = get_best_move_non_captured(non_captures);
        }
        if (move !== undefined) {
            this.board = this.board.move(move.coordinate_from, move.coordinate_to);
        }
        return move;
    }
}
module.exports = { King, Queen, Bishop, Knight, Pawn, Rook, Coordinate, Board, directions, Color, Pieces, Game };
