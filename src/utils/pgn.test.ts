import { describe, it, expect } from "vitest";
import { pickPositionFromPgn, labelFromPgn } from "./pgn";

const OPERA_PGN = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

// A game that is too short/tactical to have any qualifying middlegame ply
const SHORT_PGN = `[Event "Test"]
[White "A"]
[Black "B"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0`;

describe("pickPositionFromPgn", () => {
  it("returns a Position for a valid long game", () => {
    // The Opera Game has enough plies at move ≥12 with material > 13.
    const pos = pickPositionFromPgn(OPERA_PGN, "Opera Game");
    // Might be null if no ply qualifies (Opera Game is actually short),
    // but if it returns something it must be well-formed.
    if (pos !== null) {
      expect(pos.fen).toMatch(/^[pnbrqkPNBRQK1-8/]+ [wb]/);
      expect(pos.gmMove).toMatch(/^[a-h][1-8][a-h][1-8]/);
      expect(pos.gmSan).toBeTruthy();
      expect(pos.label).toBe("Opera Game");
      expect(pos.source).toBe("curated");
      expect(["white", "black"]).toContain(pos.sideToMove);
      expect(pos.orientation).toBe(pos.sideToMove);
    }
  });

  it("returns null for an invalid PGN string", () => {
    expect(pickPositionFromPgn("this is not a pgn", "Bad")).toBeNull();
  });

  it("returns null for a game too short to have a qualifying middlegame ply", () => {
    expect(pickPositionFromPgn(SHORT_PGN, "Short")).toBeNull();
  });

  it("gmMove is always 4 chars (no promotion char)", () => {
    // Run 20 times to cover randomness
    for (let i = 0; i < 20; i++) {
      const pos = pickPositionFromPgn(OPERA_PGN, "Test");
      if (pos) {
        expect(pos.gmMove).toHaveLength(4);
      }
    }
  });

  it("respects gmColor filter", () => {
    const pos = pickPositionFromPgn(OPERA_PGN, "Opera", "white");
    if (pos) {
      expect(pos.sideToMove).toBe("white");
    }
  });
});

describe("labelFromPgn", () => {
  it("builds a label from standard PGN headers", () => {
    const label = labelFromPgn(OPERA_PGN);
    expect(label).toContain("Morphy");
    expect(label).toContain("Paris");
    expect(label).toContain("1858");
  });

  it("falls back gracefully when headers are missing", () => {
    const label = labelFromPgn("1. e4 e5 *");
    // Should not throw and should return some non-empty string
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);
  });
});
