import { type SupportedLocale } from "@/i18n/translations";

export type DiveLogPreview = {
  id: string;
  logNumber: number;
  title: string;
  location: string;
  depth: number;
  duration: number;
  date: string;
  buddy: string;
  difficulty: "Beginner" | "Fortgeschritten" | "Pro";
  siteId?: string;
  diverId?: string;
};

export type EquipmentItem = {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: "bereit" | "wartung" | "defekt";
  lastService: string;
};

export type DiveSite = {
  id: string;
  name: string;
  country: string;
  difficulty: "Beginner" | "Fortgeschritten" | "Pro";
  highlight: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  ownerId?: string;
};

export type MediaItem = {
  id: string;
  title: string;
  author: string;
  ownerId?: string;
  url: string;
  type: "image" | "video";
  source: "url" | "upload";
  fileName?: string;
};

export type CommunityPostAttachment = {
  id: string;
  url: string;
  title: string;
  source: "url" | "upload";
  fileName?: string;
  type: "image";
};

export type CommunityPost = {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  authorEmail?: string;
  body: string;
  likes: number;
  diveLogId?: string;
  attachments: CommunityPostAttachment[];
  comments: CommunityComment[];
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

export type CommunityComment = {
  id: string;
  author: string;
  authorId?: string;
  authorEmail?: string;
  message: string;
  createdAt: string;
};

export type MemberRole = "member" | "admin";

export type MemberProfile = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: MemberRole;
  joinedAt: string;
  city: string;
  about: string;
  certifications: string[];
  favoriteDiveSite: string;
  completedDives: number;
  preferredLocale: SupportedLocale;
};

export type ForumCategory = {
  id: string;
  title: string;
  description: string;
};

export type ForumReply = {
  id: string;
  author: string;
  authorId?: string;
  message: string;
  createdAt: string;
  likes: number;
};

export type ForumThread = {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  categoryId: string;
  body: string;
  excerpt: string;
  createdAt: string;
  lastActivity: string;
  likes: number;
  replies: ForumReply[];
};

export const diveLogs: DiveLogPreview[] = [
  {
    id: "dive-101",
    logNumber: 42,
    title: "Wrack der MS Aurora",
    location: "Teneriffa",
    depth: 32,
    duration: 48,
    date: "2025-09-14",
    buddy: "Samira F.",
    difficulty: "Fortgeschritten",
    siteId: "site-04",
    diverId: "member-01"
  },
  {
    id: "dive-102",
    logNumber: 18,
    title: "Korallengarten",
    location: "Rotes Meer",
    depth: 18,
    duration: 62,
    date: "2025-08-06",
    buddy: "Lukas W.",
    difficulty: "Beginner",
    siteId: "site-05",
    diverId: "member-02"
  },
  {
    id: "dive-103",
    logNumber: 57,
    title: "Nachttauchgang Blue Hole",
    location: "Dahab",
    depth: 24,
    duration: 54,
    date: "2025-07-22",
    buddy: "Mara K.",
    difficulty: "Pro",
    siteId: "site-06",
    diverId: "member-03"
  }
];

export const equipment: EquipmentItem[] = [
  {
    id: "gear-01",
    manufacturer: "Apeks",
    model: "MTX-R",
    serialNumber: "APX-4472-01",
    status: "bereit",
    lastService: "2025-09-01"
  },
  {
    id: "gear-02",
    manufacturer: "Suunto",
    model: "D5",
    serialNumber: "SUN-8834-12",
    status: "wartung",
    lastService: "2025-06-11"
  },
  {
    id: "gear-03",
    manufacturer: "Santi",
    model: "Elite Dry",
    serialNumber: "SAN-2219-07",
    status: "bereit",
    lastService: "2025-08-25"
  }
];

