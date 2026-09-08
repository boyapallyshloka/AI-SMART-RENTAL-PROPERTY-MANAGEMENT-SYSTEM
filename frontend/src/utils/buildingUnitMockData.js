/**
 * Frontend Mock Data for HomeSphere Building & Unit Management Foundation
 * 
 * Strict Backend Entity Structure:
 * Property -> Building -> Floor -> Unit
 * 
 * BUILDING:
 * - buildingId
 * - buildingName
 * - totalFloors
 * - totalUnits
 * - description
 * - property
 * 
 * FLOOR:
 * - floorId
 * - floorName
 * - floorNumber
 * - building
 * 
 * UNIT:
 * - unitId
 * - unitNumber
 * - unitType ('APARTMENT' | 'ROOM')
 * - area
 * - bedrooms
 * - bathrooms
 * - monthlyRent
 * - securityDeposit
 * - status ('VACANT' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE')
 * - description
 * - floor
 */

export const UNIT_TYPES = ['APARTMENT', 'ROOM']
export const UNIT_STATUSES = ['VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']

// Property references from existing property system
const PROPERTY_REFS = {
  'prop-1': {
    id: 'prop-1',
    name: 'Sunset Palms Luxury Residences',
    type: 'Apartment',
    address: '420 Ocean Boulevard',
    city: 'Santa Monica',
    state: 'CA',
    zipCode: '90401',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    description: 'Premier oceanfront residential complex featuring manicured tropical gardens, heated saltwater pool, and 24/7 concierge.',
  },
  'prop-2': {
    id: 'prop-2',
    name: 'Highland Oaks Modern Townhomes',
    type: 'Townhouse',
    address: '1850 Oak Creek Parkway',
    city: 'Austin',
    state: 'TX',
    zipCode: '78704',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    description: 'Contemporary multi-level townhome community with private fenced yards, integrated EV garages, and park trail access.',
  },
  'prop-3': {
    id: 'prop-3',
    name: 'The Grandview Skyline Lofts',
    type: 'Loft',
    address: '810 Industrial Way #500',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98104',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    description: 'Converted architectural loft facility featuring 14-foot exposed concrete ceilings, oversized casement windows, and panoramic skyline vistas.',
  },
}

// Buildings Mock Data
export const MOCK_BUILDINGS = [
  {
    buildingId: 'bld-101',
    buildingName: 'Sunset Palms - Tower Alpha',
    totalFloors: 4,
    totalUnits: 8,
    description: 'Premier oceanfront residential tower featuring modern residences, floor-to-ceiling glass, and dedicated concierge access.',
    propertyId: 'prop-1',
    property: PROPERTY_REFS['prop-1'],
  },
  {
    buildingId: 'bld-102',
    buildingName: 'Sunset Palms - Pavilion East',
    totalFloors: 2,
    totalUnits: 4,
    description: 'Boutique garden residential annex adjacent to central landscaped grounds and recreational amenities.',
    propertyId: 'prop-1',
    property: PROPERTY_REFS['prop-1'],
  },
  {
    buildingId: 'bld-201',
    buildingName: 'Highland Oaks - North Block',
    totalFloors: 3,
    totalUnits: 6,
    description: 'Tri-level contemporary townhome building with integrated private garages and private fenced yards.',
    propertyId: 'prop-2',
    property: PROPERTY_REFS['prop-2'],
  },
  {
    buildingId: 'bld-301',
    buildingName: 'The Grandview - Skyline Tower',
    totalFloors: 3,
    totalUnits: 6,
    description: 'Converted architectural loft facility featuring 14-foot exposed concrete ceilings and panoramic city skyline vistas.',
    propertyId: 'prop-3',
    property: PROPERTY_REFS['prop-3'],
  },
]

