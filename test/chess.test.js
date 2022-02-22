"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chess = require("../src/chess");
test('white direction is 1', () => {
    expect(chess.directions(chess.WHITE)).toBe(1);
});
let king = new chess.King(chess.WHITE);
let board = new chess.Board();
test("Test king moves", () => {
    expect(king.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(1, 1), board)).toBe(true),
        expect(king.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(1, 2), board)).toBe(false);
});
let queen = new chess.Queen(chess.WHITE);
test("Test queen moves", () => {
    expect(queen.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(5, 5), board)).toBe(true),
        expect(queen.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(5, 0), board)).toBe(true),
        expect(queen.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(0, 5), board)).toBe(true),
        expect(queen.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(1, 2), board)).toBe(false);
});
let knight = new chess.Knight(chess.WHITE);
test("Test knight moves", () => {
    expect(knight.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(5, 5), board)).toBe(false),
        expect(knight.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(1, 2), board)).toBe(true),
        expect(knight.can_move(new chess.Coordinate(1, 2), new chess.Coordinate(0, 0), board)).toBe(true),
        expect(knight.can_move(new chess.Coordinate(0, 0), new chess.Coordinate(1, 3), board)).toBe(false);
});
let board2 = new chess.Board();
board2.initialize();
test("Test piece locations", () => {
    expect(board2.get_empty(chess.WHITE).length).toBe(32),
        expect(board2.get_not_empty(chess.WHITE).length).toBeGreaterThan(0),
        expect(board2.find_piece(knight)).toBeDefined(),
        expect(board2.find_piece(queen)).toBeDefined(),
        expect(board2.find_piece(king)).toBeDefined();
});
let game = new chess.Game();
board2.initialize();
test("Test game", () => {
    expect(game.next_move(chess.WHITE)).toBeDefined();
});