export const diveSites: DiveSite[] = [
  {
    id: "site-01",
    name: "Shark Point",
    country: "Thailand",
    difficulty: "Fortgeschritten",
    highlight: "Regelmäßige Begegnungen mit Leopardenhaien",
    coordinates: {
      latitude: 7.7783,
      longitude: 98.3834
    },
    ownerId: "member-01"
  },
  {
    id: "site-02",
    name: "Silfra-Spalte",
    country: "Island",
    difficulty: "Beginner",
    highlight: "Sichtweiten über 100 Meter im Gletscherwasser",
    coordinates: {
      latitude: 64.255,
      longitude: -21.123
    },
    ownerId: "member-02"
  },
  {
    id: "site-03",
    name: "SS Thistlegorm",
    country: "Ägypten",
    difficulty: "Pro",
    highlight: "Legendäres Wrack mit historischen Artefakten",
    coordinates: {
      latitude: 27.8117,
      longitude: 33.9224
    },
    ownerId: "member-03"
  },
  {
    id: "site-04",
    name: "MS Aurora Wrack",
    country: "Spanien",
    difficulty: "Fortgeschritten",
    highlight: "Dramatisches Wrack vor Teneriffa mit üppigen Fischschwärmen",
    coordinates: {
      latitude: 28.4636,
      longitude: -16.2518
    },
    ownerId: "member-01"
  },
  {
    id: "site-05",
    name: "Korallengarten",
    country: "Ägypten",
    difficulty: "Beginner",
    highlight: "Weite Hartkorallenriffe mit zahmen Schildkröten",
    coordinates: {
      latitude: 27.2579,
      longitude: 33.8116
    },
    ownerId: "member-02"
  },
  {
    id: "site-06",
    name: "Blue Hole Dahab",
    country: "Ägypten",
    difficulty: "Pro",
    highlight: "Legendärer Nachttauchgang mit eindrucksvollem Lichtspiel",
    coordinates: {
      latitude: 28.571,
      longitude: 34.5361
    },
    ownerId: "member-03"
  }
];

export const media: MediaItem[] = [
  {
    id: "media-01",
    title: "Walhai in freier Wildbahn",
    author: "Lena Hartmann",
    ownerId: "member-01",
    url: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
    type: "image",
    source: "url"
  },
  {
    id: "media-02",
    title: "Team Dive @ Silfra",
    author: "Armin Keller",
    ownerId: "member-02",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    type: "image",
    source: "url"
  },
  {
    id: "media-03",
    title: "Korallengarten Panorama",
    author: "Noah Weiss",
    ownerId: "member-03",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    type: "image",
    source: "url"
  },
  {
    id: "media-04",
    title: "Schwarm im Morgenlicht (Video)",
    author: "Armin Keller",
    ownerId: "member-02",
    url: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    type: "video",
    source: "url"
  }
];

export const communityPosts: CommunityPost[] = [
  {
    id: "post-01",
    title: "Meine 5 Tipps für Nachttauchgänge",
    author: "Julian",
    body: "Von der richtigen Lampenwahl bis zum Umgang mit Strömungen: So bleibst du gelassen und sicher, wenn die Sonne untergegangen ist.",
    likes: 42,
    diveLogId: "dive-103",
    attachments: [
      {
        id: "post-01-attachment-01",
        title: "Nachttauchgang Crew",
        url: "https://images.unsplash.com/photo-1498920317147-e9228e19f996",
        source: "url",
        type: "image"
      }
    ],
    comments: [
      {
        id: "comment-101",
        author: "Samira",
        message: "Danke für die Tipps! Die Idee mit der Backup-Lampe hat mir echt geholfen.",
        createdAt: "2025-10-25T18:45:00Z"
      }
    ]
  },
  {
    id: "post-02",
    title: "Equipment Pflege nach Salzwasser",
    author: "Samira",
    body: "Mit dieser Checkliste hält dein Equipment länger: Spülen, Trocknen, Kontrollieren und richtig lagern.",
    likes: 28,
    diveLogId: "dive-101",
    attachments: [
      {
        id: "post-02-attachment-01",
        title: "Frisch gespültes Equipment",
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
        source: "url",
        type: "image"
      },
      {
        id: "post-02-attachment-02",
        title: "Ausrüstung an Deck",
        url: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb",
        source: "url",
        type: "image"
      }
    ],
    comments: [
      {
        id: "comment-201",
        author: "Lukas",
        message: "Ich ergänze immer noch einen Dichtungstest beim Atemregler.",
        createdAt: "2025-10-24T09:30:00Z"
      }
    ]
  }
];

