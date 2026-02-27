import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const admin_style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    
  },
  button: {
    width: 350,
    backgroundColor: colorTheme.button + "99" ,
    textAlign: "center",
    height: 40,
    marginHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    padding: 5,
    minWidth: "85%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: '600',
  },
  title:{
    paddingTop: 30,
    fontSize: 20,
    alignSelf: "center"
  }
});
