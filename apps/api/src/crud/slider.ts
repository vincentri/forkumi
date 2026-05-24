import { defineCRUD } from '@repo/crud'

export const SliderCRUD = defineCRUD({
  model: 'slider',
  label: 'Sliders',
  navGroup: 'Content',
  fields: [
    { name: 'legend', type: 'text', label: 'Legend' },
    { name: 'title', type: 'text', label: 'Title', required: true },
    { name: 'description', type: 'text', label: 'Description', required: true },
    { name: 'image', type: 'image', label: 'Image', required: true, showInTable: true },
    { name: 'action', type: 'text', label: 'Action' },
    { name: 'actionurl', type: 'url', label: 'Action Url' },
    { name: 'position', type: 'number', label: 'Position' }
  ],
})
