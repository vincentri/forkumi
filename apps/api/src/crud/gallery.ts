import { defineCRUD } from '@repo/crud'

export const GalleryCRUD = defineCRUD({
  model: 'gallery',
  label: 'Gallery',
  navGroup: 'Content',
  maxRecords: 5,
  fields: [
    { name: 'image', type: 'image', label: 'Image', required: true },
    { name: 'position', type: 'number', label: 'Position' }
  ],
})
