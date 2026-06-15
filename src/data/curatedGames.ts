// Curated fallback games: a handful of famous, decisive classical games used
// when the live Lichess fetch fails (offline / rate-limited / empty). Every PGN
// here is validated against chess.js at build-and-test time (see the Phase 2
// validation step) so pickPositionFromPgn never rejects a curated game.

export interface CuratedGame {
  /** Full PGN including Seven Tag Roster headers used to build the label. */
  pgn: string
}

export const curatedGames: CuratedGame[] = [
  {
    // The "Opera Game"
    pgn: `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
  },
  {
    // The "Immortal Game"
    pgn: `[Event "London"]
[Site "London ENG"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5
8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8
15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6
21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`,
  },
  {
    // The "Evergreen Game"
    pgn: `[Event "Berlin"]
[Site "Berlin GER"]
[Date "1852.??.??"]
[White "Adolf Anderssen"]
[Black "Jean Dufresne"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O d3
8. Qb3 Qf6 9. e5 Qg6 10. Re1 Nge7 11. Ba3 b5 12. Qxb5 Rb8 13. Qa4 Bb6 14. Nbd2 Bb7
15. Ne4 Qf5 16. Bxd3 Qh5 17. Nf6+ gxf6 18. exf6 Rg8 19. Rad1 Qxf3 20. Rxe7+ Nxe7
21. Qxd7+ Kxd7 22. Bf5+ Ke8 23. Bd7+ Kf8 24. Bxe7# 1-0`,
  },
  {
    // "Game of the Century"
    pgn: `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6
8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4
14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+
20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1
26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4
32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+
38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
  },
  {
    // Kasparov's immortal
    pgn: `[Event "Hoogovens"]
[Site "Wijk aan Zee NED"]
[Date "1999.01.20"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O
14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5
20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6
26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3
32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7
38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2
44. Qa7 1-0`,
  },
  {
    // Botvinnik's queen sacrifice
    pgn: `[Event "AVRO"]
[Site "Rotterdam NED"]
[Date "1938.11.22"]
[White "Mikhail Botvinnik"]
[Black "Jose Raul Capablanca"]
[Result "1-0"]

1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 d5 5. a3 Bxc3+ 6. bxc3 c5 7. cxd5 exd5
8. Bd3 O-O 9. Ne2 b6 10. O-O Ba6 11. Bxa6 Nxa6 12. Bb2 Qd7 13. a4 Rfe8
14. Qd3 c4 15. Qc2 Nb8 16. Rae1 Nc6 17. Ng3 Na5 18. f3 Nb3 19. e4 Qxa4
20. e5 Nd7 21. Qf2 g6 22. f4 f5 23. exf6 Nxf6 24. f5 Rxe1 25. Rxe1 Re8
26. Re6 Rxe6 27. fxe6 Kg7 28. Qf4 Qe8 29. Qe5 Qe7 30. Ba3 Qxa3 31. Nh5+ gxh5
32. Qg5+ Kf8 33. Qxf6+ Kg8 34. e7 Qc1+ 35. Kf2 Qc2+ 36. Kg3 Qd3+ 37. Kh4 Qe4+
38. Kxh5 Qe2+ 39. Kh4 Qe4+ 40. g4 Qe1+ 41. Kh5 1-0`,
  },
  {
    pgn: `[Event "World Championship 28th"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[White "Robert James Fischer"]
[Black "Boris Spassky"]
[Result "1-0"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6
8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8
14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6
20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5
27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8
33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6
39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`,
  },
  {
    // Short's king march
    pgn: `[Event "Tilburg"]
[Site "Tilburg NED"]
[Date "1991.??.??"]
[White "Nigel Short"]
[Black "Jan Timman"]
[Result "1-0"]

1. e4 Nf6 2. e5 Nd5 3. d4 d6 4. Nf3 g6 5. Bc4 Nb6 6. Bb3 Bg7 7. Qe2 Nc6
8. O-O O-O 9. h3 a5 10. a4 dxe5 11. dxe5 Nd4 12. Nxd4 Qxd4 13. Re1 e6
14. Nd2 Nd5 15. Nf3 Qc5 16. Qe4 Qb4 17. Bc4 Nb6 18. b3 Nxc4 19. bxc4 Re8
20. Rd1 Qc5 21. Qh4 b6 22. Be3 Qc6 23. Bh6 Bh8 24. Rd8 Bb7 25. Rad1 Bg7
26. R8d7 Rf8 27. Bxg7 Kxg7 28. R1d4 Rae8 29. Qf6+ Kg8 30. h4 h5 31. Kh2 Rc8
32. Kg3 Rce8 33. Kf4 Bc8 34. Kg5 1-0`,
  },
  {
    // Steinitz's immortal combination — Von Bardeleben fled the board
    pgn: `[Event "Hastings"]
[Site "Hastings ENG"]
[Date "1895.08.17"]
[White "Wilhelm Steinitz"]
[Black "Curt von Bardeleben"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 d5
8. exd5 Nxd5 9. O-O Be6 10. Bg5 Be7 11. Bxd5 Bxd5 12. Nxd5 Qxd5 13. Bxe7 Nxe7
14. Re1 f6 15. Qe2 Qd7 16. Rac1 c6 17. d5 cxd5 18. Nd4 Kf7 19. Ne6 Rhc8
20. Qg4 g6 21. Ng5+ Ke8 22. Rxe7+ Kf8 23. Rf7+ Kg8 24. Rg7+ Kh8 25. Rxh7+ 1-0`,
  },
  {
    // Spassky vs Bronstein (King's Gambit, from "From Russia with Love")
    pgn: `[Event "URS-ch26"]
[Site "Leningrad URS"]
[Date "1960.??.??"]
[White "Boris Spassky"]
[Black "David Bronstein"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Nf3 d5 4. exd5 Bd6 5. Nc3 Ne7 6. d4 O-O 7. Bd3 Nd7
8. O-O h6 9. Ne4 Nxd5 10. c4 Ne3 11. Bxe3 fxe3 12. c5 Be7 13. Bc2 Re8
14. Qd3 e2 15. Nd6 Nf8 16. Nxf7 exf1=Q+ 17. Rxf1 Bf5 18. Qxf5 Qd7 19. Qf4 Bf6
20. N3e5 Qe7 21. Bb3 Bxe5 22. Nxe5+ Kh7 23. Qe4+ 1-0`,
  },
  {
    // Rotlewi vs Rubinstein ("Rubinstein's Immortal")
    pgn: `[Event "Lodz"]
[Site "Lodz POL"]
[Date "1907.12.26"]
[White "Georg Rotlewi"]
[Black "Akiba Rubinstein"]
[Result "0-1"]

1. d4 d5 2. Nf3 e6 3. e3 c5 4. c4 Nc6 5. Nc3 Nf6 6. dxc5 Bxc5 7. a3 a6
8. b4 Bd6 9. Bb2 O-O 10. Qd2 Qe7 11. Bd3 dxc4 12. Bxc4 b5 13. Bd3 Rd8
14. Qe2 Bb7 15. O-O Ne5 16. Nxe5 Bxe5 17. f4 Bc7 18. e4 Rac8 19. e5 Bb6+
20. Kh1 Ng4 21. Be4 Qh4 22. g3 Rxc3 23. gxh4 Rd2 24. Qxd2 Bxe4+ 25. Qg2 Rh3 0-1`,
  },
  {
    // Carlsen's endgame grind turned tactical
    pgn: `[Event "Tata Steel"]
[Site "Wijk aan Zee NED"]
[Date "2013.01.19"]
[White "Levon Aronian"]
[Black "Viswanathan Anand"]
[Result "0-1"]

1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. e3 Nbd7 6. Bd3 dxc4 7. Bxc4 b5
8. Bd3 Bd6 9. O-O O-O 10. Qc2 Bb7 11. a3 Rc8 12. Ng5 c5 13. Nxh7 Ng4 14. f4
cxd4 15. exd4 Bc5 16. Be2 Nde5 17. Bxg4 Bxd4+ 18. Kh1 Nxg4 19. Nxf8 f5
20. Ng6 Qf6 21. h3 Qxg6 22. Qe2 Qh5 23. Qd3 Be3 0-1`,
  },
  // ── World Championship games ──────────────────────────────────────────────
  {
    // Alekhine wins the final game, claiming the crown from Capablanca
    pgn: `[Event "World Championship 1927"]
[Site "Buenos Aires ARG"]
[Date "1927.??.??"]
[Round "34"]
[White "Alexander Alekhine"]
[Black "Jose Raul Capablanca"]
[Result "1-0"]

1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.e3 c6 6.a3 Be7 7.Nf3 O-O 8.Bd3 dxc4
9.Bxc4 Nd5 10.Bxe7 Qxe7 11.Ne4 N5f6 12.Ng3 c5 13.O-O Nb6 14.Ba2 cxd4 15.Nxd4 g6
16.Rc1 Bd7 17.Qe2 Rac8 18.e4 e5 19.Nf3 Kg7 20.h3 h6 21.Qd2 Be6 22.Bxe6 Qxe6
23.Qa5 Nc4 24.Qxa7 Nxb2 25.Rxc8 Rxc8 26.Qxb7 Nc4 27.Qb4 Ra8 28.Ra1 Qc6 29.a4 Nxe4
30.Nxe5 Qd6 31.Qxc4 Qxe5 32.Re1 Nd6 33.Qc1 Qf6 34.Ne4 Nxe4 35.Rxe4 Rb8 36.Re2 Ra8
37.Ra2 Ra5 38.Qc7 Qa6 39.Qc3+ Kh7 40.Rd2 Qb6 41.Rd7 Qb1+ 42.Kh2 Qb8+ 43.g3 Rf5
44.Qd4 Qe8 45.Rd5 Rf3 46.h4 Qh8 47.Qb6 Qa1 48.Kg2 Rf6 49.Qd4 Qxd4 50.Rxd4 Kg7
51.a5 Ra6 52.Rd5 Rf6 53.Rd4 Ra6 54.Ra4 Kf6 55.Kf3 Ke5 56.Ke3 h5 57.Kd3 Kd5
58.Kc3 Kc5 59.Ra2 Kb5 60.Kb3 Kc5 61.Kc3 Kb5 62.Kd4 Rd6+ 63.Ke5 Re6+ 64.Kf4 Ka6
65.Kg5 Re5+ 66.Kh6 Rf5 67.f4 Rc5 68.Ra3 Rc7 69.Kg7 Rd7 70.f5 gxf5 71.Kh6 f4
72.gxf4 Rd5 73.Kg7 Rf5 74.Ra4 Kb5 75.Re4 Ka6 76.Kh6 Rxa5 77.Re5 Ra1 78.Kxh5 Rg1
79.Rg5 Rh1 80.Rf5 Kb6 81.Rxf7 Kc6 82.Re7 1-0`,
  },
  {
    // Tal sacrifices brilliantly in a King's Indian to topple Botvinnik
    pgn: `[Event "World Championship 1960"]
[Site "Moscow URS"]
[Date "1960.??.??"]
[Round "6"]
[White "Mikhail Botvinnik"]
[Black "Mihail Tal"]
[Result "0-1"]

1.c4 Nf6 2.Nf3 g6 3.g3 Bg7 4.Bg2 O-O 5.d4 d6 6.Nc3 Nbd7 7.O-O e5 8.e4 c6
9.h3 Qb6 10.d5 cxd5 11.cxd5 Nc5 12.Ne1 Bd7 13.Nd3 Nxd3 14.Qxd3 Rfc8 15.Rb1 Nh5
16.Be3 Qb4 17.Qe2 Rc4 18.Rfc1 Rac8 19.Kh2 f5 20.exf5 Bxf5 21.Ra1 Nf4 22.gxf4 exf4
23.Bd2 Qxb2 24.Rab1 f3 25.Rxb2 fxe2 26.Rb3 Rd4 27.Be1 Be5+ 28.Kg1 Bf4 29.Nxe2 Rxc1
30.Nxd4 Rxe1+ 31.Bf1 Be4 32.Ne2 Be5 33.f4 Bf6 34.Rxb7 Bxd5 35.Rc7 Bxa2 36.Rxa7 Bc4
37.Ra8+ Kf7 38.Ra7+ Ke6 39.Ra3 d5 40.Kf2 Bh4+ 41.Kg2 Kd6 42.Ng3 Bxg3 43.Bxc4 dxc4
44.Kxg3 Kd5 45.Ra7 c3 46.Rc7 Kd4 0-1`,
  },
  {
    // Kasparov's famous Game 16: a classic queenside attack that turns the match
    pgn: `[Event "World Championship 1985"]
[Site "Moscow URS"]
[Date "1985.??.??"]
[Round "16"]
[White "Anatoly Karpov"]
[Black "Garry Kasparov"]
[Result "0-1"]

1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nb5 d6 6.c4 Nf6 7.N1c3 a6 8.Na3 d5
9.cxd5 exd5 10.exd5 Nb4 11.Be2 Bc5 12.O-O O-O 13.Bf3 Bf5 14.Bg5 Re8 15.Qd2 b5
16.Rad1 Nd3 17.Nab1 h6 18.Bh4 b4 19.Na4 Bd6 20.Bg3 Rc8 21.b3 g5 22.Bxd6 Qxd6
23.g3 Nd7 24.Bg2 Qf6 25.a3 a5 26.axb4 axb4 27.Qa2 Bg6 28.d6 g4 29.Qd2 Kg7
30.f3 Qxd6 31.fxg4 Qd4+ 32.Kh1 Nf6 33.Rf4 Ne4 34.Qxd3 Nf2+ 35.Rxf2 Bxd3
36.Rfd2 Qe3 37.Rxd3 Rc1 38.Nb2 Qf2 39.Nd2 Rxd1+ 40.Nxd1 Re1+ 0-1`,
  },
  {
    // Kramnik stuns Kasparov with a Grünfeld to lead their match
    pgn: `[Event "World Championship 2000"]
[Site "London ENG"]
[Date "2000.10.10"]
[Round "2"]
[White "Vladimir Kramnik"]
[Black "Garry Kasparov"]
[Result "1-0"]

1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Nf3 c5 8.Be3 Qa5
9.Qd2 Bg4 10.Rb1 a6 11.Rxb7 Bxf3 12.gxf3 Nc6 13.Bc4 O-O 14.O-O cxd4 15.cxd4 Bxd4
16.Bd5 Bc3 17.Qc1 Nd4 18.Bxd4 Bxd4 19.Rxe7 Ra7 20.Rxa7 Bxa7 21.f4 Qd8 22.Qc3 Bb8
23.Qf3 Qh4 24.e5 g5 25.Re1 Qxf4 26.Qxf4 gxf4 27.e6 fxe6 28.Rxe6 Kg7 29.Rxa6 Rf5
30.Be4 Re5 31.f3 Re7 32.a4 Ra7 33.Rb6 Be5 34.Rb4 Rd7 35.Kg2 Rd2+ 36.Kh3 h5
37.Rb5 Kf6 38.a5 Ra2 39.Rb6+ Ke7 40.Bd5 1-0`,
  },
  {
    // Carlsen's first world championship win — an endgame masterclass
    pgn: `[Event "World Championship 2013"]
[Site "Chennai IND"]
[Date "2013.11.15"]
[Round "5"]
[White "Magnus Carlsen"]
[Black "Viswanathan Anand"]
[Result "1-0"]

1.c4 e6 2.d4 d5 3.Nc3 c6 4.e4 dxe4 5.Nxe4 Bb4+ 6.Nc3 c5 7.a3 Ba5 8.Nf3 Nf6
9.Be3 Nc6 10.Qd3 cxd4 11.Nxd4 Ng4 12.O-O-O Nxe3 13.fxe3 Bc7 14.Nxc6 bxc6
15.Qxd8+ Bxd8 16.Be2 Ke7 17.Bf3 Bd7 18.Ne4 Bb6 19.c5 f5 20.cxb6 fxe4 21.b7 Rab8
22.Bxe4 Rxb7 23.Rhf1 Rb5 24.Rf4 g5 25.Rf3 h5 26.Rdf1 Be8 27.Bc2 Rc5 28.Rf6 h4
29.e4 a5 30.Kd2 Rb5 31.b3 Bh5 32.Kc3 Rc5+ 33.Kb2 Rd8 34.R1f2 Rd4 35.Rh6 Bd1
36.Bb1 Rb5 37.Kc3 c5 38.Rb2 e5 39.Rg6 a4 40.Rxg5 Rxb3+ 41.Rxb3 Bxb3 42.Rxe5+ Kd6
43.Rh5 Rd1 44.e5+ Kd5 45.Bh7 Rc1+ 46.Kb2 Rg1 47.Bg8+ Kc6 48.Rh6+ Kd7 49.Bxb3 axb3
50.Kxb3 Rxg2 51.Rxh4 Ke6 52.a4 Kxe5 53.a5 Kd6 54.Rh7 Kd5 55.a6 c4+ 56.Kc3 Ra2
57.a7 Kc5 58.h4 1-0`,
  },
  {
    // Carlsen wins Game 10 with seconds left to level the Karjakin match
    pgn: `[Event "World Championship 2016"]
[Site "New York USA"]
[Date "2016.11.24"]
[Round "10"]
[White "Magnus Carlsen"]
[Black "Sergey Karjakin"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Bc5 5.c3 O-O 6.Bg5 h6 7.Bh4 Be7 8.O-O d6
9.Nbd2 Nh5 10.Bxe7 Qxe7 11.Nc4 Nf4 12.Ne3 Qf6 13.g3 Nh3+ 14.Kh1 Ne7 15.Bc4 c6
16.Bb3 Ng6 17.Qe2 a5 18.a4 Be6 19.Bxe6 fxe6 20.Nd2 d5 21.Qh5 Ng5 22.h4 Nf3
23.Nxf3 Qxf3+ 24.Qxf3 Rxf3 25.Kg2 Rf7 26.Rfe1 h5 27.Nf1 Kf8 28.Nd2 Ke7 29.Re2 Kd6
30.Nf3 Raf8 31.Ng5 Re7 32.Rae1 Rfe8 33.Nf3 Nh8 34.d4 exd4 35.Nxd4 g6 36.Re3 Nf7
37.e5+ Kd7 38.Rf3 Nh6 39.Rf6 Rg7 40.b4 axb4 41.cxb4 Ng8 42.Rf3 Nh6 43.a5 Nf5
44.Nb3 Kc7 45.Nc5 Kb8 46.Rb1 Ka7 47.Rd3 Rc7 48.Ra3 Nd4 49.Rd1 Nf5 50.Kh3 Nh6
51.f3 Rf7 52.Rd4 Nf5 53.Rd2 Rh7 54.Rb3 Ree7 55.Rdd3 Rh8 56.Rb1 Rhh7 57.b5 cxb5
58.Rxb5 d4 59.Rb6 Rc7 60.Nxe6 Rc3 61.Nf4 Rhc7 62.Nd5 Rxd3 63.Nxc7 Kb8 64.Nb5 Kc8
65.Rxg6 Rxf3 66.Kg2 Rb3 67.Nd6+ Nxd6 68.Rxd6 Re3 69.e6 Kc7 70.Rxd4 Rxe6 71.Rd5 Rh6
72.Kf3 Kb8 73.Kf4 Ka7 74.Kg5 Rh8 75.Kf6 1-0`,
  },
  {
    // Carlsen vs Nepomniachtchi — the legendary 136-move Game 6
    pgn: `[Event "World Championship 2021"]
[Site "Dubai UAE"]
[Date "2021.12.03"]
[Round "6"]
[White "Magnus Carlsen"]
[Black "Ian Nepomniachtchi"]
[Result "1-0"]

1.d4 Nf6 2.Nf3 d5 3.g3 e6 4.Bg2 Be7 5.O-O O-O 6.b3 c5 7.dxc5 Bxc5 8.c4 dxc4
9.Qc2 Qe7 10.Nbd2 Nc6 11.Nxc4 b5 12.Nce5 Nb4 13.Qb2 Bb7 14.a3 Nc6 15.Nd3 Bb6
16.Bg5 Rfd8 17.Bxf6 gxf6 18.Rac1 Nd4 19.Nxd4 Bxd4 20.Qa2 Bxg2 21.Kxg2 Qb7+
22.Kg1 Qe4 23.Qc2 a5 24.Rfd1 Kg7 25.Rd2 Rac8 26.Qxc8 Rxc8 27.Rxc8 Qd5 28.b4 a4
29.e3 Be5 30.h4 h5 31.Kh2 Bb2 32.Rc5 Qd6 33.Rd1 Bxa3 34.Rxb5 Qd7 35.Rc5 e5
36.Rc2 Qd5 37.Rdd2 Qb3 38.Ra2 e4 39.Nc5 Qxb4 40.Nxe4 Qb3 41.Rac2 Bf8 42.Nc5 Qb5
43.Nd3 a3 44.Nf4 Qa5 45.Ra2 Bb4 46.Rd3 Kh6 47.Rd1 Qa4 48.Rda1 Bd6 49.Kg1 Qb3
50.Ne2 Qd3 51.Nd4 Kh7 52.Kh2 Qe4 53.Rxa3 Qxh4+ 54.Kg1 Qe4 55.Ra4 Be5 56.Ne2 Qc2
57.R1a2 Qb3 58.Kg2 Qd5+ 59.f3 Qd1 60.f4 Bc7 61.Kf2 Bb6 62.Ra1 Qb3 63.Re4 Kg7
64.Re8 f5 65.Raa8 Qb4 66.Rac8 Ba5 67.Rc1 Bb6 68.Re5 Qb3 69.Re8 Qd5 70.Rcc8 Qh1
71.Rc1 Qd5 72.Rb1 Ba7 73.Re7 Bc5 74.Re5 Qd3 75.Rb7 Qc2 76.Rb5 Ba7 77.Ra5 Bb6
78.Rab5 Ba7 79.Rxf5 Qd3 80.Rxf7+ Kxf7 81.Rb7+ Kg6 82.Rxa7 Qd5 83.Ra6+ Kh7
84.Ra1 Kg6 85.Nd4 Qb7 86.Ra2 Qh1 87.Ra6+ Kf7 88.Nf3 Qb1 89.Rd6 Kg7 90.Rd5 Qa2+
91.Rd2 Qb1 92.Re2 Qb6 93.Rc2 Qb1 94.Nd4 Qh1 95.Rc7+ Kf6 96.Rc6+ Kf7 97.Nf3 Qb1
98.Ng5+ Kg7 99.Ne6+ Kf7 100.Nd4 Qh1 101.Rc7+ Kf6 102.Nf3 Qb1 103.Rd7 Qb2+
104.Rd2 Qb1 105.Ng1 Qb4 106.Rd1 Qb3 107.Rd6+ Kg7 108.Rd4 Qb2+ 109.Ne2 Qb1
110.e4 Qh1 111.Rd7+ Kg8 112.Rd4 Qh2+ 113.Ke3 h4 114.gxh4 Qh3+ 115.Kd2 Qxh4
116.Rd3 Kf8 117.Rf3 Qd8+ 118.Ke3 Qa5 119.Kf2 Qa7+ 120.Re3 Qd7 121.Ng3 Qd2+
122.Kf3 Qd1+ 123.Re2 Qb3+ 124.Kg2 Qb7 125.Rd2 Qb3 126.Rd5 Ke7 127.Re5+ Kf7
128.Rf5+ Ke8 129.e5 Qa2+ 130.Kh3 Qe6 131.Kh4 Qh6+ 132.Nh5 Qh7 133.e6 Qg6
134.Rf7 Kd8 135.f5 Qg1 136.Ng7 1-0`,
  },
  {
    // Ding Liren wins in 38 moves as Nepo falters under pressure
    pgn: `[Event "World Championship 2023"]
[Site "Astana KAZ"]
[Date "2023.04.26"]
[Round "12"]
[White "Ding Liren"]
[Black "Ian Nepomniachtchi"]
[Result "1-0"]

1.d4 Nf6 2.Nf3 d5 3.e3 c5 4.Nbd2 cxd4 5.exd4 Qc7 6.c3 Bd7 7.Bd3 Nc6 8.O-O Bg4
9.Re1 e6 10.Nf1 Bd6 11.Bg5 O-O 12.Bxf6 gxf6 13.Ng3 f5 14.h3 Bxf3 15.Qxf3 Ne7
16.Nh5 Kh8 17.g4 Rg8 18.Kh1 Ng6 19.Bc2 Nh4 20.Qe3 Rg6 21.Rg1 f4 22.Qd3 Qe7
23.Rae1 Qg5 24.c4 dxc4 25.Qc3 b5 26.a4 b4 27.Qxc4 Rag8 28.Qc6 Bb8 29.Qb7 Rh6
30.Be4 Rf8 31.Qxb4 Qd8 32.Qc3 Ng6 33.Bg2 Qh4 34.Re2 f5 35.Rxe6 Rxh5 36.gxh5 Qxh5
37.d5+ Kg8 38.d6 1-0`,
  },
  {
    // Gukesh blunders saved; Ding blunders to hand Gukesh the world title
    pgn: `[Event "World Championship 2024"]
[Site "Singapore SIN"]
[Date "2024.12.12"]
[Round "14"]
[White "Ding Liren"]
[Black "Dommaraju Gukesh"]
[Result "0-1"]

1.Nf3 d5 2.g3 c5 3.Bg2 Nc6 4.d4 e6 5.O-O cxd4 6.Nxd4 Nge7 7.c4 Nxd4 8.Qxd4 Nc6
9.Qd1 d4 10.e3 Bc5 11.exd4 Bxd4 12.Nc3 O-O 13.Nb5 Bb6 14.b3 a6 15.Nc3 Bd4
16.Bb2 e5 17.Qd2 Be6 18.Nd5 b5 19.cxb5 axb5 20.Nf4 exf4 21.Bxc6 Bxb2 22.Qxb2 Rb8
23.Rfd1 Qb6 24.Bf3 fxg3 25.hxg3 b4 26.a4 bxa3 27.Rxa3 g6 28.Qd4 Qb5 29.b4 Qxb4
30.Qxb4 Rxb4 31.Ra8 Rxa8 32.Bxa8 g5 33.Bd5 Bf5 34.Rc1 Kg7 35.Rc7 Bg6 36.Rc4 Rb1+
37.Kg2 Re1 38.Rb4 h5 39.Ra4 Re5 40.Bf3 Kh6 41.Kg1 Re6 42.Rc4 g4 43.Bd5 Rd6
44.Bb7 Kg5 45.f3 f5 46.fxg4 hxg4 47.Rb4 Bf7 48.Kf2 Rd2+ 49.Kg1 Kf6 50.Rb6+ Kg5
51.Rb4 Be6 52.Ra4 Rb2 53.Ba8 Kf6 54.Rf4 Ke5 55.Rf2 Rxf2 56.Kxf2 Bd5 57.Bxd5 Kxd5
58.Ke3 Ke5 0-1`,
  },
]
