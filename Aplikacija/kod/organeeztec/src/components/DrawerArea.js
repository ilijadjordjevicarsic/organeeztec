import React, { useState } from "react";
import { DrawerItem, createDrawerNavigator } from "@react-navigation/drawer";
import { MainPage } from "./MainPage";
import { Event } from "./EventPage";
import { Pressable, Image, Text, View } from "react-native";
import { Avatar } from "@react-native-material/core";
import { onSnapshot } from "firebase/firestore";
import { collection, getDocs, db } from "../firebase_functions";
import { AdminEventsPage } from "./AdminEventsPage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { style } from "../styles/drawer-style";
import { FontAwesome } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { Scoreboard } from "./Scoreboard";
import {
  getUnarchivedEvents,
  unarchivedEventsListener,
} from "../firebase_functions";
import { AdminMemberListPage } from "./AdminMemberListPage";
import { colorTheme } from "../styles/color_constants";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { BottomNav } from "./BottomNav";
const Drawer = createDrawerNavigator();

const Seperator = () => <View style={style.separator} />;

export class DrawerArea extends React.Component {
  constructor(props) {
    super(props);
    this.ref = db.collection("events").where("archived", "==", false);
    this.unsubscribe = null;
    this.state = {
      events: [],
    };
    this.listen = null;
  }
  CustomDrawer = (props) => {
    const [eventsClosed, setEventsClosed] = useState(true);
    return (
      <View style={style.container}>
        <Image
          style={style.coverImage}
          source={require("../../assets/drawer-cover.png")}
        ></Image>

        <DrawerContentScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {props.state.routeNames.filter((r) => r == "MainPage").length > 0 ? (
            <DrawerItem
              pressColor={style.pressColor}
              key="MainPage"
              {...props}
              activeBackgroundColor={style.activeBgColor}
              focused={
                props.state.index ===
                props.state.routes.findIndex((e) => e.name === "MainPage")
              }
              label={({ focused }) => (
                <View style={style.drawerItemLabel}>
                  <MaterialCommunityIcons
                    style={style.iconStyle}
                    name="home"
                    size={style.iconSize}
                    color={
                      focused
                        ? style.focusedLabelColor
                        : style.unfocusedLabelColor
                    }
                  />
                  <Text
                    style={[
                      {
                        color: focused
                          ? style.focusedLabelColor
                          : style.unfocusedLabelColor,
                      },
                      style.labelText,
                    ]}
                  >
                    General
                  </Text>
                </View>
              )}
              onPress={() => {
                props.navigation.navigate("MainPage");
              }}
            ></DrawerItem>
          ) : (
            <></>
          )}
          <DrawerItem
            pressColor={style.pressColor}
            key="Dogadjaji"
            {...props}
            activeBackgroundColor={style.activeBgColor}
            focused={false}
            label={({ focused }) => (
              <View style={style.drawerItemLabel}>
                {!eventsClosed ? (
                  <MaterialCommunityIcons
                    style={style.iconStyle}
                    name="chevron-down"
                    size={style.iconSize}
                    color={style.unfocusedLabelColor}
                  />
                ) : (
                  <MaterialCommunityIcons
                    style={style.iconStyle}
                    name="chevron-right"
                    size={style.iconSize}
                    color={style.unfocusedLabelColor}
                  />
                )}
                <Text
                  style={[
                    {
                      color: style.unfocusedLabelColor,
                    },
                    style.labelText,
                  ]}
                >
                  Događaji
                </Text>
              </View>
            )}
            onPress={() => {
              setEventsClosed(!eventsClosed);
            }}
          ></DrawerItem>

          {!eventsClosed ? (
            <>
              <Seperator />
              {props.state.routeNames
                .filter(
                  (r) =>
                    this.state.events.find((e) => e.event_id == r) != undefined
                )
                .map((routeItem) => {
                  return (
                    <DrawerItem
                      pressColor={style.pressColor}
                      key={routeItem}
                      {...props}
                      activeBackgroundColor={style.activeBgColor}
                      focused={
                        props.state.index ===
                        props.state.routes.findIndex(
                          (e) => e.name === routeItem
                        )
                      }
                      label={({ focused }) => (
                        <View style={style.drawerItemLabel}>
                          <View style={style.eventsIconView}></View>
                          <Text
                            style={[
                              {
                                color: focused
                                  ? style.focusedLabelColor
                                  : style.unfocusedLabelColor,
                              },
                              style.labelText,
                            ]}
                          >
                            {(() => {
                              let event = this.state.events.find(
                                (e) => e.event_id == routeItem
                              );
                              return event.name;
                            })()}
                          </Text>
                        </View>
                      )}
                      onPress={() => {
                        props.navigation.navigate(routeItem);
                      }}
                    ></DrawerItem>
                  );
                })}
              <Seperator />
            </>
          ) : (
            <></>
          )}

          {props.state.routeNames.filter((r) => r == "EventsUpdate").length >
          0 ? (
            <DrawerItem
              pressColor={style.pressColor}
              key="EventsUpdate"
              {...props}
              activeBackgroundColor={style.activeBgColor}
              focused={
                props.state.index ===
                props.state.routes.findIndex((e) => e.name === "EventsUpdate")
              }
              label={({ focused }) => (
                <View style={style.drawerItemLabel}>
                  <MaterialCommunityIcons
                    style={style.iconStyle}
                    name="cog"
                    size={style.iconSize}
                    color={
                      focused
                        ? style.focusedLabelColor
                        : style.unfocusedLabelColor
                    }
                  />
                  <Text
                    style={[
                      {
                        color: focused
                          ? style.focusedLabelColor
                          : style.unfocusedLabelColor,
                      },
                      style.labelText,
                    ]}
                  >
                    Ažuriranje događaja
                  </Text>
                </View>
              )}
              onPress={() => {
                props.navigation.navigate("EventsUpdate");
              }}
            ></DrawerItem>
          ) : (
            <></>
          )}
          {/*props.state.routeNames.filter((r) => r == "Scoreboard").length >
          0 ? (
            <DrawerItem
              pressColor={style.pressColor}
              key="Scoreboard"
              {...props}
              activeBackgroundColor={style.activeBgColor}
              focused={
                props.state.index ===
                props.state.routes.findIndex((e) => e.name === "Scoreboard")
              }
              label={({ focused }) => (
                <View style={style.drawerItemLabel}>
                  <Ionicons
                    style={style.iconStyle}
                    name="trophy"
                    size={style.iconSize}
                    color={
                      focused
                        ? style.focusedLabelColor
                        : style.unfocusedLabelColor
                    }
                  />
                  <Text
                    style={[
                      {
                        color: focused
                          ? style.focusedLabelColor
                          : style.unfocusedLabelColor,
                      },
                      style.labelText,
                    ]}
                  >
                    Rang lista
                  </Text>
                </View>
              )}
              onPress={() => {
                props.navigation.navigate("Scoreboard");
              }}
            ></DrawerItem>
          ) : (
            <></>
          )*/}
          {props.state.routeNames.filter((r) => r == "MemberList").length >
          0 ? (
            <DrawerItem
              pressColor={style.pressColor}
              key="MemberList"
              {...props}
              activeBackgroundColor={style.activeBgColor}
              focused={
                props.state.index ===
                props.state.routes.findIndex((e) => e.name === "MemberList")
              }
              label={({ focused }) => (
                <View style={style.drawerItemLabel}>
                  <MaterialCommunityIcons
                    style={style.iconStyle}
                    name="account-group"
                    size={style.iconSize}
                    color={
                      focused
                        ? style.focusedLabelColor
                        : style.unfocusedLabelColor
                    }
                  />
                  <Text
                    style={[
                      {
                        color: focused
                          ? style.focusedLabelColor
                          : style.unfocusedLabelColor,
                      },
                      style.labelText,
                    ]}
                  >
                    Svi članovi
                  </Text>
                </View>
              )}
              onPress={() => {
                props.navigation.navigate("MemberList");
              }}
            ></DrawerItem>
          ) : (
            <></>
          )}
        </DrawerContentScrollView>
      </View>
    );
  };
  componentDidMount() {
    this.listen = this.props.navigation.addListener(
      "hardwareBackPress",
      (e) => {
        console.log("sss");

        e.preventDefault();
      }
    );
    //na promenu dogadjaja, ucitava se iz baze
    this.unsubscribe = this.ref.onSnapshot((snapshot) => {
      let all = [];

      snapshot.forEach((element) => {
        let data = element.data();
        let id = element.id;
        let el = { ...data, event_id: id };
        //console.log(el);
        all.push(el);
      });
      this.setState({ events: all });
    });
  }
  componentWillUnmount() {
    if (this.unsubscribe != null) this.unsubscribe();
    if (this.listen != null) this.listen();
  }
  myProfile() {
    return (
      <Pressable onPress={() => this.props.navigation.navigate("MyProfile")}>
        {/*<MaterialCommunityIcons
      style={{ margin: 5 }}
      name="cog"
      size={24}
      color="black"
/>*/}
        {this.props.user.profile_pic_uri != "" ? (
          <Image
            source={{ uri: this.props.user.profile_pic_uri }}
            style={{
              height: 50,
              width: 50,
              borderRadius: 25,
              marginRight: 5,
              borderWidth: 3,
              borderColor: colorTheme.button + "cc",
            }}
          ></Image>
        ) : (
          <Avatar
            style={{ marginRight: 5 }}
            label={
              this.props.user != undefined &&
              this.props.user != undefined &&
              this.props.user.name != undefined &&
              this.props.user.name != null &&
              this.props.user.surname != undefined &&
              this.props.user.surname != null
                ? this.props.user.name + " " + this.props.user.surname
                : "AA"
            }
            size={50}
          />
        )}
      </Pressable>
    );
  }
  render() {
    return (
      <Drawer.Navigator
        drawerContent={(props) => <this.CustomDrawer {...props} />}
        initialRouteName="MainPage"
        screenOptions={{
          drawerStyle: {},
          drawerActiveBackgroundColor: "black",
          drawerContentOptions: {
            activeBackgroundColor: "black",
            itemStyle: {
              shadowColor: "red",
              shadowOpacity: 0.5,
              shadowRadius: 2,
              shadowOffset: {
                width: 1,
                height: 1,
              },
            },
          },
        }}
      >
        <Drawer.Screen
          name="MainPage"
          children={({ navigation }) => {
            const route = useRoute();
            return (
              <MainPage
                user={this.props.user}
                route={route}
                nav={navigation}
              ></MainPage>
            );
          }}
          options={({ route }) => ({
            title: "General",
            unmountOnBlur: true,
            headerRight: () => this.myProfile(),
          })}
        />

        {this.state.events.map((event) => (
          <Drawer.Screen
            key={event.event_id}
            name={event.event_id}
            children={() => {
              const route = useRoute();
              return (
                <Event
                  nav={this.props.navigation}
                  event={event}
                  user={this.props.user}
                  route={route}
                ></Event>
              );
            }}
            options={({ route }) => ({
              title: event.name,
              unmountOnBlur: true,
              headerRight: () => this.myProfile(),
            })}
          ></Drawer.Screen>
        ))}
        {this.props.user.positions.filter((x) => x.position == "chairperson")
          .length > 0 ? (
          <Drawer.Screen
            name="EventsUpdate"
            children={({ navigation }) => {
              const route = useRoute();
              return (
                <BottomNav nav={this.props.navigation}>
                  <AdminEventsPage
                    route={route}
                    navigation={this.props.navigation}
                  ></AdminEventsPage>
                </BottomNav>
              );
            }}
            options={({ route }) => ({
              title: "Ažuriranje događaja",
              headerRight: () => this.myProfile(),
            })}
          />
        ) : (
          <></>
        )}
        {/*<Drawer.Screen
          name="Scoreboard"
          children={({ navigation }) => {
            const route = useRoute();
            return (
              <Scoreboard
                user={this.props.user}
                navigation={navigation}
                route={route}
              ></Scoreboard>
            );
          }}
          options={{
            title: "",
            animation: "none",
            headerTitleAlign: "center",
            headerRight: () => this.myProfile(),
          }}
        />*/}
        <Drawer.Screen
          name="MemberList"
          children={({ navigation }) => {
            const route = useRoute();
            return (
              <BottomNav nav={this.props.navigation}>
                <AdminMemberListPage
                  navigation={this.props.navigation}
                  route={route}
                ></AdminMemberListPage>
              </BottomNav>
            );
          }}
          options={({ route }) => ({
            title: "Svi članovi",
            headerRight: () => this.myProfile(),
          })}
        />
      </Drawer.Navigator>
    );
  }
}
