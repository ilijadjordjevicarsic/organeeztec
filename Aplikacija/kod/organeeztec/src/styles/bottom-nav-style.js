import { colorTheme } from "./color_constants";
const activeIconColor = colorTheme.light_primary_color;
const inactiveIconColor = colorTheme.secondary_color;
const activeBgColor = colorTheme.secondary_color;
const barColor = colorTheme.light_primary_color;
const item = {
  flex: 1,
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
};
const selectedItem = { ...item, backgroundColor: activeBgColor };
export const botom_nav_style = {
  nav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    flex: 0.1,
    backgroundColor: barColor,
    borderTopWidth: 2,
    borderTopColor: colorTheme.secondary_color,
  },
  item,
  selectedItem,
  activeIconColor,
  inactiveIconColor,
};
