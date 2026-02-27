import { colorTheme } from "./color_constants";
import { StyleSheet } from "react-native";

export const taskCommentsThem = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    flex: 0.9,
    width: "100%",
    padding: 20,
    marginBottom: 0,
  },
  flatListContentContainer: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  commentContainer: {
    flexDirection: "row",
    flex: 1,
    maxWidth: "90%",
    alignSelf: "flex-start",
    marginVertical: 10,
  },
  comment: {
    flex: 4,
    flexDirection: 'column',
    maxWidth: "80%",
    minWidth: "65%",
    borderRadius: 20,
    backgroundColor: "#ccbdbd",
    padding: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  left: {
    flex: 6,
    flexDirection: 'column',
  },
  headerWithDate: {
    flexDirection: "row",
    // alignItems: "center"
    width: "100%",
  },
  header: {
    justifyContent: "center",
    alignSelf: "center",
  },
  imageContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flex: 1,
    // minWidth: 10,
    marginRight: 5,
  },
  image: {
    borderRadius: 25,
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
  },
  name: {
    fontWeight: "600",
    textAlignVertical: "center",
    fontSize: 14,
  },
  date: {
    // paddingTop: 5,
    fontSize: 12,
    textAlignVertical: "center",
    color: "#666",
  },
  messageContainer: {
    paddingTop: 5,
  },
  message: {
    textAlign: "left",
    textAlignVertical: 'bottom',
    fontSize: 14
  },
  inputContainer: {
    flex: 0.1,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    // paddingTop: 0,
    paddingRight: 5,
    marginTop: 15,
  },
  icon: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 3,
    paddingTop: 3,
    marginLeft: 10,
    marginRight: 5,
    borderWidth: 2,
    borderColor: colorTheme.light_primary_color + "aa",
  },
  commentInput: {
    flex: 8,
    minHeight: 60,
    borderWidth: 2,
    borderColor: colorTheme.light_primary_color + "aa",
    padding: 3,
    paddingHorizontal: 25,
    // marginBottom: 10,
    borderRadius: 30,
    width: "95%",
    fontSize: 14,
    fontWeight: '400',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'justify',
    textAlignVertical: 'center',
  },
  timeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minWidth: 50,
  },
  time: {
    textAlign: 'center',
    textAlignVertical: 'top',
    fontSize: 12,
    color: "#666",
  }
});

export const taskCommentsMe = StyleSheet.create({
  container: {},
  flatListContainer: {
    width: "100%",
    padding: 20,
  },
  commentContainer: {
    flexDirection: "row",
    flex: 1,
    maxWidth: "75%",
    alignSelf: "flex-end",
    marginVertical: 10,
  },
  comment: {
    flex: 4,
    flexDirection: 'row',
    // maxWidth: "80%",
    // minWidth: "35%",
    borderRadius: 20,
    backgroundColor: "#ccbdbd",
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: colorTheme.light_primary_color + "aa",
  },
  left: {
    flex: 6,
    flexDirection: 'column',
  },
  date: {
    paddingHorizontal: 10,
    paddingTop: 5,
    textAlignVertical: "center",
    color: "#666",
  },

  messageContainer: {
    paddingVertical: 5,
  },
  message: {
    textAlign: "left",
    textAlignVertical: 'center',
    fontSize: 14
  },
});
