import { StyleSheet, StatusBar, Dimensions } from "react-native";
import { colorTheme } from "./color_constants";
export const bordAplicant_style = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    backgroundColor: colorTheme.primary_color + "44",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "100%",
    minHeight: "100%",
    paddingBottom: 100,
  },
  
  title:{
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 50,
  },

  radioButtonContainer: {
    // width: "25%",
    alignItems: 'center'
  },

  labela: {
    // marginTop: 40,
    fontSize: 18,
    fontWeight: '500',
    textAlignVertical: 'center',
    textAlign: 'center'
  },
  labelaMotPismo: {
    fontWeight: '500',
    fontSize: 24,
    marginTop: 40,
  },

  input: {
    flex: 1,
    height: 200,
    margin: 12,
    borderRadius: 10,
    padding: 20,
    minWidth: "90%",
    borderWidth: 2,
    borderColor: colorTheme.secondary_color,
    backgroundColor: colorTheme.light_primary_color + "66",
    textAlignVertical: "top",
    fontSize: 16,
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colorTheme.secondary_color,
    backgroundColor: "#ffffff55",
    padding: 20,
    minWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 10,
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    padding: 20,
    borderRadius: 20,
    // marginHorizontal: 30,
    minWidth: "50%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    marginVertical: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },
});
