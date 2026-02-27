import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const login_style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colorTheme.light_primary_color,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: 250,
    marginTop: 15,
  },
  button: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: colorTheme.button + "99",
    minWidth: "40%",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    marginTop: 60,
  },
  registerBtn: {
    textDecorationLine: "underline",
    color: colorTheme.primary_color,
    marginTop: 20,
    fontSize: 18,
  },
  text: {
    color: colorTheme.primary_text_color,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
  },
  disabledBtn: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "lightgrey",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "grey" ,
    marginTop: 60,
    minWidth: "40%",
  },
  disabledText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
});
