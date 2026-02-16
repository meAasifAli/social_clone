/**
 * Array of pleasant, aesthetic colors for posts
 * These are carefully chosen to be easy on the eyes and work well with text
 */
const POST_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEAA7', // Cream Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Sunflower
  '#BB8FCE', // Lavender
  '#F1948A', // Salmon
  '#85C1E2', // Light Blue
  '#F0B27A', // Peach
  '#C39BD3', // Purple
  '#7DCEA0', // Sea Green
  '#F5B7B1', // Pink
  '#AED6F1', // Powder Blue
  '#F9E79F', // Vanilla
  '#D7BDE2', // Lilac
  '#A9DFBF', // Light Mint
  '#FAD7A0', // Apricot
];

/**
 * Generates a random color from the predefined palette
 * @returns {string} Hex color code
 */
export function generateRandomPostColor(): string {
  const randomIndex = Math.floor(Math.random() * POST_COLORS.length);
  return POST_COLORS[randomIndex];
}

/**
 * Alternative: Generates a completely random hex color
 * @returns {string} Random hex color code
 */
export function generateRandomHexColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generates a pastel color (softer, lighter)
 * @returns {string} Pastel hex color code
 */
export function generatePastelColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
  const lightness = 80 + Math.floor(Math.random() * 15); // 80-95%

  return hslToHex(hue, saturation, lightness);
}

/**
 * Converts HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Determines if text should be white or black based on background color
 * @param hexColor Background color in hex
 * @returns {string} 'white' or 'black' for optimal contrast
 */
export function getContrastText(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
