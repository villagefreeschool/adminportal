import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface PaletteColorOptions {
    900?: string;
    800?: string;
    700?: string;
    500?: string;
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
