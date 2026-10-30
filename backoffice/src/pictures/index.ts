// The back office's own invented pictures (copies of the stories' flat illustrations, of no real person or place),
// for ideas and project images. Vite bundles each file and hands back its URL.
export const PICTURES = {
  park: new URL('./park.svg', import.meta.url).href,
  streetTrees: new URL('./street-trees.svg', import.meta.url).href,
  bikeLane: new URL('./bike-lane.svg', import.meta.url).href,
  mural: new URL('./mural.svg', import.meta.url).href,
  library: new URL('./library.svg', import.meta.url).href,
  lights: new URL('./lights.svg', import.meta.url).href
};
