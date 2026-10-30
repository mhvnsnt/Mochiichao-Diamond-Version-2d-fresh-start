import React from "react";
import {
  sceneGeometry,
  type ResolvedBattleScene,
  type SceneShape,
  type PlatformAnchors,
} from "../../lib/battleBackground";
import { useGameStore } from "../../store/gameStore";
import { getStyleProfile } from "../../lib/styleProfiles";

/**
 * The battle scene, DOM renderer — draws exactly the geometry the
 * resolver produced (battleBackground.sceneGeometry), the same data
 * PixiBattleCanvas draws on the Pixi path, so the two battle surfaces
 * can never drift apart. Presentation only: no scene choice happens
 * here; the caller resolves (WorldEngine passes its map/tile/phase).
 *
 * Anchors default to the Pixi canvas battler bases; the WorldEngine
 * DOM battle passes its own billboard anchors so the platforms sit
 * under its portraits.
 */
export default function BattleSceneBackdrop({
  scene,
  anchors,
  className,
}: {
  scene: ResolvedBattleScene;
  anchors?: PlatformAnchors;
  className?: string;
}) {
  // Visual generation switcher: the backdrop's platform staging
  // reads the active profile's battle depth scales from the
  // registry (never hardcoded) so backdrop and battlers flatten
  // together — the switcher lane's coordination point for this
  // component, applied at landing composition.
  const visualStyle = useGameStore(s => s.settings.visualStyle);
  const battleDepth = getStyleProfile(visualStyle).battle;
  const geo = sceneGeometry(scene, anchors, battleDepth);
  const shape = (s: SceneShape, i: number) => {
    switch (s.kind) {
      case "rect":
        return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill} />;
      case "circle":
        return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />;
      case "ellipse":
        return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} />;
      case "polygon":
        return <polygon key={i} points={(s.points ?? []).map((pt) => pt.join(",")).join(" ")} fill={s.fill} />;
      default:
        return null;
    }
  };
  const plats = geo.platforms;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {geo.shapes.map(shape)}
      {shape(plats.enemyShade, 1001)}
      {shape(plats.enemy, 1002)}
      {shape(plats.playerShade, 1003)}
      {shape(plats.player, 1004)}
      {geo.tint && (
        <rect x={0} y={0} width={geo.width} height={geo.height} fill={geo.tint.color} opacity={geo.tint.alpha} />
      )}
    </svg>
  );
}
