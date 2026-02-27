import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";

export const scoreboard = StyleSheet.create({
  container: {
    backgroundColor: colorTheme.primary_color + "99",
    // maxWidth: "100%",
    minHeight: "100%",
  },
  titleContainer: {
    borderBottomWidth: 2,
    borderColor: colorTheme.secondary_color,
  },
  scrollViewContent: {
    paddingTop: 20,
    // marginBottom: 10,
    // height: "100%"
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    paddingVertical: 40,
    color: "white",
  },
  membersContainer: {
    paddingBottom: 140,
  },
  leftAlign: {
    flexDirection: "row",
  },
  singleMemberContainer: {
    marginVertical: 5,
    padding: 20,
    // paddingVertical: 40,
    paddingLeft: 5,
    width: "95%",
    borderWidth: 2,
    borderRadius: 20,
    borderColor: colorTheme.ultralight_secondary_color + "dd",
    backgroundColor: colorTheme.ultralight_secondary_color + "aa",
    // backgroundColor: colorTheme.tertiary_color + "99",
    fontWeight: "600",
    fontSize: 18,
    flexDirection: "row",
    alignContent: "center",
    textAlignVertical: "center",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  numberContainer: {
    alignSelf: "center",
    marginHorizontal: 20,
  },
  firstPlace: {
    height: 50,
    width: 50,
    alignSelf: "center",
    marginHorizontal: 7,
    marginTop: 10,
  },
  numberText: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
  },
  memberInfo: {
    flexDirection: "row",
  },
  profileImage: {
    borderRadius: 35,
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
    alignSelf: "center",
  },
  memberName: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: "400",
    color: "white",
    textAlignVertical: "center",
    textAlign: "left",
    maxWidth: 220,
    // alignSelf: "center",
  },
  points: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlignVertical: "center",
    alignSelf: "center",
    marginLeft: 10,
  },
});
