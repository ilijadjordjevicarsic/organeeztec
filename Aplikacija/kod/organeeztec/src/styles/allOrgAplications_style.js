import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";

export const allOrgAplications_style = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 20,
  },
  listItem: {
     alignSelf: "flex-start", 
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
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
    alignSelf: "center",
  },
});
