import { StyleSheet } from "react-native";
import { colorTheme } from "./color_constants";
export const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorTheme.ultralight_primary_color,
  },
  iconStyle: { margin: 5 },
  focusedLabelColor: "white",
  unfocusedLabelColor: colorTheme.light_primary_color,
  separator: {
    marginVertical: 5,
    borderBottomColor: "#737373",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerItemLabel: { flexDirection: "row", alignItems: "center" },
  labelText: { fontSize: 16, fontWeight: "bold" },
  iconSize: 24,
  activeBgColor: colorTheme.light_primary_color,
  eventsIconView: { marginLeft: 20 },
  coverImage: {
    height: undefined,
    aspectRatio: 1.6 / 1,
    width: "100%",
    borderBottomLeftRadius: -15,
    borderBottomRightRadius: -15,
  },
  pressColor: colorTheme.primary_color,
});
