

enum Pieces {
    King,
    Queen,
    Bishop,
    Knight,
    Rook,
    Pawn,
};
const VALUE = new Map<Pieces, number>([[Pieces.Queen, 8], [Pieces.Bishop, 7],
[Pieces.Knight, 6], [Pieces.Rook, 5], [Pieces.Pawn, 4]]);

enum Color {
    Black,
    White,
}
const PAWN_PROMOTE_RANK = new Map<Color, number>([[Color.White, 7], [Color.Black, 0]])

const FILES: string = "abcdefgh"
const RANKS: string = "12345678"

function directions(color: Color): number {
    if (color === Color.White) {
        return 1;
    }
    return -1;
}

function pawn_rank(color: Color): number {
    if (color === Color.White) {
        return 1;
    }
    return 6;
}

function opponent(color: Color): Color {
    if (color === Color.White) {
        return Color.Black;
    }
    return Color.White;
}

function value(piece: Pieces): number {
    const value = VALUE.get(piece);
    if (value == undefined) {
        return 0;
    }
    return value;
}


class Coordinate {
    rank: number;
    file: number;
    constructor(rank: number, file: number) {
        this.rank = rank
        this.file = file
    }
    toString(): string {
        return "[" + this.rank + "," + this.file + "]";
    }
}

Coordinate.prototype.toString = function coordToString() {
    return "[" + this.rank + "," + this.file + "]";
};

class Piece {
    color: Color;
    piece: Pieces;
    constructor(color: Color, piece: Pieces) {
        this.color = color
        this.piece = piece
    }
    same(other: Piece): boolean {
        return other.color == this.color && other.piece == this.piece;
    }

    toString(): string {
        return this.color.toString() + this.piece.toString()
    }

    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        return true
    }

    can_attack(coordinate_from: Coordinate, coordindate_to: Coordinate, board: Board): boolean {
        return this.can_move(coordinate_from, coordindate_to, board)
    }

}
function get_sign_diff(start: number, end: number): number {
    if (start == end)
        return 0
    if (start > end)
        return -1
    return 1
}


function is_diagonal(start: Coordinate, end: Coordinate): boolean {
    const rank_delta = Math.abs(start.rank - end.rank)
    const file_delta = Math.abs(start.file - end.file)
    return rank_delta === file_delta && !(rank_delta === 0 && file_delta === 0)
}


function is_horizontal_or_vertical(start: Coordinate, end: Coordinate): boolean {
    const rank_delta = start.rank - end.rank
    const file_delta = start.file - end.file
    return rank_delta == 0 || file_delta == 0 && !(rank_delta == 0 && file_delta == 0)
}


class King extends Piece {
    constructor(color: Color) {
        super(color, Pieces.King)
    }

    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board) {
        const rank_delta: number = Math.abs(coordinate_from.rank - coordinate_to.rank)
        const file_delta: number = Math.abs(coordinate_from.file - coordinate_to.file)
        return (rank_delta == 1 && file_delta == 1) ||
            (rank_delta == 0 && file_delta == 1) ||
            (rank_delta == 1 && file_delta == 0)
    }
}


class Pawn extends Piece {
    constructor(color: Color) {
        super(color, Pieces.Pawn)
    }

    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        const rank_delta = coordinate_to.rank - coordinate_from.rank
        const file_delta = coordinate_to.file - coordinate_from.file
        const direction: number = directions(this.color)
        if (file_delta === 0) {
            if (pawn_rank(this.color) === coordinate_from.rank) {
                const all_empty: boolean = board.all_empty(coordinate_from, coordinate_to)
                return rank_delta == direction || (all_empty && rank_delta == 2 * direction)
            }
        } else {
            return rank_delta === direction
        }
        return false

    }

    can_attack(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        const rank_delta = coordinate_to.rank - coordinate_from.rank
        const file_delta = Math.abs(coordinate_to.file - coordinate_from.file)
        const direction = directions(this.color)
        return file_delta == 1 && rank_delta == direction
    }
}

class Rook extends Piece {
    constructor(color: Color) {
        super(color, Pieces.Rook)
    }
    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        return is_horizontal_or_vertical(coordinate_from, coordinate_to) &&
            board.all_empty(coordinate_from, coordinate_to)
    }
}


