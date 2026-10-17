import type { AccessoryType, Colour, FabricType, StyleTag } from "@/game/data/v1";
import type { Personality } from "./personalities";

// Slots: {tag} {fabric} {colour} {accessory} {count} {countWord} {list}.
type Lines = readonly [string, ...string[]];

export interface GenericClientLines {
  style: Lines;
  styleAvoid: Lines;
  fabric: Lines;
  fabricAvoid: Lines;
  fabricsOnly: Lines;
  fabricsMin: Lines;
  colour: Lines;
  colourAvoid: Lines;
  colourOnly: Lines;
  accessory: Lines;
  accessoryAvoid: Lines;
  accessoryMin: Lines;
  accessoryExact: Lines;
  coloursMin: Lines;
}

export type SpecificClientLineKey =
  | `style:${StyleTag}`
  | `styleAvoid:${StyleTag}`
  | `fabric:${FabricType}`
  | `fabricAvoid:${FabricType}`
  | `colour:${Colour}`
  | `colourAvoid:${Colour}`
  | `accessory:${AccessoryType}`
  | `accessoryAvoid:${AccessoryType}`
  | `accessoryMin:${AccessoryType}`
  | `accessoryExact:${AccessoryType}`;

export interface PersonalityLines {
  generic: GenericClientLines;
  specific: Partial<Record<SpecificClientLineKey, Lines>>;
}

