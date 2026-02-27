import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminnewevent_style = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderRadius: 10,
    padding: 10,
    width: "70%",
    backgroundColor: colorTheme.light_primary_color,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
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
  infoinput: {
    height: 200,
    margin: 12,
    borderRadius: 10,
    padding: 10,
    width: "70%",
    backgroundColor: colorTheme.light_primary_color,
    textAlignVertical: "top",
  },
  container: {
    flex: 1,
    padding: 20,

    justifyContent: "center",
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
    width: 250,
  },
  teamLabel: {
    flex: 1,
    marginLeft: 10,
  },
  positionLabel: {
    flex: 1,
    marginLeft: 10,
  },

  buttonContainer: {
    flex: 0.1,
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    flex: 1,
    margin: 10,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 5,
  },
  buttonTextmodal: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  buttonmodal: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    margin: 5,
    height: 45,
  },
});
