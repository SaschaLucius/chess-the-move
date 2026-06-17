import { describe, it, expect } from "vitest";
import { scoreMove } from "./scoring";
import type { EngineMove } from "../types";

const top3: EngineMove[] = [
  { uci: "e2e4", rank: 1, evaluation: { type: "cp", value: 30 } },
  { uci: "d2d4", rank: 2, evaluation: { type: "cp", value: 20 } },
  { uci: "g1f3", rank: 3, evaluation: { type: "cp", value: 10 } },
];

describe("scoreMove — engine top-3 cases", () => {
  it("engine #1 → 3 pts, reason engine-best", () => {
    const r = scoreMove("e2e4", "e4", "d2d4", top3);
    expect(r.points).toBe(3);
    expect(r.reason).toBe("engine-best");
    expect(r.engineRank).toBe(1);
    expect(r.matchedGm).toBe(false);
  });

  it("engine #2 + GM match → 3 pts, reason gm-and-engine-second", () => {
    const r = scoreMove("d2d4", "d4", "d2d4", top3);
    expect(r.points).toBe(3);
    expect(r.reason).toBe("gm-and-engine-second");
    expect(r.matchedGm).toBe(true);
  });

  it("engine #2 without GM match → 2 pts, reason engine-second", () => {
    const r = scoreMove("d2d4", "d4", "g1f3", top3);
    expect(r.points).toBe(2);
    expect(r.reason).toBe("engine-second");
  });

  it("engine #3 + GM match → 2 pts, reason gm-and-engine-third", () => {
    const r = scoreMove("g1f3", "Nf3", "g1f3", top3);
    expect(r.points).toBe(2);
    expect(r.reason).toBe("gm-and-engine-third");
    expect(r.matchedGm).toBe(true);
  });

  it("engine #3 without GM match → 1 pt, reason engine-third", () => {
    const r = scoreMove("g1f3", "Nf3", "e2e4", top3);
    expect(r.points).toBe(1);
    expect(r.reason).toBe("engine-third");
  });
});

describe("scoreMove — off-engine cases", () => {
  it("GM only (not in top 3) → 1 pt, reason gm-move", () => {
    const r = scoreMove("c2c4", "c4", "c2c4", top3);
    expect(r.points).toBe(1);
    expect(r.reason).toBe("gm-move");
    expect(r.matchedGm).toBe(true);
    expect(r.engineRank).toBeNull();
  });

  it("off-book but beats GM eval → 1 pt, reason beat-gm", () => {
    const r = scoreMove(
      "b1c3",
      "Nc3",
      "c2c4",
      top3,
      { type: "cp", value: 8 }, // player eval — beats GM (5cp) but not engine #3 (10cp)
      { type: "cp", value: 5 },  // GM eval
    );
    expect(r.points).toBe(1);
    expect(r.reason).toBe("beat-gm");
  });

  it("player eval beats engine #1 → 3 pts, reason beat-engine-first", () => {
    const r = scoreMove(
      "h2h3",
      "h3",
      "c2c4",
      top3,
      { type: "cp", value: 50 }, // beats engine #1 (30cp)
      { type: "cp", value: 5 },
    );
    expect(r.points).toBe(3);
    expect(r.reason).toBe("beat-engine-first");
  });

  it("player eval beats engine #2 but not #1 → 2 pts, reason beat-engine-second", () => {
    const r = scoreMove(
      "h2h3",
      "h3",
      "c2c4",
      top3,
      { type: "cp", value: 25 }, // beats #2 (20cp) but not #1 (30cp)
      { type: "cp", value: 5 },
    );
    expect(r.points).toBe(2);
    expect(r.reason).toBe("beat-engine-second");
  });

  it("player eval beats engine #3 but not #2 → 1 pt, reason beat-engine-third", () => {
    const r = scoreMove(
      "h2h3",
      "h3",
      "c2c4",
      top3,
      { type: "cp", value: 15 }, // beats #3 (10cp) but not #2 (20cp)
      { type: "cp", value: 5 },
    );
    expect(r.points).toBe(1);
    expect(r.reason).toBe("beat-engine-third");
  });

  it("off-book, worse than GM eval → -1 pt, reason off-book", () => {
    const r = scoreMove(
      "h2h3",
      "h3",
      "e2e4",
      top3,
      { type: "cp", value: -20 },
      { type: "cp", value: 30 },
    );
    expect(r.points).toBe(-1);
    expect(r.reason).toBe("off-book");
  });

  it("off-book with no evals provided → -1 pt, reason off-book", () => {
    const r = scoreMove("a2a4", "a4", "e2e4", top3);
    expect(r.points).toBe(-1);
    expect(r.reason).toBe("off-book");
  });
});

describe("scoreMove — edge cases", () => {
  it("empty engine list + GM match → 1 pt gm-move", () => {
    const r = scoreMove("e2e4", "e4", "e2e4", []);
    expect(r.points).toBe(1);
    expect(r.reason).toBe("gm-move");
  });

  it("empty engine list + miss + no evals → -1 pt off-book", () => {
    const r = scoreMove("h2h4", "h4", "e2e4", []);
    expect(r.points).toBe(-1);
    expect(r.reason).toBe("off-book");
  });

  it("mate eval also beats engine top moves → 3 pts beat-engine-first", () => {
    const r = scoreMove(
      "b1c3",
      "Nc3",
      "a2a3",
      top3,
      { type: "mate", value: 5 }, // player finds mate — beats engine #1 (30cp)
      { type: "cp", value: 30 }, // GM played modest move
    );
    expect(r.points).toBe(3);
    expect(r.reason).toBe("beat-engine-first");
  });

  it("playerSan is preserved in result", () => {
    const r = scoreMove("e2e4", "e4", "d2d4", top3);
    expect(r.playerSan).toBe("e4");
    expect(r.playerMove).toBe("e2e4");
  });
});
