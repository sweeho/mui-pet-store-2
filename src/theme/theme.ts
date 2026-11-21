import { createTheme, type ThemeOptions } from "@mui/material/styles";

import tokens from "../../design/tokens.mui.json";

/**
 * The one MUI theme. Its colours, type and shape come from design/tokens.mui.json, so a design
 * system changes the look by replacing that file, not this one.
 */
export const theme = createTheme({
  palette: tokens.palette as ThemeOptions["palette"],
  typography: tokens.typography as ThemeOptions["typography"],
  shape: tokens.shape,
});