export const forumCategories: ForumCategory[] = [
  {
    id: "general",
    title: "Allgemeiner Austausch",
    description: "Neuigkeiten aus dem Team, Reisepläne und Organisation."
  },
  {
    id: "training",
    title: "Training & Technik",
    description: "Skill-Drills, Kursvorbereitung und technische Fragen."
  },
  {
    id: "gear",
    title: "Ausrüstung & Pflege",
    description: "Setups vergleichen, Wartungstipps und Kaufberatung."
  }
];

export const forumThreads: ForumThread[] = [
  {
    id: "thread-01",
    title: "Buddy für Malediven-Liveaboard 2026 gesucht",
    author: "Mara",
    categoryId: "general",
    body:
      "Hallo Crew, wir planen im März eine zweiwöchige Liveaboard-Tour auf den Malediven mit Fokus auf Strömungstauchgänge und Großfisch. Wir suchen noch zwei Buddies mit Erfahrung in strömungsreichen Spots. Welche Logistik-Tipps habt ihr?",
    excerpt:
      "Wir planen eine Tour im März und suchen noch zwei erfahrene Buddies für tiefe Strömungstauchgänge.",
    createdAt: "2025-10-20T09:30:00Z",
    lastActivity: "2025-10-27T15:20:00Z",
    likes: 9,
    replies: [
      {
        id: "reply-0101",
        author: "Julian",
        message:
          "Ich habe letztes Jahr eine ähnliche Tour gemacht. Achtet darauf, dass alle ein eigenes Current Hook dabeihaben und plant Buffer-Tage für Inlandsflüge ein.",
        createdAt: "2025-10-22T13:10:00Z",
        likes: 4
      },
      {
        id: "reply-0102",
        author: "Samira",
        message:
          "Bei der Bootscrew unbedingt vorher nach 32% Nitrox fragen, das war bei uns nicht standardmäßig vorhanden.",
        createdAt: "2025-10-25T18:45:00Z",
        likes: 3
      }
    ]
  },
  {
    id: "thread-02",
    title: "Feinjustierung Stage-Rigging",
    author: "Julian",
    categoryId: "training",
    body:
      "Ich teste gerade unterschiedliche Bungee-Setups für Stage-Bottles und suche nach einer Lösung, die auch mit Trockentauchhandschuhen leicht zu bedienen ist. Habt ihr Empfehlungen für Boltsnaps oder zusätzliche Griffe?",
    excerpt:
      "Welche Clips nutzt ihr für Stage-Bottles? Ich suche nach einer Lösung, die bei Trockentauchanzug-Handschuhen gut funktioniert.",
    createdAt: "2025-10-18T16:05:00Z",
    lastActivity: "2025-10-26T19:05:00Z",
    likes: 6,
    replies: [
      {
        id: "reply-0201",
        author: "Chris",
        message:
          "Ich habe gute Erfahrungen mit den größeren 120mm Boltsnaps von Tecline gemacht, die lassen sich auch mit Händen in Trockenhandschuhen gut greifen.",
        createdAt: "2025-10-19T08:23:00Z",
        likes: 2
      },
      {
        id: "reply-0202",
        author: "Nora",
        message:
          "Für die Bungees nutze ich gerne zwei Gummis in verschiedenen Farben, so erkennst du sie auch bei schlechter Sicht sofort.",
        createdAt: "2025-10-23T11:52:00Z",
        likes: 1
      }
    ]
  },
  {
    id: "thread-03",
    title: "Regler-Service: DIY oder abgeben?",
    author: "Samira",
    categoryId: "gear",
    body:
      "Ich überlege, den Service für meinen Atemregler künftig selbst zu übernehmen. Hat jemand den Mares-Kurs besucht und kann berichten, ob sich der Aufwand lohnt?",
    excerpt:
      "Habt ihr euch schon einmal selbst an den ersten Stufen versucht oder vertraut ihr komplett auf zertifizierte Werkstätten?",
    createdAt: "2025-10-15T07:55:00Z",
    lastActivity: "2025-10-25T08:50:00Z",
    likes: 8,
    replies: [
      {
        id: "reply-0301",
        author: "Lukas",
        message:
          "Ich würde es nur mit Original-Kits machen und du brauchst definitiv einen Prüfstand für den Intermediate Pressure, sonst wird es ungenau.",
        createdAt: "2025-10-16T10:32:00Z",
        likes: 2
      }
    ]
  }
];

