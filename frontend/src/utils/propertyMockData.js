/**
 * Realistic Mock Rental Properties Data for HomeSphere
 * AI-Smart Rental Property Management System
 */

export const mockProperties = [
  {
    id: 'prop-101',
    name: 'The Lumina Skyline Loft',
    propertyType: 'Apartment',
    city: 'Austin, TX',
    location: 'Downtown Austin, TX',
    address: '400 Colorado St, Unit 18B, Austin, TX 78701',
    monthlyRent: 2450,
    deposit: 2450,
    bedrooms: 2,
    bathrooms: 2,
    area: 1120, // sq ft
    furnishing: 'Furnished',
    parking: 'Covered Garage',
    amenities: [
      'High-Speed Fiber Wi-Fi',
      'Resort-Style Rooftop Pool',
      '24/7 Smart Fitness Center',
      'In-Unit Washer & Dryer',
      'Pet Friendly (Dog Spa)',
      'Private Balcony with City View',
      'EV Charging Stations',
      'Keyless Smart Lock Access',
      'Stainless Steel Appliances',
      'Coworking Lounge',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 98,
    aiMatchReasons: [
      'Matches your target budget within 5% variance',
      '8 min commute to Tech Corridor and transit hub',
      'Includes designated covered parking & high-speed fiber',
      'Acoustic sound-dampening windows (Quiet Rating: 95/100)',
    ],
    description:
      'Immerse yourself in panoramic skyline views with floor-to-ceiling soundproof glass, open-concept Nordic oak interiors, and premier smart-home automation. Complete with in-unit laundry, custom Italian cabinetry, and access to the skydeck.',
    petPolicy: 'Cats and Dogs welcome (Up to 2 pets, no breed restrictions)',
    leaseTerms: '12 Months (6-18 Months flexible available)',
    yearBuilt: 2023,
    utilitiesIncluded: ['Trash Collection', 'High-Speed Internet', 'Sewer'],
    landlord: {
      name: 'Austin Metro Living Partners',
      manager: 'Sarah Jenkins',
      rating: 4.9,
      responseTime: 'Under 15 mins',
      verified: true,
    },
  },
  {
    id: 'prop-102',
    name: 'Harbor Mist Minimalist Studio',
    propertyType: 'Studio',
    city: 'Seattle, WA',
    location: 'Belltown, Seattle, WA',
    address: '2210 2nd Ave, Apt 405, Seattle, WA 98121',
    monthlyRent: 1680,
    deposit: 1500,
    bedrooms: 0,
    bathrooms: 1,
    area: 540,
    furnishing: 'Semi-Furnished',
    parking: 'Dedicated Spot',
    amenities: [
      'High-Speed Fiber Wi-Fi',
      'In-Unit Washer & Dryer',
      'Rooftop BBQ & Firepit',
      'Bike Storage & Repair Station',
      'Smart Thermostat (Nest)',
      'Dishwasher',
      'Hardwood Floors',
      'Pet Friendly',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 94,
    aiMatchReasons: [
      'Exceptional Walk Score (98/100) — Walk to South Lake Union',
      'Eco-efficient heat pump saves ~$65/mo on electric',
      'Direct tenant portal rent auto-pay with rewards',
    ],
    description:
      'Chic urban studio maximizing every square foot with modular built-in storage, quartz countertops, and oversized north-facing windows letting in generous natural light. Perfect for modern tech professionals.',
    petPolicy: 'Cats and small dogs under 30 lbs allowed',
    leaseTerms: '12 Months standard',
    yearBuilt: 2022,
    utilitiesIncluded: ['Water', 'Trash', 'Recycling'],
    landlord: {
      name: 'Cascadia Urban Property Mgmt',
      manager: 'David Chen',
      rating: 4.8,
      responseTime: 'Under 30 mins',
      verified: true,
    },
  },
  {
    id: 'prop-103',
    name: 'Sunset Palms Modern Townhouse',
    propertyType: 'Townhouse',
    city: 'San Diego, CA',
    location: 'Pacific Beach, San Diego, CA',
    address: '1440 Pacific Beach Dr, San Diego, CA 92109',
    monthlyRent: 3600,
    deposit: 3600,
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1680,
    furnishing: 'Unfurnished',
    parking: 'Covered Garage',
    amenities: [
      'Private 2-Car Attached Garage',
      'Private Fenced Patio & Garden',
      'In-Unit Washer & Dryer',
      'Chef Kitchen with Gas Range',
      'Central AC & Heating',
      'Solar Panel Energy Savings',
      'Pet Friendly',
      'Storage Unit Included',
      'Wine Cooler',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 91,
    aiMatchReasons: [
      '3 blocks from coastal boardwalk and surf beaches',
      'Private 2-car garage with Level 2 EV charging ready',
      'Rooftop solar reduces utility bills by 40%',
    ],
    description:
      'Coastal luxury living at its finest. Tri-level contemporary townhouse featuring hardwood floors, soaring 10-foot ceilings, an expansive primary suite with walk-in closet, and an outdoor patio ideal for weekend grilling.',
    petPolicy: 'Pet friendly with private dog run',
    leaseTerms: '12 or 24 Months',
    yearBuilt: 2021,
    utilitiesIncluded: ['Landscaping', 'Trash'],
    landlord: {
      name: 'Pacific Shore Rentals',
      manager: 'Marcus Sterling',
      rating: 4.9,
      responseTime: 'Under 1 hour',
      verified: true,
    },
  },
  {
    id: 'prop-104',
    name: 'Brickell Avenue Water View Condo',
    propertyType: 'Condo',
    city: 'Miami, FL',
    location: 'Brickell Financial District, Miami, FL',
    address: '1100 Brickell Bay Dr, Apt 2804, Miami, FL 33131',
    monthlyRent: 3100,
    deposit: 3100,
    bedrooms: 2,
    bathrooms: 2,
    area: 1250,
    furnishing: 'Furnished',
    parking: 'Covered Garage',
    amenities: [
      'Infinity Pool Overlooking Biscayne Bay',
      '24/7 Concierge & Valet',
      'Spa & Sauna Facilities',
      'Private Waterfront Balcony',
      'Sub-Zero & Wolf Appliances',
      'High-Speed Wi-Fi',
      'Smart Home Lighting',
      'Pet Friendly',
    ],
    availabilityStatus: 'Available Oct 1',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 89,
    aiMatchReasons: [
      'Unobstructed bay views with sunrise orientation',
      'Walking distance to top dining, Metrorail, and financial offices',
      'Full white-glove concierge and valet package included',
    ],
    description:
      'Elevated living on the 28th floor in the heart of Miami’s financial epicenter. Fully designer-furnished with imported porcelain tile, European kitchen cabinetry, and panoramic waterfront sunset vistas.',
    petPolicy: 'Small pets allowed (deposit required)',
    leaseTerms: '12 Months',
    yearBuilt: 2022,
    utilitiesIncluded: ['Water', 'High-Speed Cable/Internet', 'Sewer', 'Trash'],
    landlord: {
      name: 'Brickell Premier Living',
      manager: 'Camila Rodriguez',
      rating: 4.7,
      responseTime: 'Under 2 hours',
      verified: true,
    },
  },
  {
    id: 'prop-105',
    name: 'SoHo Artisan Cast-Iron Loft',
    propertyType: 'Apartment',
    city: 'New York, NY',
    location: 'SoHo, Manhattan, NY',
    address: '92 Prince St, 3rd Floor, New York, NY 10012',
    monthlyRent: 4250,
    deposit: 4250,
    bedrooms: 1,
    bathrooms: 1.5,
    area: 980,
    furnishing: 'Semi-Furnished',
    parking: 'Street Parking',
    amenities: [
      'Exposed Historic Brick & Timber Beams',
      'Private Keyed Elevator Access',
      '12-Foot Ceiling Heights',
      'Soaking Tub & Rain Shower',
      'In-Unit Washer & Dryer',
      'Central AC with Nest Control',
      'Motorized Solar Shades',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 86,
    aiMatchReasons: [
      'Authentic pre-war architectural character with modern luxury',
      'Direct access to Broadway-Lafayette and Prince St subway lines',
      'High acoustic isolation between loft residences',
    ],
    description:
      'Rarely available authentic cast-iron loft in prime historic SoHo. Features restored pine floors, oversized southern-exposure sash windows, museum-quality lighting tracks, and a gourmet island kitchen.',
    petPolicy: 'Pet friendly (Cats & Dogs allowed)',
    leaseTerms: '12-24 Months',
    yearBuilt: 2020,
    utilitiesIncluded: ['Water', 'Heat'],
    landlord: {
      name: 'Prince Street Holdings LLC',
      manager: 'Julian Vance',
      rating: 4.9,
      responseTime: 'Under 1 hour',
      verified: true,
    },
  },
  {
    id: 'prop-106',
    name: 'River North Panoramic Penthouse',
    propertyType: 'Penthouse',
    city: 'Chicago, IL',
    location: 'River North, Chicago, IL',
    address: '430 N Orleans St, PH-02, Chicago, IL 60654',
    monthlyRent: 4900,
    deposit: 4900,
    bedrooms: 3,
    bathrooms: 3,
    area: 2150,
    furnishing: 'Furnished',
    parking: 'Covered Garage',
    amenities: [
      'Private 400 sq ft Wrap-Around Terrace',
      'Heated Garage Parking (2 Tandem)',
      'Dual Fireplace (Living & Primary)',
      'Wine Cellar & Wet Bar',
      'Private Elevator Vestibule',
      '24/7 Doorman & Package Lockers',
      'Sauna & Steam Shower',
      'High-Speed Wi-Fi',
      'Pet Friendly',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 95,
    aiMatchReasons: [
      'Top-floor penthouse with unobstructed Chicago river & skyline views',
      'Includes 2 dedicated heated garage spaces with EV hookup',
      'Custom acoustic insulation throughout',
    ],
    description:
      'The crown jewel of River North. Spanning 2,150 square feet with custom motorized curtain walls, a chef’s kitchen featuring Calacatta quartz waterfall counters, and an expansive wraparound deck with gas fire pit.',
    petPolicy: 'Pet friendly with on-site pet relief park',
    leaseTerms: '12 Months',
    yearBuilt: 2024,
    utilitiesIncluded: ['Gas', 'Water', 'Trash', 'Internet'],
    landlord: {
      name: 'Windy City Luxury Residences',
      manager: 'Sophia Anderson',
      rating: 5.0,
      responseTime: 'Under 10 mins',
      verified: true,
    },
  },
  {
    id: 'prop-107',
    name: 'Cherry Creek Modern Garden Villa',
    propertyType: 'Villa',
    city: 'Denver, CO',
    location: 'Cherry Creek North, Denver, CO',
    address: '320 Adams St, Denver, CO 80206',
    monthlyRent: 3850,
    deposit: 3850,
    bedrooms: 4,
    bathrooms: 3.5,
    area: 2400,
    furnishing: 'Unfurnished',
    parking: 'Covered Garage',
    amenities: [
      'Private Landscaped Backyard & Firepit',
      'Finished Basement / Media Room',
      '2-Car Heated Garage',
      'Mudroom with Ski & Gear Storage',
      'Smart Irrigation & Solar Powered',
      'In-Unit Laundry Room',
      'Pet Friendly',
      'Central AC & Heating',
    ],
    availabilityStatus: 'Available Nov 15',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 84,
    aiMatchReasons: [
      'Ideal for families or remote professionals needing flex office spaces',
      'Ranked #1 school district in Denver metro area',
      'Custom gear room built for Colorado ski/bike lifestyle',
    ],
    description:
      'Rare standalone luxury villa nestled in vibrant Cherry Creek. Features a sun-drenched great room, dual-sided limestone fireplace, radiant heated bathroom floors, and a private pergola patio surrounded by aspen trees.',
    petPolicy: 'Pet friendly (Large dogs allowed, fenced yard)',
    leaseTerms: '12 or 24 Months',
    yearBuilt: 2022,
    utilitiesIncluded: ['Seasonal Yard Maintenance', 'Trash'],
    landlord: {
      name: 'Mile High Property Group',
      manager: 'Taylor Brooks',
      rating: 4.8,
      responseTime: 'Under 1 hour',
      verified: true,
    },
  },
  {
    id: 'prop-108',
    name: 'Mission District Eco-Flat',
    propertyType: 'Apartment',
    city: 'San Francisco, CA',
    location: 'Mission Dolores, San Francisco, CA',
    address: '760 Valencia St, Apt 3B, San Francisco, CA 94110',
    monthlyRent: 2850,
    deposit: 2850,
    bedrooms: 1,
    bathrooms: 1,
    area: 720,
    furnishing: 'Furnished',
    parking: 'Dedicated Spot',
    amenities: [
      'Private Balcony Facing Courtyard',
      'LEED Platinum Certified Building',
      'In-Unit Washer & Dryer',
      'Rooftop Community Herb Garden',
      'High-Speed Wi-Fi',
      'Secure Bike Pavilion',
      'Keyless Smart Entry',
      'Energy-Star Induction Kitchen',
    ],
    availabilityStatus: 'Available Now',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
    ],
    aiMatchScore: 92,
    aiMatchReasons: [
      'Quiet courtyard-facing unit avoiding street noise (92 acoustic score)',
      'Steps away from BART, Dolores Park, and top cafes',
      'Solar-backed microgrid guarantees 0 downtime power',
    ],
    description:
      'Sustainable urban living designed with reclaimed cedar accents, triple-pane windows, and minimalist Scandinavian styling. Enjoy immediate access to Valencia corridor dining while living in a peaceful, quiet sanctuary.',
    petPolicy: 'Pet friendly (Cats & small dogs)',
    leaseTerms: '12 Months',
    yearBuilt: 2023,
    utilitiesIncluded: ['Water', 'Trash', 'Internet'],
    landlord: {
      name: 'Bay Area Green Habitats',
      manager: 'Liam Gallagher',
      rating: 4.9,
      responseTime: 'Under 30 mins',
      verified: true,
    },
  },
]

export const filterOptions = {
  propertyTypes: ['All Types', 'Apartment', 'Studio', 'Townhouse', 'Condo', 'Penthouse', 'Villa'],
  cities: ['All Locations', 'Austin, TX', 'Seattle, WA', 'San Diego, CA', 'Miami, FL', 'New York, NY', 'Chicago, IL', 'Denver, CO', 'San Francisco, CA'],
  bedrooms: [
    { label: 'Any Beds', value: 'all' },
    { label: 'Studio (0)', value: '0' },
    { label: '1 Bed', value: '1' },
    { label: '2 Beds', value: '2' },
    { label: '3+ Beds', value: '3+' },
    { label: '4+ Beds', value: '4+' },
  ],
  furnishing: ['All Furnishing', 'Furnished', 'Semi-Furnished', 'Unfurnished'],
  parking: ['All Parking', 'Covered Garage', 'Dedicated Spot', 'Street Parking'],
  priceRanges: [
    { label: 'Any Budget', min: 0, max: Infinity },
    { label: 'Under $2,000', min: 0, max: 2000 },
    { label: '$2,000 - $3,000', min: 2000, max: 3000 },
    { label: '$3,000 - $4,000', min: 3000, max: 4000 },
    { label: '$4,000+', min: 4000, max: Infinity },
  ],
}

/**
 * Filter properties based on user filter criteria
 */
export function filterProperties(properties, filters = {}) {
  return properties.filter((prop) => {
    // 1. Search Query (location, name, address, or city)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim()
      const matchesSearch =
        prop.name.toLowerCase().includes(q) ||
        prop.location.toLowerCase().includes(q) ||
        prop.city.toLowerCase().includes(q) ||
        prop.address.toLowerCase().includes(q) ||
        prop.propertyType.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }

    // 2. City / Location Filter
    if (filters.city && filters.city !== 'All Locations') {
      if (prop.city !== filters.city && !prop.location.toLowerCase().includes(filters.city.toLowerCase())) {
        return false
      }
    }

    // 3. Property Type Filter
    if (filters.propertyType && filters.propertyType !== 'All Types') {
      if (prop.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false
      }
    }

    // 4. Budget / Rent Range
    if (filters.minRent !== undefined && filters.minRent !== null && filters.minRent !== '') {
      if (prop.monthlyRent < Number(filters.minRent)) return false
    }
    if (filters.maxRent !== undefined && filters.maxRent !== null && filters.maxRent !== '') {
      if (prop.monthlyRent > Number(filters.maxRent)) return false
    }

    // 5. Bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      if (filters.bedrooms === '0') {
        if (prop.bedrooms !== 0) return false
      } else if (filters.bedrooms === '1') {
        if (prop.bedrooms !== 1) return false
      } else if (filters.bedrooms === '2') {
        if (prop.bedrooms !== 2) return false
      } else if (filters.bedrooms === '3+') {
        if (prop.bedrooms < 3) return false
      } else if (filters.bedrooms === '4+') {
        if (prop.bedrooms < 4) return false
      }
    }

    // 6. Furnishing
    if (filters.furnishing && filters.furnishing !== 'All Furnishing') {
      if (prop.furnishing !== filters.furnishing) return false
    }

    // 7. Parking
    if (filters.parking && filters.parking !== 'All Parking') {
      if (filters.parking === 'Any Parking') {
        if (prop.parking === 'None' || !prop.parking) return false
      } else if (prop.parking !== filters.parking) {
        return false
      }
    }

    // 8. Min AI Match Score
    if (filters.minAiScore && Number(filters.minAiScore) > 0) {
      if (prop.aiMatchScore < Number(filters.minAiScore)) return false
    }

    // 9. Availability
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'available_now' && prop.availabilityStatus !== 'Available Now') {
        return false
      }
    }

    return true
  })
}

/**
 * Sort properties by selected sort criteria
 */
export function sortProperties(properties, sortBy = 'ai_match') {
  const sorted = [...properties]
  switch (sortBy) {
    case 'ai_match':
      return sorted.sort((a, b) => b.aiMatchScore - a.aiMatchScore)
    case 'price_asc':
      return sorted.sort((a, b) => a.monthlyRent - b.monthlyRent)
    case 'price_desc':
      return sorted.sort((a, b) => b.monthlyRent - a.monthlyRent)
    case 'bedrooms_desc':
      return sorted.sort((a, b) => b.bedrooms - a.bedrooms)
    case 'area_desc':
      return sorted.sort((a, b) => b.area - a.area)
    default:
      return sorted
  }
}

/**
 * Get single property by ID with fallback
 */
export function getPropertyById(id) {
  return mockProperties.find((p) => p.id === id) || mockProperties[0]
}
