// src/lib/blurPlaceholder.ts

/**
 * Static gray placeholder blur data URL for movie posters
 * This is a 1x1 pixel gray base64 image that serves as a placeholder
 * when blurhash is not available
 */
export const STATIC_BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * Generate a color-based blur placeholder from movie poster
 * Uses the movie's vote_average to create a color gradient
 * @param voteAverage - TMDB vote average (0-10)
 * @returns Blur placeholder string
 */
export function generateBlurPlaceholder(voteAverage: number): string {
  // Generate a color based on rating
  // Low ratings = red/orange, High ratings = green/blue
  const normalizedRating = Math.min(Math.max(voteAverage / 10, 0), 1);
  
  let r, g, b;
  
  if (normalizedRating < 0.5) {
    // Red to yellow
    const t = normalizedRating * 2;
    r = 255;
    g = Math.round(200 * t);
    b = Math.round(100 * t);
  } else {
    // Yellow to green/blue
    const t = (normalizedRating - 0.5) * 2;
    r = Math.round(255 * (1 - t * 0.5));
    g = Math.round(200 + 55 * t);
    b = Math.round(100 + 155 * t);
  }

  // Create a simple SVG data URL as placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3">
      <rect width="2" height="3" fill="rgb(${r},${g},${b})"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString('base64')}`;
}

/**
 * Get the appropriate blur placeholder for a movie
 * @param voteAverage - TMDB vote average
 * @param hasPoster - Whether the movie has a poster
 */
export function getBlurPlaceholder(voteAverage: number, hasPoster: boolean): string {
  if (!hasPoster) {
    return STATIC_BLUR_PLACEHOLDER;
  }
  return generateBlurPlaceholder(voteAverage);
}
