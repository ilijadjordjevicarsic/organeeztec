import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";

export const adminMemberList_style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
    
  },
  searchBox: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
  },
  
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
  },
  memberNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5,
    
  },
  memberName: {
    fontSize: 14,
    fontWeight: "bold",
    
  },
  
  memberActivity: {
    fontSize: 14,
  },
  memberButton: {
    backgroundColor: colorTheme.button + "99",
    borderRadius: 10,
    padding: 10,
    alignSelf: "flex-end",
    marginTop: 8,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colorTheme.button + "cc",
    
  },
  memberButtonText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: '600',
    
  },
  noImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colorTheme.button + "cc",
  },
  memberInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  
});
