import type { AxisScores } from "./scoring";

// Colors for drawing scores on light backgrounds (charts, history cards).
// These follow the brand palette used by the orb and radar, except Social
// Attunement: the brand yellow (#fcf050) is nearly invisible on white and
// lavender, so data views use a deeper gold instead.
export const AXIS_COLORS: Record<keyof AxisScores, string> = {
  social_attunement: "#b89a00",
  empathy: "#8fae3a",
  self_orientation: "#933160",
  conscientiousness: "#14877c",
  agency: "#c13732",
  reactivity: "#d16539",
};
