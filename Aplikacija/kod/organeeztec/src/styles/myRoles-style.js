import { StyleSheet, StatusBar } from "react-native";
import { colorTheme } from "./color_constants";

export const myRoles_style = StyleSheet.create({
  title:{
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 50,
  },
  boxTitle: {
    fontSize: 20,
    fontWeight: '500',
    paddingBottom: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  container: {
    // backgroundColor: colorTheme.ultralight_primary_color,
    // paddingVertical: 40,
    // paddingHorizontal: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    padding: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  team: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  teamContainer: {
    borderBottomWidth: 1,
    alignContent: 'center',
    // alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 10,
    marginRight: 7,
    fontSize: 16,
    textAlign: 'center'
  },
  textcontainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    padding: 10,
    borderRadius: 30,
    // marginHorizontal: 30,
    minWidth: "35%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },

  modalText:{
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginVertical: 10
  },
});
