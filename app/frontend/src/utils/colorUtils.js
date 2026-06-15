export const FASHION_COLORS = {
  'off-white': '#F5F0E8', 'off white': '#F5F0E8', 'cream': '#FFFDD0', 'ivory': '#FFFFF0',
  'ecru': '#C2B280', 'champagne': '#F7E7CE', 'white': '#FFFFFF',
  'light grey': '#D3D3D3', 'light gray': '#D3D3D3', 'grey': '#9E9E9E', 'gray': '#9E9E9E',
  'charcoal': '#36454F', 'dark grey': '#A9A9A9', 'dark gray': '#A9A9A9', 'black': '#1A1A1A',
  'olive green': '#6B7C45', 'army green': '#4B5320', 'forest green': '#2D6A3F',
  'sage': '#87AE73', 'sage green': '#87AE73', 'hunter green': '#355E3B', 'emerald': '#50C878',
  'mint': '#98FF98', 'mint green': '#98FF98', 'olive': '#808000',
  'terracotta': '#E07B54', 'rust': '#B7410E', 'burnt orange': '#CC5500',
  'coral': '#FF7F50', 'salmon': '#FA8072', 'peach': '#FFCBA4',
  'tan': '#D2B48C', 'camel': '#C19A6B', 'sand': '#C2B280', 'beige': '#F5F5DC',
  'nude': '#F2D2BD', 'blush': '#FFB6C1', 'dusty rose': '#DCAE96', 'mauve': '#B784A7',
  'burgundy': '#800020', 'wine': '#722F37', 'maroon': '#800000',
  'navy': '#001F5B', 'navy blue': '#001F5B', 'cobalt': '#0047AB', 'cobalt blue': '#0047AB',
  'sky blue': '#87CEEB', 'light blue': '#ADD8E6', 'denim': '#1560BD', 'teal': '#008080',
  'mustard': '#FFDB58', 'mustard yellow': '#FFDB58', 'yellow': '#FFD700',
  'gold': '#C9A84C', 'golden': '#FFC000', 'khaki': '#C3B091',
  'pink': '#FFC0CB', 'hot pink': '#FF69B4', 'fuchsia': '#FF00FF',
  'purple': '#800080', 'lavender': '#E6E6FA', 'lilac': '#C8A2C8', 'violet': '#EE82EE',
  'red': '#CC0000', 'crimson': '#DC143C', 'cherry': '#DE3163',
  'brown': '#795548', 'chocolate': '#7B3F00', 'mocha': '#7B4F3A', 'cognac': '#9F4520',
  'silver': '#C0C0C0', 'metallic': '#AAA9AD', 'copper': '#B87333',
}

export function resolveColor(color) {
  return FASHION_COLORS[color.toLowerCase().trim()] || color
}
