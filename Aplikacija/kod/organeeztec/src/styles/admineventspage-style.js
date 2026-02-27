import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";

export const admineventspage_style = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventBtns: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  button: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 10,
    paddingLeft: 0,
    paddingRight: 0,
    marginHorizontal: 5,
    borderRadius: 30,
    flex: 1,
    marginTop: 2,
    flexWrap: "nowrap",
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },
  eventName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
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
  title: {
    fontSize: 20,

    marginBottom: 10,

    padding: 10,
    alignSelf: "center",
  },

  eventBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },

  buttonadd: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 10,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
  },
  buttonmod: {
    backgroundColor: colorTheme.button + "99",
    textAlign: "center",
    padding: 10,

    borderRadius: 30,
    marginRight: 10,
    marginTop: 2,
  },
  rowmod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