export const members: MemberProfile[] = [
  {
    id: "member-01",
    name: "Lena Hartmann",
    email: "lena@divelog.studio",
    password: "member-demo",
    role: "member",
    joinedAt: "2024-11-05T10:15:00Z",
    city: "Hamburg",
    about:
      "Rescue Diver mit Fokus auf Unterwasserfotografie und wöchentliche Trainings im Freiwasser.",
    certifications: ["Rescue Diver", "Nitrox", "Dry Suit"],
    favoriteDiveSite: "Silfra-Spalte",
    completedDives: 84,
    preferredLocale: "de"
  },
  {
    id: "member-02",
    name: "Armin Keller",
    email: "armin@divelog.studio",
    password: "admin-demo",
    role: "admin",
    joinedAt: "2023-07-18T08:40:00Z",
    city: "München",
    about:
      "Technischer Taucher und Ausbildungsleiter. Organisiert Wracktouren und Mixed-Gas Workshops.",
    certifications: ["Instructor", "Trimix", "Full Cave"],
    favoriteDiveSite: "SS Thistlegorm",
    completedDives: 212,
    preferredLocale: "en"
  },
  {
    id: "member-03",
    name: "Noah Weiss",
    email: "noah@divelog.studio",
    password: "reef-lovers",
    role: "member",
    joinedAt: "2025-03-22T14:05:00Z",
    city: "Berlin",
    about: "Open Water Instructor mit Leidenschaft für Meeresbiologie und Reef Check.",
    certifications: ["Instructor", "Deep", "Night"],
    favoriteDiveSite: "Shark Point",
    completedDives: 134,
    preferredLocale: "de"
  },
  {
    id: "member-demo-de",
    name: "Demo Account (DE)",
    email: "demo-de@divelog.studio",
    password: "demo-de",
    role: "member",
    joinedAt: "2025-01-05T09:00:00Z",
    city: "",
    about: "Quickstart-Demo für die deutschsprachige Oberfläche.",
    certifications: [],
    favoriteDiveSite: "",
    completedDives: 0,
    preferredLocale: "de"
  },
  {
    id: "member-demo-en",
    name: "Demo Account (EN)",
    email: "demo-en@divelog.studio",
    password: "demo-en",
    role: "member",
    joinedAt: "2025-01-05T09:00:00Z",
    city: "",
    about: "Quickstart demo tailored for the English interface.",
    certifications: [],
    favoriteDiveSite: "",
    completedDives: 0,
    preferredLocale: "en"
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "note-01",
    title: "Wartung fällig",
    description: "Suunto D5 braucht eine Revision in 7 Tagen.",
    timestamp: "2025-10-25T08:30:00Z"
  },
  {
    id: "note-02",
    title: "Neuer Kommentar",
    description: "Lukas hat deinen Tauchbericht kommentiert.",
    timestamp: "2025-10-24T19:12:00Z"
  }
];