export const clientLines: Record<Personality, PersonalityLines> = {
  deadpan: {
    generic: {
      style: [
        "Think {tag}. I'll know it when I see it.",
        "{tag}. That's the whole request.",
        "Make it {tag}. I've had a long week.",
      ],
      styleAvoid: ["Anything but {tag}. I'll be fine.", "Not {tag}. I have my reasons."],
      fabric: ["{fabric}. It'll do nicely.", "I'd like {fabric}. Don't read into it."],
      fabricAvoid: ["No {fabric}. We don't talk about it.", "Not {fabric}. It knows what it did."],
      fabricsOnly: [
        "Nothing but honest fabrics. {list} only.",
        "{list} only. Surprise me within that.",
      ],
      fabricsMin: [
        "I get bored easily. {countWord} fabrics, at least.",
        "At least {countWord} fabrics. I like options.",
      ],
      colour: ["{colour}, please. It matches my mood.", "Make it {colour}. Don't ask me why."],
      colourAvoid: ["No {colour}. We've fallen out.", "Anything but {colour}. Long story."],
      colourOnly: ["Nothing but {list}, please. I'm not fussy.", "{list} only. Only means only."],
      accessory: [
        "{accessory}. Somewhere on there.",
        "Add {accessory}. I'll pretend I'm not excited.",
      ],
      accessoryAvoid: ["No {accessory}. I've had enough of them.", "Keep the {accessory} off me."],
      accessoryMin: [
        "{countWord} {accessory}, at the very least.",
        "At least {countWord} {accessory}. Subtlety is not the goal.",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}. Not one more.",
        "{countWord} {accessory}. I counted.",
      ],
      coloursMin: [
        "I want colour, and lots of it. {countWord} at least.",
        "At least {countWord} colours. I'm tired of beige.",
      ],
    },
    specific: {
      "fabric:Velvet": [
        "I adore velvet. Don't tell anyone.",
        "Velvet. It's the only thing that's ever understood me.",
      ],
      "fabricAvoid:Sequin": ["Sequins make me itch.", "No sequins. I'd rather not glitter."],
      "style:Gothic": [
        "Something with a little darkness to it.",
        "Gothic. Think funeral, but fun.",
      ],
      "styleAvoid:Cute": [
        "Nothing sweet, please. I'm not a cupcake.",
        "Not cute. I'm not a kitten.",
      ],
      "colourAvoid:Black": [
        "No black. I'm not in mourning.",
        "Anything but black. No wake planned. Yet.",
      ],
      "accessory:Bow": [
        "Bows, please. Don't look so surprised.",
        "A bow, or several. Restraint is overrated.",
      ],
      "accessoryAvoid:Feather": ["No feathers, I sneeze.", "No feathers. They end up in my tea."],
      "accessoryMin:Bow": [
        "Bows everywhere. {countWord} at the very least.",
        "{countWord} {accessory}, minimum. Subtlety is not the goal.",
      ],
      "accessoryExact:Brooch": [
        "{countWord} {accessory}. One for each of my ex-husbands.",
        "{countWord} {accessory}. I'm told that's a respectable number.",
      ],
    },
  },
  gushing: {
    generic: {
      style: [
        "Oh, {tag}! That's exactly what I'm after, darling.",
        "I'm dreaming of {tag}, darling. Truly dreaming.",
        "Oh, {tag}, please! I can't wait to see it.",
      ],
      styleAvoid: [
        "Oh, not {tag}, darling. I couldn't bear it.",
        "Anything but {tag}, my dear. Everything else is wonderful!",
      ],
      fabric: [
        "Oh, {fabric}! What a lovely idea, darling.",
        "{fabric}, please! I'm already imagining it.",
      ],
      fabricAvoid: [
        "Oh, no {fabric}, darling. It just isn't me.",
        "I'm afraid {fabric} and I don't get along, dear.",
      ],
      fabricsOnly: [
        "Oh, nothing but {list}, please, darling!",
        "Just {list}, dear. Only those, and I'll be delighted.",
      ],
      fabricsMin: [
        "Oh, {countWord} fabrics at least, darling! The more, the merrier.",
        "Mix it up, dear! {countWord} fabrics or more would be heavenly.",
      ],
      colour: [
        "Oh, {colour}, darling! I'm glowing at the thought.",
        "Make it {colour}, dear! It's my favourite today.",
      ],
      colourAvoid: [
        "Oh, not {colour}, darling! It isn't my day for it.",
        "No {colour} for me, dear. Everything else is gorgeous!",
      ],
      colourOnly: [
        "Oh, nothing but {list}, please, darling!",
        "Only {list}, dear. Isn't that lovely?",
      ],
      accessory: [
        "Oh, {accessory}! Add as many as you like, darling.",
        "Do add {accessory}, dear. They make me so happy!",
      ],
      accessoryAvoid: [
        "Oh, no {accessory}, darling. I'm so sorry to be fussy!",
        "Please keep the {accessory} away, dear. They don't suit me, I'm afraid.",
      ],
      accessoryMin: [
        "Oh, {countWord} {accessory} at the very least, darling!",
        "Please, at least {countWord} {accessory}, dear! Oh, the joy.",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}, darling. Perfection!",
        "{countWord} {accessory}, dear, no more, no fewer. I just know it's right.",
      ],
      coloursMin: [
        "Oh, at least {countWord} colours, darling! Make it a rainbow.",
        "Colour, dear, colour! {countWord} at the very least.",
      ],
    },
    specific: {
      "fabric:Velvet": [
        "Oh, velvet! I simply adore it, darling.",
        "Velvet, dear? Oh, you've read my mind!",
      ],
      "fabricAvoid:Sequin": [
        "Oh, no sequins, darling. They make me itch dreadfully.",
        "Sequins, dear? Lovely on others, but not on me.",
      ],
      "style:Gothic": [
        "Oh, something gothic, darling! Dark and dreamy.",
        "Gothic, please, dear! Moody and magnificent.",
      ],
      "styleAvoid:Cute": [
        "Oh, not cute, darling! I'm feeling far too grand today.",
        "Nothing cute, dear, I beg you. I'm feeling dramatic.",
      ],
      "colourAvoid:Black": [
        "Oh, no black, darling! I'm feeling far too sunny.",
        "Anything but black, dear. Let's be bright!",
      ],
      "accessory:Bow": [
        "Oh, bows! I simply adore a bow, darling.",
        "Bows, dear! Add every one you can find.",
      ],
      "accessoryAvoid:Feather": [
        "Oh, no feathers, darling! They make me sneeze terribly.",
        "No feathers, dear. I'm so sorry, I do sneeze so!",
      ],
      "accessoryMin:Bow": [
        "Oh, bows everywhere, darling! {countWord} at the very least.",
        "{countWord} {accessory} at least, dear! I can't have too many.",
      ],
      "accessoryExact:Brooch": [
        "Oh, exactly {countWord} {accessory}, darling! Each one a little treasure.",
        "{countWord} {accessory}, dear, no more, no fewer. Isn't that sweet?",
      ],
    },
  },
  brisk: {
    generic: {
      style: ["{tag}. No fuss.", "Make it {tag}.", "Go {tag}. Keep it practical."],
      styleAvoid: ["Not {tag}.", "No {tag}. Moving on."],
      fabric: ["{fabric}, please. Keep it simple.", "Use {fabric}. Thanks."],
      fabricAvoid: ["No {fabric}.", "Skip the {fabric}. Thanks."],
      fabricsOnly: ["{list} only.", "Nothing but {list}. That's all."],
      fabricsMin: ["At least {countWord} fabrics.", "{countWord} fabrics, minimum. Thanks."],
      colour: ["{colour}. That's it.", "Make it {colour}."],
      colourAvoid: ["No {colour}.", "Not {colour}. Thanks."],
      colourOnly: ["{list} only.", "Nothing but {list}. Quick as you can."],
      accessory: ["{accessory}. A few will do.", "Add {accessory}."],
      accessoryAvoid: ["No {accessory}.", "Leave off the {accessory}."],
      accessoryMin: [
        "At least {countWord} {accessory}.",
        "{countWord} {accessory}, minimum. Thanks.",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}.",
        "{countWord} {accessory}. No more, no fewer.",
      ],
      coloursMin: ["At least {countWord} colours.", "{countWord} colours, minimum. Thanks."],
    },
    specific: {
      "fabric:Velvet": ["Velvet. No fuss.", "Velvet, please. Thanks."],
      "fabricAvoid:Sequin": ["No sequins.", "No sequins. They shed."],
      "style:Gothic": ["Gothic. Dark, simple, done.", "Gothic. Nothing flimsy."],
      "styleAvoid:Cute": ["Not cute. Thanks.", "No cute. I'm busy."],
      "colourAvoid:Black": ["No black.", "Anything but black."],
      "accessory:Bow": ["Bows. A few.", "Bows, please. Neat ones."],
      "accessoryAvoid:Feather": ["No feathers.", "No feathers. They get everywhere."],
      "accessoryMin:Bow": [
        "{countWord} {accessory} at least. Neat.",
        "At least {countWord} {accessory}.",
      ],
      "accessoryExact:Brooch": [
        "Exactly {countWord} {accessory}. Pinned neatly.",
        "{countWord} {accessory}. Count them.",
      ],
    },
  },
};
