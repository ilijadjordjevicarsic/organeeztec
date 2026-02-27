import {
  Platform,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  Linking,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import * as React from "react";
import { meetings_style } from "../styles/meetings-style";
import { BottomNav } from "./BottomNav";
import { Alert } from "react-native";
import { Button, Avatar } from "@react-native-material/core";
import { useState, useEffect, useRef } from "react";
import { deleteMeeting, finishMeeting } from "../firebase_functions";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { documentId } from "firebase/firestore";
import { getTeams, getUnarchivedEvents } from "../firebase_functions";
import DateTimePicker from "@react-native-community/datetimepicker";
import Moment from "moment";
import { LoadingIndicator } from "./LoadingIndicator";
import Toast from "react-native-root-toast";
import {
  addNewMeeting,
  db,
  confirmAttendance,
  unconfirmAttendance,
} from "../firebase_functions";
import { BasicListItemBG } from "./BasicListItemBG";
import { sortMeetings } from "../scripts/helperFunctions";
import { isValidHttpUrl } from "../scripts/helperFunctions";

export const MeetingsPage = (props) => {
  const [selectedTab, setSelectedTab] = useState("Predstojeći");
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeam, setSelectedTeams] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [loadedMeetings, setLoadedMeetings] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [MoMLink, setMoMLink] = useState("");
  const [addingMoM, setAddingMoM] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingAttendance, setChangingAttendance] = useState(false);
  const [clickedMeeting, _setClickedMeeting] = React.useState(null);
  const clickedMeetingRef = React.useRef(clickedMeeting);
  const setClickedMeeting = (clicked) => {
    clickedMeetingRef.current = clicked;
    _setClickedMeeting(clicked);
  };
  const meeting = (item) => {
    let archived = false;
    item.event_ids.forEach((e) => {
      if (e != "General") {
        let event = allEvents.find((b) => b.event_id == e);
        if (!event) archived = true;
      }
    });
    if (!archived)
      return (
        <>
          <View style={meetings_style.dateAndTeam}>
            <Text>
              {item.team_id == "General"
                ? (() => {
                    let thing = "";
                    item.event_ids.forEach((e) => {
                      if (e != "General") {
                        let event = allEvents.find((b) => b.event_id == e);
                        if (event != undefined)
                          thing = thing + " " + event.skraceno;
                      }
                    });
                    if (thing == "") thing = "Bord";
                    else thing = "Org tim - " + thing;
                    return thing;
                  })()
                : (() => {
                    let thing = item.team_id;
                    item.event_ids.forEach((e) => {
                      if (e != "General") {
                        let event = allEvents.find((b) => b.event_id == e);
                        if (event != undefined)
                          thing = thing + " - " + event.skraceno;
                      }
                    });
                    return thing;
                  })()}{" "}
            </Text>
            <Text>
              {Moment(item.beginning.toDate()).format("DD/MM/yy")} od
              {" " + Moment(item.beginning.toDate()).format("HH:mm")} do
              {" " + Moment(item.end.toDate()).format("HH:mm")}
            </Text>
          </View>
          <Text>{item.title}</Text>
          <View></View>
        </>
      );
  };
  useEffect(() => {
    //const fetchedTeams = await getTeams();
    setLoadedMeetings(false);
    if (selectedTab == "Predstojeći") {
      const fetchEvents = async () => {
        getUnarchivedEvents()
          .then((fetchedEvents) => {
            console.log(fetchedEvents);
            setAllEvents(fetchedEvents);

            let availableTeams = [];

            if (
              props.user.positions.filter((p) => p.collection == "board")
                .length > 0
            ) {
              availableTeams.push({
                key: "bordgen",
                id: "Bord",
                name: "Bord",
                events: [],
              });
              let events = [];
              events = fetchedEvents.map((e) => ({
                key: e.event_id + "bordorg",
                event_id: e.event_id,
                skraceno: e.skraceno,
              }));

              availableTeams.push({
                key: "orgen",
                id: "Org",
                name: "Org tim",
                events: events,
              });
            } else if (
              props.user.positions.filter((p) => p.collection == "events")
                .length > 0
            ) {
              let forGeneral = [];

              props.user.positions
                .filter((p) => p.collection == "events")
                .forEach((p) => {
                  let event = fetchedEvents.find(
                    (e) => e.event_id == p.document
                  );
                  if (event) {
                    if (
                      forGeneral.filter(
                        (e) => e.key == p.document + "orgevents"
                      ).length == 0
                    )
                      forGeneral.push({
                        key: p.document + "orgevents",
                        event_id: p.document,
                        skraceno: event.skraceno,
                      });
                  }
                });
              availableTeams.push({
                key: "orggeneral",
                id: "Org",
                name: "Org tim",
                events: forGeneral,
              });
            }
            props.user.managed_teams.forEach((element) => {
              let helpArray = element.split(" ");

              if (helpArray.length == 1) {
                //bord pozicija
                let tim = helpArray[0];
                if (tim != "General") {
                  let index = -1;
                  availableTeams.forEach((t, i) => {
                    if (t.id == tim) index = i;
                  });
                  if (index == -1) {
                    let events = fetchedEvents.map((e) => ({
                      key: e.event_id + tim,
                      event_id: e.event_id,
                      skraceno: e.skraceno,
                    }));
                    events.push({
                      key: tim + "general",
                      event_id: "General",
                      skraceno: "General",
                    });

                    availableTeams.push({
                      key: tim,
                      id: tim,
                      name: tim,
                      events: [...events],
                    });
                  } else {
                    let events = fetchedEvents.map((e) => ({
                      key: e.event_id + "timidk",
                      event_id: e.event_id,
                      skraceno: e.skraceno,
                    }));
                    events.push({
                      key: tim + "general",
                      event_id: "General",
                      skraceno: "General",
                    });

                    events.forEach((e) => {
                      if (
                        availableTeams[index].events.filter(
                          (t) =>
                            t.skraceno == e.skraceno && t.event_id == e.event_id
                        ).length == 0
                      )
                        availableTeams[index].events.push({
                          key: tim + e.event_id + "hm",
                          ...e,
                        });
                    });
                  }
                }
              } else if (helpArray.length == 2) {
                let tim = helpArray[1];
                if (tim != "General") {
                  let event = fetchedEvents.map((e) => ({
                    key: e.event_id + tim + "haha",
                    event_id: e.event_id,
                    skraceno: e.skraceno,
                  }));
                  event = event.find((e) => e.event_id == helpArray[0]);
                  if (event) {
                    let index = -1;
                    let present = availableTeams.forEach((t, i) => {
                      if (t.id == tim) index = i;
                    });
                    if (index == -1) {
                      availableTeams.push({
                        key: tim + "av",
                        id: tim,
                        name: tim,
                        events: [event],
                      });
                    } else {
                      if (
                        availableTeams[index].events.filter(
                          (e) => e.event_id == event.event_id
                        ).length == 0
                      )
                        availableTeams[index].events.push(event);
                    }
                  }
                }
              }
            });
            setTeams(availableTeams);
            availableTeams.forEach((a) => {});
            setLoaded(true);
          })
          .catch((err) => {
            console.log("greška" + err);
          });
      };
      fetchEvents();
      const listener = db
        .collection("meetings")
        .onSnapshot((allMeetingsSnaps) => {
          let myMeetings = [];
          let promises = [];
          allMeetingsSnaps.docs.forEach((snap) => {
            let data = { ...snap.data(), id: snap.id };

            let addMeetingFunc = () => {
              if (
                data.attendance_confirmations != null &&
                data.attendance_confirmations.length > 0
              )
                promises.push(
                  db
                    .collection("users")
                    .where(documentId(), "in", data.attendance_confirmations)
                    .get()
                    .then((userSnaps) => {
                      data.attendeeInfo = [];
                      userSnaps.docs.forEach((doc) => {
                        let user = doc.data();
                        user.id = doc.id;

                        data.attendeeInfo.push(user);
                      });

                      myMeetings.push(data);
                    })
                    .catch((err) => console.log(err))
                );
              else myMeetings.push({ ...data, attendeeInfo: [] });
            };

            if (data.user == props.user.user_id) {
              addMeetingFunc();
            } else if (
              !(
                data.beginning.toDate().getTime() < new Date() &&
                data.end.toDate().getTime() < new Date()
              )
            ) {
              if (
                props.user.positions.filter(
                  (p) =>
                    p.collection == "teams" &&
                    p.document == data.team_id &&
                    p.position == "member"
                ).length != 0
              )
                addMeetingFunc();
              else if (props.user.managed_teams.includes(data.team_id)) {
                addMeetingFunc();
              } else if (
                props.user.positions.filter(
                  (p) => p.collection == "board" && p.document == "board"
                ).length > 0 &&
                data.team_id == "General"
              ) {
                addMeetingFunc();
              } else if (
                props.user.positions.filter(
                  (p) =>
                    p.collection == "events" &&
                    data.event_ids.includes(p.document) &&
                    (data.team_id == "General" ||
                      props.user.positions.includes(
                        p.document + " " + data.team_id
                      ))
                ).length > 0
              ) {
                addMeetingFunc();
              } else if (
                data.attendance_confirmations.includes(props.user.user_id) ||
                data.outsiders.includes(props.user.user_id)
              ) {
                addMeetingFunc();
              }
            }
          });
          Promise.all(promises)
            .then(() => {
              myMeetings = myMeetings.sort(sortMeetings);
              setMeetings(myMeetings);

              setChangingAttendance(false);
              setLoadedMeetings(true);
              if (clickedMeetingRef.current != null) {
                let n = myMeetings.find((m) => {
                  return m.id == clickedMeetingRef.current.id;
                });
                setClickedMeeting(n);

                if (
                  clickedMeetingRef.current == undefined ||
                  clickedMeetingRef.current == null
                ) {
                  console.log("obrisan");
                }
              }
            })
            .catch((err) => console.log(err));
        });
      return () => {
        listener();
      };
    } else {
      const listener = db
        .collection("finished_meetings")
        .onSnapshot((allMeetingsSnaps) => {
          let myMeetings = [];
          let promises = [];
          allMeetingsSnaps.docs.forEach((snap) => {
            let data = { ...snap.data(), id: snap.id };

            let addMeetingFunc = () => {
              if (data.attendees != null && data.attendees.length > 0)
                promises.push(
                  db
                    .collection("users")
                    .where(documentId(), "in", data.attendees)
                    .get()
                    .then((userSnaps) => {
                      data.attendeeInfo = [];
                      userSnaps.docs.forEach((doc) => {
                        let user = doc.data();
                        user.id = doc.id;
                        data.attendeeInfo.push(user);
                      });

                      myMeetings.push(data);
                    })
                    .catch((err) => console.log(err))
                );
              else myMeetings.push({ ...data, attendeeInfo: [] });
            };

            if (data.user == props.user.user_id) addMeetingFunc();
            else {
              if (
                props.user.positions.filter(
                  (p) =>
                    p.collection == "teams" &&
                    p.document == data.team_id &&
                    p.position == "member"
                ).length != 0
              )
                addMeetingFunc();
              else if (props.user.managed_teams.includes(data.team_id)) {
                addMeetingFunc();
              } else if (
                props.user.positions.filter(
                  (p) => p.collection == "board" && p.document == "board"
                ).length > 0 &&
                data.team_id == "General"
              ) {
                addMeetingFunc();
              } else if (
                props.user.positions.filter(
                  (p) =>
                    p.collection == "events" &&
                    data.event_ids.includes(p.document) &&
                    (data.team_id == "General" ||
                      props.user.positions.includes(
                        p.document + " " + data.team_id
                      ))
                ).length > 0
              ) {
                addMeetingFunc();
              } else if (data.attendees.includes(props.user.user_id)) {
                addMeetingFunc();
              }
            }
          });
          Promise.all(promises)
            .then(() => {
              myMeetings = myMeetings.sort(sortMeetings);
              setMeetings(myMeetings);

              setChangingAttendance(false);
              setLoadedMeetings(true);
              if (clickedMeetingRef.current != null) {
                let n = myMeetings.find((m) => {
                  return m.id == clickedMeetingRef.current.id;
                });
                setClickedMeeting(n);

                if (
                  clickedMeetingRef.current == undefined ||
                  clickedMeetingRef.current == null
                ) {
                  console.log("obrisan");
                }
              }
            })
            .catch((err) => console.log(err));
        });
      return () => {
        listener();
      };
    }
  }, [selectedTab]);

  useEffect(() => {
    setSelectedEvent([]);
    if (selectedTeam != null) setEvents(selectedTeam.events);
    else setEvents([]);
  }, [selectedTeam]);
  useEffect(() => {
    setSelectedTeams(null);
    setSelectedEvent([]);
    setEvents([]);
    setDescription("");
    setStartTime(new Date());
    setEndTime(new Date());
    setDate(new Date());
    setTitle("");
    setSaving(false);
    setChangingAttendance(false);
  }, [modalVisible]);
  useEffect(() => {
    setChangingAttendance(false);
    setAddingMoM(false);
  }, [clickedMeeting]);
  const handlePress = (tab) => {
    setSelectedTab(tab);
  };

  const handleAddMeeting = () => {
    setModalVisible(true);
  };
  const handleConfirmAttendance = () => {
    setChangingAttendance(true);
    confirmAttendance(clickedMeeting.id)
      .then(() => {
        console.log("gotovo");
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Došlo je do greške", "Proverite konekciju");
        setChangingAttendance(false);
      });
  };
  const handleAddMoM = (id) => {
    setAddingMoM(true);
    if (!isValidHttpUrl(MoMLink)) {
      Alert.alert("URL nije validan");
      setAddingMoM(false);
      return;
    }
    Linking.canOpenURL(MoMLink)
      .then(() => {
        return finishMeeting(clickedMeeting.id, MoMLink);
      })
      .then(() => {
        setClickedMeeting(null);
        setAddingMoM(false);
      })
      .catch((er) => {
        if (er == "neuspesno") {
          Alert.alert("Došlo je do greške", "Proverite konekciju");
        } else Alert.alert("URL nije validan");
        setAddingMoM(false);
        return;
      });
  };
  const handleUnconfirmAttendance = () => {
    setChangingAttendance(true);

    unconfirmAttendance(clickedMeeting.id)
      .then(() => {
        console.log("gotovo");
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Došlo je do greške", "Proverite konekciju");
        setChangingAttendance(false);
      });
  };
  const handleDelete = () => {
    setDeleting(true);
    deleteMeeting(clickedMeeting.id)
      .then(() => {
        Toast.show("Uspešno obrisan sastanak");
        setDeleting(false);
        setDeleteModalVisible(false);
        setClickedMeeting(null);
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Došlo je do greške", "Proverite konekciju");
        setDeleting(false);
        setDeleteModalVisible(false);
      });
  };
  const handleSaveMeeting = () => {
    setSaving(true);

    if (title == "") {
      Alert.alert("Morate uneti naslov");
      setSaving(false);
      return;
    }
    if (description == "") {
      Alert.alert("Morate uneti opis");
      setSaving(false);
      return;
    }
    let currentDate = new Date();

    if (currentDate.getTime() > date.getTime()) {
      Alert.alert("Uneti datum nije validan");
      setSaving(false);
      return;
    }
    if (currentDate > startTime) {
      Alert.alert("Uneto vreme početka sastanka nije validno");
      setSaving(false);
      return;
    }
    if (currentDate > endTime) {
      Alert.alert("Uneto vreme kraja sastanka nije validno");
      setSaving(false);
      return;
    }
    if (startTime >= endTime) {
      Alert.alert("Kraj sastanka mora biti posle početka sastanka");
      setSaving(false);
      return;
    }
    if (selectedTeam == null) {
      Alert.alert("Morate izabrati tim");
      setSaving(false);
      return;
    }
    if (selectedEvent.length == 0) {
      if (selectedTeam.id == "Bord") {
        selectedEvent.push("General");
      } else {
        Alert.alert("Morate izabrati događaj");
        setSaving(false);
        return;
      }
    }
    let tim = selectedTeam;
    if (selectedTeam.id == "Bord" || selectedTeam.id == "Org") {
      tim.id = "General";
    }
    let meeting = {
      title: title,
      description: description,
      beginning: startTime,
      end: endTime,
      event_ids: selectedEvent,
      team_id: tim.id,
    };
    addNewMeeting(meeting)
      .then(() => {
        setModalVisible(false);
        setSaving(false);
        Toast.show("Uspešno dodat sastanak");
      })
      .catch((err) => {
        console.log(err);
        setSaving(false);
        Alert.alert("Došlo je do greške", "Proverite konekciju");
      });
  };

  const handleCancelMeeting = () => {
    setModalVisible(false);
  };

  const handleStartTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || startTime;
    setShowStartTimePicker(Platform.OS === "ios");
    setStartTime(currentDate);
  };

  const handleEndTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || endTime;
    setShowEndTimePicker(Platform.OS === "ios");
    setEndTime(currentDate);
  };
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endTime;
    setShowDatePicker(Platform.OS === "ios");
    let fullEndDate = new Date(currentDate);

    fullEndDate.setHours(endTime.getHours());

    fullEndDate.setMinutes(endTime.getMinutes());
    let fullStartDate = new Date(currentDate);

    fullStartDate.setHours(startTime.getHours());

    fullStartDate.setMinutes(startTime.getMinutes());
    setDate(currentDate);
    setEndTime(fullEndDate);
    setStartTime(fullStartDate);
  };

  const funcshowDatePicker = () => {
    setShowDatePicker(true);
  };

  const funcshowStartTimePicker = () => {
    setShowStartTimePicker(true);
  };

  const funcshowEndTimePicker = () => {
    setShowEndTimePicker(true);
  };
  return (
    <BottomNav nav={props.navigation} active="meetings">
      {loaded ? (
        <>
          <View style={meetings_style.dividersContainer}>
            <TouchableOpacity
              style={[
                meetings_style.button1,
                selectedTab === "Predstojeći" && meetings_style.selectedTab,
              ]}
              onPress={() => handlePress("Predstojeći")}
            >
              <Text style={meetings_style.buttonText}>Predstojeći</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                meetings_style.button1,
                selectedTab === "Gotovi" && meetings_style.selectedTab,
              ]}
              onPress={() => handlePress("Gotovi")}
            >
              <Text style={meetings_style.buttonText}>Gotovi</Text>
            </TouchableOpacity>
          </View>

          <>
            {selectedTab == "Predstojeći" ? (
              <>
                {props.user.positions.filter((p) => p.collection != "teams")
                  .length > 0 ? (
                  <TouchableOpacity
                    style={meetings_style.button}
                    onPress={handleAddMeeting}
                  >
                    <Text style={meetings_style.buttonText}>
                      Dodaj sastanak
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
                {loadedMeetings ? (
                  <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                      <Text style={meetings_style.label7}>
                        Nemate predstojeće sastanke
                      </Text>
                    }
                    keyExtractor={(item, index) => String(item.id)}
                    data={meetings}
                    renderItem={({ item }) => {
                      let archived = false;
                      item.event_ids.forEach((e) => {
                        if (e != "General") {
                          let event = allEvents.find((b) => b.event_id == e);
                          if (!event) archived = true;
                        }
                      });
                      if (!archived)
                        return (
                          <BasicListItemBG
                            onPress={() => {
                              setClickedMeeting(item);
                            }}
                            itemStyle={meetings_style.itemStyle}
                            cardStyle={(() => {
                              let style = { ...meetings_style.itemContainer };

                              if (
                                item.beginning.toDate().getTime() <
                                new Date().getTime()
                              ) {
                                //ako je prošao početak sastanka

                                if (
                                  item.end.toDate().getTime() >
                                  new Date().getTime()
                                ) {
                                  //ako je završen sastanak

                                  style.backgroundColor =
                                    meetings_style.currentMeetingColor;
                                } else {
                                  //ako je sastanak u toku

                                  style.backgroundColor =
                                    meetings_style.finishedMeetingColor;
                                }
                              } else {
                                /*nije prosao pocetak sastanka*/
                              }
                              return style;
                            })()}
                          >
                            <>{meeting(item)}</>
                          </BasicListItemBG>
                        );
                    }}
                  ></FlatList>
                ) : (
                  <LoadingIndicator />
                )}
                <Modal visible={clickedMeeting != null} animationType="slide">
                  <SafeAreaView style={{ flex: 1 }}>
                    {clickedMeeting != null ? (
                      <View style={meetings_style.clickedMeetingModalContent}>
                        <View>
                          {clickedMeeting.user == props.user.user_id &&
                          clickedMeeting.beginning.toDate().getTime() >
                            new Date().getTime() &&
                          clickedMeeting.end.toDate().getTime() >
                            new Date().getTime() ? (
                            <View style={meetings_style.deleteButton}>
                              <TouchableOpacity
                                onPress={() => setDeleteModalVisible(true)}
                              >
                                <MaterialIcons
                                  name="delete"
                                  size={24}
                                  color="black"
                                />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <></>
                          )}
                          <View style={meetings_style.dateAndTeam1}>
                            <Text style={meetings_style.label2}>
                              {clickedMeeting.team_id == "General"
                                ? (() => {
                                    let thing = "";
                                    clickedMeeting.event_ids.forEach((e) => {
                                      if (e != "General") {
                                        let event = allEvents.find(
                                          (b) => b.event_id == e
                                        );
                                        if (event != undefined)
                                          thing = thing + " " + event.skraceno;
                                      }
                                    });
                                    if (thing == "") thing = "Bord";
                                    else thing = "Org tim - " + thing;
                                    return thing;
                                  })()
                                : (() => {
                                    let thing = clickedMeeting.team_id;
                                    clickedMeeting.event_ids.forEach((e) => {
                                      if (e != "General") {
                                        let event = allEvents.find(
                                          (b) => b.event_id == e
                                        );
                                        if (event != undefined)
                                          thing =
                                            thing + " - " + event.skraceno;
                                      }
                                    });
                                    return thing;
                                  })()}{" "}
                              sastanak
                            </Text>
                            <Text style={meetings_style.label2}>
                              {Moment(clickedMeeting.beginning.toDate()).format(
                                "DD/MM/yy"
                              )}{" "}
                              od
                              {" " +
                                Moment(
                                  clickedMeeting.beginning.toDate()
                                ).format("HH:mm")}{" "}
                              do
                              {" " +
                                Moment(clickedMeeting.end.toDate()).format(
                                  "HH:mm"
                                )}
                            </Text>
                          </View>
                          <View>
                            {/*<Text>Naslov:{clickedMeeting.title}</Text>*/}
                            <Text style={meetings_style.label}>
                              Opis sastanka:
                            </Text>
                            <Text style={meetings_style.description}>
                              {clickedMeeting.description}
                            </Text>
                          </View>
                        </View>

                        {/*{clickedMeeting.user == props.user.user_id ? (
                  <></>
                ) : (*/}

                        <>
                          {clickedMeeting.beginning.toDate().getTime() >
                          new Date().getTime() ? (
                            <>
                              {clickedMeeting.attendeeInfo.length > 0 ? (
                                <>
                                  <Text style={meetings_style.label3}>
                                    Članovi koji su potvrdili dolazak:
                                  </Text>
                                  <ScrollView style={meetings_style.attendees}>
                                    {clickedMeeting.attendeeInfo.map((info) => (
                                      <View
                                        style={meetings_style.memberContainer}
                                        key={info.id}
                                      >
                                        {info.profile_pic_uri ? (
                                          <Image
                                            source={{
                                              uri: info.profile_pic_uri,
                                            }}
                                            style={meetings_style.memberImage}
                                          />
                                        ) : (
                                          <View
                                            style={
                                              meetings_style.noImageContainer
                                            }
                                          >
                                            <Text
                                              style={
                                                meetings_style.memberInitials
                                              }
                                            >
                                              {info.name.charAt(0)}
                                              {info.surname.charAt(0)}
                                            </Text>
                                          </View>
                                        )}

                                        <View
                                          style={meetings_style.textContainer}
                                        >
                                          <Text
                                            style={meetings_style.memberName}
                                          >
                                            {info.name + " " + info.surname}
                                          </Text>
                                        </View>
                                      </View>
                                    ))}
                                  </ScrollView>
                                </>
                              ) : (
                                <>
                                  {/*<Text>Niko nije potvrdio dolazak</Text>*/}
                                </>
                              )}
                              {props.user.user_id != clickedMeeting.user ? (
                                <>
                                  {changingAttendance ? (
                                    <LoadingIndicator />
                                  ) : (
                                    <>
                                      <>
                                        {clickedMeeting.attendance_confirmations.includes(
                                          props.user.user_id
                                        ) ? (
                                          <TouchableOpacity
                                            style={meetings_style.button}
                                            onPress={() =>
                                              handleUnconfirmAttendance()
                                            }
                                          >
                                            <Text
                                              style={[
                                                meetings_style.buttonText,
                                              ]}
                                            >
                                              Otkaži dolazak
                                            </Text>
                                          </TouchableOpacity>
                                        ) : (
                                          <TouchableOpacity
                                            style={meetings_style.button}
                                            onPress={() =>
                                              handleConfirmAttendance()
                                            }
                                          >
                                            <Text
                                              style={[
                                                meetings_style.buttonText,
                                              ]}
                                            >
                                              Potvrdi dolazak
                                            </Text>
                                          </TouchableOpacity>
                                        )}
                                      </>
                                    </>
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : clickedMeeting.end.toDate().getTime() <
                            new Date().getTime() ? (
                            <>
                              {props.user.user_id == clickedMeeting.user ? (
                                <View>
                                  <Text style={meetings_style.label}>
                                    Sastanak je završen. Unesite link do
                                    zapisnika:
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                    }}
                                  >
                                    <TextInput
                                      defaultValue={MoMLink}
                                      onChangeText={(text) => setMoMLink(text)}
                                      style={meetings_style.MoMinput}
                                      autoCorrect={false}
                                    ></TextInput>
                                    <View
                                      style={{
                                        flex: 0.2,
                                        alignContent: "center",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {addingMoM ? (
                                        <LoadingIndicator />
                                      ) : (
                                        <TouchableOpacity
                                          onPress={() =>
                                            handleAddMoM(clickedMeeting.id)
                                          }
                                        >
                                          <Feather
                                            name="check"
                                            size={24}
                                            color="black"
                                          />
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              ) : (
                                <Text style={meetings_style.label}>
                                  Ovaj sastanak se završio
                                </Text>
                              )}
                            </>
                          ) : (
                            <>
                              <Text style={meetings_style.label}>
                                Sastanak je u toku.{" "}
                                {clickedMeeting.attendeeInfo.length > 0
                                  ? "Prisustvuju:"
                                  : ""}
                              </Text>
                              {clickedMeeting.attendeeInfo.length > 0 ? (
                                <>
                                  <ScrollView style={meetings_style.attendees}>
                                    {clickedMeeting.attendeeInfo.map((info) => (
                                      <View
                                        style={meetings_style.memberContainer}
                                        key={info.id}
                                      >
                                        {info.profile_pic_uri ? (
                                          <Image
                                            source={{
                                              uri: info.profile_pic_uri,
                                            }}
                                            style={meetings_style.memberImage}
                                          />
                                        ) : (
                                          <View
                                            style={
                                              meetings_style.noImageContainer
                                            }
                                          >
                                            <Text
                                              style={
                                                meetings_style.memberInitials
                                              }
                                            >
                                              {info.name.charAt(0)}
                                              {info.surname.charAt(0)}
                                            </Text>
                                          </View>
                                        )}

                                        <View
                                          style={meetings_style.textContainer}
                                        >
                                          <Text
                                            style={meetings_style.memberName}
                                          >
                                            {info.name + " " + info.surname}
                                          </Text>
                                        </View>
                                      </View>
                                    ))}
                                  </ScrollView>
                                </>
                              ) : (
                                <></>
                              )}
                            </>
                          )}
                        </>

                        {/*})}*/}
                      </View>
                    ) : (
                      <></>
                    )}

                    <TouchableOpacity
                      style={meetings_style.button}
                      onPress={() => {
                        setClickedMeeting(null);
                      }}
                    >
                      <Text style={meetings_style.buttonText}>Zatvori</Text>
                    </TouchableOpacity>
                    <Modal
                      transparent={true}
                      visible={deleteModalVisible}
                      animationType="slide"
                    >
                      <Pressable
                        style={meetings_style.deleteModalContainer}
                        onPress={() => {
                          setDeleteModalVisible(false);
                        }}
                      >
                        <Pressable style={meetings_style.deleteModalContent}>
                          <Text style={meetings_style.label5}>
                            Da li ste sigurni da želite da izbrišete ovaj
                            sastanak?
                          </Text>
                          <View style={meetings_style.modalButtonContainer}>
                            {deleting ? (
                              <LoadingIndicator />
                            ) : (
                              <View style={meetings_style.buttons}>
                                <Pressable
                                  style={meetings_style.button}
                                  title="Da"
                                  onPress={() => {
                                    handleDelete();
                                  }}
                                >
                                  <Text style={meetings_style.buttonText}>
                                    Da
                                  </Text>
                                </Pressable>
                                <Pressable
                                  style={meetings_style.button}
                                  title="Ne"
                                  onPress={() => setDeleteModalVisible(false)}
                                >
                                  <Text style={meetings_style.buttonText}>
                                    Ne
                                  </Text>
                                </Pressable>
                              </View>
                            )}
                          </View>
                        </Pressable>
                      </Pressable>
                    </Modal>
                  </SafeAreaView>
                </Modal>
              </>
            ) : (
              <>
                {loadedMeetings ? (
                  <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                      <Text style={meetings_style.label7}>
                        Nema gotovih sastanke
                      </Text>
                    }
                    keyExtractor={(item, index) => String(item.id)}
                    data={meetings}
                    renderItem={({ item }) => {
                      let archived = false;
                      item.event_ids.forEach((e) => {
                        if (e != "General") {
                          let event = allEvents.find((b) => b.event_id == e);
                          if (!event) archived = true;
                        }
                      });
                      if (!archived)
                        return (
                          <BasicListItemBG
                            onPress={() => {
                              setClickedMeeting(item);
                            }}
                            itemStyle={meetings_style.itemStyle}
                            cardStyle={meetings_style.itemContainer}
                          >
                            <>{meeting(item)}</>
                          </BasicListItemBG>
                        );
                    }}
                  ></FlatList>
                ) : (
                  <LoadingIndicator />
                )}
                <Modal visible={clickedMeeting != null} animationType="slide">
                  <SafeAreaView style={{ flex: 1 }}>
                    {clickedMeeting != null ? (
                      <View style={meetings_style.clickedMeetingModalContent}>
                        <View>
                          <View style={meetings_style.dateAndTeam1}>
                            <Text style={meetings_style.label2}>
                              {clickedMeeting.team_id == "General"
                                ? (() => {
                                    let thing = "";
                                    clickedMeeting.event_ids.forEach((e) => {
                                      if (e != "General") {
                                        let event = allEvents.find(
                                          (b) => b.event_id == e
                                        );
                                        if (event != undefined)
                                          thing = thing + " " + event.skraceno;
                                      }
                                    });
                                    if (thing == "") thing = "Bord";
                                    else thing = "Org tim - " + thing;
                                    return thing;
                                  })()
                                : (() => {
                                    let thing = clickedMeeting.team_id;
                                    clickedMeeting.event_ids.forEach((e) => {
                                      if (e != "General") {
                                        let event = allEvents.find(
                                          (b) => b.event_id == e
                                        );
                                        if (event != undefined)
                                          thing =
                                            thing + " - " + event.skraceno;
                                      }
                                    });
                                    return thing;
                                  })()}
                            </Text>
                            <Text style={meetings_style.label2}>
                              {Moment(clickedMeeting.beginning.toDate()).format(
                                "DD/MM/yy"
                              )}{" "}
                              od
                              {" " +
                                Moment(
                                  clickedMeeting.beginning.toDate()
                                ).format("HH:mm")}{" "}
                              do
                              {" " +
                                Moment(clickedMeeting.end.toDate()).format(
                                  "HH:mm"
                                )}
                            </Text>
                          </View>
                          <Text style={meetings_style.label}>
                            Opis sastanka:
                          </Text>
                          <Text style={meetings_style.description}>
                            {clickedMeeting.description}
                          </Text>
                        </View>
                        <>
                          {clickedMeeting.attendeeInfo.length > 0 ? (
                            <>
                              <Text style={meetings_style.label3}>
                                Članovi koji su prisustvovali:
                              </Text>
                              <ScrollView style={meetings_style.attendees}>
                                {clickedMeeting.attendeeInfo.map((info) => (
                                  <View
                                    style={meetings_style.memberContainer}
                                    key={info.id}
                                  >
                                    {info.profile_pic_uri ? (
                                      <Image
                                        source={{
                                          uri: info.profile_pic_uri,
                                        }}
                                        style={meetings_style.memberImage}
                                      />
                                    ) : (
                                      <View
                                        style={meetings_style.noImageContainer}
                                      >
                                        <Text
                                          style={meetings_style.memberInitials}
                                        >
                                          {info.name.charAt(0)}
                                          {info.surname.charAt(0)}
                                        </Text>
                                      </View>
                                    )}

                                    <View style={meetings_style.textContainer}>
                                      <Text style={meetings_style.memberName}>
                                        {info.name + " " + info.surname}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              </ScrollView>
                            </>
                          ) : (
                            <Text style={meetings_style.label3}>
                              Niko nije prisustvovao
                            </Text>
                          )}
                        </>
                        <View></View>
                        <TouchableOpacity
                          style={meetings_style.button}
                          onPress={() => {
                            Linking.openURL(clickedMeeting.MoM)
                              .then(() => {})
                              .catch(() => {
                                Alert.alert("Došlo je do greške");
                              });
                          }}
                        >
                          <Text style={[meetings_style.buttonText]}>
                            Pregledaj zapisnik
                          </Text>
                        </TouchableOpacity>

                        {/*{clickedMeeting.user == props.user.user_id ? (
                  <></>
                ) : (*/}

                        {/*})}*/}
                      </View>
                    ) : (
                      <></>
                    )}

                    <TouchableOpacity
                      style={meetings_style.button}
                      onPress={() => {
                        setClickedMeeting(null);
                      }}
                    >
                      <Text style={meetings_style.buttonText}>Zatvori</Text>
                    </TouchableOpacity>
                  </SafeAreaView>
                </Modal>
              </>
            )}
          </>

          <Modal visible={modalVisible} animationType="slide">
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={meetings_style.modalContainer}
              >
                <Text style={meetings_style.modalTitle}>Dodaj sastanak</Text>
                <TextInput
                  style={meetings_style.input}
                  placeholder="Naslov"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                  autoCorrect={false}
                />
                <TextInput
                  style={meetings_style.input}
                  placeholder="Opis"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                  multiline
                  autoCorrect={false}
                />
                <Text style={meetings_style.label}>Izaberi tim:</Text>
                <View style={meetings_style.teamsContainer}>
                  {teams.map((team) => (
                    <View key={team.key}>
                      <TouchableOpacity
                        value={team.id}
                        style={[
                          meetings_style.circleStyle,
                          selectedTeam == team &&
                            meetings_style.selectedCircleStyle,
                        ]}
                        onPress={() => {
                          /*if (selectedTeams.includes(team.id)) {
                        setSelectedTeams(
                          selectedTeams.filter((id) => id !== team.id)
                        );
                      } else {
                        setSelectedTeams([...selectedTeams, team.id]);
                      }*/ setSelectedTeams(team);
                        }}
                      >
                        <Text
                          style={[
                            meetings_style.circleText,
                            selectedTeam == team &&
                              meetings_style.selectedCircleText,
                          ]}
                        >
                          {team.name}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                {selectedTeam != null ? (
                  <>
                    {events.length > 0 ? (
                      <>
                        <Text style={meetings_style.label}>
                          Izaberi događaj:
                        </Text>
                        <View style={meetings_style.eventsContainer}>
                          {events.map((event) => (
                            <View key={event.key}>
                              <TouchableOpacity
                                value={event.event_id}
                                style={[
                                  meetings_style.circleStyle,
                                  selectedEvent.includes(event.event_id) &&
                                    meetings_style.selectedCircleStyle,
                                ]}
                                onPress={() => {
                                  /*if (selectedEvent.includes(event.event_id)) {
                                  setSelectedEvent(
                                    selectedEvent.filter(
                                      (id) => id !== event.event_id
                                    )
                                  );
                                } else {
                                  setSelectedEvent([
                                    ...selectedEvent,
                                    event.event_id,
                                  ]);
                                }*/
                                  setSelectedEvent([event.event_id]);
                                }}
                              >
                                <Text
                                  style={[
                                    meetings_style.circleText,
                                    selectedEvent.includes(event.event_id) &&
                                      meetings_style.selectedCircleText,
                                  ]}
                                >
                                  {event.skraceno}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <></>
                )}

                <View style={meetings_style.datePickerContainer}>
                  <Text style={meetings_style.label}>
                    Izaberite datum sastanka:
                  </Text>
                  <TouchableOpacity onPress={funcshowDatePicker}>
                    <Text style={meetings_style.datePickerText}>
                      {Moment(date).format("DD/MM/yy")}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      testID="dateTimePicker1"
                      value={date}
                      mode="date"
                      is24Hour={true}
                      onChange={handleDateChange}
                    />
                  )}
                </View>
                <View style={meetings_style.datePickerContainer}>
                  <Text style={meetings_style.label}>
                    Izaberite vreme početka sastanka:
                  </Text>
                  <TouchableOpacity onPress={funcshowStartTimePicker}>
                    <Text style={meetings_style.datePickerText}>
                      {Moment(startTime).format("HH:mm")}
                    </Text>
                  </TouchableOpacity>
                  {showStartTimePicker && (
                    <DateTimePicker
                      testID="dateTimePicker2"
                      value={startTime}
                      mode="time"
                      is24Hour={true}
                      onChange={handleStartTimeChange}
                    />
                  )}
                </View>
                <View style={meetings_style.datePickerContainer}>
                  <Text style={meetings_style.label}>
                    Izaberite vreme kraja sastanka:
                  </Text>
                  <TouchableOpacity onPress={funcshowEndTimePicker}>
                    <Text style={meetings_style.datePickerText}>
                      {Moment(endTime).format("HH:mm")}
                    </Text>
                  </TouchableOpacity>
                  {showEndTimePicker && (
                    <DateTimePicker
                      testID="dateTimePicker3"
                      value={endTime}
                      mode="time"
                      is24Hour={true}
                      onChange={handleEndTimeChange}
                    />
                  )}
                </View>
                {saving ? (
                  <LoadingIndicator />
                ) : (
                  <>
                    <TouchableOpacity
                      style={meetings_style.button}
                      onPress={handleSaveMeeting}
                    >
                      <Text style={meetings_style.buttonText}>Sačuvaj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={meetings_style.button}
                      onPress={handleCancelMeeting}
                    >
                      <Text style={meetings_style.buttonText}>Otkaži</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </BottomNav>
  );
};
