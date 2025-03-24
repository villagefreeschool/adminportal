import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColorOptions {
    dark?: string;
    light?: string;
  }

  interface Palette {
    green: Palette['primary'];
    brown: Palette['primary'];
  }

  interface PaletteOptions {
    green?: PaletteOptions['primary'];
    brown?: PaletteOptions['primary'];
  }
}
