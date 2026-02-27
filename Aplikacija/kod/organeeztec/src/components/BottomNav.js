import { View } from "react-native";
import { colorTheme } from "../styles/color_constants";
import { Button } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { botom_nav_style } from "../styles/bottom-nav-style";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { withNavigation } from "react-navigation";

const Tab = createBottomTabNavigator();
/*  const Child = () => {
  return <>{props.children}</>;
};*/
export class BottomNav extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.9 }}>{this.props.children}</View>
        <View style={botom_nav_style.nav}>
          <Pressable
            style={
              this.props.active === "meetings"
                ? botom_nav_style.selectedItem
                : botom_nav_style.item
            }
            onPress={() => {
              if (this.props.active !== "meetings")
                this.props.nav.navigate("Meetings");
            }}
          >
            <MaterialCommunityIcons
              name="account-clock"
              color={
                this.props.active === "meetings"
                  ? botom_nav_style.activeIconColor
                  : botom_nav_style.inactiveIconColor
              }
              size={26}
            />
          </Pressable>
          {/*<Pressable
            style={
              this.props.active === "calendar"
                ? botom_nav_style.selectedItem
                : botom_nav_style.item
            }
            onPress={() => {
              if (this.props.active !== "calendar")
                this.props.nav.navigate("Calendar");
            }}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              color={
                this.props.active === "calendar"
                  ? botom_nav_style.activeIconColor
                  : botom_nav_style.inactiveIconColor
              }
              size={26}
            />
            </Pressable>*/}
          <Pressable
            style={
              this.props.active === "scoreboard"
                ? botom_nav_style.selectedItem
                : botom_nav_style.item
            }
            onPress={() => {
              if (this.props.active !== "scoreboard")
                this.props.nav.navigate("Scoreboard");
            }}
          >
            <Ionicons
              name="trophy"
              color={
                this.props.active === "scoreboard"
                  ? botom_nav_style.activeIconColor
                  : botom_nav_style.inactiveIconColor
              }
              size={26}
            />
          </Pressable>
          <Pressable
            style={
              this.props.active === "tasks"
                ? botom_nav_style.selectedItem
                : botom_nav_style.item
            }
            onPress={() => {
              if (this.props.active !== "tasks")
                this.props.nav.navigate("MyTasks");
            }}
          >
            <Foundation
              name="clipboard-notes"
              size={26}
              color={
                this.props.active === "tasks"
                  ? botom_nav_style.activeIconColor
                  : botom_nav_style.inactiveIconColor
              }
            />
          </Pressable>
          {/*<Pressable
            style={
              this.props.active === "notifications"
                ? botom_nav_style.selectedItem
                : botom_nav_style.item
            }
            onPress={() => {
              if (this.props.active !== "notifications")
                this.props.nav.navigate("Notifications");
            }}
          >
            <Feather
              name="bell"
              size={26}
              color={
                this.props.active === "notifications"
                  ? botom_nav_style.activeIconColor
                  : botom_nav_style.inactiveIconColor
              }
            />
            </Pressable>*/}
        </View>
      </View>
    );
  }
}