// Floors Mock Data
export const MOCK_FLOORS = [
  // Building 101 Floors (4 floors)
  {
    floorId: 'flr-101-1',
    floorName: 'Ground Floor',
    floorNumber: 1,
    buildingId: 'bld-101',
    building: {
      buildingId: 'bld-101',
      buildingName: 'Sunset Palms - Tower Alpha',
      property: PROPERTY_REFS['prop-1'],
    },
  },
  {
    floorId: 'flr-101-2',
    floorName: 'Second Floor',
    floorNumber: 2,
    buildingId: 'bld-101',
    building: {
      buildingId: 'bld-101',
      buildingName: 'Sunset Palms - Tower Alpha',
      property: PROPERTY_REFS['prop-1'],
    },
  },
  {
    floorId: 'flr-101-3',
    floorName: 'Third Floor',
    floorNumber: 3,
    buildingId: 'bld-101',
    building: {
      buildingId: 'bld-101',
      buildingName: 'Sunset Palms - Tower Alpha',
      property: PROPERTY_REFS['prop-1'],
    },
  },
  {
    floorId: 'flr-101-4',
    floorName: 'Penthouse Level',
    floorNumber: 4,
    buildingId: 'bld-101',
    building: {
      buildingId: 'bld-101',
      buildingName: 'Sunset Palms - Tower Alpha',
      property: PROPERTY_REFS['prop-1'],
    },
  },

  // Building 102 Floors (2 floors)
  {
    floorId: 'flr-102-1',
    floorName: 'Garden Level',
    floorNumber: 1,
    buildingId: 'bld-102',
    building: {
      buildingId: 'bld-102',
      buildingName: 'Sunset Palms - Pavilion East',
      property: PROPERTY_REFS['prop-1'],
    },
  },
  {
    floorId: 'flr-102-2',
    floorName: 'Upper Terrace Level',
    floorNumber: 2,
    buildingId: 'bld-102',
    building: {
      buildingId: 'bld-102',
      buildingName: 'Sunset Palms - Pavilion East',
      property: PROPERTY_REFS['prop-1'],
    },
  },

  // Building 201 Floors (3 floors)
  {
    floorId: 'flr-201-1',
    floorName: 'Level 1 - Courtyard',
    floorNumber: 1,
    buildingId: 'bld-201',
    building: {
      buildingId: 'bld-201',
      buildingName: 'Highland Oaks - North Block',
      property: PROPERTY_REFS['prop-2'],
    },
  },
  {
    floorId: 'flr-201-2',
    floorName: 'Level 2 - Mid Terrace',
    floorNumber: 2,
    buildingId: 'bld-201',
    building: {
      buildingId: 'bld-201',
      buildingName: 'Highland Oaks - North Block',
      property: PROPERTY_REFS['prop-2'],
    },
  },
  {
    floorId: 'flr-201-3',
    floorName: 'Level 3 - Sky Deck',
    floorNumber: 3,
    buildingId: 'bld-201',
    building: {
      buildingId: 'bld-201',
      buildingName: 'Highland Oaks - North Block',
      property: PROPERTY_REFS['prop-2'],
    },
  },

  // Building 301 Floors (3 floors)
  {
    floorId: 'flr-301-1',
    floorName: 'Concourse Level',
    floorNumber: 1,
    buildingId: 'bld-301',
    building: {
      buildingId: 'bld-301',
      buildingName: 'The Grandview - Skyline Tower',
      property: PROPERTY_REFS['prop-3'],
    },
  },
  {
    floorId: 'flr-301-2',
    floorName: 'Mezzanine Level',
    floorNumber: 2,
    buildingId: 'bld-301',
    building: {
      buildingId: 'bld-301',
      buildingName: 'The Grandview - Skyline Tower',
      property: PROPERTY_REFS['prop-3'],
    },
  },
  {
    floorId: 'flr-301-3',
    floorName: 'Skyline Level',
    floorNumber: 3,
    buildingId: 'bld-301',
    building: {
      buildingId: 'bld-301',
      buildingName: 'The Grandview - Skyline Tower',
      property: PROPERTY_REFS['prop-3'],
    },
  },
]