class Knight extends Piece {
    constructor(color: Color) {
        super(color, Pieces.Knight)
    }
    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        const rank_delta = Math.abs(coordinate_from.rank - coordinate_to.rank)
        const file_delta = Math.abs(coordinate_from.file - coordinate_to.file)
        return (rank_delta == 1 && file_delta == 2) || (rank_delta == 2 && file_delta == 1)
    }
}



class Bishop extends Piece {
    constructor(color: Color) {
        super(color, Pieces.Bishop)
    }

    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        return is_diagonal(coordinate_from, coordinate_to) &&
            board.all_empty(coordinate_from, coordinate_to)
    }
}


class Queen extends Piece {
    constructor(color: Color) {
        super(color, Pieces.Queen)
    }

    can_move(coordinate_from: Coordinate, coordinate_to: Coordinate, board: Board): boolean {
        return (is_horizontal_or_vertical(coordinate_from, coordinate_to) ||
            is_diagonal(coordinate_from, coordinate_to)) &&
            board.all_empty(coordinate_from, coordinate_to);
    }
}


function get_coordinates(start: Coordinate, end: Coordinate): Coordinate[] {
    const rank_start: number = start.rank
    const rank_end = end.rank
    const file_start = start.file
    const file_end = end.file
    const rank_sign = get_sign_diff(rank_start, rank_end)
    const file_sign = get_sign_diff(file_start, file_end)
    const rank_diff = Math.abs(rank_start - rank_end)
    const file_diff = Math.abs(file_start - file_end)
    const num_squares = Math.max(rank_diff, file_diff) - 1
    let rank = rank_start
    let file = file_start
    const coordinates: Coordinate[] = []
    for (let square = 0; square < num_squares; square++) {
        rank = rank + rank_sign
        file = file + file_sign
        coordinates.push(new Coordinate(rank, file))
    }
    return coordinates
}


class Board {
    pieces: (Piece | undefined)[][];
    constructor() {
        this.pieces = new Array(8);
        for (let i: number = 0; i < 8; i++) {
            this.pieces[i] = new Array(8);
        }
    }

