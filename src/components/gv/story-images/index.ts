// Invented pictures for the stories: flat illustrations of no real person or place. Vite bundles each file and
// hands back its URL.
export const PICTURES = {
  park: new URL('./park.svg', import.meta.url).href,
  streetTrees: new URL('./street-trees.svg', import.meta.url).href,
  bikeLane: new URL('./bike-lane.svg', import.meta.url).href,
  mural: new URL('./mural.svg', import.meta.url).href,
  library: new URL('./library.svg', import.meta.url).href,
  lights: new URL('./lights.svg', import.meta.url).href
};

export const PORTRAITS = [
  new URL('./person-1.svg', import.meta.url).href,
  new URL('./person-2.svg', import.meta.url).href,
  new URL('./person-3.svg', import.meta.url).href,
  new URL('./person-4.svg', import.meta.url).href
];
