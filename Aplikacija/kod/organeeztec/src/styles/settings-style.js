import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const settings_style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    backgroundColor: colorTheme.black,
    alignItems: "center",
  },
  button: {
    backgroundColor: colorTheme.primary_color,
  },
  registerBtn: {
    textDecorationLine: "underline",
    color: colorTheme.highlight_text_color,
  },
  text: {
    color: colorTheme.primary_text_color,
  },
  btnText: {
    color: colorTheme.primary_text_color,
  },
  disabledBtn: {},
  disabledText: {},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
