import { Button } from "@react-native-material/core";
import { StyleSheet, StatusBar, Dimensions } from "react-native";
import { colorTheme } from "./color_constants";
const windowWidth = Dimensions.get("window").width;

const windowHeight = Dimensions.get("window").height;
export const updateProfile_style = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollview: {
    flex: 1,
    width: windowWidth,
  },
  scrollviewContainerStyle: {
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 30,
  },
  input: {
    height: 60,
    borderWidth: 2,
    borderColor: colorTheme.light_primary_color + "aa",
    padding: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 20,
    width: "80%",
    marginTop: 15,
    fontSize: 14,
    fontWeight: '400',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  cvContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 60,
  },
  cvText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 30,
  },
  addButton: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: colorTheme.primary_color,
    backgroundColor: colorTheme.button + "aa",
    marginBottom: 40,
    marginTop: 40,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    textAlign: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    padding: 15,
    borderRadius: 30,
    // marginHorizontal: 30,
    minWidth: "35%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    justifyContent: 'center'
  }, 

  profileImage: { 
    borderRadius: 100, 
    width: 145, 
    height: 145,
  },
  
  required: {
    color: colorTheme.primary_color,
  },
  updateButton: {
    backgroundColor: colorTheme.button + "dd",
    padding: 15,
    borderRadius: 30,
    minWidth: "35%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    justifyContent: 'center',
    minWidth: '85%',
    marginTop: 10
  },
  updateButtonContainer: {
    marginBottom: 20,
  }
});
