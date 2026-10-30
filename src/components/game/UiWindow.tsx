import React from 'react';
import StdWindow from './StdWindow';

/**
 * UiWindow — the UI template kit's standard window: the game's ONE
 * frame (StdWindow) plus the furniture every window needs — a title
 * bar, an optional close (back) affordance in the same top-right
 * seat on every window, and a footer slot for the help line.
 * Built ON StdWindow, never instead of it: skins, day/night accent
 * and the v32 menu floor all keep working because the frame itself
 * is unchanged. Layout metrics come from uiTokens (16px window
 * padding, 24px title, 48px minimum target).
 *
 * The close button is a real <button> labelled "Close" — every kit
 * window can always be left by mouse, touch, and (via the host
 * screen's useMenuNavigation onCancel) by keyboard.
 */
export default function UiWindow({ title, children, footer, onClose, selected = false, accent, className = '', style, ariaLabel }: {
  title?: string;
  children: React.ReactNode;
  /** Bottom slot — normally a MenuHelpLine / UiListMenu help line. */
  footer?: React.ReactNode;
  /** When set, renders the standard top-right close button. */
  onClose?: () => void;
  selected?: boolean;
  accent?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  return (
    <StdWindow selected={selected} accent={accent} className={`ui-window ${className}`} style={style}>
      <div role="dialog" aria-label={ariaLabel ?? title} className="flex flex-col gap-3">
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-3">
            {title
              ? <h2 className="game-title ui-window-title">{title}</h2>
              : <span />}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="game-button ui-window-close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
        {footer}
      </div>
    </StdWindow>
  );
}
