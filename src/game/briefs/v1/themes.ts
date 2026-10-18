import type { AccessoryType, Colour, FabricType, StyleTag, fabrics } from "@/game/data/v1";

type GeneralFabricName = {
  [F in FabricType]: (typeof fabrics)[F] extends { modifierOnly: true } ? never : F;
}[FabricType];

export interface ThemeBoosts {
  tag: number;
  item: number;
  avoid: number;
}

export const themeBoosts: ThemeBoosts = {
  tag: 4,
  item: 3,
  avoid: 0.25,
};

export interface Theme {
  id: string;
  favouredTags: readonly StyleTag[];
  favouredColours: readonly Colour[];
  favouredFabrics?: readonly GeneralFabricName[];
  favouredAccessories?: readonly AccessoryType[];
  occasions: readonly string[];
  adjectives: readonly string[];
  worries: readonly string[];
  templates: readonly string[];
}

export const themes: readonly Theme[] = [
  {
    id: "harvest-supper",
    favouredTags: ["Simple", "Warm", "Daywear"],
    favouredColours: ["Orange", "Brown", "Yellow"],
    favouredFabrics: ["Wool", "Linen"],
    favouredAccessories: ["Button", "Piping"],
    occasions: ["the harvest supper", "the village apple fair", "the barn dance"],
    adjectives: ["honest and hard-wearing", "warm and sturdy", "plain and cheerful"],
    worries: ["looking like a scarecrow", "getting pie on it", "shivering in the barn"],
    templates: [
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "{name} is dressing for {occasion} and wants to look {adjective} without {worry}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
      "{name} needs something {adjective} for {occasion}, without {worry}.",
    ],
  },
  {
    id: "garden-party",
    favouredTags: ["Romantic", "Flowers", "Daywear"],
    favouredColours: ["Pink", "White", "Green"],
    favouredFabrics: ["Lace", "Cotton"],
    favouredAccessories: ["Flower", "Bow"],
    occasions: ["a midsummer garden party", "a summer tea on the lawn", "the flower show"],
    adjectives: ["romantic", "soft and dreamy", "fresh and pretty"],
    worries: ["outshining the hostess", "attracting every bee", "getting grass stains"],
    templates: [
      "{name} is attending {occasion} and wants to look {adjective} without {worry}.",
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
    ],
  },
  {
    id: "stylish-wake",
    favouredTags: ["Gothic", "Elegant", "Formal"],
    favouredColours: ["Black", "Purple"],
    favouredFabrics: ["Velvet", "Lace"],
    favouredAccessories: ["Brooch", "Feather"],
    occasions: ["a very stylish wake", "a moonlit seance", "a dramatic poetry reading"],
    adjectives: ["dark and dignified", "moody and elegant", "mysterious"],
    worries: ["looking too cheerful", "frightening the vicar", "tripping on the hem"],
    templates: [
      "{name} is attending {occasion} and wants to look {adjective} without {worry}.",
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
      "{name} needs something {adjective} for {occasion}, without {worry}.",
    ],
  },
  {
    id: "winter-gala",
    favouredTags: ["Glamour", "Eveningwear", "Shimmering"],
    favouredColours: ["Red", "Purple", "Yellow"],
    favouredFabrics: ["Sequin", "Silk", "Velvet"],
    favouredAccessories: ["Jewel", "Feather"],
    occasions: ["the grand winter gala", "opening night at the opera", "the mayor's charity ball"],
    adjectives: ["dazzling", "glittering and grand", "sleek and sparkling"],
    worries: ["looking like a disco ball", "snagging a sequin on the buffet", "sitting down in it"],
    templates: [
      "{name} is attending {occasion} and wants to look {adjective} without {worry}.",
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
    ],
  },
  {
    id: "job-interview",
    favouredTags: ["Professional", "Simple", "Workwear"],
    favouredColours: ["Grey", "Blue", "Black"],
    favouredFabrics: ["Wool", "Linen", "Cotton"],
    favouredAccessories: ["Button", "Piping"],
    occasions: [
      "a final-round interview",
      "a meeting with the bank manager",
      "a tour of the new workshop",
    ],
    adjectives: ["capable and calm", "crisp and sensible", "smart but friendly"],
    worries: ["looking stiff", "creasing on the bus", "looking like a mannequin"],
    templates: [
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "{name} is dressing for {occasion} and wants to look {adjective} without {worry}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
      "{name} needs something {adjective} for {occasion}, without {worry}.",
    ],
  },
  {
    id: "costume-party",
    favouredTags: ["Playful", "Eclectic", "Elaborate"],
    favouredColours: ["Orange", "Purple", "Yellow"],
    favouredAccessories: ["Tassel", "Bell", "Trim", "Appliqué"],
    occasions: ["a costume party", "the masquerade at the old mill", "a fancy dress picnic"],
    adjectives: ["bold and silly", "wonderfully over the top", "gloriously odd"],
    worries: ["being mistaken for a lampshade", "matching the curtains", "being unable to dance"],
    templates: [
      "{name} is going to {occasion} and wants to look {adjective} without {worry}.",
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
    ],
  },
  {
    id: "seaside-holiday",
    favouredTags: ["Casual", "Cool", "Patterned"],
    favouredColours: ["Blue", "White", "Yellow"],
    favouredFabrics: ["Cotton", "Linen"],
    favouredAccessories: ["Button", "Trim"],
    occasions: ["a seaside holiday", "a day on the pier", "a picnic on the beach"],
    adjectives: ["light and breezy", "relaxed and cheerful", "bright as a postcard"],
    worries: ["blowing away in the wind", "getting sand in the seams", "attracting seagulls"],
    templates: [
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "{name} is dressing for {occasion} and wants to look {adjective} without {worry}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
      "{name} needs something {adjective} for {occasion}, without {worry}.",
    ],
  },
  {
    id: "first-date",
    favouredTags: ["Cute", "Romantic", "Risqué"],
    favouredColours: ["Pink", "Red"],
    favouredFabrics: ["Lace", "Silk"],
    favouredAccessories: ["Bow", "Flower", "Lace Trim"],
    occasions: ["a first date", "a candlelit dinner for two", "a sunset picnic date"],
    adjectives: ["sweet with a little spark", "charming and daring", "cute but a bit bold"],
    worries: ["trying too hard", "looking like a valentine", "spilling soup on it"],
    templates: [
      "{name} is dressing for {occasion} and wants to look {adjective} without {worry}.",
      "{name} is dressing for {occasion} and wants something {adjective}.",
      "For {occasion}, {name} would like something {adjective}. No {worry}, please.",
    ],
  },
];
