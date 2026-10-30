import React from 'react';
import StdWindow from './StdWindow';
import { subscribeNotice, getNotice, postNotice } from '../../lib/uiNotice';
import { UI_TOKENS } from '../../lib/uiTokens';

/**
 * UiNotice — the kit's HUD notification host. Mounted ONCE in App;
 * renders the current uiNotice bus line as a StdWindow toast
 * (base register, the game's one frame) for UI_TOKENS.motion
 * .noticeMs, then clears it. role="status" so assistive tech hears
 * it; pointer-transparent so it never blocks play. Renders nothing
 * when no notice is posted — no empty frame ever sits on the HUD.
 */
export default function UiNotice() {
  const [text, setText] = React.useState<string | null>(getNotice());

  React.useEffect(() => subscribeNotice(setText), []);

  React.useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => postNotice(''), UI_TOKENS.motion.noticeMs);
    return () => clearTimeout(t);
  }, [text]);

  if (!text) return null;
  return (
    <StdWindow className="ui-notice">
      <div role="status">{text}</div>
    </StdWindow>
  );
}
