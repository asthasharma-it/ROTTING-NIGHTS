export interface QuizOption {
  label: string;
  genreSlugs: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "friday-night",
    question: "Bed's made, snacks are out. What are you reaching for?",
    options: [
      { label: "Something that makes me laugh", genreSlugs: ["comedy"] },
      { label: "Something that keeps me up all night", genreSlugs: ["thriller", "horror"] },
      { label: "Something that makes me feel things", genreSlugs: ["drama", "rom-com"] },
      { label: "Something big, loud, and fast", genreSlugs: ["action", "sci-fi"] },
    ],
  },
  {
    id: "rewatch",
    question: "Which of these sounds most like your comfort rewatch?",
    options: [
      { label: "A cozy rom-com", genreSlugs: ["rom-com"] },
      { label: "A gripping thriller", genreSlugs: ["thriller"] },
      { label: "An animated favorite", genreSlugs: ["animation"] },
      { label: "A slow-burn drama", genreSlugs: ["drama"] },
    ],
  },
  {
    id: "new-world",
    question: "Pick the world you'd rather escape into:",
    options: [
      { label: "A haunted house", genreSlugs: ["horror"] },
      { label: "A magical kingdom", genreSlugs: ["fantasy"] },
      { label: "A distant galaxy", genreSlugs: ["sci-fi"] },
      { label: "A true story", genreSlugs: ["documentary"] },
    ],
  },
  {
    id: "ending",
    question: "How do you like your endings?",
    options: [
      { label: "Happy, tied with a bow", genreSlugs: ["rom-com", "comedy"] },
      { label: "Twisty, I want a gasp", genreSlugs: ["thriller"] },
      { label: "Bittersweet and real", genreSlugs: ["drama"] },
      { label: "Adrenaline until the credits", genreSlugs: ["action"] },
    ],
  },
];
