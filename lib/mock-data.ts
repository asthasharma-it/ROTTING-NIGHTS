import { MediaDetail, MediaType, Provider } from "@/types/media";

// Demo catalog used only when TMDB_API_KEY is not set, so the whole UI can be
// built and tried out before real TMDB/Google credentials exist. Once
// TMDB_API_KEY is present, lib/tmdb.ts calls the real API instead.

const PROVIDER_POOL: Record<string, Provider> = {
  netflix: { name: "Netflix", logoUrl: "https://placehold.co/64x64/e50914/ffffff.png?text=N", type: "stream" },
  prime: { name: "Prime Video", logoUrl: "https://placehold.co/64x64/00a8e1/00121a.png?text=P", type: "stream" },
  hotstar: { name: "JioHotstar", logoUrl: "https://placehold.co/64x64/0f1e3d/38bdf8.png?text=H", type: "stream" },
  zee5: { name: "ZEE5", logoUrl: "https://placehold.co/64x64/6a1b9a/ffffff.png?text=Z5", type: "stream" },
  sonyliv: { name: "SonyLIV", logoUrl: "https://placehold.co/64x64/00539f/ffffff.png?text=SL", type: "stream" },
  appletv: { name: "Apple TV+", logoUrl: "https://placehold.co/64x64/000000/ffffff.png?text=TV", type: "stream" },
};

function poster(title: string) {
  const text = encodeURIComponent(title);
  return `https://placehold.co/342x513/1a1d27/9b9ba8.png?text=${text}&font=roboto`;
}

const CAST_POOL = [
  { name: "Jordan Vale", character: "Lead" },
  { name: "Priya Nathan", character: "Supporting" },
  { name: "Elliot Cho", character: "Supporting" },
  { name: "Maren Okafor", character: "Lead" },
  { name: "Theo Bastien", character: "Supporting" },
];

interface Seed {
  id: number;
  title: string;
  mediaType: MediaType;
  year: string;
  genreSlugs: string[];
  overview: string;
  runtimeMinutes: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  providers: (keyof typeof PROVIDER_POOL)[];
}

