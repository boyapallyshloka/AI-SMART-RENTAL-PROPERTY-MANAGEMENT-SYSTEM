/**
 * Realistic Mock Data and Storage Helpers for HomeSphere Owner Properties
 */

const STORAGE_KEY = 'homesphere_owner_properties'

export const PROPERTY_TYPES = [
  'Apartment',
  'Condominium',
  'Townhouse',
  'Single Family',
  'Loft',
]

export const FURNISHING_OPTIONS = [
  'Furnished',
  'Semi-Furnished',
  'Unfurnished',
]

export const PARKING_OPTIONS = [
  'Garage',
  'Covered',
  'Street',
  'None',
]

export const STATUS_OPTIONS = [
  'Available',
  'Occupied',
  'Pending',
]

export const AMENITIES_LIST = [
  'High-speed Wi-Fi',
  'Swimming Pool',
  'Fitness Center',
  'In-unit Laundry',
  'Central AC',
  'Pet Friendly',
  'Balcony / Patio',
  'EV Charging Station',
  '24/7 Security Concierge',
  'Rooftop Lounge',
  'Smart Thermostat',
  'Dishwasher',
]

export const INITIAL_PROPERTIES = [
  {
    id: 'prop-1',
    name: 'Sunset Palms Luxury Residences',
    type: 'Apartment',
    address: '420 Ocean Boulevard',
    city: 'Santa Monica',
    state: 'CA',
    zipCode: '90401',
    bedrooms: 2,
    bathrooms: 2,
    area: 1250,
    furnishing: 'Furnished',
    parking: 'Garage',
    monthlyRent: 3400,
    deposit: 3400,
    totalUnits: 24,
    occupiedUnits: 22,
    status: 'Occupied',
    amenities: [
      'Swimming Pool',
      'Fitness Center',
      'In-unit Laundry',
      'Central AC',
      'High-speed Wi-Fi',
      'Pet Friendly',
      'Balcony / Patio',
      'EV Charging Station',
    ],
    description:
      'Premier oceanfront residential complex featuring floor-to-ceiling glass, private balconies with Pacific ocean views, stainless steel Bosch appliances, and smart home climate controls.',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-01-15',
  },
  {
    id: 'prop-2',
    name: 'Highland Oaks Modern Townhomes',
    type: 'Townhouse',
    address: '1850 Oak Creek Parkway',
    city: 'Austin',
    state: 'TX',
    zipCode: '78704',
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1850,
    furnishing: 'Semi-Furnished',
    parking: 'Garage',
    monthlyRent: 2950,
    deposit: 2950,
    totalUnits: 12,
    occupiedUnits: 12,
    status: 'Occupied',
    amenities: [
      'In-unit Laundry',
      'Central AC',
      'Pet Friendly',
      'Balcony / Patio',
      'Smart Thermostat',
      'Dishwasher',
    ],
    description:
      'Spacious tri-level architectural townhomes in South Congress. Features private 2-car attached garages, quartz countertops, designer lighting, and fenced private yards.',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-02-01',
  },
  {
    id: 'prop-3',
    name: 'The Grandview Skyline Lofts',
    type: 'Loft',
    address: '810 Industrial Way #500',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98104',
    bedrooms: 1,
    bathrooms: 1.5,
    area: 980,
    furnishing: 'Furnished',
    parking: 'Covered',
    monthlyRent: 2450,
    deposit: 2000,
    totalUnits: 16,
    occupiedUnits: 11,
    status: 'Available',
    amenities: [
      'High-speed Wi-Fi',
      'Fitness Center',
      'Central AC',
      'Rooftop Lounge',
      '24/7 Security Concierge',
      'Dishwasher',
    ],
    description:
      'Industrial-chic urban lofts boasting 14-foot exposed concrete ceilings, polished concrete floors, custom steel windows, and a panoramic community rooftop terrace overlooking the bay.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-02-18',
  },
  {
    id: 'prop-4',
    name: 'Harborview Bayfront Condos',
    type: 'Condominium',
    address: '120 Biscayne Boulevard',
    city: 'Miami',
    state: 'FL',
    zipCode: '33132',
    bedrooms: 2,
    bathrooms: 2,
    area: 1400,
    furnishing: 'Unfurnished',
    parking: 'Covered',
    monthlyRent: 3900,
    deposit: 4000,
    totalUnits: 18,
    occupiedUnits: 15,
    status: 'Pending',
    amenities: [
      'Swimming Pool',
      'Fitness Center',
      'In-unit Laundry',
      'Central AC',
      'Balcony / Patio',
      '24/7 Security Concierge',
      'EV Charging Station',
    ],
    description:
      'Waterfront luxury high-rise condominium with wraparound private balconies, marble bath finishes, Sub-Zero refrigeration, and infinity pool deck with cabanas.',
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-03-05',
  },
  {
    id: 'prop-5',
    name: 'Pinecrest Mountain Villa',
    type: 'Single Family',
    address: '742 Evergreen Ridge Road',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    bedrooms: 4,
    bathrooms: 3.5,
    area: 2750,
    furnishing: 'Unfurnished',
    parking: 'Garage',
    monthlyRent: 4600,
    deposit: 5000,
    totalUnits: 1,
    occupiedUnits: 1,
    status: 'Occupied',
    amenities: [
      'In-unit Laundry',
      'Central AC',
      'Pet Friendly',
      'Balcony / Patio',
      'Smart Thermostat',
      'Dishwasher',
      'Garage',
    ],
    description:
      'Magnificent single-family craftsman home with expansive cedar deck, gas fireplace, dual master suites, private heated garage, and mature pine tree landscaping.',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-03-12',
  },
  {
    id: 'prop-6',
    name: 'Metro Center Executive Suites',
    type: 'Apartment',
    address: '350 North Michigan Avenue',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    furnishing: 'Furnished',
    parking: 'Covered',
    monthlyRent: 2850,
    deposit: 2850,
    totalUnits: 30,
    occupiedUnits: 25,
    status: 'Available',
    amenities: [
      'High-speed Wi-Fi',
      'Fitness Center',
      'Central AC',
      'Rooftop Lounge',
      '24/7 Security Concierge',
      'EV Charging Station',
    ],
    description:
      'Prime downtown Chicago apartment tower steps from the Magnificent Mile. Includes concierge services, co-working resident library, and state-of-the-art fitness center.',
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: '2026-03-20',
  },
]

