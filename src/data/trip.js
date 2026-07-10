// ============================================================
//  EDIT THIS FILE — it's the single source of truth for your trip.
//  Everything the app shows (dates, riders, route, hotels, rules)
//  comes from here. Checklists and expenses are edited in the app
//  itself and saved on your phone.
// ============================================================

export const trip = {
  name: 'Euro Ride 2026',
  tagline: 'Rent. Ride. Remember.',
  // ISO dates (YYYY-MM-DD). Used for the countdown and day headers.
  startDate: '2026-08-01',
  endDate: '2026-08-09',
  homeCurrency: 'EUR',

  riders: [
    // EDIT: your crew. Emoji shows as the avatar.
    { name: 'Nizar', emoji: '🏍️' },
    { name: 'Rider 2', emoji: '😎' },
    { name: 'Rider 3', emoji: '🔥' },
  ],

  rental: {
    company: 'EDIT: rental company',
    bikes: 'EDIT: e.g. 2× BMW R1250GS, 1× Ducati Multistrada',
    pickup: 'Munich, Germany — Aug 1, 09:00',
    dropoff: 'Munich, Germany — Aug 9, before 17:00',
    bookingRef: 'EDIT: booking reference',
    phone: 'EDIT: +49 ...',
    notes: 'Bring driving licence + IDP, passport and credit card for the deposit.',
  },

  emergency: {
    // 112 works across all of Europe for police / ambulance / fire.
    numbers: [
      { label: 'European emergency (all countries)', value: '112' },
      { label: 'Roadside assistance (rental)', value: 'EDIT: rental hotline' },
      { label: 'Travel insurance', value: 'EDIT: policy no. + phone' },
    ],
  },
}

// ------------------------------------------------------------
//  ITINERARY — one entry per day.
//  `route` is a list of places in riding order; the app builds a
//  Google Maps directions link from it automatically.
// ------------------------------------------------------------
export const itinerary = [
  {
    day: 1,
    date: '2026-08-01',
    title: 'Pick up bikes → into the Alps',
    route: ['Munich', 'Bad Tölz', 'Achenpass', 'Innsbruck'],
    km: 175,
    rideTime: '3h',
    highlights: ['Bike pickup + paperwork', 'Achenpass warm-up twisties', 'Evening in Innsbruck old town'],
    hotel: 'EDIT: hotel in Innsbruck',
    notes: 'Easy first day — get used to the bikes, check luggage straps.',
  },
  {
    day: 2,
    date: '2026-08-02',
    title: 'Grossglockner High Alpine Road',
    route: ['Innsbruck', 'Gerlos Pass', 'Grossglockner Hochalpenstrasse', 'Lienz'],
    km: 230,
    rideTime: '5h',
    highlights: ['Gerlos Pass', 'Grossglockner — 36 hairpins, 2,504 m', 'Edelweissspitze viewpoint'],
    hotel: 'EDIT: hotel in Lienz',
    notes: 'Grossglockner toll ~€30 per bike. Start early to beat the buses.',
  },
  {
    day: 3,
    date: '2026-08-03',
    title: 'Into the Dolomites',
    route: ['Lienz', 'Misurina', 'Tre Cime di Lavaredo', 'Cortina d’Ampezzo', 'Passo Falzarego', 'Corvara'],
    km: 160,
    rideTime: '4h',
    highlights: ['Lake Misurina', 'Tre Cime toll road', 'Falzarego pass'],
    hotel: 'EDIT: hotel in Corvara / Alta Badia',
    notes: 'Short km day — lots of photo stops.',
  },
  {
    day: 4,
    date: '2026-08-04',
    title: 'Sella Ronda pass loop',
    route: ['Corvara', 'Passo Gardena', 'Passo Sella', 'Passo Pordoi', 'Passo Campolongo', 'Corvara'],
    km: 60,
    rideTime: '2h riding — all day playing',
    highlights: ['Four legendary Dolomites passes in one loop', 'Ride it twice if the weather is good'],
    hotel: 'Same hotel — no luggage today 🎉',
    notes: 'Loop day. Leave the panniers at the hotel.',
  },
  {
    day: 5,
    date: '2026-08-05',
    title: 'Stelvio Pass',
    route: ['Corvara', 'Bolzano', 'Merano', 'Passo dello Stelvio', 'Bormio'],
    km: 210,
    rideTime: '5h',
    highlights: ['THE pass — 48 numbered hairpins to 2,757 m', 'Bratwurst at the summit', 'Descent to Bormio'],
    hotel: 'EDIT: hotel in Bormio',
    notes: 'Fuel up in Merano. Stelvio gets busy after 10:00.',
  },
  {
    day: 6,
    date: '2026-08-06',
    title: 'Swiss passes — into Engadin',
    route: ['Bormio', 'Passo di Gavia', 'Passo del Bernina', 'St. Moritz', 'Julierpass', 'Andermatt'],
    km: 240,
    rideTime: '5h30',
    highlights: ['Gavia — narrow and wild', 'Bernina glacier views', 'St. Moritz coffee stop'],
    hotel: 'EDIT: hotel in Andermatt',
    notes: 'Switzerland: motorway vignette not needed if we stay on passes. Carry CHF for small stops.',
  },
  {
    day: 7,
    date: '2026-08-07',
    title: 'The big three: Furka, Grimsel, Susten',
    route: ['Andermatt', 'Furkapass', 'Grimselpass', 'Sustenpass', 'Andermatt'],
    km: 120,
    rideTime: '3h30',
    highlights: ['Furka — James Bond Goldfinger road', 'Grimsel reservoir walls', 'Susten glacier views'],
    hotel: 'Same hotel in Andermatt',
    notes: 'Another loop day without luggage. Best ridden clockwise.',
  },
  {
    day: 8,
    date: '2026-08-08',
    title: 'Liechtenstein → Austria → Bavaria',
    route: ['Andermatt', 'Chur', 'Vaduz', 'Fernpass', 'Garmisch-Partenkirchen'],
    km: 280,
    rideTime: '5h',
    highlights: ['Country #5: Liechtenstein', 'Zugspitze views near Garmisch'],
    hotel: 'EDIT: hotel in Garmisch',
    notes: 'Longer transit day — Austrian vignette needed if we take the A12.',
  },
  {
    day: 9,
    date: '2026-08-09',
    title: 'Back to Munich — drop off bikes',
    route: ['Garmisch-Partenkirchen', 'Kochelsee', 'Munich'],
    km: 110,
    rideTime: '2h',
    highlights: ['Last lakeside twisties', 'Bikes back by 17:00', 'Farewell beers 🍻'],
    hotel: '—',
    notes: 'Fill the tanks before returning. Photos of the bikes at drop-off for the deposit.',
  },
]