const SEEDS: Seed[] = [
  { id: 900001, title: "The Last Static Hour", mediaType: "movie", year: "2023", genreSlugs: ["thriller"], overview: "A radio host discovers a conspiracy hiding inside the static between broadcasts.", runtimeMinutes: 118, numberOfSeasons: null, numberOfEpisodes: null, providers: ["netflix", "prime"] },
  { id: 900002, title: "Hollow Corridor", mediaType: "movie", year: "2022", genreSlugs: ["horror"], overview: "A family moves into a house where the hallways rearrange themselves at night.", runtimeMinutes: 101, numberOfSeasons: null, numberOfEpisodes: null, providers: ["hotstar"] },
  { id: 900003, title: "Office Shenanigans", mediaType: "tv", year: "2019", genreSlugs: ["comedy"], overview: "A chaotic small marketing agency tries not to lose its biggest client.", runtimeMinutes: null, numberOfSeasons: 3, numberOfEpisodes: 28, providers: ["prime", "sonyliv"] },
  { id: 900004, title: "Two Left Shoes", mediaType: "movie", year: "2021", genreSlugs: ["rom-com"], overview: "Two rival wedding planners are forced to work the same event.", runtimeMinutes: 104, numberOfSeasons: null, numberOfEpisodes: null, providers: ["netflix"] },
  { id: 900005, title: "Quiet Harbor", mediaType: "tv", year: "2020", genreSlugs: ["drama"], overview: "A fishing town grapples with a secret that surfaces after a storm.", runtimeMinutes: null, numberOfSeasons: 2, numberOfEpisodes: 16, providers: ["hotstar", "zee5"] },
  { id: 900006, title: "Neon Skyline", mediaType: "movie", year: "2024", genreSlugs: ["sci-fi"], overview: "A courier in a floating city smuggles memories instead of packages.", runtimeMinutes: 129, numberOfSeasons: null, numberOfEpisodes: null, providers: ["appletv"] },
  { id: 900007, title: "Paper Lanterns", mediaType: "movie", year: "2020", genreSlugs: ["animation"], overview: "A lantern-maker's daughter sets out to relight her village's festival.", runtimeMinutes: 96, numberOfSeasons: null, numberOfEpisodes: null, providers: ["netflix", "hotstar"] },
  { id: 900008, title: "The Deep Archive", mediaType: "tv", year: "2022", genreSlugs: ["documentary"], overview: "Explorers catalog the deepest untouched trenches of the Pacific.", runtimeMinutes: null, numberOfSeasons: 1, numberOfEpisodes: 6, providers: ["appletv"] },
  { id: 900009, title: "Glass Kingdom", mediaType: "movie", year: "2023", genreSlugs: ["fantasy"], overview: "An exiled glassblower discovers her craft can trap and release memories.", runtimeMinutes: 122, numberOfSeasons: null, numberOfEpisodes: null, providers: ["zee5"] },
  { id: 900010, title: "Midnight Rewind", mediaType: "tv", year: "2021", genreSlugs: ["thriller"], overview: "Every episode a detective relives the same night, one hour earlier.", runtimeMinutes: null, numberOfSeasons: 2, numberOfEpisodes: 14, providers: ["sonyliv", "prime"] },
  { id: 900011, title: "Static in the Walls", mediaType: "movie", year: "2021", genreSlugs: ["horror"], overview: "An electrician renovating an old theater keeps hearing an audience that isn't there.", runtimeMinutes: 97, numberOfSeasons: null, numberOfEpisodes: null, providers: ["netflix"] },
  { id: 900012, title: "Laugh Track", mediaType: "tv", year: "2018", genreSlugs: ["comedy"], overview: "A washed-up sitcom star tries to reboot her career by babysitting her niece.", runtimeMinutes: null, numberOfSeasons: 4, numberOfEpisodes: 40, providers: ["hotstar"] },
  { id: 900013, title: "Coffee & Constellations", mediaType: "movie", year: "2022", genreSlugs: ["rom-com"], overview: "An astronomer and a barista keep almost-meeting under the same night sky.", runtimeMinutes: 99, numberOfSeasons: null, numberOfEpisodes: null, providers: ["zee5", "netflix"] },
  { id: 900014, title: "Broken Ledger", mediaType: "movie", year: "2019", genreSlugs: ["drama"], overview: "A small-town accountant uncovers a debt that isn't hers to pay.", runtimeMinutes: 111, numberOfSeasons: null, numberOfEpisodes: null, providers: ["sonyliv"] },
  { id: 900015, title: "Skybound", mediaType: "movie", year: "2023", genreSlugs: ["action"], overview: "A grounded pilot has one flight left to stop a hijacked cargo plane.", runtimeMinutes: 114, numberOfSeasons: null, numberOfEpisodes: null, providers: ["prime"] },
  { id: 900016, title: "Ashfall", mediaType: "tv", year: "2024", genreSlugs: ["sci-fi"], overview: "Survivors of a volcanic winter build a fragile settlement in a buried city.", runtimeMinutes: null, numberOfSeasons: 1, numberOfEpisodes: 8, providers: ["appletv", "netflix"] },
  { id: 900017, title: "Crayon Hearts", mediaType: "movie", year: "2018", genreSlugs: ["animation"], overview: "A child's crayon drawings come alive to help her parents fall back in love.", runtimeMinutes: 88, numberOfSeasons: null, numberOfEpisodes: null, providers: ["hotstar"] },
  { id: 900018, title: "Deep Sea Diaries", mediaType: "tv", year: "2021", genreSlugs: ["documentary"], overview: "A rotating crew of marine biologists log a year aboard a research vessel.", runtimeMinutes: null, numberOfSeasons: 2, numberOfEpisodes: 12, providers: ["zee5"] },
  { id: 900019, title: "Thorncastle", mediaType: "tv", year: "2020", genreSlugs: ["fantasy"], overview: "A disgraced knight is the only one who remembers the kingdom's true history.", runtimeMinutes: null, numberOfSeasons: 3, numberOfEpisodes: 24, providers: ["prime", "hotstar"] },
  { id: 900020, title: "Wrong Number", mediaType: "movie", year: "2023", genreSlugs: ["rom-com"], overview: "A misdialed call turns into a year of anonymous letters between strangers.", runtimeMinutes: 102, numberOfSeasons: null, numberOfEpisodes: null, providers: ["netflix"] },
  { id: 900021, title: "The Quiet Patient", mediaType: "movie", year: "2020", genreSlugs: ["thriller"], overview: "A therapist becomes convinced her silent patient is hiding a confession.", runtimeMinutes: 108, numberOfSeasons: null, numberOfEpisodes: null, providers: ["sonyliv"] },
  { id: 900022, title: "Attic Noises", mediaType: "movie", year: "2023", genreSlugs: ["horror"], overview: "New homeowners find a decades-old tenant still keeping to the attic.", runtimeMinutes: 94, numberOfSeasons: null, numberOfEpisodes: null, providers: ["zee5", "netflix"] },
  { id: 900023, title: "Punchline", mediaType: "movie", year: "2021", genreSlugs: ["comedy"], overview: "A failing comedian steals jokes from a support group and gets caught.", runtimeMinutes: 93, numberOfSeasons: null, numberOfEpisodes: null, providers: ["prime"] },
  { id: 900024, title: "Foster City", mediaType: "tv", year: "2019", genreSlugs: ["drama"], overview: "A foster home coordinator fights to keep a group of siblings together.", runtimeMinutes: null, numberOfSeasons: 3, numberOfEpisodes: 30, providers: ["hotstar", "sonyliv"] },
];

export function getMockCatalog(): MediaDetail[] {
  return SEEDS.map((seed, i) => ({
    id: seed.id,
    mediaType: seed.mediaType,
    title: seed.title,
    posterUrl: poster(seed.title),
    year: seed.year,
    genreSlugs: seed.genreSlugs,
    overview: seed.overview,
    runtimeMinutes: seed.runtimeMinutes,
    numberOfSeasons: seed.numberOfSeasons,
    numberOfEpisodes: seed.numberOfEpisodes,
    cast: [CAST_POOL[i % CAST_POOL.length], CAST_POOL[(i + 1) % CAST_POOL.length], CAST_POOL[(i + 2) % CAST_POOL.length]],
    genres: seed.genreSlugs,
    providers: seed.providers.map((p) => PROVIDER_POOL[p]),
    backdropUrl: null,
    trailerKey: null,
  }));
}

export function getMockById(mediaType: MediaType, id: number): MediaDetail | null {
  return getMockCatalog().find((m) => m.mediaType === mediaType && m.id === id) ?? null;
}
