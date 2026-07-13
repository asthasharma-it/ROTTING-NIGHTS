export type MediaType = "movie" | "tv";

export type WatchStatusType =
  | "NOPE"
  | "MAYBE"
  | "DEFINITELY"
  | "ONGOING"
  | "WATCHED";

export interface MediaSummary {
  id: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
  year: string | null;
  genreSlugs: string[];
}

export interface CastMember {
  name: string;
  character: string;
}

export interface Provider {
  name: string;
  logoUrl: string;
  type: "stream" | "rent" | "buy";
}

export interface MediaDetail extends MediaSummary {
  overview: string;
  runtimeMinutes: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  cast: CastMember[];
  genres: string[];
  providers: Provider[];
  backdropUrl: string | null;
  trailerKey: string | null;
}