// ------------------------------------------------------------
//  COUNTRY INFO — riding rules for every country on the route.
// ------------------------------------------------------------
export const countries = [
  {
    flag: '🇩🇪', name: 'Germany',
    facts: [
      'No motorway vignette — autobahn is free',
      'Speed: 50 town / 100 rural / autobahn often unlimited (130 advisory)',
      'Alcohol limit 0.5‰ — but just don’t',
    ],
  },
  {
    flag: '🇦🇹', name: 'Austria',
    facts: [
      'Motorway vignette REQUIRED (~€6 / 10 days for bikes) — buy digital before crossing',
      'Grossglockner has its own toll (~€30/bike), vignette not valid there',
      'Speed: 50 town / 100 rural / 130 motorway',
      'Some passes ban loud exhausts (Tyrol dB limits) — keep it civil',
    ],
  },
  {
    flag: '🇮🇹', name: 'Italy',
    facts: [
      'Autostrada = pay-per-use toll booths (cash or card)',
      'Speed: 50 town / 90 rural / 130 motorway',
      'Passes can close for weather or bike races — check signs in the valley',
    ],
  },
  {
    flag: '🇨🇭', name: 'Switzerland',
    facts: [
      'Motorway vignette CHF 40/year — skip motorways and you don’t need it',
      'Speed: 50 town / 80 rural / 120 motorway — cameras EVERYWHERE, fines are brutal',
      'Currency is CHF, not Euro (cards widely accepted)',
    ],
  },
  {
    flag: '🇱🇮', name: 'Liechtenstein',
    facts: [
      'Same rules and currency (CHF) as Switzerland',
      'Blink and you’re through it — get the passport stamp in Vaduz (souvenir stamp, 3 CHF)',
    ],
  },
]

// ------------------------------------------------------------
//  PACKING LIST — starting template. Ticks (and any items you
//  add or delete in the app) are saved on your phone.
// ------------------------------------------------------------
export const packingTemplate = [
  {
    group: 'Documents', items: [
      'Passport', 'Driving licence (+ International Driving Permit)',
      'Rental booking confirmation', 'Travel insurance papers',
      'Credit card for bike deposit', 'EHIC / health insurance card',
    ],
  },
  {
    group: 'Riding gear', items: [
      'Helmet', 'Riding jacket + trousers', 'Gloves (+ thin spare pair)',
      'Boots', 'Rain suit', 'Earplugs', 'Neck tube / balaclava',
      'Back protector', 'Sunglasses / dark visor',
    ],
  },
  {
    group: 'Tech', items: [
      'Phone mount + charger for the bike', 'Intercom (charged + paired)',
      'Power bank', 'EU plug adapters', 'Action camera + mounts + SD cards',
      'Offline maps downloaded (Google Maps / OsmAnd)',
    ],
  },
  {
    group: 'Clothes & misc', items: [
      'Base layers (it’s cold at 2,700 m — even in August)',
      'Warm mid-layer / fleece', 'Casual clothes for evenings',
      'Swim shorts (alpine lakes!)', 'Sunscreen', 'Painkillers / personal meds',
      'Small first-aid kit', 'Cable lock for helmets', 'Cash: EUR + some CHF',
      'Bungee cords / luggage straps', 'Microfibre cloth (visor cleaning)',
    ],
  },
]

// ------------------------------------------------------------
//  Expense categories shown in the Money tab.
// ------------------------------------------------------------
export const expenseCategories = [
  { id: 'fuel',    label: 'Fuel',    emoji: '⛽' },
  { id: 'food',    label: 'Food',    emoji: '🍝' },
  { id: 'hotel',   label: 'Hotel',   emoji: '🛏️' },
  { id: 'tolls',   label: 'Tolls',   emoji: '🛣️' },
  { id: 'rental',  label: 'Rental',  emoji: '🏍️' },
  { id: 'other',   label: 'Other',   emoji: '💶' },
]
