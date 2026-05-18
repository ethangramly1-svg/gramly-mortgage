export const palette = {
  paper:     "#f6f0e4",
  paperSub:  "#ece4d2",
  ink:       "#0a1224",
  inkSoft:   "#2d3a52",
  brass:     "#c8a047",
  brassDeep: "#9a7830",
  moon:      "#f0c674",
  cream:        "#f7ecd6",
  creamDeep:    "#e8d6ad",
  marbleWhite:  "#fbf7ef",
  goldGlow:     "#d9b063",
  goldDeep:     "#a37b2d",
  skyWarmTop:   "#f5d99a",
  skyWarmMid:   "#e8b070",
  skyWarmHaze:  "#fde7c4"
} as const;

export type PaletteKey = keyof typeof palette;
