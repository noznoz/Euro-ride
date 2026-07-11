// ============================================================
//  EDIT THIS FILE — it's the single source of truth for the trip.
//  Everything the app shows (dates, riders, route, rules) comes
//  from here. Checklists and expenses are edited in the app
//  itself and saved on your phone.
// ============================================================

export const trip = {
  name: 'Jeddah Chapter',
  subName: 'Europe Ride 2026',
  tagline: 'Ride some of Europe’s best mountain roads',
  // ISO dates (YYYY-MM-DD). Used for the countdown and day headers.
  startDate: '2026-09-22',
  endDate: '2026-10-03',
  homeCurrency: 'EUR',

  riders: [
    { name: 'Nizar', emoji: '🏍️' },
    { name: 'Friend 1', emoji: '😎' }, // EDIT: names of the two friends
    { name: 'Friend 2', emoji: '🔥' }, // arriving a day early with you
  ],
  group: {
    size: '~15 riders',
    note: 'You and two close friends arrive one day before the rest of the group.',
  },

  flights: {
    outbound: {
      airline: 'Saudia', flight: 'SV175', clazz: 'Business',
      route: 'Jeddah (JED) → Munich (MUC)',
      date: 'Tue 22 Sep 2026', detail: 'Arrival ≈ 14:55',
    },
    inbound: {
      airline: 'Saudia', flight: 'SV174', clazz: 'Business',
      route: 'Munich (MUC) → Jeddah (JED)',
      date: 'Sat 3 Oct 2026', detail: 'Breakfast → airport transfer → home',
    },
  },

  baseHotel: {
    name: 'HYPERION Hotel München',
    note: 'Base hotel in Munich before and after the motorcycle tour.',
  },

  rental: {
    company: 'EDIT: Harley-Davidson rental / dealer in Munich',
    bikes: 'Harley-Davidson Street Glide CVO',
    pickup: 'Munich — after the group meets (23–24 Sep)',
    dropoff: 'Munich — Fri 2 Oct (Ride Day 9)',
    bookingRef: 'EDIT: booking reference',
    phone: 'EDIT: +49 ...',
    notes: 'Iron Raven stays home this time. Bring Saudi licence + IDP, passport and a credit card with sufficient limit for the deposit.',
  },

  objectives: [
    'Ride some of Europe’s best mountain roads',
    'Capture cinematic footage (Insta360 X5, X2, DJI Osmo Action Mini)',
    'Buy Harley-Davidson gear in Germany',
    'Enjoy specialty coffee stops',
    'Visit luxury watch boutiques',
    'Spend time with the riding group',
    'Return with a complete travel story for the future Lulu app',
  ],

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
//  type: 'travel' | 'city' | 'ride' | 'rest'
//  For ride days, `route` is the list of places in riding order;
//  the app builds a Google Maps directions link from it.
// ------------------------------------------------------------
export const itinerary = [
  {
    day: 1, date: '2026-09-22', type: 'travel', tag: '✈️',
    title: 'Arrival — Jeddah → Munich',
    highlights: [
      'SV175 lands ≈ 14:55 — immigration, luggage, taxi to HYPERION Hotel',
      'Check in and freshen up',
      'Evening: Harley-Davidson dealer for riding gear (see the "Buy at H-D Munich" list in Packing)',
    ],
    hotel: 'HYPERION Hotel München',
    notes: 'You + 2 friends arrive a day before everyone else — gear shopping before the crowd.',
  },
  {
    day: 2, date: '2026-09-23', type: 'city', tag: '🛍️',
    title: 'Munich — shopping, coffee & the group arrives',
    highlights: [
      'Morning free: Maximilianstraße, luxury watch boutiques, Cartier',
      'Specialty coffee stops around the Altstadt',
      '≈ 14:00 — meet the rest of the group (~15 riders)',
    ],
    hotel: 'HYPERION Hotel München',
    notes: 'Last day off the bike — double-check gear and documents tonight.',
  },
  {
    day: 3, date: '2026-09-24', type: 'ride', rideDay: 1,
    title: 'Munich → Bregenz',
    route: ['Munich', 'Bregenz'],
    km: 200, rideTime: '≈ 3h',
    highlights: ['First miles on the Street Glide CVO', 'Lake Constance (Bodensee) arrival', 'Evening walk on the Bregenz lakefront'],
    hotel: 'EDIT: hotel in Bregenz',
    notes: 'Easy opener — settle into group formation and Cardo comms.',
  },
  {
    day: 4, date: '2026-09-25', type: 'ride', rideDay: 2,
    title: 'Bregenz → Andermatt',
    route: ['Bregenz', 'Chur', 'Andermatt'],
    km: 190, rideTime: '≈ 3h30',
    highlights: ['Into Switzerland', 'Oberalppass into Andermatt', 'Heart of the Swiss Alps'],
    hotel: 'EDIT: hotel in Andermatt',
    notes: 'Swiss speed cameras are merciless — ride sharp.',
  },
  {
    day: 5, date: '2026-09-26', type: 'ride', rideDay: 3,
    title: 'Andermatt → Montreux',
    route: ['Andermatt', 'Furkapass', 'Gletsch', 'Montreux'],
    km: 200, rideTime: '≈ 4h',
    highlights: ['Furka — the James Bond Goldfinger pass', 'Rhône valley descent', 'Lake Geneva golden hour'],
    hotel: 'EDIT: hotel in Montreux',
    notes: 'Late September: passes can be near-freezing at dawn — heated vest day.',
  },
  {
    day: 6, date: '2026-09-27', type: 'rest', tag: '🏖️',
    title: 'Montreux — rest day',
    highlights: ['Walk the lake promenade', 'Visit Chillon Castle', 'Relax, specialty coffee, photography'],
    hotel: 'Same hotel in Montreux',
    notes: 'No luggage, no helmets. Charge every camera battery tonight.',
  },
  {
    day: 7, date: '2026-09-28', type: 'ride', rideDay: 5,
    title: 'Montreux → Täsch',
    route: ['Montreux', 'Martigny', 'Visp', 'Täsch'],
    km: 155, rideTime: '≈ 2h30',
    highlights: ['Rhône valley run', 'Täsch — gateway to Zermatt', 'Optional: train up to Zermatt for Matterhorn views'],
    hotel: 'EDIT: hotel in Täsch',
    notes: 'Zermatt itself is car-free — bikes stay in Täsch.',
  },
  {
    day: 8, date: '2026-09-29', type: 'ride', rideDay: 6,
    title: 'Täsch → Como',
    route: ['Täsch', 'Simplon Pass', 'Domodossola', 'Como'],
    km: 190, rideTime: '≈ 4h',
    highlights: ['Simplon Pass into Italy', 'Espresso in Domodossola', 'Lake Como waterfront evening'],
    hotel: 'EDIT: hotel in Como',
    notes: 'Italy: autostrada tolls are pay-per-use — keep a card handy.',
  },
  {
    day: 9, date: '2026-09-30', type: 'ride', rideDay: 7,
    title: 'Como → Livigno',
    route: ['Como', 'Sondrio', 'Livigno'],
    km: 170, rideTime: '≈ 3h30',
    highlights: ['Valtellina wine valley', 'Climb to duty-free Livigno at 1,816 m', 'Cheapest fuel of the trip — fill everything'],
    hotel: 'EDIT: hotel in Livigno',
    notes: 'Livigno is a duty-free zone — stock up.',
  },
  {
    day: 10, date: '2026-10-01', type: 'ride', rideDay: 8,
    title: 'Livigno → Achensee',
    route: ['Livigno', 'Zernez', 'Landeck', 'Innsbruck', 'Achensee'],
    km: 370, rideTime: '≈ 6h',
    highlights: ['Longest day — Engadin, Inn valley, Tyrol', 'Achensee: Tyrol’s largest lake', 'Last alpine sunset'],
    hotel: 'EDIT: hotel at Achensee',
    notes: 'Big-km day: early start, disciplined fuel and coffee stops.',
  },
  {
    day: 11, date: '2026-10-02', type: 'ride', rideDay: 9,
    title: 'Achensee → Munich — return the bikes',
    route: ['Achensee', 'Tegernsee', 'Munich'],
    km: 110, rideTime: '≈ 2h',
    highlights: ['Final lakeside twisties via Tegernsee', 'Return motorcycles in Munich', 'Farewell dinner with the chapter'],
    hotel: 'HYPERION Hotel München',
    notes: 'Fill the tank before returning. Photograph the bike at drop-off for the deposit.',
  },
  {
    day: 12, date: '2026-10-03', type: 'travel', tag: '🏁',
    title: 'Home — Munich → Jeddah',
    highlights: ['Breakfast at the hotel', 'Airport transfer', 'SV174 home to Jeddah'],
    hotel: '—',
    notes: 'Pack the H-D shopping carefully — that gear is coming home.',
  },
]

// ------------------------------------------------------------
//  Where each day ends (for the weather forecast). lat/lon of the
//  overnight town.
// ------------------------------------------------------------
export const dayLocations = {
  1:  { name: 'Munich',    lat: 48.137, lon: 11.575 },
  2:  { name: 'Munich',    lat: 48.137, lon: 11.575 },
  3:  { name: 'Bregenz',   lat: 47.503, lon: 9.747 },
  4:  { name: 'Andermatt', lat: 46.634, lon: 8.594 },
  5:  { name: 'Montreux',  lat: 46.433, lon: 6.911 },
  6:  { name: 'Montreux',  lat: 46.433, lon: 6.911 },
  7:  { name: 'Täsch',     lat: 46.068, lon: 7.779 },
  8:  { name: 'Como',      lat: 45.808, lon: 9.085 },
  9:  { name: 'Livigno',   lat: 46.538, lon: 10.134 },
  10: { name: 'Achensee',  lat: 47.443, lon: 11.735 },
  11: { name: 'Munich',    lat: 48.137, lon: 11.575 },
  12: { name: 'Munich',    lat: 48.137, lon: 11.575 },
}

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
      'Speed: 50 town / 100 rural / 130 motorway',
      'Tyrol has noise limits on some roads — keep the V-twin civil',
    ],
  },
  {
    flag: '🇨🇭', name: 'Switzerland',
    facts: [
      'Motorway vignette CHF 40/year — needed if we touch any motorway',
      'Speed: 50 town / 80 rural / 120 motorway — cameras EVERYWHERE, fines are brutal',
      'Currency is CHF, not Euro (cards widely accepted)',
    ],
  },
  {
    flag: '🇮🇹', name: 'Italy',
    facts: [
      'Autostrada = pay-per-use toll booths (cash or card)',
      'Speed: 50 town / 90 rural / 130 motorway',
      'Livigno is a duty-free zone — cheapest fuel of the trip',
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
      'Passport', 'Flight tickets (SV175 / SV174)', 'Hotel confirmations',
      'Motorcycle rental confirmation', 'Travel insurance',
      'Saudi driving licence', 'International Driving Permit',
      'Credit card with sufficient limit',
    ],
  },
  {
    group: 'Riding gear', items: [
      'Helmet', 'Cardo communicator (charged + paired)', 'Riding jacket',
      'Riding pants', 'Boots', 'Gloves', 'Rain gear', 'Earplugs',
    ],
  },
  {
    group: 'Cameras & tech', items: [
      'Insta360 X5 + mounts', 'Insta360 X2', 'DJI Osmo Action Mini',
      'SD cards + spares', 'Batteries + chargers for every camera',
      'Power bank', 'USB-C cables', 'EU plug adapters', 'Phone mount',
      'Offline maps downloaded',
    ],
  },
  {
    group: 'Buy at H-D Munich (22 Sep)', items: [
      'Riding jacket', 'Gloves', 'Riding jeans/pants', 'Harley T-shirts',
      'Germany H.O.G. merchandise', 'Heated vest', 'Waterproof overgloves',
      'Neck warmer', 'Tire repair kit', 'Power bank', 'Cardo accessories',
      'USB-C cables', 'Ear plugs', 'First aid kit',
    ],
  },
  {
    group: 'Clothes & misc', items: [
      'Base layers (alpine passes are cold in late September)',
      'Warm mid-layer', 'Casual clothes for evenings',
      'Sunscreen', 'Personal meds', 'Cash: EUR + some CHF',
      'Microfibre cloth (visor + camera lenses)',
    ],
  },
]

// ------------------------------------------------------------
//  EXCHANGE RATES — SAR per 1 unit of each currency.
//  EDIT these to the real rates just before the trip; every
//  expense is converted with them.
// ------------------------------------------------------------
export const fx = {
  EUR: 4.06,
  CHF: 4.35,
  SAR: 1,
}

// ------------------------------------------------------------
//  Expense categories shown in the Money tab.
// ------------------------------------------------------------
export const expenseCategories = [
  { id: 'fuel',     label: 'Fuel',     emoji: '⛽' },
  { id: 'food',     label: 'Food',     emoji: '🍝' },
  { id: 'coffee',   label: 'Coffee',   emoji: '☕' },
  { id: 'hotel',    label: 'Hotel',    emoji: '🛏️' },
  { id: 'tolls',    label: 'Tolls',    emoji: '🛣️' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'rental',   label: 'Rental',   emoji: '🏍️' },
  { id: 'other',    label: 'Other',    emoji: '💶' },
]
