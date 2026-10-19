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
      "{name} has been baking all week and is off to {occasion}. She wants something {adjective}.",
      "{name} will take {occasion} in something {adjective}, if she can manage it without {worry}.",
      "Fresh from the orchard, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has a hat picked out and is off to {occasion}. She wants to look {adjective}.",
      "{name} is strolling into {occasion} and hopes to look {adjective} without {worry}.",
      "Parasol in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} is paying her respects at {occasion}. She wants something {adjective}.",
      "{name} will sweep into {occasion} looking {adjective}, and would rather avoid {worry}.",
      "The invitation said black, so {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has been counting the days to {occasion}. She wants something {adjective}.",
      "{name} will glide into {occasion} looking {adjective}, as long as she avoids {worry}.",
      "Gloves on, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has her best handshake ready for {occasion}. She wants something {adjective}.",
      "{name} will walk into {occasion} looking {adjective}, and hopes to dodge {worry}.",
      "Folder under her arm, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has been planning for weeks and is off to {occasion}. She wants something {adjective}.",
      "{name} will burst into {occasion} looking {adjective}, with no risk of {worry}.",
      "Mask at the ready, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has packed a bucket and spade for {occasion}. She wants something {adjective}.",
      "{name} will stroll along {occasion} looking {adjective}, and would rather avoid {worry}.",
      "Ice cream in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
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
      "{name} has changed her mind three times about {occasion}. She wants something {adjective}.",
      "{name} will arrive at {occasion} looking {adjective}, and fears only {worry}.",
      "Heart fluttering, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "christening",
    favouredTags: ["Cute", "Formal", "Daywear"],
    favouredColours: ["White", "Pink", "Blue"],
    favouredFabrics: ["Lace", "Cotton"],
    favouredAccessories: ["Bow", "Lace Trim"],
    occasions: [
      "a christening",
      "the christening tea afterwards",
      "a naming day in the village church",
    ],
    adjectives: ["sweet and dignified", "soft and proper", "tidy but tender"],
    worries: ["being upstaged by the baby", "getting milk on it", "looking like a doily"],
    templates: [
      "{name} has been invited to {occasion}. She wants something {adjective}.",
      "{name} will cuddle the guest of honour at {occasion} and hopes to look {adjective}, without {worry}.",
      "With a gift tucked in her bag, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "book-launch",
    favouredTags: ["Professional", "Eclectic", "Cool"],
    favouredColours: ["Green", "Purple", "Brown"],
    favouredFabrics: ["Linen", "Wool"],
    favouredAccessories: ["Brooch", "Button"],
    occasions: [
      "a book launch",
      "a reading at the corner bookshop",
      "the literary society's spring supper",
    ],
    adjectives: ["clever and a little quirky", "inky and interesting", "calm and well read"],
    worries: [
      "looking like a footnote",
      "spilling wine on the author",
      "blending in with the shelves",
    ],
    templates: [
      "{name} has been asked to {occasion}, and she wants something {adjective}.",
      "{name} will mingle at {occasion} looking {adjective}, and would rather avoid {worry}.",
      "With a pen in her pocket, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "village-fete",
    favouredTags: ["Casual", "Patterned", "Flowers"],
    favouredColours: ["Yellow", "Green", "Pink"],
    favouredFabrics: ["Cotton"],
    favouredAccessories: ["Flower", "Trim"],
    occasions: [
      "the village fete",
      "a day of jam stalls and tombola",
      "the church hall bring-and-buy",
    ],
    adjectives: ["cheerful and practical", "bright and comfortable", "pretty but practical"],
    worries: [
      "losing a sleeve to the coconut shy",
      "getting jam on it",
      "being roped into judging the marrows",
    ],
    templates: [
      "{name} has a few pennies for {occasion}. She wants something {adjective}.",
      "{name} will wander through {occasion} looking {adjective}, with luck and no {worry}.",
      "Basket on her arm, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "jazz-night",
    favouredTags: ["Cool", "Eveningwear", "Risqué"],
    favouredColours: ["Blue", "Black", "Purple"],
    favouredFabrics: ["Silk", "Velvet"],
    favouredAccessories: ["Feather", "Jewel"],
    occasions: [
      "a night at the jazz club",
      "a smoky late set downstairs",
      "a saxophone solo by the river",
    ],
    adjectives: ["smooth and a little sultry", "cool as a muted trumpet", "swaying and stylish"],
    worries: [
      "being too stiff to sway",
      "getting in the drummer's way",
      "looking like the cloakroom",
    ],
    templates: [
      "{name} has her dancing shoes ready for {occasion}. She wants something {adjective}.",
      "{name} will slip into {occasion} looking {adjective}, without {worry}.",
      "Humming a tune, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "hen-do",
    favouredTags: ["Playful", "Shimmering", "Cute"],
    favouredColours: ["Pink", "Purple", "Yellow"],
    favouredFabrics: ["Sequin"],
    favouredAccessories: ["Bow", "Bell"],
    occasions: ["a hen do", "a very pink weekend away", "a night of cocktails and karaoke"],
    adjectives: ["sparkly and silly", "fun and fizzy", "bubbly and bright"],
    worries: ["looking like a cocktail umbrella", "leaving a trail of glitter", "losing the sash"],
    templates: [
      "{name} has a sash and a plan for {occasion}. She wants something {adjective}.",
      "{name} will take over {occasion} looking {adjective}, and swears there will be no {worry}.",
      "Tiara slightly crooked, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "graduation",
    favouredTags: ["Formal", "Professional", "Daywear"],
    favouredColours: ["Blue", "Black", "Red"],
    favouredFabrics: ["Wool", "Silk"],
    favouredAccessories: ["Piping", "Brooch"],
    occasions: [
      "a graduation ceremony",
      "the degree day photographs",
      "the dean's garden reception",
    ],
    adjectives: ["proud and polished", "smart and ready for photos", "dignified but delighted"],
    worries: ["disappearing under the gown", "tripping on the stage steps", "squinting in the sun"],
    templates: [
      "{name} has finally made it to {occasion}. She wants something {adjective}.",
      "{name} will cross the lawn at {occasion} looking {adjective}, and hopes to avoid {worry}.",
      "Scroll in mind, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "museum-opening",
    favouredTags: ["Elegant", "Eclectic", "Simple"],
    favouredColours: ["Grey", "White", "Black"],
    favouredFabrics: ["Silk", "Linen"],
    favouredAccessories: ["Brooch", "Piping"],
    occasions: [
      "the museum opening",
      "a private view of the new gallery",
      "a lecture on lost lace",
    ],
    adjectives: ["refined and thoughtful", "graceful with a twist", "quietly striking"],
    worries: [
      "being mistaken for an exhibit",
      "looking too much like the wallpaper",
      "setting off the alarms",
    ],
    templates: [
      "{name} has been invited to {occasion}. She wants something {adjective}.",
      "{name} will wander through {occasion} looking {adjective}, without {worry}.",
      "Catalogue in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "tea-dance",
    favouredTags: ["Romantic", "Elegant", "Daywear"],
    favouredColours: ["Pink", "Blue", "White"],
    favouredFabrics: ["Silk", "Lace"],
    favouredAccessories: ["Bow", "Brooch"],
    occasions: [
      "a tea dance",
      "the Sunday waltz at the assembly rooms",
      "a dance on the seafront bandstand",
    ],
    adjectives: ["swirly and graceful", "light on its feet", "pretty with a lovely twirl"],
    worries: [
      "stepping on the hem",
      "running out of puff before the foxtrot",
      "spilling tea on a partner",
    ],
    templates: [
      "{name} has pinned up her hair for {occasion}. She wants something {adjective}.",
      "{name} will whirl through {occasion} looking {adjective}, and hopes to avoid {worry}.",
      "Toes tapping, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "rainy-picnic",
    favouredTags: ["Warm", "Casual", "Simple"],
    favouredColours: ["Green", "Brown", "Blue"],
    favouredFabrics: ["Wool", "Cotton"],
    favouredAccessories: ["Button"],
    occasions: [
      "a picnic in the drizzle",
      "a damp afternoon by the lake",
      "a brave picnic under one big umbrella",
    ],
    adjectives: ["snug and cheerful", "cosy and unbothered", "warm and stubborn"],
    worries: ["getting soggy sandwiches", "squelching in the grass", "looking like a wet sheep"],
    templates: [
      "{name} is braving {occasion}. She'd like something {adjective}, without {worry}.",
      "The forecast says rain, and {name} is off to {occasion} anyway. She wants something {adjective}.",
      "Flask in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "riding-lesson",
    favouredTags: ["Workwear", "Simple", "Cool"],
    favouredColours: ["Brown", "Black", "Green"],
    favouredFabrics: ["Linen", "Wool"],
    favouredAccessories: ["Button", "Piping"],
    occasions: ["a riding lesson", "a morning at the stables", "a gentle hack across the fields"],
    adjectives: ["neat and sensible", "hard-working and tidy", "easy to move in"],
    worries: ["being sat on by a pony", "catching on the saddle", "getting hay in the seams"],
    templates: [
      "{name} has her boots by the door for {occasion}. She wants something {adjective}.",
      "{name} will take on {occasion} looking {adjective}, and would rather avoid {worry}.",
      "Carrot in pocket, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "midnight-feast",
    favouredTags: ["Playful", "Warm", "Casual"],
    favouredColours: ["Purple", "Blue", "Yellow"],
    favouredFabrics: ["Wool", "Cotton"],
    favouredAccessories: ["Bell", "Tassel"],
    occasions: ["a midnight feast", "a sleepover in the attic", "a cocoa party after lights out"],
    adjectives: ["snug and sneaky", "giggly and comfortable", "cosy and a bit silly"],
    worries: ["rustling too loudly", "waking the whole house", "getting cocoa on it"],
    templates: [
      "{name} has hidden the biscuits for {occasion}. She wants something {adjective}.",
      "{name} will tiptoe to {occasion} looking {adjective}, and swears there will be no {worry}.",
      "Torch in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "lighthouse-wedding",
    favouredTags: ["Romantic", "Formal", "Cool"],
    favouredColours: ["White", "Blue", "Grey"],
    favouredFabrics: ["Silk", "Lace"],
    favouredAccessories: ["Flower", "Lace Trim"],
    occasions: [
      "a wedding at the lighthouse",
      "a wedding on the cliff top",
      "a ceremony above the harbour",
    ],
    adjectives: ["windswept and lovely", "airy and elegant", "salty and sweet"],
    worries: ["being blown into the sea", "tripping on the spiral stairs", "upstaging the bride"],
    templates: [
      "{name} has been asked to {occasion}. She wants something {adjective}.",
      "{name} will climb up to {occasion} looking {adjective}, and hopes to avoid {worry}.",
      "Hat pinned down tight, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "castle-wedding",
    favouredTags: ["Uncomfortable", "Formal", "Warm"],
    favouredColours: ["Red", "White", "Brown"],
    favouredFabrics: ["Velvet", "Wool"],
    favouredAccessories: ["Piping", "Brooch"],
    occasions: [
      "a wedding in a castle with no heating",
      "a formal portrait that takes all day",
      "a very long service in a cold church",
    ],
    adjectives: ["grand but a bit stiff", "dignified and determined", "heavy and splendid"],
    worries: [
      "freezing in the great hall",
      "not being able to sit down",
      "fainting before the vows",
    ],
    templates: [
      "{name} has been asked to {occasion}. She wants to look {adjective}, and would rather not end up {worry}.",
      "{name} has accepted her fate at {occasion}. She wants something {adjective}, and no {worry}.",
      "Teeth chattering already, {name} is bound for {occasion}. Something {adjective}, please, without {worry}.",
    ],
  },
  {
    id: "halloween-ball",
    favouredTags: ["Gothic", "Elaborate", "Playful"],
    favouredColours: ["Orange", "Black", "Purple"],
    favouredFabrics: ["Velvet", "Lace"],
    favouredAccessories: ["Tassel", "Appliqué"],
    occasions: ["the Halloween ball", "a ghost tour of the old town", "a haunted house party"],
    adjectives: ["spooky and splendid", "delightfully creepy", "dramatic and daft"],
    worries: [
      "frightening the guests too well",
      "catching on a cobweb",
      "being mistaken for a bat",
    ],
    templates: [
      "{name} is haunting {occasion} this year. Something {adjective}, please, and no {worry}.",
      "{name} has been practising her cackle for {occasion}. She wants something {adjective}.",
      "By candlelight, {name} will arrive at {occasion} looking {adjective}, and fears only {worry}.",
    ],
  },
  {
    id: "polar-send-off",
    favouredTags: ["Warm", "Workwear", "Patterned"],
    favouredColours: ["White", "Blue", "Red"],
    favouredFabrics: ["Wool"],
    favouredAccessories: ["Button", "Trim"],
    occasions: [
      "a polar expedition send-off",
      "a farewell supper before the long voyage",
      "a toast at the icy quayside",
    ],
    adjectives: ["snug and heroic", "sturdy and merry", "wrapped up and wonderful"],
    worries: ["looking like a snowman", "overheating at the supper", "getting lost in the scarf"],
    templates: [
      "{name} has waved off many a brave soul at {occasion}. She wants something {adjective}.",
      "{name} will stamp her boots at {occasion} looking {adjective}, and would rather avoid {worry}.",
      "Breath steaming, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "spa-weekend",
    favouredTags: ["Simple", "Cool", "Casual"],
    favouredColours: ["White", "Green", "Blue"],
    favouredFabrics: ["Linen", "Cotton"],
    favouredAccessories: ["Piping"],
    occasions: [
      "a spa weekend",
      "a morning by the thermal pool",
      "an afternoon of cucumber slices and quiet",
    ],
    adjectives: ["calm and soft", "relaxed and airy", "soothing and simple"],
    worries: ["falling asleep in it", "looking like a bathrobe", "getting mud mask on it"],
    templates: [
      "{name} has booked in for {occasion}. She wants something {adjective}.",
      "{name} will drift through {occasion} looking {adjective}, without {worry}.",
      "Slippers on, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
  {
    id: "in-laws-dinner",
    favouredTags: ["Elegant", "Cute", "Daywear"],
    favouredColours: ["Blue", "Pink", "Grey"],
    favouredFabrics: ["Silk", "Cotton"],
    favouredAccessories: ["Brooch", "Bow"],
    occasions: [
      "a fancy dinner with the in-laws",
      "a Sunday lunch at the big house",
      "the family anniversary supper",
    ],
    adjectives: ["polite and pretty", "charming and well behaved", "tidy with a hint of sparkle"],
    worries: [
      "saying the wrong thing in it",
      "spilling gravy on the good tablecloth",
      "being compared to the cousins",
    ],
    templates: [
      "{name} is nervously off to {occasion}. She wants something {adjective}.",
      "{name} will face {occasion} looking {adjective}, and prays for no {worry}.",
      "Flowers in hand, {name} is bound for {occasion}. Something {adjective}, please, and no {worry}.",
    ],
  },
];
