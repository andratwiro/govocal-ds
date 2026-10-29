// Vite's `?url` import (the MapLibre worker's address, in maplibre.ts): the file is emitted as it is and the import
// gives its URL. tsconfig loads no Vite client types, so the one shape used is declared here.
declare module '*?url' {
  const url: string;
  export default url;
}