/**
 * Retrieve all properties from localStorage or seed initial data
 */
export function getMockProperties() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read properties from localStorage', e)
  }

  // Seed default data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES))
  } catch (e) {}
  return INITIAL_PROPERTIES
}

/**
 * Retrieve a single property by ID
 */
export function getMockPropertyById(id) {
  const all = getMockProperties()
  return all.find((p) => String(p.id) === String(id)) || null
}

/**
 * Add a new property to mock storage
 */
export function addMockProperty(newProperty) {
  const current = getMockProperties()
  const created = {
    ...newProperty,
    id: `prop-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    totalUnits: Number(newProperty.totalUnits) || 1,
    occupiedUnits: Number(newProperty.occupiedUnits) || 0,
    monthlyRent: Number(newProperty.monthlyRent) || 0,
    deposit: Number(newProperty.deposit) || 0,
    bedrooms: Number(newProperty.bedrooms) || 1,
    bathrooms: Number(newProperty.bathrooms) || 1,
    area: Number(newProperty.area) || 0,
    amenities: Array.isArray(newProperty.amenities) ? newProperty.amenities : [],
    images:
      Array.isArray(newProperty.images) && newProperty.images.length > 0
        ? newProperty.images
        : [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
          ],
  }

  const updatedList = [created, ...current]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (e) {
    console.error('Failed to save added property', e)
  }
  return created
}

/**
 * Update an existing property in mock storage
 */
export function updateMockProperty(id, updatedFields) {
  const current = getMockProperties()
  let updatedItem = null

  const updatedList = current.map((item) => {
    if (String(item.id) === String(id)) {
      updatedItem = {
        ...item,
        ...updatedFields,
        totalUnits:
          updatedFields.totalUnits !== undefined
            ? Number(updatedFields.totalUnits)
            : item.totalUnits,
        occupiedUnits:
          updatedFields.occupiedUnits !== undefined
            ? Number(updatedFields.occupiedUnits)
            : item.occupiedUnits,
        monthlyRent:
          updatedFields.monthlyRent !== undefined
            ? Number(updatedFields.monthlyRent)
            : item.monthlyRent,
        deposit:
          updatedFields.deposit !== undefined
            ? Number(updatedFields.deposit)
            : item.deposit,
        bedrooms:
          updatedFields.bedrooms !== undefined
            ? Number(updatedFields.bedrooms)
            : item.bedrooms,
        bathrooms:
          updatedFields.bathrooms !== undefined
            ? Number(updatedFields.bathrooms)
            : item.bathrooms,
        area:
          updatedFields.area !== undefined
            ? Number(updatedFields.area)
            : item.area,
        images:
          Array.isArray(updatedFields.images) && updatedFields.images.length > 0
            ? updatedFields.images
            : item.images,
      }
      return updatedItem
    }
    return item
  })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (e) {
    console.error('Failed to update property', e)
  }
  return updatedItem
}

/**
 * Delete a property from mock storage
 */
export function deleteMockProperty(id) {
  const current = getMockProperties()
  const updatedList = current.filter((p) => String(p.id) !== String(id))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (e) {
    console.error('Failed to delete property', e)
  }
  return true
}
