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
        "Nothing but honest fabrics, please. Only {list}.",
        "{list} only. Surprise me within that.",
      ],
      fabricsMin: [
        "I get bored easily. At least {countWord} fabrics.",
        "At least {countWord} fabrics. I like options.",
      ],
      colour: ["{colour}, please. It matches my mood.", "Make it {colour}. Don't ask me why."],
      colourAvoid: ["No {colour}. We've fallen out.", "Anything but {colour}. Long story."],
      colourOnly: ["Nothing but {list}, please. I'm not fussy.", "{list} only. Only means only."],
      accessory: [
        "{accessory}. Somewhere on there.",
        "Add {accessory}. I'll pretend I'm not excited.",
      ],
      accessoryAvoid: ["No {accessory}. I've had my fill.", "Keep the {accessory} off me."],
      accessoryMin: [
        "{countWord} {accessory}, at the very least.",
        "At least {countWord} {accessory}. Subtlety is not the goal.",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}. Not one more.",
        "{countWord} {accessory}. I counted.",
      ],
      coloursMin: [
        "I want colour, and lots of it. At least {countWord}.",
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
        "Bows everywhere. At the very least, {countWord}.",
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
        "Mix it up, dear! At least {countWord} fabrics would be heavenly.",
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
        "Do add {accessory}, dear. What a treat!",
      ],
      accessoryAvoid: [
        "Oh, no {accessory}, darling. I'm so sorry to be fussy!",
        "Please keep the {accessory} away, dear. It's just not me, I'm afraid.",
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
        "Colour, dear, colour! At the very least, {countWord}.",
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
        "Oh, bows everywhere, darling! At the very least, {countWord}.",
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
      accessory: ["{accessory}. Keep it tidy.", "Add {accessory}."],
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
  grand: {
    generic: {
      style: [
        "One expects {tag}. I trust that is clear.",
        "Make it {tag}. One has standards, after all.",
        "I shall require {tag}. Do try to rise to it.",
      ],
      styleAvoid: [
        "One cannot abide {tag}. Kindly avoid it.",
        "Not {tag}, I think. It would not be fitting.",
      ],
      fabric: [
        "One expects {fabric}. Nothing less will do.",
        "I shall wear {fabric}. It is only proper.",
      ],
      fabricAvoid: [
        "No {fabric}, please. It is not done.",
        "One does not wear {fabric}. I am sure you understand.",
      ],
      fabricsOnly: [
        "One will accept only {list}. I trust that is not too taxing.",
        "{list} only. I have never needed more.",
      ],
      fabricsMin: [
        "One expects a variety. At least {countWord} fabrics, I think.",
        "At least {countWord} fabrics. A single cloth is so provincial.",
      ],
      colour: [
        "{colour}, naturally. It has always suited me.",
        "One expects {colour}. I have worn it for years.",
      ],
      colourAvoid: [
        "No {colour}, please. One has never trusted it.",
        "I will not wear {colour}. Do not take it personally.",
      ],
      colourOnly: [
        "One will wear nothing but {list}. I am quite decided.",
        "{list} only. Anything else would be vulgar.",
      ],
      accessory: [
        "A touch of {accessory}, I think. Tastefully, of course.",
        "One expects {accessory}. It is a matter of form.",
      ],
      accessoryAvoid: [
        "No {accessory}, please. It is not for me.",
        "One finds {accessory} rather tiresome. Leave it off.",
      ],
      accessoryMin: [
        "I shall require at least {countWord} {accessory}. A lady must be noticed.",
        "At least {countWord} {accessory}, if you please. One does like to be seen.",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}, no more, no fewer. One is particular.",
        "{countWord} {accessory}, precisely. I shall be counting.",
      ],
      coloursMin: [
        "One expects colour. At least {countWord}, I think.",
        "At least {countWord} colours, if you please. I do not do plain.",
      ],
    },
    specific: {
      "fabric:Velvet": [
        "One expects velvet. It is the only fabric with manners.",
        "Velvet, naturally. I could not possibly wear anything else.",
      ],
      "fabricAvoid:Sequin": [
        "No sequins. One is not a chandelier.",
        "Sequins are for lesser occasions. Kindly leave them out.",
      ],
      "style:Gothic": [
        "Something gothic, I think. One does favour a little gloom.",
        "Gothic. My family has always dressed for a good haunting.",
      ],
      "styleAvoid:Cute": [
        "Nothing cute, please. One is not a kitten.",
        "Not cute. One has dignity to maintain.",
      ],
      "colourAvoid:Black": [
        "No black, please. One is not in mourning today.",
        "Anything but black. I wore enough of it last winter.",
      ],
      "accessory:Bow": [
        "Bows, I think. A lady may indulge in a ribbon or two.",
        "One expects bows. Tastefully placed, of course.",
      ],
      "accessoryAvoid:Feather": [
        "No feathers, please. They make one's hat look nervous.",
        "One does not wear feathers. They do not stay put.",
      ],
      "accessoryMin:Bow": [
        "I shall require bows. At least {countWord}, I think.",
        "At least {countWord} {accessory}, if you please. One is fond of ribbon.",
      ],
      "accessoryExact:Brooch": [
        "Exactly {countWord} {accessory}. One has inherited rather a lot of them.",
        "{countWord} {accessory}, precisely. The family jewels shall not be crowded.",
      ],
    },
  },
  anxious: {
    generic: {
      style: [
        "If it's not too much trouble, maybe something {tag}?",
        "Could it be {tag}, perhaps? Only if that's all right.",
        "I was thinking {tag}. Sorry, is that silly?",
      ],
      styleAvoid: [
        "Sorry, could it not be {tag}? I'm sure it's lovely, really.",
        "If possible, maybe not {tag}? I'm so sorry to ask.",
      ],
      fabric: [
        "Might it be {fabric}? Sorry, only if it's easy.",
        "I was wondering about {fabric}. Is that all right?",
      ],
      fabricAvoid: [
        "Sorry, but could we skip the {fabric}? I'm so sorry.",
        "Please, no {fabric}. I'm sure it's lovely, I just can't.",
      ],
      fabricsOnly: [
        "Sorry, could it be only {list}? I'd be so grateful.",
        "If it's not too much, just {list}? Nothing else, I think.",
      ],
      fabricsMin: [
        "Sorry, could we have at least {countWord} fabrics? I'd be ever so grateful.",
        "Maybe at least {countWord} fabrics? Sorry, I do like a choice.",
      ],
      colour: [
        "Might it be {colour}? Sorry, I do hope that's all right.",
        "I was hoping for {colour}. If that's not too much trouble.",
      ],
      colourAvoid: [
        "Sorry, could we avoid {colour}? I'm so sorry to be difficult.",
        "Maybe not {colour}? I hope that's all right.",
      ],
      colourOnly: [
        "Sorry, could it be nothing but {list}? I'd be so grateful.",
        "If it's no trouble, {list} only? I'm so sorry to be fussy.",
      ],
      accessory: [
        "Might there be some {accessory}? Sorry, only if it's not too much.",
        "I was hoping for a little {accessory}. Is that all right?",
      ],
      accessoryAvoid: [
        "Sorry, but could we leave off the {accessory}? I'm so sorry.",
        "No {accessory}, please? I'm sorry to be a bother.",
      ],
      accessoryMin: [
        "Sorry, could there be at least {countWord} {accessory}? Only if it's not too much.",
        "Maybe {countWord} {accessory}, or more? I'm so sorry to ask.",
      ],
      accessoryExact: [
        "Sorry, could it be exactly {countWord} {accessory}? I'd be so grateful.",
        "Exactly {countWord} {accessory}, if that's all right. Sorry to be particular.",
      ],
      coloursMin: [
        "If it's not too much, at least {countWord} colours? Sorry, I do love variety.",
        "Maybe {countWord} colours, or more? I'm so sorry to ask.",
      ],
    },
    specific: {
      "fabric:Velvet": [
        "If it's not too much trouble, maybe some velvet?",
        "Might it be velvet? Sorry, it's just so soft and comforting.",
      ],
      "fabricAvoid:Sequin": [
        "Sorry, but no sequins? They make me feel like everyone's looking.",
        "Please, no sequins. I'm so sorry, they're a bit much for me.",
      ],
      "style:Gothic": [
        "Might it be a little gothic? Sorry, I do like a quiet sort of gloom.",
        "Something gothic, maybe? Sorry, is that too dark?",
      ],
      "styleAvoid:Cute": [
        "Sorry, could it not be cute? I'm afraid I'd blush.",
        "Maybe nothing cute? I'm so sorry, I'd feel a bit silly.",
      ],
      "colourAvoid:Black": [
        "Sorry, could we avoid black? I'm so sorry to be difficult.",
        "Maybe not black? It's a bit gloomy for me, I'm sorry.",
      ],
      "accessory:Bow": [
        "Might there be a bow? Sorry, I do find them comforting.",
        "A bow or two, maybe? If it's not too much trouble.",
      ],
      "accessoryAvoid:Feather": [
        "Sorry, but no feathers? They tickle my nose, I'm afraid.",
        "Please, no feathers. I'm so sorry, I sneeze at the slightest thing.",
      ],
      "accessoryMin:Bow": [
        "Sorry, could there be bows? At least {countWord}, if that's all right.",
        "At least {countWord} {accessory}, maybe? I'm sorry, I just can't resist them.",
      ],
      "accessoryExact:Brooch": [
        "Sorry, could it be exactly {countWord} {accessory}? I'd be so grateful.",
        "{countWord} {accessory}, if that's all right. I'm so sorry to be precise.",
      ],
    },
  },
  theatrical: {
    generic: {
      style: [
        "{tag}! It must be {tag}! I can see the curtain rising!",
        "I demand {tag}, darling! The stage is set!",
        "Make it {tag}! Let the whole world gasp!",
      ],
      styleAvoid: [
        "Not {tag}! I would simply perish on the spot!",
        "Banish {tag}, darling! It will not play tonight!",
      ],
      fabric: [
        "{fabric}! I must have {fabric}! Nothing else will do!",
        "Give me {fabric}, darling! Let it sweep the stage!",
      ],
      fabricAvoid: [
        "No {fabric}! The audience would riot!",
        "Banish the {fabric}, darling! It ruins the whole scene!",
      ],
      fabricsOnly: [
        "{list} only! Let those be my entire cast!",
        "Nothing but {list}, darling! This is my final word!",
      ],
      fabricsMin: [
        "At least {countWord} fabrics! A star needs a full wardrobe!",
        "Give me {countWord} fabrics at the very least, darling! Variety is everything!",
      ],
      colour: [
        "{colour}! Pure, glorious {colour}! Light the spotlights!",
        "Make it {colour}, darling! Let it blaze across the stage!",
      ],
      colourAvoid: [
        "No {colour}! It clashes with my destiny!",
        "Not a drop of {colour}, darling! The scene cannot bear it!",
      ],
      colourOnly: [
        "Nothing but {list}! Not a thread of anything else!",
        "{list} only, darling! Let those be my whole palette!",
      ],
      accessory: [
        "{accessory}! I must have {accessory}! It is the finishing flourish!",
        "Add {accessory}, darling! Let it catch the light!",
      ],
      accessoryAvoid: [
        "No {accessory}! I will not be upstaged!",
        "Away with the {accessory}, darling! It steals my moment!",
      ],
      accessoryMin: [
        "At least {countWord} {accessory}! More, if the drama demands it!",
        "Give me {countWord} {accessory} at the very least, darling! I want to dazzle!",
      ],
      accessoryExact: [
        "Exactly {countWord} {accessory}! Not one more, or the whole act collapses!",
        "{countWord} {accessory}, darling! Precisely, for the final bow!",
      ],
      coloursMin: [
        "At least {countWord} colours! Paint the whole stage, darling!",
        "Give me {countWord} colours at the very least! A grand finale needs a rainbow!",
      ],
    },
    specific: {
      "fabric:Velvet": [
        "Velvet, darling! I must have velvet!",
        "Velvet! The curtain, the cloak, the whole grand finale!",
      ],
      "fabricAvoid:Sequin": [
        "No sequins! I refuse to compete with the lighting!",
        "Sequins? Not tonight, darling! I am the spectacle!",
      ],
      "style:Gothic": [
        "Gothic, darling! A tragedy in three acts, with ruffles!",
        "Make it gothic! I want to haunt the entire theatre!",
      ],
      "styleAvoid:Cute": [
        "Not cute! I am a tragedy, not a teddy bear!",
        "Banish the cute, darling! I am a legend in the making!",
      ],
      "colourAvoid:Black": [
        "No black! I am not dressed for a funeral, darling!",
        "Not black! The villain wore it last season!",
      ],
      "accessory:Bow": [
        "Bows, darling! Big, bold and gloriously over the top!",
        "Add bows! Let every one take a bow of its own!",
      ],
      "accessoryAvoid:Feather": [
        "No feathers! Last time, one flew into the orchestra!",
        "Not a feather, darling! They upstage the whole show!",
      ],
      "accessoryMin:Bow": [
        "Bows! At least {countWord} of them, darling! A full ovation!",
        "At least {countWord} {accessory}! I want to curtsy in ribbon!",
      ],
      "accessoryExact:Brooch": [
        "Exactly {countWord} {accessory}! One for every act, darling!",
        "{countWord} {accessory}! Each one a jewel in my crown!",
      ],
    },
  },
};
