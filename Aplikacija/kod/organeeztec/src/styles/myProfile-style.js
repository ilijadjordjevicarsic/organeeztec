import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const myProfile_style = StyleSheet.create({
  // label: {
  //   textAlign: "center",
  // },

  container: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },

  avatar: {
    marginTop: 10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 24,
    fontWeight: '500',
    marginVertical: 30,
  },

  profileImage: {
    borderRadius: 60,
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },

  button: {
    backgroundColor: colorTheme.button + "99",
    padding: 20,
    borderRadius: 30,
    marginHorizontal: 30,
    marginVertical: 10,
    minWidth: "85%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },

  input: {
    height: 60,
    // margin: 12,
    // borderRadius: 10,
    // padding: 10,
    // width: "70%",
    // backgroundColor: colorTheme.light_primary_color,
    borderWidth: 2,
    borderColor: colorTheme.light_primary_color + "aa",
    padding: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    minWidth: "90%",
    marginTop: 5,
    fontSize: 14,
    fontWeight: '400',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },

  label: {
    textAlign: 'center',
    fontSize: 24,
    paddingVertical: 20,
    fontWeight: '500'
  },

  titleModal:{
    textAlign: 'center',
    fontSize: 26,
    paddingBottom: 60,
    fontWeight: '600',
  },

  labelPassChange: {
    textAlign: 'center',
    fontSize: 18,
    color: "#000000bb",
    paddingVertical: 5,
    fontWeight: '500'
  },

  buttonpass: {
    width: 200,
    backgroundColor: colorTheme.button,
    marginTop: 20,
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
    paddingVertical: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 30,
  },

});
