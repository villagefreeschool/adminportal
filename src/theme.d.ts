import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteColorOptions {
    dark?: string;
    light?: string;
    500?: string;
    700?: string;
    800?: string;
    900?: string;
  }

  interface PaletteColor {
    500: string;
    700: string;
    800: string;
    900: string;
  }

  interface Palette {
    green: Palette["primary"];
    brown: Palette["primary"];
  }

  interface PaletteOptions {
    green?: PaletteOptions["primary"];
    brown?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    "body-md": true;
    "body-sm": true;
    body1: false;
    body2: false;
  }
}
