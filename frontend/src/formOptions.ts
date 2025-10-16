// ============================================
// CUISINE OPTIONS
// ============================================
// Based on Google Places API supported cuisine types
// Reference:
// https://developers.google.com/maps/documentation/places/web-service/supported_types

export const CUISINE_OPTIONS = [
  "American",
  "Australian", // Added for Modern Australian
  "Brazilian",
  "Caribbean",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Lebanese", // Added - popular globally
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Peruvian", // Added - distinct South American
  "Spanish",
  "Thai",
  "Turkish",
  "Vietnamese",
  "African",
  "Other",
] as const;

// TypeScript type derived from the array (ensures type safety)
export type CuisineOption = (typeof CUISINE_OPTIONS)[number];

// ============================================
// DIETARY RESTRICTIONS
// ============================================
// Common dietary restrictions - user can select multiple + add notes

export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Egg allergy", // Added
  "Nut allergy",
  "Shellfish allergy",
  "Low FODMAP", // Added
  "Halal",
  "Kosher",
] as const;

export type DietaryRestriction = (typeof DIETARY_RESTRICTIONS)[number];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combines dietary restriction checkboxes and additional notes into a single string
 * for backend storage
 *
 * @param checkboxes - Array of selected dietary restrictions
 * @param notes - Additional notes from free text field
 * @returns Formatted string for database storage
 *
 * @example
 * combineDietaryInfo(['Vegetarian', 'Gluten-free'], 'No shellfish')
 * // Returns: "Vegetarian, Gluten-free. Additional notes: No shellfish"
 */
export function combineDietaryInfo(
  checkboxes: string[],
  notes: string
): string | null {
  const checkboxPart = checkboxes.join(", ");
  const notesPart = notes.trim() ? `Additional notes: ${notes.trim()}` : "";

  if (!checkboxPart && !notesPart) {
    return null; // Nothing selected or entered
  }

  if (checkboxPart && notesPart) {
    return `${checkboxPart}. ${notesPart}`;
  }

  return checkboxPart || notesPart;
}