// Units Mock Data
export const MOCK_UNITS = [
  // Building 101 - Floor 1 Units
  {
    unitId: 'unit-101',
    unitNumber: 'A-101',
    unitType: 'APARTMENT',
    area: 1150,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 3200,
    securityDeposit: 3200,
    status: 'OCCUPIED',
    description: 'Spacious two-bedroom garden apartment with private patio, dual vanities, and direct pool access.',
    floor: {
      floorId: 'flr-101-1',
      floorName: 'Ground Floor',
      floorNumber: 1,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-102',
    unitNumber: 'A-102',
    unitType: 'APARTMENT',
    area: 850,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 2600,
    securityDeposit: 2600,
    status: 'VACANT',
    description: 'Sunny one-bedroom unit with open-concept kitchen, stainless appliances, and polished quartz counters.',
    floor: {
      floorId: 'flr-101-1',
      floorName: 'Ground Floor',
      floorNumber: 1,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 101 - Floor 2 Units
  {
    unitId: 'unit-201',
    unitNumber: 'A-201',
    unitType: 'APARTMENT',
    area: 1250,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 3400,
    securityDeposit: 3400,
    status: 'OCCUPIED',
    description: 'Corner two-bedroom residence featuring wraparound balcony and expansive ocean horizon views.',
    floor: {
      floorId: 'flr-101-2',
      floorName: 'Second Floor',
      floorNumber: 2,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-202',
    unitNumber: 'A-202',
    unitType: 'ROOM',
    area: 450,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1500,
    securityDeposit: 1500,
    status: 'RESERVED',
    description: 'Private executive suite with dedicated ensuite bath, soundproofed walls, and compact kitchenette.',
    floor: {
      floorId: 'flr-101-2',
      floorName: 'Second Floor',
      floorNumber: 2,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 101 - Floor 3 Units
  {
    unitId: 'unit-301',
    unitNumber: 'A-301',
    unitType: 'APARTMENT',
    area: 1350,
    bedrooms: 3,
    bathrooms: 2,
    monthlyRent: 3900,
    securityDeposit: 3900,
    status: 'OCCUPIED',
    description: 'Three-bedroom family residence with European white oak flooring, walk-in closets, and designer lighting.',
    floor: {
      floorId: 'flr-101-3',
      floorName: 'Third Floor',
      floorNumber: 3,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-302',
    unitNumber: 'A-302',
    unitType: 'APARTMENT',
    area: 900,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 2750,
    securityDeposit: 2750,
    status: 'MAINTENANCE',
    description: 'Modern one-bedroom apartment currently scheduled for preventative HVAC and plumbing valve inspection.',
    floor: {
      floorId: 'flr-101-3',
      floorName: 'Third Floor',
      floorNumber: 3,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 101 - Floor 4 Units
  {
    unitId: 'unit-401',
    unitNumber: 'A-401',
    unitType: 'APARTMENT',
    area: 1800,
    bedrooms: 3,
    bathrooms: 2.5,
    monthlyRent: 5200,
    securityDeposit: 5200,
    status: 'OCCUPIED',
    description: 'Top-tier luxury penthouse featuring private terrace, panoramic glass walls, and gas hearth.',
    floor: {
      floorId: 'flr-101-4',
      floorName: 'Penthouse Level',
      floorNumber: 4,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-402',
    unitNumber: 'A-402',
    unitType: 'APARTMENT',
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 3600,
    securityDeposit: 3600,
    status: 'VACANT',
    description: 'Upper floor two-bedroom apartment with vaulted ceilings and premium custom cabinetry.',
    floor: {
      floorId: 'flr-101-4',
      floorName: 'Penthouse Level',
      floorNumber: 4,
      building: {
        buildingId: 'bld-101',
        buildingName: 'Sunset Palms - Tower Alpha',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 102 - Floor 1 Units
  {
    unitId: 'unit-501',
    unitNumber: 'PE-101',
    unitType: 'APARTMENT',
    area: 1050,
    bedrooms: 2,
    bathrooms: 1.5,
    monthlyRent: 2900,
    securityDeposit: 2900,
    status: 'OCCUPIED',
    description: 'Quiet garden-level residence with landscaped private veranda and private storage locker.',
    floor: {
      floorId: 'flr-102-1',
      floorName: 'Garden Level',
      floorNumber: 1,
      building: {
        buildingId: 'bld-102',
        buildingName: 'Sunset Palms - Pavilion East',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-502',
    unitNumber: 'PE-102',
    unitType: 'ROOM',
    area: 500,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1450,
    securityDeposit: 1450,
    status: 'VACANT',
    description: 'Furnished studio room with private keycard entrance, mini-fridge, and garden view.',
    floor: {
      floorId: 'flr-102-1',
      floorName: 'Garden Level',
      floorNumber: 1,
      building: {
        buildingId: 'bld-102',
        buildingName: 'Sunset Palms - Pavilion East',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 102 - Floor 2 Units
  {
    unitId: 'unit-601',
    unitNumber: 'PE-201',
    unitType: 'APARTMENT',
    area: 1100,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 3100,
    securityDeposit: 3100,
    status: 'OCCUPIED',
    description: 'Bright upper pavilion flat with high vaulted ceilings overlooking the central fountain courtyard.',
    floor: {
      floorId: 'flr-102-2',
      floorName: 'Upper Terrace Level',
      floorNumber: 2,
      building: {
        buildingId: 'bld-102',
        buildingName: 'Sunset Palms - Pavilion East',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },
  {
    unitId: 'unit-602',
    unitNumber: 'PE-202',
    unitType: 'ROOM',
    area: 520,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1550,
    securityDeposit: 1550,
    status: 'RESERVED',
    description: 'Spacious private studio with ensuite bath, built-in shelving, and south-facing windows.',
    floor: {
      floorId: 'flr-102-2',
      floorName: 'Upper Terrace Level',
      floorNumber: 2,
      building: {
        buildingId: 'bld-102',
        buildingName: 'Sunset Palms - Pavilion East',
        property: PROPERTY_REFS['prop-1'],
      },
    },
  },

  // Building 201 - Floor 1 Units
  {
    unitId: 'unit-701',
    unitNumber: 'HO-101',
    unitType: 'APARTMENT',
    area: 1650,
    bedrooms: 3,
    bathrooms: 2.5,
    monthlyRent: 2950,
    securityDeposit: 2950,
    status: 'OCCUPIED',
    description: 'Tri-level modern townhome with quartz island, dual vanities, and direct 2-car garage entry.',
    floor: {
      floorId: 'flr-201-1',
      floorName: 'Level 1 - Courtyard',
      floorNumber: 1,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },
  {
    unitId: 'unit-702',
    unitNumber: 'HO-102',
    unitType: 'APARTMENT',
    area: 1550,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2700,
    securityDeposit: 2700,
    status: 'VACANT',
    description: 'Two-bedroom townhome residence with high ceilings and private fenced garden patio.',
    floor: {
      floorId: 'flr-201-1',
      floorName: 'Level 1 - Courtyard',
      floorNumber: 1,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },

  // Building 201 - Floor 2 Units
  {
    unitId: 'unit-801',
    unitNumber: 'HO-201',
    unitType: 'APARTMENT',
    area: 1750,
    bedrooms: 3,
    bathrooms: 2.5,
    monthlyRent: 3100,
    securityDeposit: 3100,
    status: 'OCCUPIED',
    description: 'Spacious corner townhome with greenbelt trail vistas and custom master walk-in wardrobe.',
    floor: {
      floorId: 'flr-201-2',
      floorName: 'Level 2 - Mid Terrace',
      floorNumber: 2,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },
  {
    unitId: 'unit-802',
    unitNumber: 'HO-202',
    unitType: 'ROOM',
    area: 480,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1400,
    securityDeposit: 1400,
    status: 'OCCUPIED',
    description: 'Independent studio guest suite with keyless entrance and private ensuite bathroom.',
    floor: {
      floorId: 'flr-201-2',
      floorName: 'Level 2 - Mid Terrace',
      floorNumber: 2,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },

  // Building 201 - Floor 3 Units
  {
    unitId: 'unit-901',
    unitNumber: 'HO-301',
    unitType: 'APARTMENT',
    area: 1950,
    bedrooms: 3,
    bathrooms: 3,
    monthlyRent: 3450,
    securityDeposit: 3450,
    status: 'OCCUPIED',
    description: 'Upper-level townhome residence featuring private rooftop sunset viewing terrace.',
    floor: {
      floorId: 'flr-201-3',
      floorName: 'Level 3 - Sky Deck',
      floorNumber: 3,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },
  {
    unitId: 'unit-902',
    unitNumber: 'HO-302',
    unitType: 'APARTMENT',
    area: 1400,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2650,
    securityDeposit: 2650,
    status: 'MAINTENANCE',
    description: 'Two-bedroom residence currently undergoing scheduled hardwood flooring refinishing.',
    floor: {
      floorId: 'flr-201-3',
      floorName: 'Level 3 - Sky Deck',
      floorNumber: 3,
      building: {
        buildingId: 'bld-201',
        buildingName: 'Highland Oaks - North Block',
        property: PROPERTY_REFS['prop-2'],
      },
    },
  },

  // Building 301 - Floor 1 Units
  {
    unitId: 'unit-1001',
    unitNumber: 'GV-101',
    unitType: 'APARTMENT',
    area: 920,
    bedrooms: 1,
    bathrooms: 1.5,
    monthlyRent: 2350,
    securityDeposit: 2000,
    status: 'VACANT',
    description: 'Ground level industrial loft with 14-foot ceiling and commercial steel casement windows.',
    floor: {
      floorId: 'flr-301-1',
      floorName: 'Concourse Level',
      floorNumber: 1,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },
  {
    unitId: 'unit-1002',
    unitNumber: 'GV-102',
    unitType: 'ROOM',
    area: 420,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1350,
    securityDeposit: 1350,
    status: 'OCCUPIED',
    description: 'Compact live-work creative studio with polished concrete floors and exposed structural brick.',
    floor: {
      floorId: 'flr-301-1',
      floorName: 'Concourse Level',
      floorNumber: 1,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },

  // Building 301 - Floor 2 Units
  {
    unitId: 'unit-1101',
    unitNumber: 'GV-201',
    unitType: 'APARTMENT',
    area: 1100,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2650,
    securityDeposit: 2200,
    status: 'OCCUPIED',
    description: 'Mid-rise urban loft with modern stainless steel kitchen island and in-unit laundry closet.',
    floor: {
      floorId: 'flr-301-2',
      floorName: 'Mezzanine Level',
      floorNumber: 2,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },
  {
    unitId: 'unit-1102',
    unitNumber: 'GV-202',
    unitType: 'ROOM',
    area: 460,
    bedrooms: 1,
    bathrooms: 1,
    monthlyRent: 1450,
    securityDeposit: 1450,
    status: 'VACANT',
    description: 'Mezzanine private studio room with full ensuite bath and sound-dampened exterior glazing.',
    floor: {
      floorId: 'flr-301-2',
      floorName: 'Mezzanine Level',
      floorNumber: 2,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },

  // Building 301 - Floor 3 Units
  {
    unitId: 'unit-1201',
    unitNumber: 'GV-301',
    unitType: 'APARTMENT',
    area: 1450,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 3100,
    securityDeposit: 2800,
    status: 'OCCUPIED',
    description: 'Skyline loft with exposed iron trusses, customized lighting, and unobstructed bay vistas.',
    floor: {
      floorId: 'flr-301-3',
      floorName: 'Skyline Level',
      floorNumber: 3,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },
  {
    unitId: 'unit-1202',
    unitNumber: 'GV-302',
    unitType: 'APARTMENT',
    area: 1350,
    bedrooms: 2,
    bathrooms: 2,
    monthlyRent: 2950,
    securityDeposit: 2700,
    status: 'RESERVED',
    description: 'Corner loft apartment with floor-to-ceiling northwest glass and modern open kitchen.',
    floor: {
      floorId: 'flr-301-3',
      floorName: 'Skyline Level',
      floorNumber: 3,
      building: {
        buildingId: 'bld-301',
        buildingName: 'The Grandview - Skyline Tower',
        property: PROPERTY_REFS['prop-3'],
      },
    },
  },
].map((u) => ({
  unitId: u.unitId,
  unitNumber: u.unitNumber,
  unitType: u.unitType,
  area: u.area,
  bedrooms: u.bedrooms,
  bathrooms: u.bathrooms,
  monthlyRent: u.monthlyRent,
  securityDeposit: u.securityDeposit,
  status: u.status,
  description: u.description,
  floorId: u.floorId || u.floor?.floorId,
  floor: u.floor,
}))

// LocalStorage persistence keys
const STORAGE_KEYS = {
  BUILDINGS: 'homesphere_mock_buildings',
  FLOORS: 'homesphere_mock_floors',
  UNITS: 'homesphere_mock_units',
}

// Storage helpers
function loadStorageList(key, fallback) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize records to guarantee backend foreign keys exist
          return parsed.map((item) => {
            if (key === STORAGE_KEYS.BUILDINGS) {
              return {
                ...item,
                propertyId: item.propertyId || item.property?.id || 'prop-1',
              }
            }
            if (key === STORAGE_KEYS.FLOORS) {
              return {
                ...item,
                buildingId: item.buildingId || item.building?.buildingId,
              }
            }
            if (key === STORAGE_KEYS.UNITS) {
              return {
                ...item,
                floorId: item.floorId || item.floor?.floorId,
              }
            }
            return item
          })
        }
      }
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e)
    }
    // Initialize storage with fallback on first access
    try {
      localStorage.setItem(key, JSON.stringify(fallback))
    } catch (e) {
      // Ignore storage quota errors in private browsing
    }
  }
  return [...fallback]
}

function saveStorageList(key, list) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(list))
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e)
    }
  }
}

// ==========================================
// BUILDINGS CRUD
// ==========================================

export function getMockBuildings() {
  return loadStorageList(STORAGE_KEYS.BUILDINGS, MOCK_BUILDINGS)
}

export function getMockBuildingById(buildingId) {
  if (!buildingId) return null
  const list = getMockBuildings()
  return list.find((b) => String(b.buildingId) === String(buildingId)) || null
}

export function getMockBuildingsByPropertyId(propertyId) {
  if (!propertyId) return []
  const list = getMockBuildings()
  return list.filter(
    (b) => String(b.propertyId || b.property?.id) === String(propertyId)
  )
}

export function addMockBuilding(buildingData) {
  const current = getMockBuildings()
  const newBuilding = {
    buildingId: `bld-${Date.now()}`,
    buildingName: String(buildingData.buildingName || '').trim(),
    totalFloors: Number(buildingData.totalFloors) || 1,
    totalUnits: Number(buildingData.totalUnits) || 0,
    description: String(buildingData.description || '').trim(),
    propertyId: buildingData.propertyId || buildingData.property?.id || 'prop-1',
    property: buildingData.property || null,
  }
  const updated = [newBuilding, ...current]
  saveStorageList(STORAGE_KEYS.BUILDINGS, updated)
  return newBuilding
}

export function updateMockBuilding(buildingId, updatedFields) {
  const current = getMockBuildings()
  let updatedBuilding = null

  const updated = current.map((b) => {
    if (String(b.buildingId) === String(buildingId)) {
      updatedBuilding = {
        ...b,
        ...updatedFields,
        propertyId:
          updatedFields.propertyId ||
          updatedFields.property?.id ||
          b.propertyId ||
          b.property?.id,
        totalFloors:
          updatedFields.totalFloors !== undefined
            ? Number(updatedFields.totalFloors)
            : b.totalFloors,
        totalUnits:
          updatedFields.totalUnits !== undefined
            ? Number(updatedFields.totalUnits)
            : b.totalUnits,
        property:
          updatedFields.property !== undefined
            ? updatedFields.property
            : b.property,
      }
      return updatedBuilding
    }
    return b
  })

  saveStorageList(STORAGE_KEYS.BUILDINGS, updated)

  // Cascade building name/property down to floors if updated
  if (updatedBuilding) {
    const floors = getMockFloors()
    const updatedFloors = floors.map((f) => {
      if (String(f.building?.buildingId) === String(buildingId)) {
        return {
          ...f,
          buildingId: updatedBuilding.buildingId,
          building: {
            ...f.building,
            buildingName: updatedBuilding.buildingName,
            property: updatedBuilding.property,
          },
        }
      }
      return f
    })
    saveStorageList(STORAGE_KEYS.FLOORS, updatedFloors)
  }

  return updatedBuilding
}

export function deleteMockBuilding(buildingId) {
  const buildings = getMockBuildings()
  const floors = getMockFloors()
  const units = getMockUnits()

  // Identify floors belonging to this building
  const affectedFloors = floors.filter(
    (f) => String(f.building?.buildingId) === String(buildingId)
  )
  const affectedFloorIds = new Set(affectedFloors.map((f) => String(f.floorId)))

  // Identify units belonging to those floors
  const remainingUnits = units.filter(
    (u) =>
      !affectedFloorIds.has(String(u.floor?.floorId)) &&
      String(u.floor?.building?.buildingId) !== String(buildingId)
  )
  const deletedUnitsCount = units.length - remainingUnits.length

  // Remove floors
  const remainingFloors = floors.filter(
    (f) => String(f.building?.buildingId) !== String(buildingId)
  )
  const deletedFloorsCount = floors.length - remainingFloors.length

  // Remove building
  const remainingBuildings = buildings.filter(
    (b) => String(b.buildingId) !== String(buildingId)
  )

  saveStorageList(STORAGE_KEYS.BUILDINGS, remainingBuildings)
  saveStorageList(STORAGE_KEYS.FLOORS, remainingFloors)
  saveStorageList(STORAGE_KEYS.UNITS, remainingUnits)

  return {
    success: true,
    deletedFloorsCount,
    deletedUnitsCount,
  }
}

// ==========================================
// FLOORS CRUD
// ==========================================

export function getMockFloors() {
  return loadStorageList(STORAGE_KEYS.FLOORS, MOCK_FLOORS)
}

export function getMockFloorsByBuildingId(buildingId) {
  if (!buildingId) return []
  const list = getMockFloors()
  return list.filter((f) => String(f.buildingId || f.building?.buildingId) === String(buildingId))
}

export function getMockFloorById(floorId) {
  if (!floorId) return null
  const list = getMockFloors()
  return list.find((f) => String(f.floorId) === String(floorId)) || null
}

export function addMockFloor(floorData) {
  const current = getMockFloors()
  const newFloor = {
    floorId: `flr-${Date.now()}`,
    floorName: String(floorData.floorName || '').trim(),
    floorNumber: Number(floorData.floorNumber) || 1,
    buildingId: floorData.buildingId || floorData.building?.buildingId,
    building: floorData.building || null,
  }
  const updated = [...current, newFloor]
  saveStorageList(STORAGE_KEYS.FLOORS, updated)

  // Update building's totalFloors count if current count exceeds totalFloors
  const buildingId = floorData.buildingId || floorData.building?.buildingId
  if (buildingId) {
    const building = getMockBuildingById(buildingId)
    const buildingFloors = updated.filter(
      (f) => String(f.buildingId || f.building?.buildingId) === String(buildingId)
    )
    if (building && buildingFloors.length > building.totalFloors) {
      updateMockBuilding(buildingId, { totalFloors: buildingFloors.length })
    }
  }

  return newFloor
}

export function updateMockFloor(floorId, updatedFields) {
  const current = getMockFloors()
  let updatedFloor = null

  const updated = current.map((f) => {
    if (String(f.floorId) === String(floorId)) {
      updatedFloor = {
        ...f,
        ...updatedFields,
        buildingId:
          updatedFields.buildingId ||
          updatedFields.building?.buildingId ||
          f.buildingId ||
          f.building?.buildingId,
        floorNumber:
          updatedFields.floorNumber !== undefined
            ? Number(updatedFields.floorNumber)
            : f.floorNumber,
      }
      return updatedFloor
    }
    return f
  })

  saveStorageList(STORAGE_KEYS.FLOORS, updated)

  // Cascade updated floor name/number to any existing units on this floor
  if (updatedFloor) {
    const units = getMockUnits()
    const updatedUnits = units.map((u) => {
      if (String(u.floorId || u.floor?.floorId) === String(floorId)) {
        return {
          ...u,
          floorId: updatedFloor.floorId,
          floor: {
            ...u.floor,
            floorName: updatedFloor.floorName,
            floorNumber: updatedFloor.floorNumber,
          },
        }
      }
      return u
    })
    saveStorageList(STORAGE_KEYS.UNITS, updatedUnits)
  }

  return updatedFloor
}

export function deleteMockFloor(floorId) {
  const floors = getMockFloors()
  const units = getMockUnits()

  // Remove units on this floor
  const remainingUnits = units.filter((u) => String(u.floorId || u.floor?.floorId) !== String(floorId))
  const deletedUnitsCount = units.length - remainingUnits.length

  // Remove floor
  const targetFloor = floors.find((f) => String(f.floorId) === String(floorId))
  const remainingFloors = floors.filter((f) => String(f.floorId) !== String(floorId))

  saveStorageList(STORAGE_KEYS.FLOORS, remainingFloors)
  saveStorageList(STORAGE_KEYS.UNITS, remainingUnits)

  // Update building's totalFloors if appropriate
  const buildingId = targetFloor?.buildingId || targetFloor?.building?.buildingId
  if (buildingId) {
    const buildingFloors = remainingFloors.filter(
      (f) => String(f.buildingId || f.building?.buildingId) === String(buildingId)
    )
    const building = getMockBuildingById(buildingId)
    if (building && building.totalFloors > buildingFloors.length) {
      updateMockBuilding(buildingId, { totalFloors: Math.max(1, buildingFloors.length) })
    }
  }

  return { success: true, deletedUnitsCount }
}

// ==========================================
// UNITS CRUD
// ==========================================

export function getMockUnits() {
  return loadStorageList(STORAGE_KEYS.UNITS, MOCK_UNITS)
}

export function getMockUnitsByFloorId(floorId) {
  if (!floorId) return []
  const list = getMockUnits()
  return list.filter((u) => String(u.floorId || u.floor?.floorId) === String(floorId))
}

export function getMockUnitsByBuildingId(buildingId) {
  if (!buildingId) return []
  const list = getMockUnits()
  return list.filter(
    (u) => String(u.floor?.building?.buildingId) === String(buildingId)
  )
}

export function getMockUnitById(unitId) {
  if (!unitId) return null
  const list = getMockUnits()
  return list.find((u) => String(u.unitId) === String(unitId)) || null
}

export function addMockUnit(unitData) {
  const current = getMockUnits()
  const newUnit = {
    unitId: `unit-${Date.now()}`,
    unitNumber: String(unitData.unitNumber || '').trim(),
    unitType: unitData.unitType || 'APARTMENT',
    area: Number(unitData.area) || 0,
    bedrooms: Number(unitData.bedrooms) || 0,
    bathrooms: Number(unitData.bathrooms) || 0,
    monthlyRent: Number(unitData.monthlyRent) || 0,
    securityDeposit: Number(unitData.securityDeposit) || 0,
    status: unitData.status || 'VACANT',
    description: String(unitData.description || '').trim(),
    floorId: unitData.floorId || unitData.floor?.floorId,
    floor: unitData.floor || null,
  }

  const updated = [newUnit, ...current]
  saveStorageList(STORAGE_KEYS.UNITS, updated)

  // Update parent building's totalUnits count if appropriate
  const buildingId = unitData.floor?.building?.buildingId
  if (buildingId) {
    const buildingUnits = updated.filter(
      (u) => String(u.floor?.building?.buildingId) === String(buildingId)
    )
    const building = getMockBuildingById(buildingId)
    if (building && buildingUnits.length > building.totalUnits) {
      updateMockBuilding(buildingId, { totalUnits: buildingUnits.length })
    }
  }

  return newUnit
}

export function updateMockUnit(unitId, updatedFields) {
  const current = getMockUnits()
  let updatedUnit = null

  const updated = current.map((u) => {
    if (String(u.unitId) === String(unitId)) {
      updatedUnit = {
        ...u,
        ...updatedFields,
        floorId:
          updatedFields.floorId ||
          updatedFields.floor?.floorId ||
          u.floorId ||
          u.floor?.floorId,
        area:
          updatedFields.area !== undefined ? Number(updatedFields.area) : u.area,
        bedrooms:
          updatedFields.bedrooms !== undefined
            ? Number(updatedFields.bedrooms)
            : u.bedrooms,
        bathrooms:
          updatedFields.bathrooms !== undefined
            ? Number(updatedFields.bathrooms)
            : u.bathrooms,
        monthlyRent:
          updatedFields.monthlyRent !== undefined
            ? Number(updatedFields.monthlyRent)
            : u.monthlyRent,
        securityDeposit:
          updatedFields.securityDeposit !== undefined
            ? Number(updatedFields.securityDeposit)
            : u.securityDeposit,
        // Preserve floor reference intact
        floor: updatedFields.floor || u.floor,
      }
      return updatedUnit
    }
    return u
  })

  saveStorageList(STORAGE_KEYS.UNITS, updated)
  return updatedUnit
}

export function deleteMockUnit(unitId) {
  const units = getMockUnits()
  const target = units.find((u) => String(u.unitId) === String(unitId))
  const updated = units.filter((u) => String(u.unitId) !== String(unitId))
  saveStorageList(STORAGE_KEYS.UNITS, updated)

  // Update building totalUnits if desired
  const buildingId = target?.floor?.building?.buildingId
  if (buildingId) {
    const buildingUnits = updated.filter(
      (u) => String(u.floor?.building?.buildingId) === String(buildingId)
    )
    const building = getMockBuildingById(buildingId)
    if (building && building.totalUnits > buildingUnits.length) {
      updateMockBuilding(buildingId, { totalUnits: buildingUnits.length })
    }
  }

  return true
}

// ==========================================
// TENANT CONTEXT RELATIONSHIP (READ-ONLY)
// ==========================================

/**
 * Resolves the tenant's rented master property ID from mock tenancy records.
 * Hierarchy: Tenant -> Property -> Building -> Floor -> Unit
 * Default: 'prop-1' ("Sunset Palms Luxury Residences", matching Elena Rostova / Unit #302)
 */
export function getTenantAssociatedPropertyId(user) {
  return 'prop-1'
}

/**
 * Returns complete tenant rental context for "My Rental Property" experience.
 * Easily swappable with backend GET /api/tenant/my-rental in the future.
 */
export function getMyRentalProperty(user) {
  const propertyId = getTenantAssociatedPropertyId(user)
  const property = PROPERTY_REFS[propertyId] || PROPERTY_REFS['prop-1']
  const buildings = getMockBuildings().filter(
    (b) => String(b.property?.id) === String(propertyId)
  )

  // Frontend mock association: Elena Rostova / Unit #302 in Tower Alpha (Floor 3)
  const currentUnitId = 'unit-302'
  const currentUnit = getMockUnitById(currentUnitId)
  const currentBuilding = buildings.find((b) => b.buildingId === 'bld-101') || buildings[0]

  return {
    property,
    currentUnitId,
    currentUnit,
    currentBuilding,
    buildings,
    leaseSummary: {
      unitNumber: currentUnit?.unitNumber || 'A-302',
      unitType: currentUnit?.unitType || 'APARTMENT',
      status: 'Active Lease',
      rentAmount: currentUnit?.monthlyRent || 2750,
      depositAmount: currentUnit?.securityDeposit || 2750,
      leaseEndDate: 'July 31, 2027',
      rentDueDay: '1st of the month',
    },
  }
}

/**
 * Returns only the buildings that belong to the tenant's rented property context
 */
export function getMockBuildingsForTenant(user) {
  const targetPropertyId = getTenantAssociatedPropertyId(user)
  const allBuildings = getMockBuildings()
  return allBuildings.filter(
    (b) => String(b.property?.id) === String(targetPropertyId)
  )
}

// ==========================================
// PROPERTY DISCOVERY (VACANT UNITS ONLY)
// ==========================================

/**
 * Returns strictly VACANT units available for rental discovery.
 * Guaranteed to exclude any OCCUPIED, RESERVED, or MAINTENANCE units,
 * and explicitly excludes the tenant's currently occupied unit.
 * Easily swappable with backend GET /api/units/available in the future.
 */
export function getAvailableUnits(user) {
  const myRental = getMyRentalProperty(user)
  const currentUnitId = myRental.currentUnitId

  const allUnits = getMockUnits()
  return allUnits.filter(
    (unit) => unit.status === 'VACANT' && String(unit.unitId) !== String(currentUnitId)
  )
}

/**
 * Returns properties with available inventory for property discovery.
 * Easily swappable with backend GET /api/properties/available in the future.
 */
export function getAvailableProperties(user) {
  const vacantUnits = getAvailableUnits(user)
  const propertiesMap = new Map()

  vacantUnits.forEach((unit) => {
    const prop = unit.floor?.building?.property
    if (!prop) return

    if (!propertiesMap.has(prop.id)) {
      propertiesMap.set(prop.id, {
        property: prop,
        buildingsMap: new Map(),
        availableUnits: [],
      })
    }

    const item = propertiesMap.get(prop.id)
    item.availableUnits.push(unit)

    const bld = unit.floor?.building
    if (bld) {
      if (!item.buildingsMap.has(bld.buildingId)) {
        item.buildingsMap.set(bld.buildingId, {
          buildingId: bld.buildingId,
          buildingName: bld.buildingName,
          totalFloors: bld.totalFloors,
          totalUnits: bld.totalUnits,
          description: bld.description,
          property: prop,
          vacantUnitsCount: 0,
        })
      }
      item.buildingsMap.get(bld.buildingId).vacantUnitsCount += 1
    }
  })

  return Array.from(propertiesMap.values()).map((item) => ({
    property: item.property,
    buildings: Array.from(item.buildingsMap.values()),
    availableUnits: item.availableUnits,
    vacantUnitsCount: item.availableUnits.length,
    minRent: Math.min(...item.availableUnits.map((u) => u.monthlyRent)),
    maxRent: Math.max(...item.availableUnits.map((u) => u.monthlyRent)),
  }))
}
