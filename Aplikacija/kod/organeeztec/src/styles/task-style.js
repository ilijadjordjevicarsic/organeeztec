import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";

export const task = StyleSheet.create({
  container: {
    flex: 2,
    flexDirection: "column",
    width: "94%",
    borderWidth: 1,
    borderRadius: 10,
    margin: "2%",
    // padding: "5%",
    justifyContent: "space-between",
    // height: 150
  },
  taskContainer: {
    padding: "5%",
    elevation: 5,
  },
  modal: {
    flex: 1,
    minHeight: "35%",
    width: "90%",
    alignItems: "center",
    marginHorizontal: "5%",
    marginVertical: "60%",
    justifyContent: "space-evenly",
    backgroundColor: "white",
    borderRadius: 40,
    padding: "10%",
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 50,
    alignSelf: 'center'
  },
  modalText: {
    minHeight: "15%",
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
  modalChoice: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
  },
  modalPressable: {
    flex: 1,
    backgroundColor: colorTheme.button + "99",
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 30,
    marginVertical: 10,
    minWidth: "35%",
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
  },
  modalPressableText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },
  markedDone: {
    padding: "5%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 10,
    borderTopStartRadius: 0,
    borderTopEndRadius: 0,
  },
  pending: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    // borderTopWidth: 1,
    borderRadius: 10,
    borderTopStartRadius: 0,
    borderTopEndRadius: 0,
  },
  pendingYes: {
    flex: 1,
    width: "100%",
    height: "100%",
    padding: "5%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#8bd165",
    borderBottomLeftRadius: 10,
  },
  pendingNo: {
    flex: 1,
    width: "100%",
    height: "100%",
    padding: "5%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#ff493c",
    borderBottomRightRadius: 10,
  },
  titleAndPoints: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 0,
  },
  title: {
    fontSize: 30,
    width: "85%",
    textAlign: 'justify'
  },
  points: {
    fontSize: 20,
    marginHorizontal: 5
  },
  deadlineAndProgress: {
    flex: 1,
    justifyContent: "flex-end",
  },
  deadline: {
    paddingVertical: "3%",
  },
  description: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingRight: 40,
  },
  milestones: {
    marginTop: "8%",
    marginBottom: "3%",
    alignItems: "center",
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    fontWeight: "normal",
    fontSize: 18,
    textAlignVertical: "center",
    paddingBottom: "3%",
    marginRight: 0,
    marginVertical: "1%",
  },
  milestoneText: {
    flex: 10,
    fontSize: 17,
    marginRight: "5%",
  },
});
