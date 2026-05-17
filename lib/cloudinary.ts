/**
 * Inject Cloudinary transformations into an image URL.
 * Only modifies res.cloudinary.com URLs — passes others through unchanged.
 */
export function clImg(url: string, transforms = 'w_1200,q_auto,f_auto'): string {
  if (!url.includes('res.cloudinary.com/')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}
