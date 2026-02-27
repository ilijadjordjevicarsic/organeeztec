import { color } from "react-native-reanimated";
import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";

export const addTask = StyleSheet.create({
  pageContainer: {
    //flex: 1,
    flexDirection: "column",
  },
  //Poeni i timovi
  pointsAndTeams: {
    margin: "3%",
    flex: 1,
    flexDirection: "column",
    //backgroundColor: colorTheme.ultralight_secondary_color,
    //marginBottom: 70,
  },
  numericInput: {
    fontSize: 17,
    fontWeight: "600",
    color: 'white',
    backgroundColor: colorTheme.primary_color + "77",
  },
  points: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    padding: 10,
    marginVertical: 20,
  },
  pointsText: {
    fontSize: 18,
    padding: 5,
    alignSelf: "center",
  },

  containerDdTeams: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    textAlign: "center",
  },

  //Config za dropdown timova
  icon: {
    marginRight: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    paddingVertical: 40,
  },
  itemtext: {
    textAlign: "center",
    fontSize: 16,
    fontSize: 16,
  },
  label: {
    position: "absolute",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    fontSize: 16,
    textAlign: "center",
  },
  selectedTextStyle: {
    fontSize: 16,
    textAlign: "center",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    textAlign: "center",
    borderRadius: 10,
  },

  //Posebnoj osobi
  posebnojOsobiCb: {
    margin: "3%",
    flex: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    //paddingTop: 40,
  },
  active: {
    backgroundColor: colorTheme.ultralight_primary_color,
  },
  dropdownTeams: {
    flex: 4,
    paddingVertical: "5%",
    paddingHorizontal: "5%",
    height: "5%",
    width: "65%",
    alignSelf: "center",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontWeight: "normal",
    fontSize: 16,
    textAlignVertical: "center",
    marginVertical: "10%",
    textAlign: "center",
  },
  dropdownMembers: {
    flex: 4,
    paddingVertical: "5%",
    height: "5%",
    width: "80%",
    alignSelf: "center",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontWeight: "normal",
    fontSize: 16,
    textAlignVertical: "center",
    marginTop: 0,
    paddingHorizontal: "3%",
    textAlign: "center",
  },
  posebnojOsobiContainer: {
    margin: "3%",
    //marginTop: 45,
    justifyContent: "center",
    flex: 2,
    padding: 0,
  },

  //Glavni deo taskova - input
  inputAndCbs: {
    margin: "4%",
    flex: 4,
  },
  input: {
    flex: 1,
  },
  textInputNaziv: {
    flex: 1,
    margin: "3%",
    padding: "5%",
    height: "10%",
    minHeight: "10%",
    width: "95%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontWeight: "600",
    fontSize: 18,
    textAlignVertical: "center",
    justifyContent: "center",
    alignSelf: 'center'
  },
  textInputOpis: {
    flex: 3,
    margin: "3%",
    minHeight: 200,
    padding: "5%",
    width: "95%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontWeight: "normal",
    fontSize: 18,
    textAlignVertical: "top",
    justifyContent: "center",
    alignSelf: 'center'
  },
  inputLabel: {
    padding: "4%",
    paddingBottom: 0,
    paddingLeft: "3%",
    fontSize: 20,
    fontWeight: "500",
    textAlignVertical: 'center'
  },

  //Checkboxes za timove
  team: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "5%",
    minHeight: "10%",
  },
  teamsCb: {
    flexDirection: "row",
    alignContent: "space-around",
    justifyContent: "space-around",
    flexWrap: "wrap",
    alignSelf: "center",
  },
  teamsCbText: {
    fontWeight: "900",
    fontSize: 15,
  },
  checkbox: {},
  //Milestones
  milestonesContainer: {
    flex: 5,
    margin: "5%",
    marginRight: 0,
    marginBottom: "10%",
  },
  milestoneInputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    // marginTop: "5%",
  },
  milestoneInput: {
    flex: 9,
    margin: "3%",
    marginLeft: 0,
    marginRight: "5%",
    padding: "3%",
    paddingHorizontal: "5%",
    minHeight: "100%",
    width: "100%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontWeight: "normal",
    fontSize: 16,
    textAlignVertical: "center",
    // justifyContent: "center",
  },
  milestones: {},
  milestone: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    margin: "3%",
    //minHeight: "100%",
    fontWeight: "normal",
    fontSize: 18,
    textAlignVertical: "center",
    paddingLeft: "1%",
    marginRight: 0,
    marginVertical: "1%",
  },
  milestoneText: {
    flex: 10,
    fontSize: 17,
    marginRight: "5%",
  },
  milestoneTitle: {
    padding: "3%",
    paddingLeft: "3%",
    marginBottom: "2%",
    fontSize: 20,
    fontWeight: "500",
  },
  milestoneIcon: {
    flex: 1,
    padding: 5,
    alignSelf: "center",
    paddingRight: "5%"
  },

  //date
  date: {
    flex: 1,
    margin: "5%",
    marginTop: "10%",
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateTitle: {
    padding: "4%",
    paddingLeft: "3%",
    fontSize: 20,
    fontWeight: "500",
    textAlignVertical: 'center'
  },
  dateInput: {
    //minHeight: "100%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.light_primary_color + "aa",
    fontSize: 18,
    textAlignVertical: "center",
    marginRight: "3%",
    paddingHorizontal: "5%",
    padding: "3%",
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignSelf: 'center'
  },
  dateInputText: {
    marginHorizontal: "5%",
    fontWeight: "600",
    color: colorTheme.primary_color,
  },

  //button
  // button: {
  //   margin: "5%",
  //   marginTop: "10%",
  //   marginBottom: "12%",
  //   width: "60%",
  //   alignSelf: "center",
  //   justifyContent: "flex-end",
  //   paddingVertical: 12,
  //   paddingHorizontal: 32,
  //   borderRadius: 8,
  //   elevation: 1,
  //   backgroundColor: colorTheme.light_primary_color,
  // },
  // buttonText: {
  //   textAlign: "center",
  //   color: "white",
  //   fontSize: 18,
  //   padding: "5%",
  // },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 30,
    minWidth: "35%",
    width: "60%",
    marginTop: "10%",
    marginBottom: "12%",
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    justifyContent: "center",
    alignSelf: "center",
  },

  //za iskacuci modal
  modalContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: "5%",
    marginVertical: "25%",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 20,
    padding: "10%",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 50,
  },
  modalNumeric: {
    margin: "30%",
  },
  modal: {
    //marginTop: "20%",
    //marginBottom: "12%",
    width: "100%",
    fontSize: 25,
    textAlign: "center",
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
