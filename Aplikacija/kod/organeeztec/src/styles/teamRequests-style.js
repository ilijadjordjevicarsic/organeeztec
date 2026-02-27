import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";

export const teamRequests_style = StyleSheet.create({
  container: { 
    flex: 1,
    padding:20,
   },
  listItem: 
  { alignSelf: "flex-start",
   padding: "4%" 
  },
  itemContainer: {
    flexDirection: "column",
    height: "100%",
    alignItems: "center",
  },
  date: {
    flex: 0.2,
    fontStyle: "italic",
    color: "#808080",
  },
  user: {
    justifyContent: "center",
    flex: 0.8,
    alignSelf: "flex-start",
    marginHorizontal: 7,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
    alignSelf: "center",
  },
  button: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: colorTheme.button + "99",
    padding:10,
    marginHorizontal: 5,
    borderRadius: 30,
  
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttons: {
    flexDirection: "row",
    
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
});
