import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  FlatList,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import { task } from "../styles/task-style";
import { colorTheme } from "../styles/color_constants";
import { BottomNav } from "./BottomNav";
import { useNavigation } from "@react-navigation/native";
import { event_style } from "../styles/event-style";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Button, Avatar, select, even } from "@react-native-material/core";
import {
  Firestore,
  getDocs,
  collection,
  enableIndexedDbPersistence,
  getDoc,
} from "firebase/firestore";
import Task from "./Task";
import { db, getMembers, getManagedTeams } from "../firebase_functions";
import firebase from "firebase/compat/app";
import { Alert } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";
import {
  openOrgApplications,
  closeOrgApplications,
} from "../firebase_functions";
import { tasksPage } from "../styles/tasksPage-style";
import { sortAnnouncements } from "../scripts/helperFunctions";

export const Event = (props) => {
  const [selectedRole, setSelectedRole] = useState("General");
  const [selectedTab, setSelectedTab] = useState("Zvanična obaveštenja");
  const [modalVisible, setModalVisible] = useState(false);
  const [isInternalButtonDisabled, setIsInternalButtonDisabled] =
    useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPostButtonVisible, setIsPostButtonVisible] = useState(true);
  const [isTeamButtonVisible, setIsTeamButtonVisible] = useState(false);
  const [externalAnnouncements, setExternalAnnouncements] = useState([]);
  const [internalAnnouncements, setInternalAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [tabLoading, setTabLoading] = useState(true);

  const viewTeamReq = () => {
    props.nav.navigate("TeamRequests", { team_id: selectedRole });
  };
  const handlePress1 = () => {
    props.nav.navigate("MyRoles");
  };
  const openApplicationForOC = () => {
    props.nav.navigate("AllOCApplicationsPage", {
      event: props.event,
    });
  };

  const changeApplicationsOpen = () => {
    if (props.event.applications_open)
      closeOrgApplications(props.event.event_id);
    else openOrgApplications(props.event.event_id);
  };
  const selectRole = (role) => {
    if (
      (selectedTab == "Interna obaveštenja" || selectedTab === "Zaduženja") &&
      !(
        props.user.positions.filter(
          (position) =>
            position.document === role && position.position === "member"
        ).length > 0 ||
        props.user.managed_teams.includes(role) ||
        props.user.managed_teams.includes(props.event.event_id + " " + role) ||
        (role === "General" &&
          (props.user.positions.filter(
            (position) =>
              position.collection === "board" && position.document === "board"
          ).length > 0 ||
            props.user.positions.filter(
              (position) =>
                position.collection === "events" &&
                position.document === props.event.event_id
            ).length > 0))
      )
    ) {
      setSelectedTab("Zvanična obaveštenja");
    }
    setSelectedRole(role);
  };
  const handleOrgTeamApplication = () => {
    props.nav.navigate("OrgTeamAplicant", { event_id: props.event.event_id });
  };
  const handlePress = (tabName) => {
    setSelectedTab(tabName);
    setIsTeamButtonVisible(tabName === "O timu");

    setIsPostButtonVisible(
      tabName === "Zvanična obaveštenja" || tabName === "Interna obaveštenja"
    );
  };
  useEffect(() => {
    console.log("user");
    if (props.route && props.route.params) {
      console.log("params");
      console.log(props.route.params);
      if (props.route.params.tab) {
        if (props.route.params.tab == "external-notification") {
          setSelectedTab("Zvanična obaveštenja");
        } else if (props.route.params.tab == "internal-notification") {
          if (
            props.user.positions.filter(
              (position) =>
                position.document === selectedRole &&
                position.position === "member"
            ).length > 0 ||
            props.user.managed_teams.includes(selectedRole) ||
            props.user.managed_teams.includes(
              props.event.event_id + " " + selectedRole
            )
          )
            setSelectedTab("Interna obaveštenja");
        }
      }
      if (props.route.params.team_id) {
        if (
          props.route.params.team_id == "General" ||
          props.route.params.team_id == "HR" ||
          props.route.params.team_id == "PR" ||
          props.route.params.team_id == "IT" ||
          props.route.params.team_id == "Dizajn" ||
          props.route.params.team_id == "FR"
        ) {
          setSelectedRole(props.route.params.team_id);
        }
      }
    }
  }, []);

  useEffect(() => {
    setTabLoading(true);
    if (
      !(
        props.user.positions.filter(
          (position) =>
            position.document === selectedRole && position.position === "member"
        ).length > 0 ||
        props.user.managed_teams.includes(selectedRole) ||
        props.user.managed_teams.includes(
          props.event.event_id + " " + selectedRole
        )
      )
    ) {
      setIsInternalButtonDisabled(true);
    } else {
      setIsInternalButtonDisabled(false);
    }
    if (selectedRole === "General") {
      if (
        !(
          props.user.positions.filter(
            (position) =>
              position.collection === "board" && position.document === "board"
          ).length > 0 ||
          props.user.positions.filter(
            (position) =>
              position.collection === "events" &&
              position.document === props.event.event_id
          ).length > 0
        )
      ) {
        setIsInternalButtonDisabled(true);
      } else {
        setIsInternalButtonDisabled(false);
      }
    }

    aboutTeam();
    if (selectedTab === "Zaduženja") {
      const table = db
        .collection("tasks")
        .where("event_id", "array-contains", props.event.event_id)
        .where("team_id", "==", selectedRole)
        .where("worker", "==", null);

      const listener = table.onSnapshot((snapshot) => {
        let tasks = [];
        snapshot.docs.forEach((pod) => {
          if (pod.exists) {
            let data = pod.data();
            if (
              data != null &&
              (data.deleted == undefined || data.deleted == false) &&
              data.title != null &&
              data.description != null &&
              data.points != null &&
              data.team_id != null &&
              data.milestones != null &&
              data.event_id != null &&
              data.deadline != null &&
              data.user_id != null &&
              data.done != null &&
              data.accepted != null
            )
              tasks.push({
                title: data.title,
                id: pod.id,
                description: data.description,
                points: data.points,
                team_id: data.team_id,
                milestones: data.milestones,
                events: data.event_id,
                deadline: data.deadline.toDate(),
                worker: data.worker,
                user_id: data.user_id,
                done: data.done,
                accepted: data.accepted,
                deleted: data.deleted,
              });
          }
        });
        tasks.sort((a, b) => a.deadline - b.deadline);
        setTasks(tasks);
        setTabLoading(false);
      });
      return () => {
        listener();
      };
    } else if (selectedTab === "Zvanična obaveštenja") {
      const announcements = db
        .collection("events")
        .doc(props.event.event_id)
        .collection("external_announcements")
        .where("team_id", "==", selectedRole);

      const listener = announcements.onSnapshot((snapshot) => {
        let obavestenja = [];
        let promises = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (data.title !== undefined && data.text !== undefined) {
            promises.push(
              db
                .collection("users")
                .doc(data.poster)
                .get()
                .then((querySnapshot) => {
                  if (querySnapshot.exists) {
                    let dat = querySnapshot.data();
                    if (dat)
                      obavestenja.push({
                        id: pod.id,
                        approved: data.approved,
                        title: data.title,
                        text: data.text,
                        date_posted: data.date_posted.toDate(),
                        poster: dat.name + " " + dat.surname,
                        posterEmail: querySnapshot.id,
                        slika: dat.profile_pic_uri,
                        ime: dat.name,
                        prezime: dat.surname,
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                })
            );
          }
        });
        Promise.all(promises)
          .then((aha) => {
            obavestenja = obavestenja.sort(sortAnnouncements);
            setExternalAnnouncements(obavestenja);
            setTabLoading(false);
          })
          .catch((err) => {
            console.log(err.message);
          });
      });
      return () => {
        listener();
      };
    } else if (selectedTab === "Interna obaveštenja") {
      const announcements = db
        .collection("events")
        .doc(props.event.event_id)
        .collection("internal_announcements")
        .where("team_id", "==", selectedRole);

      const listener = announcements.onSnapshot((snapshot) => {
        let obavestenja = [];
        let promises = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (data.title !== undefined && data.text !== undefined) {
            promises.push(
              db
                .collection("users")
                .doc(data.poster)
                .get()
                .then((querySnapshot) => {
                  if (querySnapshot.exists) {
                    let dat = querySnapshot.data();
                    if (dat)
                      obavestenja.push({
                        title: data.title,
                        text: data.text,
                        date_posted: data.date_posted.toDate(),
                        poster: dat.name + " " + dat.surname,
                        id: pod.id,
                        posterEmail: querySnapshot.id,
                        slika: dat.profile_pic_uri,
                        ime: dat.name,
                        prezime: dat.surname,
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                })
            );
          }
        });
        Promise.all(promises)
          .then((aha) => {
            obavestenja = obavestenja.sort(sortAnnouncements);
            setInternalAnnouncements(obavestenja);
            setTabLoading(false);
          })
          .catch((err) => {
            console.log(err.message);
          });
      });

      return () => {
        listener();
      };
    }
  }, [
    selectedTab,
    selectedRole,
    props.user.positions,
    props.user.managed_teams,
    props.event.event_id,
    props.event.info,
  ]);

  const handleModalSubmit = () => {
    setLoading(true);
    if (title === "") {
      Alert.alert("Morate uneti naslov obavešenja");
      setLoading(false);
      return;
    }
    if (description === "") {
      Alert.alert("Morate uneti sadržaj obavešenja");
      setLoading(false);
      return;
    }
    if (title !== "" && description !== "") {
      addExternalAnnouncement()
        .then(() => {
          setModalVisible(false);
          setTitle("");
          setDescription("");
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };
  const getInfoGeneral = () => {
    const zaGeneral = db.collection("users").doc(props.event.HO);

    return new Promise((resolve, reject) => {
      let otimu = {};
      getDoc(zaGeneral)
        .then((snaps) => {
          let data = snaps.data();

          otimu.koordinator = {
            fullName: data.name + " " + data.surname,
            slika: data.profile_pic_uri,
            ime: data.name,
            prezime: data.surname,
          };
          otimu.info = props.event.info;
        })
        .then((aha) => {
          resolve(otimu);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  const aboutTeam = () => {
    if (selectedTab === "O timu") {
      if (selectedRole === "General") {
        if (props.event.HO !== "") {
          getInfoGeneral()
            .then((i) => {
              setTeamInfo(i);
              setTabLoading(false);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          let otimu = {};
          otimu.info = props.event.info;
          otimu.koordinator = null;
          setTeamInfo(otimu);
          setTabLoading(false);
        }
      } else {
        getInfo()
          .then((i) => {
            setTeamInfo(i);
            setTabLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      let otimu = {};
      const pozicije = db
        .collection("events")
        .doc(props.event.event_id)
        .collection("positions")
        .where("managed_teams", "array-contains", selectedRole);

      getDocs(pozicije)
        .then((snapshot) => {
          let promises = [];
          snapshot.docs.forEach((pod) => {
            let data = pod.data();

            if (
              !(data.user == undefined) &&
              !(data.user == null) &&
              data.user != ""
            ) {
              promises.push(
                db
                  .collection("users")
                  .doc(data.user)
                  .get()
                  .then((snaps) => {
                    let dat = snaps.data();
                    otimu.koordinator = {
                      fullName: dat.name + " " + dat.surname,
                      slika: dat.profile_pic_uri,
                      ime: dat.name,
                      prezime: dat.surname,
                    };
                  })
                  .catch((err) => {
                    console.log(err);
                  })
              );
            }
          });
          if (promises.length > 0) return Promise.all(promises);
          return Promise.resolve(true);
        })
        .then(() => {
          return db
            .collection("teams")
            .doc(selectedRole)
            .collection("subteams")
            .doc(props.event.event_id)
            .get()
            .then((snips) => {
              let da = snips.data();

              otimu.info = da.info;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .then((aha) => {
          resolve(otimu);
        })
        .catch((err) => {
          reject(err.message);
        });
    });
  };

  const addExternalAnnouncement = () => {
    if (selectedTab === "Zvanična obaveštenja") {
      let announcement = {};
      if (
        (selectedRole != "General" &&
          (selectedTab === "Interna obaveštenja" ||
            (selectedTab === "Zvanična obaveštenja" &&
              (props.user.managed_teams.includes(selectedRole) ||
                props.user.managed_teams.includes(
                  props.event.event_id + " " + selectedRole
                ))))) ||
        (selectedRole === "General" &&
          (props.user.positions.filter(
            (position) =>
              position.collection === "board" && position.document === "board"
          ).length > 0 ||
            props.user.positions.filter(
              (position) =>
                position.collection === "events" &&
                position.document === props.event.event_id
            ).length > 0))
      ) {
        announcement = {
          approved: true,
          title: title,
          text: description,
          poster: props.user.user_id,
          team_id: selectedRole,
          date_posted: firebase.firestore.Timestamp.now(),
        };
      } else {
        announcement = {
          approved: false,
          title: title,
          text: description,
          poster: props.user.user_id,
          team_id: selectedRole,
          date_posted: firebase.firestore.Timestamp.now(),
        };
      }

      const eventRef = db.collection("events").doc(props.event.event_id);
      const announcementRef = eventRef
        .collection("external_announcements")
        .doc();

      return announcementRef
        .set(announcement)
        .then(() => {
          console.log("Successfully added new external announcement");
        })
        .catch((error) => {
          console.error("Error adding new external announcement: ", error);
        });
    } else if (selectedTab === "Interna obaveštenja") {
      const announcement = {
        approved: true,
        title: title,
        text: description,
        poster: props.user.user_id,
        team_id: selectedRole,
        date_posted: firebase.firestore.Timestamp.now(),
      };

      const eventRef = db.collection("events").doc(props.event.event_id);
      const announcementRef = eventRef
        .collection("internal_announcements")
        .doc();

      return announcementRef
        .set(announcement)
        .then(() => {
          console.log("Successfully added new internal announcement");
        })
        .catch((error) => {
          console.error("Error adding new internal announcement: ", error);
        });
    }
  };

  const EventComponent = (props) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTeamInfo, setNewTeamInfo] = useState(null);
    const [isModalAnnouncementVisible, setIsModalAnnouncementVisible] =
      useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const handleDeleteAnnouncement = () => {
      let type = "external_announcements";

      if (selectedTab == "Interna obaveštenja") type = "internal_announcements";
      console.log(props.event.event_id);
      console.log(type);
      console.log(selectedAnnouncement.id);
      db.collection("events")
        .doc(props.event.event_id)
        .collection(type)
        .doc(selectedAnnouncement.id)
        .delete()
        .then(() => {
          console.log("done");
          setSelectedAnnouncement(null);
          setIsModalAnnouncementVisible(false);
        })
        .catch((e) => {
          console.log(e);
          setSelectedAnnouncement(null);
          setIsModalAnnouncementVisible(false);
        });
    };
    const editTeam = () => {
      setIsModalVisible(true);
    };

    const saveTeamInfo = () => {
      if (newTeamInfo == null) {
        setIsModalVisible(false);
        return;
      }
      if (selectedRole === "General") {
        const eventRef = db.collection("events").doc(props.event.event_id);
        eventRef.update({
          info: newTeamInfo,
        });
      } else {
        const teamRef = db
          .collection("teams")
          .doc(selectedRole)
          .collection("subteams")
          .doc(props.event.event_id);

        teamRef.update({
          info: newTeamInfo,
        });
        let n = teamInfo;
        n.info = newTeamInfo;
        setTeamInfo(n);
      }
      setIsModalVisible(false);
    };

    const handleAnnouncementPress = (announcement) => {
      if (
        announcement.posterEmail &&
        props.user.user_id &&
        props.user.user_id == announcement.posterEmail
      ) {
        setSelectedAnnouncement(announcement);

        setIsModalAnnouncementVisible(true);
      }
    };
    const handleApprove = (item) => {
      setLoading(true);

      const announcementRef = db
        .collection("events")
        .doc(props.event.event_id)
        .collection("external_announcements")
        .doc(item.id);
      announcementRef
        .update({ approved: true })
        .then(() => {
          console.log("Updated");
          Alert.alert("Uspešno ste odobrili obaveštenje");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Greška", error);
          setLoading(false);
        });
    };

    const handleReject = (item) => {
      const announcementRef = db
        .collection("events")
        .doc(props.event.event_id)
        .collection("external_announcements")
        .doc(item.id);

      announcementRef
        .delete()
        .then(() => {
          console.log("Deleted");
          Alert.alert("Uspešno ste obrisali obaveštenje");
          setLoading(false);
        })
        .catch((error) => {
          console.error("Greška", error);
          setLoading(false);
        });
    };

    return (
      <View style={event_style.container}>
        <View style={event_style.rolesContainer}>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "General" && event_style.selectedRole,
              // {flex: 3},
            ]}
            onPress={() => selectRole("General")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "General" && { fontWeight: "600" },
              ]}
            >
              Org tim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "PR" && event_style.selectedRole,
            ]}
            onPress={() => selectRole("PR")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "PR" && { fontWeight: "600" },
              ]}
            >
              PR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "FR" && event_style.selectedRole,
            ]}
            onPress={() => selectRole("FR")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "FR" && { fontWeight: "600" },
              ]}
            >
              FR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "Dizajn" && event_style.selectedRole,
            ]}
            onPress={() => selectRole("Dizajn")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "Dizajn" && { fontWeight: "600" },
              ]}
            >
              Dizajn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "HR" && event_style.selectedRole,
            ]}
            onPress={() => selectRole("HR")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "HR" && { fontWeight: "600" },
              ]}
            >
              HR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.role,
              selectedRole === "IT" && event_style.selectedRole,
            ]}
            onPress={() => selectRole("IT")}
          >
            <Text
              style={[
                event_style.roleText,
                selectedRole === "IT" && { fontWeight: "600" },
              ]}
            >
              IT
            </Text>
          </TouchableOpacity>
        </View>
        <View style={event_style.dividersContainer}>
          <TouchableOpacity
            style={[
              event_style.divider,
              selectedTab === "Zvanična obaveštenja" && event_style.selectedTab,
            ]}
            onPress={() => handlePress("Zvanična obaveštenja")}
          >
            <Text
              style={[
                event_style.dividerText,
                selectedTab === "Zvanična obaveštenja" && { fontWeight: "500" },
              ]}
            >
              Zvanična obaveštenja
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isInternalButtonDisabled}
            style={[
              event_style.divider,
              selectedTab === "Interna obaveštenja" && event_style.selectedTab,
              isInternalButtonDisabled && event_style.disabledButton,
            ]}
            onPress={() => handlePress("Interna obaveštenja")}
          >
            <Text
              style={[
                event_style.dividerText,
                selectedTab === "Interna obaveštenja" && { fontWeight: "500" },
              ]}
            >
              Interna obaveštenja
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isInternalButtonDisabled}
            style={[
              event_style.divider,
              selectedTab === "Zaduženja" && event_style.selectedTab,
              isInternalButtonDisabled && event_style.disabledButton,
            ]}
            onPress={() => handlePress("Zaduženja")}
          >
            <Text
              style={[
                event_style.dividerText,
                selectedTab === "Zaduženja" && { fontWeight: "500" },
              ]}
            >
              Zaduženja
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              event_style.divider,
              selectedTab === "O timu" && event_style.selectedTab,
            ]}
            onPress={() => handlePress("O timu")}
          >
            <Text
              style={[
                event_style.dividerText,
                selectedTab === "O timu" && { fontWeight: "500" },
              ]}
            >
              {selectedRole == "General" ? "O događaju" : "O timu"}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {tabLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              {selectedTab === "Zvanična obaveštenja" ? (
                <View style={event_style.listContainer}>
                  <FlatList
                    ListEmptyComponent={
                      <Text style={event_style.info}>
                        Nema zvaničnih obaveštenja
                      </Text>
                    }
                    data={externalAnnouncements.filter(
                      (item) =>
                        props.user.managed_teams.includes(selectedRole) ||
                        props.user.managed_teams.includes(
                          props.event.event_id + " " + selectedRole
                        ) ||
                        item.approved === true
                    )}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onLongPress={() => handleAnnouncementPress(item)}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <View
                            style={
                              item.approved
                                ? event_style.obcontainer
                                : event_style.obcontainerRequest
                            }
                          >
                            <View style={event_style.notificationHeader}>
                              <View style={event_style.notificationHeaderImg}>
                                {item.slika !== "" ? (
                                  <Image
                                    source={{ uri: item.slika }}
                                    style={event_style.image}
                                  />
                                ) : (
                                  <Avatar
                                    label={
                                      item.ime != undefined &&
                                      item.ime != null &&
                                      item.prezime != undefined &&
                                      item.prezime != null
                                        ? item.ime + " " + item.prezime
                                        : "AA"
                                    }
                                    size={50}
                                  />
                                )}
                              </View>
                              <View style={event_style.notificationHeaderText}>
                                <Text style={event_style.ime}>
                                  {item.poster}
                                </Text>
                                <Text style={event_style.date}>
                                  {item.date_posted.toLocaleString()}
                                </Text>
                              </View>
                            </View>
                            <View style={event_style.textcontainer}>
                              <Text style={event_style.naslov}>
                                {item.title}
                              </Text>
                              <Text style={event_style.text}>{item.text}</Text>
                            </View>
                            {item.approved === false && (
                              <View style={event_style.pending}>
                                {/* <Pressable
                                  style={event_style.buttonmodal}
                                  onPress={() => handleApprove(item)}
                                >
                                  <Text style={event_style.buttonText}>
                                    Prihvati
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={event_style.buttonmodal}
                                  onPress={() => handleReject(item)}
                                >
                                  <Text style={event_style.buttonText}>
                                    Odbaci
                                  </Text>
                                </Pressable> */}
                                <Pressable
                                  onPress={() => handleApprove(item)}
                                  style={event_style.pendingYes}
                                >
                                  <Text
                                    style={{
                                      textAlign: "center",
                                      margin: "3%",
                                    }}
                                  >
                                    Prihvati
                                  </Text>
                                  <Ionicons
                                    name="ios-checkmark-done"
                                    size={24}
                                    color="black"
                                  />
                                </Pressable>
                                <Pressable
                                  style={event_style.pendingNo}
                                  onPress={() => handleReject(item)}
                                >
                                  <Text
                                    style={{
                                      textAlign: "center",
                                      margin: "3%",
                                    }}
                                  >
                                    Odbij
                                  </Text>
                                  <Feather name="x" size={24} color="black" />
                                </Pressable>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  {isModalAnnouncementVisible && selectedAnnouncement && (
                    <Modal
                      animationType="fade"
                      transparent={true}
                      onRequestClose={() => {
                        setIsModalAnnouncementVisible(false);
                      }}
                    >
                      <Pressable
                        onPress={() => setIsModalAnnouncementVisible(false)}
                      >
                        <Pressable style={task.modal}>
                          <Text style={task.modalText}>
                            Da li ste sigurni da želite{"\n"}da obrišete
                            obaveštenje {"\n"}
                            <Text
                              style={
                                task.modalText && {
                                  fontWeight: "800",
                                  fontSize: 24,
                                  paddingTop: 10,
                                }
                              }
                            >
                              {selectedAnnouncement.title}
                            </Text>{" "}
                            ?
                          </Text>
                          <View style={task.modalChoice}>
                            <Pressable
                              style={task.modalPressable}
                              onPress={() => {
                                handleDeleteAnnouncement();
                              }}
                            >
                              <Text style={task.modalPressableText}>Da</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                setIsModalAnnouncementVisible(false);
                              }}
                              style={[
                                task.modalPressable,
                                {
                                  backgroundColor: colorTheme.button + "ee",
                                },
                              ]}
                            >
                              <Text style={task.modalPressableText}>Ne</Text>
                            </Pressable>
                          </View>
                        </Pressable>
                      </Pressable>
                    </Modal>
                  )}
                </View>
              ) : (
                <>
                  {selectedTab === "Interna obaveštenja" ? (
                    <View style={event_style.listContainer}>
                      <FlatList
                        ListEmptyComponent={
                          <Text style={event_style.info}>
                            Nema internih obaveštenja
                          </Text>
                        }
                        data={internalAnnouncements}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onLongPress={() => handleAnnouncementPress(item)}
                          >
                            <View>
                              <View style={event_style.obcontainer}>
                                <View style={event_style.notificationHeader}>
                                  <View
                                    style={event_style.notificationHeaderImg}
                                  >
                                    {item.slika !== "" ? (
                                      <Image
                                        source={{ uri: item.slika }}
                                        style={event_style.image}
                                      />
                                    ) : (
                                      <Avatar
                                        label={
                                          item.ime != undefined &&
                                          item.ime != null &&
                                          item.prezime != undefined &&
                                          item.prezime != null
                                            ? item.ime + " " + item.prezime
                                            : "AA"
                                        }
                                        size={50}
                                      />
                                    )}
                                  </View>
                                  <View
                                    style={event_style.notificationHeaderText}
                                  >
                                    <Text style={event_style.ime}>
                                      {item.poster}
                                    </Text>
                                    <Text style={event_style.date}>
                                      {item.date_posted.toLocaleString()}
                                    </Text>
                                  </View>
                                </View>
                                <View style={event_style.textcontainer}>
                                  <Text style={event_style.naslov}>
                                    {item.title}
                                  </Text>
                                  <Text style={event_style.text}>
                                    {item.text}
                                  </Text>
                                </View>
                                {item.approved === false && (
                                  <View style={event_style.pending}>
                                    {/* <Pressable
                                  style={event_style.buttonmodal}
                                  onPress={() => handleApprove(item)}
                                >
                                  <Text style={event_style.buttonText}>
                                    Prihvati
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={event_style.buttonmodal}
                                  onPress={() => handleReject(item)}
                                >
                                  <Text style={event_style.buttonText}>
                                    Odbaci
                                  </Text>
                                </Pressable> */}
                                    <Pressable
                                      onPress={() => handleApprove(item)}
                                      style={event_style.pendingYes}
                                    >
                                      <Text
                                        style={{
                                          textAlign: "center",
                                          margin: "3%",
                                        }}
                                      >
                                        Prihvati
                                      </Text>
                                      <Ionicons
                                        name="ios-checkmark-done"
                                        size={24}
                                        color="black"
                                      />
                                    </Pressable>
                                    <Pressable
                                      style={event_style.pendingNo}
                                      onPress={() => handleReject(item)}
                                    >
                                      <Text
                                        style={{
                                          textAlign: "center",
                                          margin: "3%",
                                        }}
                                      >
                                        Odbij
                                      </Text>
                                      <Feather
                                        name="x"
                                        size={24}
                                        color="black"
                                      />
                                    </Pressable>
                                  </View>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                      {isModalAnnouncementVisible && selectedAnnouncement && (
                        <Modal
                          animationType="fade"
                          transparent={true}
                          onRequestClose={() => {
                            setIsModalAnnouncementVisible(false);
                          }}
                        >
                          <Pressable
                            onPress={() => setIsModalAnnouncementVisible(false)}
                          >
                            <Pressable style={task.modal}>
                              <Text style={task.modalText}>
                                Da li ste sigurni da želite{"\n"}da obrišete
                                obaveštenje {"\n"}
                                <Text
                                  style={
                                    task.modalText && {
                                      fontWeight: "800",
                                      fontSize: 24,
                                      paddingTop: 10,
                                    }
                                  }
                                >
                                  {selectedAnnouncement.title}
                                </Text>{" "}
                                ?
                              </Text>
                              <View style={task.modalChoice}>
                                <Pressable
                                  style={task.modalPressable}
                                  onPress={() => {
                                    handleDeleteAnnouncement();
                                  }}
                                >
                                  <Text style={task.modalPressableText}>
                                    Da
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setIsModalAnnouncementVisible(false);
                                  }}
                                  style={[
                                    task.modalPressable,
                                    {
                                      backgroundColor: colorTheme.button + "ee",
                                    },
                                  ]}
                                >
                                  <Text style={task.modalPressableText}>
                                    Ne
                                  </Text>
                                </Pressable>
                              </View>
                            </Pressable>
                          </Pressable>
                        </Modal>
                      )}
                    </View>
                  ) : (
                    <>
                      {selectedTab === "Zaduženja" ? (
                        <View style={event_style.listContainer}>
                          <FlatList
                            data={tasks}
                            contentContainerStyle={
                              event_style.listContentContainer
                            }
                            ListEmptyComponent={
                              <Text style={event_style.info}>
                                Nema dostupnih zaduženja
                              </Text>
                            }
                            renderItem={({ item }) => {
                              return (
                                <View style={event_style.task}>
                                  <Task
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description}
                                    milestones={item.milestones}
                                    deadline={item.deadline}
                                    points={item.points}
                                    team={item.team_id}
                                    givenBy={item.user_id}
                                    worker={props.user}
                                    tab={5} //UNTAKEN TASKS
                                    done={item.done}
                                    confirmed_done={item.confirmed_done}
                                    deleted={item.deleted}
                                  />
                                </View>
                              );
                            }}
                            keyExtractor={(item, index) => index.toString()}
                          />
                        </View>
                      ) : (
                        <>
                          {selectedTab === "O timu" ? (
                            <>
                              <>
                                {teamInfo == null ? (
                                  <LoadingIndicator />
                                ) : (
                                  <>
                                    {teamInfo.koordinator != null ? (
                                      <>
                                        <Text style={event_style.nadlezan}>
                                          Nadležan:
                                        </Text>
                                        <View
                                          style={event_style.imageContainer}
                                        >
                                          {teamInfo.koordinator.slika != "" ? (
                                            <Image
                                              source={{
                                                uri: teamInfo.koordinator.slika,
                                              }}
                                              style={event_style.profileImage}
                                            />
                                          ) : (
                                            <View
                                              style={
                                                event_style.noImageContainer
                                              }
                                            >
                                              <Text
                                                style={
                                                  event_style.memberInitials
                                                }
                                              >
                                                {teamInfo.koordinator.ime.charAt(
                                                  0
                                                )}
                                                {teamInfo.koordinator.prezime.charAt(
                                                  0
                                                )}
                                              </Text>
                                            </View>
                                          )}
                                          <Text style={event_style.imekoor}>
                                            {teamInfo.koordinator.fullName}
                                          </Text>
                                        </View>
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                    <ScrollView
                                      showsVerticalScrollIndicator={false}
                                      showsHorizontalScrollIndicator={false}
                                      overScrollMode="never"
                                      contentContainerStyle={
                                        event_style.innerContainer
                                      }
                                    >
                                      <Text style={event_style.info}>
                                        {teamInfo.info}
                                      </Text>
                                    </ScrollView>
                                    {props.user.managed_teams.includes(
                                      selectedRole
                                    ) ||
                                    props.user.managed_teams.includes(
                                      props.event.event_id + " " + selectedRole
                                    ) ? (
                                      <Pressable
                                        style={event_style.buttonmodal}
                                        onPress={() => editTeam()}
                                      >
                                        <Text style={event_style.buttonText}>
                                          Edit
                                        </Text>
                                      </Pressable>
                                    ) : (
                                      <></>
                                    )}
                                    <Modal
                                      transparent={true}
                                      visible={isModalVisible}
                                      animationType="slide"
                                    >
                                      <SafeAreaView style={{ flex: 1 }}>
                                        <Pressable
                                          style={event_style.modalContainer}
                                          onPress={() => {
                                            setIsModalVisible(false);
                                          }}
                                        >
                                          <Pressable
                                            style={event_style.modalContent}
                                          >
                                            <Text
                                              style={event_style.modalTitle}
                                            >
                                              Promena informacija o{" "}
                                              {selectedRole === "General"
                                                ? "događaju"
                                                : "timu"}{" "}
                                              :
                                            </Text>
                                            <TextInput
                                              style={[
                                                event_style.modalTextInput,
                                                event_style.modalDescriptionTextInput,
                                              ]}
                                              onChangeText={(text) =>
                                                setNewTeamInfo(text)
                                              }
                                              defaultValue={teamInfo.info}
                                              multiline={true}
                                              autoCorrect={false}
                                            ></TextInput>
                                            <View style={event_style.buttons}>
                                              <Pressable
                                                style={event_style.buttonmodal}
                                                onPress={() =>
                                                  setIsModalVisible(false)
                                                }
                                              >
                                                <Text
                                                  style={event_style.buttonText}
                                                >
                                                  Odustani
                                                </Text>
                                              </Pressable>
                                              <Pressable
                                                style={event_style.buttonmodal}
                                                onPress={() => saveTeamInfo()}
                                              >
                                                <Text
                                                  style={event_style.buttonText}
                                                >
                                                  Sačuvaj
                                                </Text>
                                              </Pressable>
                                            </View>
                                          </Pressable>
                                        </Pressable>
                                      </SafeAreaView>
                                    </Modal>
                                  </>
                                )}
                              </>
                            </>
                          ) : (
                            <View>
                              <Text>test</Text>
                              <Text>{props.event.name}</Text>
                            </View>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  };
  return (
    <BottomNav nav={props.nav}>
      <EventComponent event={props.event} user={props.user}></EventComponent>
      {isTeamButtonVisible && (
        <>
          <>
            {selectedRole == "General" ? (
              <>
                <>
                  {props.user.positions.filter(
                    (x) =>
                      x.collection == "board" &&
                      x.document == "board" &&
                      x.position == "chairperson"
                  ).length == 1 ? (
                    <>
                      <TouchableOpacity
                        style={event_style.fullWidthButton}
                        onPress={() => changeApplicationsOpen()}
                      >
                        <Text style={event_style.fullWidthButtonText}>
                          {props.event.applications_open
                            ? "Zatvori prijave za organizacioni tim"
                            : "Otvori prijave za organizacioni tim"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={event_style.fullWidthButton}
                        onPress={() => openApplicationForOC()}
                      >
                        <Text style={event_style.fullWidthButtonText}>
                          Pregledaj prijave za organizacioni tim
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <></>
                  )}
                </>
                {props.event.applications_open &&
                props.user.positions.filter(
                  (p) =>
                    p.collection == "events" &&
                    p.document == props.event.event_id
                ).length == 0 ? (
                  <TouchableOpacity
                    style={event_style.fullWidthButton1}
                    onPress={() => handleOrgTeamApplication()}
                  >
                    <Text style={event_style.fullWidthButtonText}>
                      Prijavi se za organizacioni tim !
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <>
                  {props.user.managed_teams.includes(selectedRole) ? (
                    <TouchableOpacity
                      style={event_style.fullWidthButton}
                      onPress={() => viewTeamReq()}
                    >
                      <Text style={event_style.fullWidthButtonText}>
                        Pregledaj zahteve za ulaz u tim
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {props.user.positions.filter(
                        (x) =>
                          x.document == selectedRole && x.position == "member"
                      ).length > 0 ? (
                        <>
                          {/*<TouchableOpacity
                          style={event_style.fullWidthButton}
                          onPress={() => handlePress1()}
                        >
                          <Text style={event_style.fullWidthButtonText}>
                            Prijavi se za tim !
                          </Text>
                      </TouchableOpacity>*/}
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </>
              </>
            )}
          </>
        </>
      )}
      <>
        {isPostButtonVisible &&
        (props.user.positions.filter(
          (position) =>
            position.document === selectedRole && position.position === "member"
        ).length > 0 ||
          props.user.managed_teams.includes(selectedRole) ||
          props.user.managed_teams.includes(
            props.event.event_id + " " + selectedRole
          ) ||
          (selectedRole === "General" &&
            (props.user.positions.filter(
              (position) =>
                position.collection === "board" && position.document === "board"
            ).length > 0 ||
              props.user.positions.filter(
                (position) =>
                  position.collection === "events" &&
                  position.document === props.event.event_id
              ).length > 0))) ? (
          <TouchableOpacity
            style={event_style.fullWidthButton1}
            onPress={() => setModalVisible(true)}
          >
            <Text style={event_style.fullWidthButtonText}>
              {(selectedRole != "General" &&
                (selectedTab === "Interna obaveštenja" ||
                  (selectedTab === "Zvanična obaveštenja" &&
                    (props.user.managed_teams.includes(selectedRole) ||
                      props.user.managed_teams.includes(
                        props.event.event_id + " " + selectedRole
                      ))))) ||
              (selectedRole === "General" &&
                (props.user.positions.filter(
                  (position) =>
                    position.collection === "board" &&
                    position.document === "board"
                ).length > 0 ||
                  props.user.positions.filter(
                    (position) =>
                      position.collection === "events" &&
                      position.document === props.event.event_id
                  ).length > 0))
                ? "Objavi novo obaveštenje"
                : "Napravi zahtev za objavu novog obaveštenja"}
            </Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </>
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        {/* <SafeAreaView style={{ flex: 1 }}> */}
        <Pressable
          style={event_style.modalContainer}
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <Pressable style={event_style.modalContent}>
            <Text style={event_style.modalTitle}>Naslov obaveštenja:</Text>
            <TextInput
              style={event_style.modalTextInput}
              value={title}
              onChangeText={(text) => setTitle(text)}
              autoCorrect={false}
            />
            <Text style={event_style.modalTitle}>Sadržaj obaveštenja:</Text>
            <TextInput
              style={[
                event_style.modalTextInput,
                event_style.modalDescriptionTextInput,
              ]}
              autoCorrect={false}
              value={description}
              onChangeText={(text) => setDescription(text)}
              multiline={true}
              numberOfLines={4}
            />
            {loading ? (
              <View style={{ flex: 1, justifyContent: "space-evenly" }}>
                <Text style={{ color: "#00000000", fontSize: 32, flex: 1 }}>
                  Neki tekst
                </Text>
                <LoadingIndicator />
                <Text style={{ color: "#00000000", fontSize: 32, flex: 1 }}>
                  Neki tekst
                </Text>
              </View>
            ) : (
              <View style={event_style.buttons}>
                <Pressable
                  style={event_style.buttonmodal}
                  onPress={handleModalSubmit}
                >
                  <Text style={event_style.buttonText}>Objavi</Text>
                </Pressable>
                <Pressable
                  style={{ marginTop: 20 }}
                  onPress={() => {
                    setModalVisible(false);
                    setTitle("");
                    setDescription("");
                  }}
                >
                  <Text style={event_style.odustani}>Odustani</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
        {/* </SafeAreaView> */}
      </Modal>
    </BottomNav>
  );
};
