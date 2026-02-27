import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const modal_style = StyleSheet.create({
  modal: {
    margin: 40,
    width: "80%",
    height: "80%",
    minHeight: "80%",
    backgroundColor: colorTheme.ultralight_primary_color,
    borderRadius: 60,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    
  },
  title: {
    margin: "3%",
    color: colorTheme.title
  },
  inputpart: {
    flex: 1,
    width: "100%"
  },
  texttitle: {
    flex: 1,
    width: "100%",
    marginBottom: "5%",
    marginTop: "3%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: colorTheme.border,
    backgroundColor: colorTheme.ultralight_secondary_color,
    textAlign: "center"
  },
  textdescription: {
    width: "100%",
    flex: 8,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: colorTheme.border,
    backgroundColor: colorTheme.ultralight_secondary_color,
    // textAlign: "left"
  },
  icon: {
    padding: 10,
    margin: 10,
    alignSelf:'flex-start'
  },
  button: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: colorTheme.button

  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});
