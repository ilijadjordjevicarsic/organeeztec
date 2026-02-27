import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const main_style = StyleSheet.create({
  menubar: {
    flex: 1,
    height: "100%",
    backgroundColor: colorTheme.secondary_color,
  },
  mainpage: {
    flex: 5,
    height: "100%",
    backgroundColor: colorTheme.white,
  },
  menuitem: {
    flex: 1,
    backgroundColor: colorTheme.secondary_color,
  },
  menuitemselected: {
    flex: 1,
    backgroundColor: colorTheme.secondary_color,
  },
  text: {
    color: colorTheme.primary_text_color,
  },
  statusbar: {
    flex: 1,
    color: colorTheme.primary_color,
  },
});

