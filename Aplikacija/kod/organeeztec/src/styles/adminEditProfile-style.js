import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminEditProfile_style = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 15,
    borderColor: colorTheme.button + "cc",
    borderRadius: 30,
  },
  innerContainer: {
    padding: 20,
    flexGrow: 1,
    alignItems: "center",
  },
  positionsContainer: {
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  memberImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  memberInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  noImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  label: {
    marginTop: 30,
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
  },
  podatak: {
    marginTop: 10,
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
    color: colorTheme.primary_color,
  },
  roleIndicator: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  button: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: colorTheme.button + "99",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
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
  },
  modalText: {
    textAlign: "center",
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
});
