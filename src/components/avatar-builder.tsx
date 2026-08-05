"use client";

import { useState } from "react";
import { CartoonAvatar, type AvatarConfig } from "./cartoon-avatar";

/**
 * Cartoon avatar creator — the same parametric system the bots use, exposed as
 * a picker. Every option list is short on purpose: a handful of good-looking
 * choices beats an overwhelming character editor.
 */

export const DEFAULT_USER_AVATAR: AvatarConfig = {
  skin: "#e8b48c",
  hair: "short",
  hairColor: "#4a3626",
  clothing: "tshirt",
  clothingColor: "#5b7d9e",
  mouth: "smile",
  brows: "normal",
};

const SKINS = ["#f6d5b8", "#eec39c", "#e8b48c", "#c98d5f", "#a06a42", "#7a4e30", "#5c3a22"];
const HAIR_COLORS = ["#17130f", "#4a3626", "#8a6a3c", "#c4622e", "#d8b96a", "#9e968c", "#e8e4da", "#7c4a9e", "#3aa0d8"];
const CLOTHES = ["#5b7d9e", "#2f7d4f", "#b0413a", "#7c4a9e", "#26292e", "#e3a83d", "#c05a80", "#3aa0d8"];

const HAIRS: AvatarConfig["hair"][] = [
  "short", "crew", "curly", "swoop", "side-part", "slick-back",
  "bob", "long", "bun", "ponytail", "afro", "dreads", "wild",
  "bouffant", "receding", "bald-fringe", "none",
];
const FACIAL: NonNullable<AvatarConfig["facialHair"]>[] = [
  "none", "stubble", "mustache", "goatee", "beard", "full",
];
const MOUTHS: NonNullable<AvatarConfig["mouth"]>[] = ["smile", "grin", "neutral", "smirk"];
const BROWS: NonNullable<AvatarConfig["brows"]>[] = ["normal", "raised", "stern"];
const GLASSES: NonNullable<AvatarConfig["glasses"]>[] = ["none", "square", "round"];
const CLOTHING: AvatarConfig["clothing"][] = [
  "tshirt", "hoodie", "sweater", "shirt", "suit", "turtleneck", "jersey",
];

function Swatches({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`${label} ${c}`}
            aria-pressed={value === c}
            onClick={() => onPick(c)}
            style={{ backgroundColor: c }}
            className={`h-7 w-7 rounded-full transition-transform ${
              value === c ? "ring-2 ring-brand ring-offset-2 ring-offset-surface-1" : "hover:scale-110"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Options<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onPick(o)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
              value === o
                ? "bg-brand text-white"
                : "bg-surface-2 text-fg-muted hover:bg-surface-3"
            }`}
          >
            {o.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AvatarBuilder({
  value,
  onChange,
  name = "You",
}: {
  value: AvatarConfig;
  onChange: (next: AvatarConfig) => void;
  name?: string;
}) {
  const set = (patch: Partial<AvatarConfig>) => onChange({ ...value, ...patch });
  const [tab, setTab] = useState<"face" | "hair" | "clothes">("face");

  return (
    <div>
      <div className="grid place-items-center rounded-2xl bg-board p-4">
        <CartoonAvatar config={value} name={name} size={140} />
      </div>

      <div className="mt-3 flex gap-1 rounded-xl bg-surface-1 p-1" role="tablist">
        {(["face", "hair", "clothes"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "bg-surface-3 text-fg" : "text-fg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab === "face" && (
          <>
            <Swatches label="Skin" colors={SKINS} value={value.skin} onPick={(skin) => set({ skin })} />
            <Options label="Mouth" options={MOUTHS} value={value.mouth ?? "smile"} onPick={(mouth) => set({ mouth })} />
            <Options label="Brows" options={BROWS} value={value.brows ?? "normal"} onPick={(brows) => set({ brows })} />
            <Options label="Glasses" options={GLASSES} value={value.glasses ?? "none"} onPick={(glasses) => set({ glasses })} />
          </>
        )}
        {tab === "hair" && (
          <>
            <Options label="Style" options={HAIRS} value={value.hair} onPick={(hair) => set({ hair })} />
            <Swatches label="Colour" colors={HAIR_COLORS} value={value.hairColor} onPick={(hairColor) => set({ hairColor })} />
            <Options label="Facial hair" options={FACIAL} value={value.facialHair ?? "none"} onPick={(facialHair) => set({ facialHair })} />
          </>
        )}
        {tab === "clothes" && (
          <>
            <Options label="Outfit" options={CLOTHING} value={value.clothing} onPick={(clothing) => set({ clothing })} />
            <Swatches label="Colour" colors={CLOTHES} value={value.clothingColor} onPick={(clothingColor) => set({ clothingColor })} />
          </>
        )}
      </div>
    </div>
  );
}
