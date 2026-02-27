import { LoginPage } from "./src/components/LoginPage";
import { MainPage } from "./src/components/MainPage";
import { RegisterPage } from "./src/components/RegisterPage";
import { SettingsPage } from "./src/components/SettingsPage";
import { TasksPage } from "./src/components/TasksPage";
import { AddTask } from "./src/components/AddTask";
import * as React from "react";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerArea } from "./src/components/DrawerArea";
import { MyProfilePage } from "./src/components/MyProfilePage";
import { UpdateProfilePage } from "./src/components/UpdateProfilePage";
import { RootSiblingParent } from "react-native-root-siblings";
import { BordAplicantPage } from "./src/components/BordAplicantPage";
import { InitalLoad } from "./src/components/InitialLoad";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "./src/firebase_config";
import { MeetingsPage } from "./src/components/MeetingsPage";
import { NotificationsPage } from "./src/components/NotificationsPage";
import { CalendarPage } from "./src/components/CalendarPage";
import { Scoreboard } from "./src/components/Scoreboard";
import { TaskComments } from "./src/components/TaskComments";
import {
  db,
  getManagedTeams,
  setPushToken,
  checkPushToken,
} from "./src/firebase_functions";
import { AdminPage } from "./src/components/AdminPage";
import { MyRolesPage } from "./src/components/MyRolesPage";
import { AdminEventsPage } from "./src/components/AdminEventsPage";
import { AdminAuthentificationPage } from "./src/components/AdminAuthentificationPage";
import { AdminBordAplicantPage } from "./src/components/AdminBordAplicantPage";
import { AdminRolesUpdatePage } from "./src/components/AdminRolesUpdatePage";
import { AdminMemberListPage } from "./src/components/AdminMemberListPage";
import { AdminEditProfilePage } from "./src/components/AdminEditProfilePage";
import { AdminviewAuthRequest } from "./src/components/AdminViewAuthRequest";
import { enableScreens } from "react-native-screens";
import { AdminViewBoardApplication } from "./src/components/AdminViewBoardApplication";
import { AdminNewEvent } from "./src/components/AdminNewEvent";
import { AdminUpdateEventPage } from "./src/components/AdminUpdateEventPage";
import { OrgTeamAplicationPage } from "./src/components/OrgTeamApplication";
import { AllOCApplicationsPage } from "./src/components/AllOCAppllicationsPage";
import { ViewOCApplication } from "./src/components/ViewOCApplication";
import { TeamRequestsPage } from "./src/components/TeamRequests";
import { Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Toast from "react-native-root-toast";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

enableScreens();
const Stack = createNativeStackNavigator();
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);
  }
};
/*async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "assets/sounds/notif-alert.wav",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}*/

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "notif_alert.wav",
      enableVibrate: true,
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      userInfoLoaded: false,
      user: null,
      userInfo: null,
      expoPushToken: null,
    };
    this.listener = null;
    this.userListener = null;
    this.messageUnsub = null;
    this.notificationListener = React.createRef();
    this.responseListener = React.createRef();

    this.tokenListener = React.createRef();
  }
  /*notificationCallback = () => {
    console.log(this.state.expoPushToken);
    console.log("called");
    sendPushNotification(this.state.expoPushToken);
  };*/
  componentDidMount() {
    const auth = getAuth();
    let currentToken;
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log(token);
        this.setState({ expoPushToken: token });
        currentToken = token;
      })
      .catch((err) => console.log(err))
      .finally(() => {
        this.listener = onAuthStateChanged(auth, async (user) => {
          if (auth.currentUser == null) {
            this.setState({
              userInfoLoaded: false,
            });
          }
          if (this.userListener != null) this.userListener();
          this.setState({
            user: auth.currentUser,
          });
          if (this.state.user != null) {
            const ref = db.collection("users").doc(this.state.user.email);

            checkPushToken(currentToken)
              .then(() => {
                console.log("then");
                setPushToken(currentToken);

                this.tokenListener.current = Notifications.addPushTokenListener(
                  async (response) => {
                    Notifications.getExpoPushTokenAsync().then((tokenRes) => {
                      console.log("onnewpushtoken");
                      console.log(tokenRes.data);
                      let newToken = tokenRes.data;
                      setPushToken(newToken);
                    });
                  }
                );

                this.userListener = ref.onSnapshot((snapshot) => {
                  //console.log(snapshot.data());
                  if (snapshot.exists) {
                    let u = snapshot.data();

                    if (u.admin != null && !u.admin) {
                      getManagedTeams(u.positions)
                        .then((m) => {
                          let us = {
                            ...u,
                            user_id: this.state.user.email,
                            managed_teams: [...m],
                          };
                          this.setState({
                            isLoaded: true,
                            userInfo: us,
                            userInfoLoaded: true,
                          });
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    } else {
                      let us = { ...u, user_id: this.state.user.email };
                      this.setState({
                        isLoaded: true,
                        userInfo: us,
                        userInfoLoaded: true,
                      });
                    }
                  } else {
                    this.setState({
                      isLoaded: true,
                      user: null,
                    });
                    signOut(auth)
                      .then(() => {})
                      .catch((err) => console.log(err));
                  }
                });
              })
              .catch((e) => {
                console.log(e);
                signOut(auth)
                  .then(() => {
                    Toast.show("Ovaj nalog je već ulogovan na drugom uređaju");
                  })
                  .catch((err) => console.log(err));
              });
          } else {
            this.setState({
              isLoaded: true,
              user: null,
            });
          }
        });
      });

    this.notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        this.state.notification = notification;
        console.log("ovde");
        console.log(notification.request);
      });

    this.responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("slay");
        let notifData = response.notification.request.content.data;
        console.log(notifData);
        if (notifData) {
          if (notifData.type) {
            switch (notifData.type) {
              case "external-notification":
              case "internal-notification":
                if (notifData.event_id) {
                  if (notifData.event_id == "General") {
                    if (notifData.team_id)
                      navigate("Main", {
                        screen: "MainPage",
                        params: {
                          tab: notifData.type,
                          team_id: notifData.team_id,
                        },
                      });
                  } else {
                    if (notifData.team_id)
                      navigate("Main", {
                        screen: notifData.event_id,
                        params: {
                          tab: notifData.type,
                          team_id: notifData.team_id,
                        },
                      });
                  }
                }
                break;
              default: {
              }
            }
          }
        }
      });
    /*if (requestUserPermission()) {
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
        });
    } else {
      console.log("failed to get token");
    }*/
    /*messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
        }
      });

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });
s
    this.messageUnsub = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });*/
  }
  componentWillUnmount() {
    if (this.listener != null) this.listener();
    if (this.userListener != null) this.userListener();
    if (this.messageUnsub != null) this.messageUnsub();
    if (this.notificationListener.current != null)
      Notifications.removeNotificationSubscription(
        this.notificationListener.current
      );
    if (this.responseListener.current != null)
      Notifications.removeNotificationSubscription(
        this.responseListener.current
      );
    {
      if (this.tokenListener.current != null)
        Notifications.removeNotificationSubscription(
          this.tokenListener.current
        );
    }
  }

  render() {
    if (
      !this.state.isLoaded ||
      (this.state.isLoaded &&
        this.state.user != null &&
        !this.state.userInfoLoaded)
    ) {
      return <InitalLoad></InitalLoad>;
    }
    return (
      <RootSiblingParent>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator detachInactiveScreens={true}>
            {this.state.user === null ||
            this.state.user.getIdToken(true) === null ? (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginPage}
                  options={{ title: "", headerShown: false }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterPage}
                  options={{ title: "" }}
                />
              </>
            ) : this.state.userInfo.admin ? (
              <>
                <Stack.Screen
                  name="MainAdmin"
                  component={AdminPage}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AdminEvents"
                  component={AdminEventsPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminUpdateEvent"
                  component={AdminUpdateEventPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminNewEvent"
                  component={AdminNewEvent}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminAuthentification"
                  component={AdminAuthentificationPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminAuthReq"
                  component={AdminviewAuthRequest}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminBordAplicant"
                  component={AdminBordAplicantPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminViewBordAplicant"
                  component={AdminViewBoardApplication}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminRolesUpdate"
                  component={AdminRolesUpdatePage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminMemberList"
                  component={AdminMemberListPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminEditProfile"
                  children={({ navigation }) => {
                    const route = useRoute();
                    return (
                      <AdminEditProfilePage
                        admin={true}
                        navigation={navigation}
                        route={route}
                      ></AdminEditProfilePage>
                    );
                  }}
                  options={{ title: "" }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Main"
                  children={({ navigation }) => (
                    <DrawerArea
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></DrawerArea>
                  )}
                  options={({ navigation }) => ({
                    /*title: "",
          headerLeft: null,
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate("Settings")}>
              <MaterialCommunityIcons name="cog" size={24} color="black" />
            </Pressable>
          ),*/
                    headerShown: false,
                  })}
                />

                {this.state.userInfo.positions.filter(
                  (x) => x.position == "chairperson"
                ).length > 0 ? (
                  <Stack.Screen
                    name="AdminEvents"
                    component={AdminEventsPage}
                    options={{ title: "" }}
                  />
                ) : (
                  <></>
                )}
                {this.state.userInfo.positions.filter(
                  (x) => x.position == "chairperson"
                ).length > 0 ? (
                  <Stack.Screen
                    name="AdminUpdateEvent"
                    component={AdminUpdateEventPage}
                    options={{ title: "" }}
                  />
                ) : (
                  <></>
                )}
                {this.state.userInfo.positions.filter(
                  (x) => x.position == "chairperson"
                ).length > 0 ? (
                  <Stack.Screen
                    name="AdminNewEvent"
                    component={AdminNewEvent}
                    options={{ title: "" }}
                  />
                ) : (
                  <></>
                )}

                <Stack.Screen
                  name="Settings"
                  component={SettingsPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AdminEditProfile"
                  children={({ navigation }) => {
                    const route = useRoute();
                    return (
                      <AdminEditProfilePage
                        admin={false}
                        navigation={navigation}
                        route={route}
                      ></AdminEditProfilePage>
                    );
                  }}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="MyTasks"
                  children={({ navigation }) => (
                    <TasksPage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></TasksPage>
                  )}
                  options={{
                    title: "Zaduženja",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="TeamRequests"
                  component={TeamRequestsPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="Meetings"
                  options={{
                    title: "Sastanci",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                  children={({ navigation }) => (
                    <MeetingsPage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></MeetingsPage>
                  )}
                />
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsPage}
                  options={{
                    title: "Notifikacije",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="TaskComments"
                  children={({ navigation }) => {
                    const route = useRoute();
                    return (
                      <TaskComments
                        user={this.state.userInfo}
                        navigation={navigation}
                        route={route}
                      ></TaskComments>
                    );
                  }}
                  options={{
                    title: "",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="Scoreboard"
                  children={({ navigation }) => (
                    <Scoreboard
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></Scoreboard>
                  )}
                  options={{
                    title: "",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="Calendar"
                  children={({ navigation }) => (
                    <CalendarPage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></CalendarPage>
                  )}
                  options={{
                    title: "Kalendar",
                    animation: "none",
                    headerTitleAlign: "center",
                  }}
                />
                <Stack.Screen
                  name="AddTask"
                  children={({ navigation }) => (
                    <AddTask
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></AddTask>
                  )}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="AllOCApplicationsPage"
                  component={AllOCApplicationsPage}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="ViewOCApplication"
                  component={ViewOCApplication}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="MyProfile"
                  children={({ navigation }) => (
                    <MyProfilePage
                      user={this.state.userInfo}
                      navigation={navigation}
                      //notifTest={() => this.notificationCallback()}
                    ></MyProfilePage>
                  )}
                  options={{ title: "" }}
                />

                <Stack.Screen
                  name="UpdateProfile"
                  children={({ navigation }) => (
                    <UpdateProfilePage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></UpdateProfilePage>
                  )}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="BordAplicant"
                  children={({ navigation }) => (
                    <BordAplicantPage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></BordAplicantPage>
                  )}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="OrgTeamAplicant"
                  children={({ navigation }) => {
                    const route = useRoute();
                    return (
                      <OrgTeamAplicationPage
                        user={this.state.userInfo}
                        navigation={navigation}
                        route={route}
                      ></OrgTeamAplicationPage>
                    );
                  }}
                  options={{ title: "" }}
                />
                <Stack.Screen
                  name="MyRoles"
                  children={({ navigation }) => (
                    <MyRolesPage
                      user={this.state.userInfo}
                      navigation={navigation}
                    ></MyRolesPage>
                  )}
                  options={{ title: "" }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </RootSiblingParent>
    );
  }
}
