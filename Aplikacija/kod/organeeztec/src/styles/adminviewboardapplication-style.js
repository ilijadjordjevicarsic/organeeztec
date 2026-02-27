import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminviewboardapplication_style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    borderWidth: 15,
    borderColor: colorTheme.button + "cc",
    borderRadius: 30,
  },
  label: {
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
  buttonpass: {
    width: 200,
    backgroundColor: colorTheme.button,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
  },
  podatak: {
    fontSize: 16,
    marginBottom: 5,
    marginRight: 5,
    color: colorTheme.primary_color,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttonmodal: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: colorTheme.button + "99",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
});
