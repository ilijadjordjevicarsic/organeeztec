import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminupdateevent_style = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownMembers: {
    flex: 4,
    paddingVertical: "5%",
    height: "5%",
    width: "80%",
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 0,
    paddingHorizontal: "3%",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 50,
  },
  container: {
    flex: 1,
    padding: 20,

    justifyContent: "center",
  },
  contentContainer: {
    flex: 0.9,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,

    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colorTheme.light_primary_color,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  teamLabel: {
    flex: 1,
    marginLeft: 10,
  },
  positionLabel: {
    flex: 1,
    marginLeft: 10,
  },
  dropdownMembers: {
    flex: 1,
    marginLeft: 10,
    borderColor: colorTheme.light_primary_color,
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonContainer: {
    flex: 0.1,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    flex: 1,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
});
