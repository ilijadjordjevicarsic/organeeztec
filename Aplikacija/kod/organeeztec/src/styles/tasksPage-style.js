import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";
import { getMediaLibraryPermissionsAsync } from "expo-image-picker";

export const tasksPage = StyleSheet.create({
  taskspage: {
    flex: 1,
    flexDirection: "column",
    marginBottom: "9%",
    paddingBottom: "9%",
  },
  scrollView: {
    height: "100%",
  },
  navButtonsContainer: {
    flex: 0.05,
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 1,
    minHeight: "10%",
    alignItems: "center",
  },
  navButton: {
    flex: 1,
    backgroundColor: "#ddd",
    alignSelf: "center",
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f3f3f3",
  },
  navButtonText: {
    textAlign: "center",
  },

  titleview: {
    //   borderBottomColor: "gray",
    //   borderBottomWidth: 2,
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10%",
  },
  title: {
    color: colorTheme.primary_text_color,
    padding: 25,
  },
  button: {
    backgroundColor: colorTheme.light_secondary_color,
    padding: 15,
    marginTop: 15,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  tasks: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,

    marginTop: 10,
    alignSelf: "center",
    padding: 20,
  },
});
