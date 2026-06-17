import type { ScoreState } from "../types";
import type { Settings } from "../hooks/useSettings";
import { MOVE_TIME_PRESETS, BLITZ_TIME_PRESETS, ENGINE_DEPTH_PRESETS } from "../hooks/useSettings";
import { buildScoreLabel } from "../hooks/useScore";

interface SettingsModalProps {
  settings: Settings;
  scoreState: ScoreState;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  scoreState,
  onUpdateSettings,
  onReset,
  onClose,
}: SettingsModalProps) {
  function handleReset() {
    if (window.confirm("Reset your score and streak to zero?")) {
      onReset();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Settings</h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* ── Score & Streaks ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">
            {buildScoreLabel(settings.engineElo, settings.blitzEnabled, settings.blitzSeconds)}
          </h3>
          <div className="settings-row settings-row--stats">
            <div className="settings-stat">
              <span className="settings-stat__value">
                {scoreState.totalPoints}
              </span>
              <span className="settings-stat__label">Pts</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat__value">
                {scoreState.maxPoints}
              </span>
              <span className="settings-stat__label">Max pts</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat__value">
                {scoreState.movesPlayed}
              </span>
              <span className="settings-stat__label">Moves</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat__value">
                {scoreState.bestStreak}🔥
              </span>
              <span className="settings-stat__label">Best streak</span>
            </div>
          </div>
          <button className="btn-reset" onClick={handleReset}>
            Reset score
          </button>
        </section>

        {/* ── Difficulty ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">Engine difficulty</h3>
          <p className="settings-section__hint">
            Engine strength as approximate ELO. GM uses full Stockfish strength.
          </p>
          <div className="preset-buttons">
            {MOVE_TIME_PRESETS.map((p) => (
              <button
                key={String(p.elo)}
                className={`preset-btn${settings.engineElo === p.elo ? " preset-btn--active" : ""}`}
                onClick={() => onUpdateSettings({ engineElo: p.elo })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Depth ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">Analysis depth</h3>
          <p className="settings-section__hint">
            Max time Stockfish may spend per position. It can finish earlier if the position is clear.
          </p>
          <div className="preset-buttons">
            {ENGINE_DEPTH_PRESETS.map((p) => (
              <button
                key={p.ms}
                className={`preset-btn${settings.engineMoveTimeMs === p.ms ? " preset-btn--active" : ""}`}
                onClick={() => onUpdateSettings({ engineMoveTimeMs: p.ms })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Blitz mode ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">Timer mode</h3>
          <p className="settings-section__hint">
            Countdown timer — move before time runs out.
          </p>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.blitzEnabled}
              onChange={(e) =>
                onUpdateSettings({ blitzEnabled: e.target.checked })
              }
            />
            <span className="toggle__track" />
            <span className="toggle__label">
              {settings.blitzEnabled ? "On" : "Off"}
            </span>
          </label>
          {settings.blitzEnabled && (
            <div className="preset-buttons" style={{ marginTop: "0.5rem" }}>
              {BLITZ_TIME_PRESETS.map((p) => (
                <button
                  key={p.s}
                  className={`preset-btn${settings.blitzSeconds === p.s ? " preset-btn--active" : ""}`}
                  onClick={() => onUpdateSettings({ blitzSeconds: p.s })}
                >
                  {p.s}s {p.label}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
