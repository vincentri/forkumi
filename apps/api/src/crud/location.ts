import { defineCRUD } from '@repo/crud'

export const LocationCRUD = defineCRUD({
  model: 'location',
  label: 'Locations',
  navGroup: 'Content',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'location', type: 'text', label: 'Location', required: true },
    { name: 'location_url', type: 'url', label: 'Location Url (Google Maps URL)', required: true },
    { name: 'phone_number', type: 'text', label: 'Phone Number' },
    { name: 'position', type: 'number', label: 'Position' }
  ],
})
