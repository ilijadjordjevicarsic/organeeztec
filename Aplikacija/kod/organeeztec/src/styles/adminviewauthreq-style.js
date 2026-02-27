import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminviewauthreq_style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    borderWidth: 15,
    borderColor: colorTheme.button + "cc",
    borderRadius: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    flex:1,
    flexWrap: 'wrap',
    justifyContent: "center",
  },
  info: {
    flex: 0.8,
    padding: "5%",
    marginBottom: 20,
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    flex: 0.2,
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    textAlign: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: colorTheme.button + "99",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    flex: 1,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  deleteButton: {
    flex: 1,
  },
  profileImage: {
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
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
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colorTheme.light_primary_color,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: 250,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "600",
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
    flexWrap: 'wrap',
    
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
