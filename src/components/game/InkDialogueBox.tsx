import React, { useCallback, useEffect, useRef, useState } from "react";
import DialogueBox from "./DialogueBox";
import type { InkChoice, InkLine, InkSession } from "../../lib/inkStory";
import { slotForNpc } from "../../lib/humanSheets";

/**
 * InkDialogueBox — drives the game's DialogueBox from a live Ink
 * session (step i). One Ink line at a time through the same message
 * window the plain dialog[] path uses (typewriter, portrait,
 * 2-lines-per-page, A advance); when the story reaches a choice
 * point, the choices render as a vertical option list inside that
 * same window — the FireRed multichoice shape, not a popup.
 *
 * The session is created by the caller (WorldEngine) so a bad story
 * id / knot falls back to plain dialog lines before this component
 * ever mounts. onComplete fires once, with the story's declared
 * variables (clock_set, codex_get, sprint_boots for the truck start),
 * when the session ends — knot-scoped sessions end at their divert
 * boundary, full-story sessions at END.
 */
export default function InkDialogueBox({
  session,
  npc,
  onComplete,
  registerAdvance,
}: {
  session: InkSession;
  npc?: { name?: string; [key: string]: unknown } | null;
  onComplete: (variables: Record<string, unknown>) => void;
  registerAdvance?: (fn: (() => void) | null) => void;
}) {
  const [line, setLine] = useState<InkLine | null>(null);
  const [choices, setChoices] = useState<InkChoice[]>([]);
  const startedRef = useRef(false);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const pull = useCallback(() => {
    const next = session.next();
    if (next) {
      setLine(next);
      setChoices([]);
      return;
    }
    const ch = session.choices;
    if (ch.length > 0) {
      setChoices(ch);
      return;
    }
    if (!doneRef.current) {
      doneRef.current = true;
      onCompleteRef.current(session.variables);
    }
  }, [session]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    pull();
    // Run once: the session is stateful and must not restart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = useCallback(
    (index: number) => {
      session.choose(index);
      setChoices([]);
      pull();
    },
    [session, pull],
  );

  // An empty story completes through pull() above; render nothing
  // while that completion is in flight.
  if (line === null && choices.length === 0) return null;

  const speakerName = line?.speaker ?? undefined;
  const speakerSlot =
    line?.speaker && npc && line.speaker === npc.name
      ? slotForNpc(npc)
      : null;

  return (
    <DialogueBox
      lines={line ? [line.text] : ["..."]}
      speakerName={speakerName}
      speakerSlot={speakerSlot}
      options={choices.length > 0 ? choices.map((c) => c.text) : undefined}
      onOption={
        choices.length > 0
          ? (i: number) => pick(choices[i]?.index ?? i)
          : undefined
      }
      onComplete={pull}
      registerAdvance={registerAdvance}
    />
  );
}
