import { describe, it, expect } from "vitest";
import { curatedGames } from "./curatedGames";
import { pickPositionFromPgn } from "../utils/pgn";

describe("curatedGames — PGN validation", () => {
  it("has at least one curated game", () => {
    expect(curatedGames.length).toBeGreaterThan(0);
  });

  curatedGames.forEach((game, index) => {
    it(`game[${index}] PGN yields at least one valid position`, () => {
      // Run pickPositionFromPgn multiple times to account for randomness;
      // as long as at least one attempt succeeds the PGN is valid and the
      // game contains qualifying middlegame plies.
      let succeeded = false;
      for (let attempt = 0; attempt < 10; attempt++) {
        const pos = pickPositionFromPgn(game.pgn, `game[${index}]`);
        if (pos !== null) {
          succeeded = true;
          // Basic structural sanity checks on the returned position.
          expect(pos.fen).toMatch(/^[pnbrqkPNBRQK1-8/]+ [wb]/);
          expect(pos.gmMove).toHaveLength(4);
          expect(pos.gmSan).toBeTruthy();
          expect(pos.source).toBe("curated");
          break;
        }
      }
      expect(
        succeeded,
        `game[${index}] produced no qualifying position in 10 attempts`,
      ).toBe(true);
    });
  });
});