    initPieces(pieces: (Piece | undefined)[][]) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                this.pieces[rank][file] = pieces[rank][file];
            }
        }
    }

    toString(): string {
        let result = ""
        for (let rank = 7; rank >= 0; rank--) {
            let row = ""
            for (let file = 0; file < 8; file++) {
                let piece = this.get_piece_at(new Coordinate(rank, file))
                if (piece == undefined) {
                    row = row + "   "
                } else {
                    row = row + piece.toString() + " "
                }
            }
            result = result + "\n" + row
        }
        return result
    }

    find_piece(piece: Piece): Coordinate | undefined {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const pieceHere = this.pieces[rank][file];
                if (pieceHere != undefined && pieceHere.same(piece)) {
                    return new Coordinate(rank, file);
                }

            }

        }
        return undefined
    }

    king_in_check(color: Color): boolean {
        const coordinate_king = this.find_piece(new King(color))
        if (coordinate_king != undefined) {
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    const piece = this.pieces[rank][file]
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

    put_piece(coordinate: Coordinate, piece: Piece) {
        this.pieces[coordinate.rank][coordinate.file] = piece
    }

    initialize() {
        let rank = 1
        for (let file = 0; file < 8; file++) {
            this.put_piece(new Coordinate(rank, file), new Pawn(Color.White))
        }
        this.put_piece(new Coordinate(0, 0), new Rook(Color.White))
        this.put_piece(new Coordinate(0, 7), new Rook(Color.White))
        this.put_piece(new Coordinate(0, 1), new Knight(Color.White))
        this.put_piece(new Coordinate(0, 6), new Knight(Color.White))
        this.put_piece(new Coordinate(0, 2), new Bishop(Color.White))
        this.put_piece(new Coordinate(0, 5), new Bishop(Color.White))
        this.put_piece(new Coordinate(0, 3), new Queen(Color.White))
        this.put_piece(new Coordinate(0, 4), new King(Color.White))
        rank = 6
        for (let file = 0; file < 8; file++) {
            this.put_piece(new Coordinate(rank, file), new Pawn(Color.Black))
        }
        this.put_piece(new Coordinate(7, 0), new Rook(Color.Black))
        this.put_piece(new Coordinate(7, 7), new Rook(Color.Black))
        this.put_piece(new Coordinate(7, 1), new Knight(Color.Black))
        this.put_piece(new Coordinate(7, 6), new Knight(Color.Black))
        this.put_piece(new Coordinate(7, 2), new Bishop(Color.Black))
        this.put_piece(new Coordinate(7, 5), new Bishop(Color.Black))
        this.put_piece(new Coordinate(7, 3), new Queen(Color.Black))
        this.put_piece(new Coordinate(7, 4), new King(Color.Black))
    }

    all_empty(start: Coordinate, end: Coordinate) {
        const coordinates = get_coordinates(start, end)
        for (const coordinate of coordinates) {
            if (this.pieces[coordinate.rank][coordinate.file] != undefined) {
                return false;
            }
        }
        return true;
    }

    get_piece_at(coordinate: Coordinate): Piece | undefined {
        return this.pieces[coordinate.rank][coordinate.file]
    }

    get_not_empty(color: Color): Coordinate[] {
        const coordinates: Coordinate[] = []
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = this.pieces[rank][file]
                if (piece != undefined && piece.color === color) {
                    coordinates.push(new Coordinate(rank, file))
                }
            }
        }
        return coordinates
    }

    get_empty(color: Color): Coordinate[] {
        const coordinates: Coordinate[] = []
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = this.pieces[rank][file]
                if (piece == undefined) {
                    coordinates.push(new Coordinate(rank, file))
                }
            }
        }
        return coordinates
    }


    move(coordinate_from: Coordinate, coordinate_to: Coordinate): Board {
        const new_board = new Board()
        new_board.initPieces(this.pieces);
        const piece = new_board.pieces[coordinate_from.rank][coordinate_from.file];
        const piece_to_replace = new_board.pieces[coordinate_to.rank][coordinate_to.file];
        if (piece != undefined && piece.piece == Pieces.Pawn && coordinate_to.rank == PAWN_PROMOTE_RANK.get(piece.color)) {
            piece_to_replace = new Queen(piece.color)
        }
        if (piece_to_replace !== undefined) {
            new_board.pieces[coordinate_to.rank][coordinate_to.file] = piece_to_replace;
        }
        new_board.pieces[coordinate_from.rank][coordinate_from.file] = undefined;
        return new_board
    }

    get_moves(my_coordinates: Coordinate[], blank_coordinates: Coordinate[], color: Color): Move[] {
        const moves: Move[] = []
        for (const blank_coordinate of blank_coordinates) {
            for (const my_coordinate of my_coordinates) {
                const my_piece = this.get_piece_at(my_coordinate)
                if (my_piece != undefined && my_piece.can_move(my_coordinate, blank_coordinate, this)) {
                    const move = new Move(my_coordinate, blank_coordinate, this)
                    if (!move.in_check.get(color)) {
                        moves.push(move)
                    }
                }
            }
        }
        return moves
    }

    get_captures(my_coordinates: Coordinate[], others_coordinates: Coordinate[], color: Color): Move[] {
        const moves: Move[] = []
        for (const other_coordinate of others_coordinates) {
            for (const my_coordinate of my_coordinates) {
                const my_piece = this.get_piece_at(my_coordinate)
                if (my_piece != undefined && my_piece.can_attack(my_coordinate, other_coordinate, this)) {
                    const move = new Move(my_coordinate, other_coordinate, this)
                    if (!move.in_check.get(color)) {
                        moves.push(move)
                    }
                }
            }
        }
        return moves
    }

    not_matches_king(coordinate: Coordinate): boolean {
        const piece = this.get_piece_at(coordinate);
        return (piece != undefined && piece.piece != Pieces.King);
    }

    remove_king(others_coordinates: Coordinate[]): Coordinate[] {
        return others_coordinates.filter(coordinate => this.not_matches_king(coordinate))
    }


    any_moves(color: Color): boolean {
        const opp = opponent(color)
        let others_coordinates = this.get_not_empty(opp)
        others_coordinates = this.remove_king(others_coordinates)
        const empty_coordinates = this.get_empty(color)
        const my_coordinates = this.get_not_empty(color)
        const captures = this.get_captures(my_coordinates, others_coordinates, color)
        if (captures.length > 0) {
            return true;
        }
        const non_captures = this.get_moves(my_coordinates, empty_coordinates, color)
        return non_captures.length > 0
    }
}


