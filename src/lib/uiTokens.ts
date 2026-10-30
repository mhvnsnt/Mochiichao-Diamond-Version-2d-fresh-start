/**
 * uiTokens — the ONE shared token set for the UI template kit
 * (UiWindow / UiListMenu / UiChoiceMenu / UiNotice + the screens that
 * adopt them).
 *
 * Why this exists: the game already has one frame (StdWindow /
 * .game-panel) and one palette, but spacing, type sizes, row heights
 * and focus treatment were re-decided per screen, which is why menus
 * felt inconsistent. These tokens name the values the shipped screens
 * already converge on (StdWindow's v4 palette, MenuList's 15px row
 * gap, DialogueBox's type sizes), so adopting the kit changes no
 * screen's identity — it stops the next screen from drifting.
 *
 * PROVENANCE: window/frame structure follows the game's existing
 * StdWindow (itself the 9-slice text-window structure of the held
 * decomps, translated to CSS in game-flow v4). Colour values are the
 * game's own v4 palette — no donor colours, names, or assets. Type
 * scale and row metrics are measured from the game's shipped screens
 * (MenuList row gap 15px, DialogueBox 16px/1.625 body text, HUD
 * 11px micro-labels). Persona presentation values are NOT here: that
 * dialect stays reserved (src/lib/personaDialogue.ts) and is never a
 * token default.
 */
import './uiKit.css';

export const UI_TOKENS = {
  space: {
    /** Tight inline gap (icon + label). */
    xs: 4,
    /** Default control gap. */
    sm: 8,
    /** MenuList's shipped row gap — the list rhythm everywhere. */
    row: 15,
    /** Window padding (DialogueBox / pause panel use 16px). */
    window: 16,
    /** Screen safe margin (dialogue box sits 0.75rem from edges). */
    screen: 12,
  },
  type: {
    /** HUD micro-labels (WorldHud time/party lines). */
    micro: 11,
    /** Help lines, secondary text. */
    help: 14,
    /** Menu rows and dialogue body (Settings TEXT SIZE default). */
    body: 16,
    /** Window titles (.game-title on the pause panel). */
    title: 24,
    lineHeight: 1.625,
  },
  frame: {
    /** StdWindow / .game-panel palette — the one frame. */
    panel: '#16233a',
    panelOpacity: 0.92,
    border: '#22d3ee',
    accent: '#fbbf24',
    text: '#f1f5f9',
    danger: '#ef4444',
    radius: 14,
    borderWidth: 2,
  },
  focus: {
    /** The selected-row treatment MenuList already ships. */
    ring: '0 0 0 2px #fde047',
    brightness: 1.25,
    cursorGlyph: '►',
  },
  control: {
    /** Minimum touch target (DialogueBox YES/NO buttons ship 48px). */
    minTarget: 48,
    rowPadY: 10,
    rowPadX: 16,
  },
  layer: {
    hud: 40,
    window: 50,
    notice: 90,
  },
  motion: {
    /** Notice lifetime before auto-dismiss. */
    noticeMs: 2600,
  },
} as const;

/** CSS custom properties for the kit, set once by uiKit.css :root. */
export const UI_TOKEN_CSS_VARS: Record<string, string> = {
  '--ui-space-row': `${UI_TOKENS.space.row}px`,
  '--ui-window-pad': `${UI_TOKENS.space.window}px`,
  '--ui-type-help': `${UI_TOKENS.type.help}px`,
  '--ui-type-body': `${UI_TOKENS.type.body}px`,
  '--ui-frame-panel': UI_TOKENS.frame.panel,
  '--ui-frame-border': UI_TOKENS.frame.border,
  '--ui-frame-accent': UI_TOKENS.frame.accent,
  '--ui-frame-text': UI_TOKENS.frame.text,
  '--ui-frame-danger': UI_TOKENS.frame.danger,
  '--ui-frame-radius': `${UI_TOKENS.frame.radius}px`,
  '--ui-min-target': `${UI_TOKENS.control.minTarget}px`,
};