function value_captured(move: Move): number {
    if (move.captured === undefined) {
        return 0
    } else {
        return value(move.captured.piece)
    }
}


class Move {
    coordinate_to: Coordinate;
    coordinate_from: Coordinate;
    board_before: Board;
    board_after: Board;
    in_check: Map<Color, boolean>;
    captured: Piece | undefined;


    constructor(coordinate_from: Coordinate, coordinate_to: Coordinate, board_before: Board) {
        this.coordinate_to = coordinate_to
        this.coordinate_from = coordinate_from
        this.board_before = board_before
        this.board_after = board_before.move(coordinate_from, coordinate_to)
        this.in_check = new Map<Color, boolean>([[Color.Black, this.board_after.king_in_check(Color.Black)],
        [Color.White, this.board_after.king_in_check(Color.White)]]);
        this.captured = this.board_before.get_piece_at(this.coordinate_to)
    }


    toString() {
        let capture = ""
        if (this.captured != undefined) {
            capture = "x"
        }
        const piece = this.board_before.get_piece_at(this.coordinate_from)
        let piece_str = ""
        if (piece != undefined) {
            if (piece.piece == Pieces.Pawn) {
                piece_str = ""
            } else {
                piece_str = piece.toString()
            }
        }
        return piece_str + capture + this.coordinate_to.toString()
    }
}


function get_check_moves(moves: Move[], color: Color): Move[] {
    const check_moves: Move[] = []
    const opp = opponent(color);
    for (const move of moves) {
        const in_check: boolean | undefined = move.in_check.get(opp);
        if (in_check != undefined && in_check) {
            check_moves.push(move)
        }
    }
    return check_moves
}



function get_check_mate_moves(check_moves: Move[], color: Color): Move[] {
    const check_mate_moves: Move[] = []
    for (const move of check_moves) {
        if (!move.board_after.any_moves(opponent(color))) {
            check_mate_moves.push(move)
        }
    }
    return check_mate_moves
}


function get_best_move_captured(moves: Move[]) {
    if (moves.length == 1) {
        return moves[0]
    }
    moves.sort(value_captured)
    return moves[moves.length - 1]
}

function get_best_move_non_captured(moves: Move[]) {
    return moves[Math.floor(Math.random() * moves.length)]
}


class Game {
    board: Board;
    constructor() {
        this.board = new Board();
        this.board.initialize();
    }

    next_move(color: Color): Move | undefined {
        const opponent_color = opponent(color)
        let others_coordinates = this.board.get_not_empty(opponent_color)
        others_coordinates = this.board.remove_king(others_coordinates)
        const empty_coordinates = this.board.get_empty(color)
        const my_coordinates = this.board.get_not_empty(color)
        const captures = this.board.get_captures(my_coordinates, others_coordinates, color)
        const non_captures = this.board.get_moves(my_coordinates, empty_coordinates, color)
        const check_moves = get_check_moves(captures.concat(non_captures), color)
        const check_mate_moves = get_check_mate_moves(check_moves, color)
        let move: Move | undefined = undefined
        if (check_mate_moves.length > 0) {
            move = check_mate_moves[0]
        }
        if (move === undefined && check_moves.length > 0) {
            move = check_moves[0]
        }
        if (move === undefined && captures.length > 0) {
            move = get_best_move_captured(captures)
        }
        if (move === undefined && non_captures.length > 0) {
            move = get_best_move_non_captured(non_captures)
        }
        if (move !== undefined) {
            this.board = this.board.move(move.coordinate_from, move.coordinate_to)
        }
        return move
    }

}


export = { King, Queen, Bishop, Knight, Pawn, Rook, Coordinate, Board, directions, Color, Pieces, Game };

