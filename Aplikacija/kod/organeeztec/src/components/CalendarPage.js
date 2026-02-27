import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import React, { useEffect, useState, useRef } from "react";
import { Text, View, Pressable, Modal, TextInput } from "react-native";
import {
  TimelineList,
  LocaleConfig,
  CalendarProvider,
  TimelineListProps,
  Calendar,
} from "react-native-calendars";
import { db } from "../firebase_functions";
import { BottomNav } from "./BottomNav";
import DateTimePicker from "@react-native-community/datetimepicker";
import Moment from "moment";
import { LoadingIndicator } from "./LoadingIndicator";
import { getUnarchivedEvents } from "../firebase_functions";

export const CalendarPage = (props) => {
  const [selectedDate, _setSelectedDate] = useState(null);
  const [marked, setMarked] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState(null);
  const [showEvents, setShowEvents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("date");
  const [beginning, setBeginning] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [showBeginningPicker, setShowBeginningPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [unarchivedEvents, setUnarchivedEvents] = useState(null);

  const bordColor = "#ff0000";
  const allColor = "#ff00ff";

  const setSelectedDate = (date) => {
    _setSelectedDate(date);
  };
  useEffect(() => {
    if (selectedDate) console.log("current " + selectedDate);
    let events = { ...marked };
    Object.keys(events).map((e) => (events[e].selected = false));
    if (events[selectedDate] == undefined) {
      events[selectedDate] = {
        selected: true,
      };
    } else events[selectedDate].selected = true;
    setMarked(events);
  }, [selectedDate]);
  const handleDatePress = (date) => {
    setSelectedDate(date.dateString);
    console.log("Odabrani datum:", date);
  };
  useEffect(() => {
    LocaleConfig.locales["sr"] = {
      monthNames: [
        "Januar",
        "Februar",
        "Mart",
        "April",
        "Maj",
        "Jun",
        "Jul",
        "Avgust",
        "Septembar",
        "Oktobar",
        "Novembar",
        "Decembar",
      ],
      monthNamesShort: [
        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "Maj",
        "Jun",
        "Jul",
        "Avg.",
        "Sep.",
        "Okt.",
        "Nov.",
        "Dec.",
      ],
      dayNames: [
        "Nedelja",
        "Ponedeljak",
        "Utorak",
        "Sreda",
        "Četvrtak",
        "Petak",
        "Subota",
      ],
      dayNamesShort: ["Ned.", "Pon.", "Uto.", "Sre.", "Čet.", "Pet.", "Sub."],
      today: "Danas",
    };
    LocaleConfig.defaultLocale = "sr";
    getUnarchivedEvents()
      .then((uevents) => {
        setUnarchivedEvents(uevents);
        getCalendarEvents(uevents);
      })
      .catch((err) => console.log(err));
  }, []);
  const startDate = Timestamp.fromDate(new Date());
  const endDate = Timestamp.fromMillis(
    startDate.toMillis() + 24 * 60 * 60 * 1000
  );

  const showBeginningPickerModal = () => {
    setShowBeginningPicker(true);
  };

  const handleBeginningConfirm = (date) => {
    setShowBeginningPicker(false);
    setBeginning(date);
  };

  const showEndPickerModal = () => {
    setShowEndPicker(true);
  };

  const handleEndConfirm = (date) => {
    setShowEndPicker(false);
    setEnd(date);
  };

  const getCalendarEvents = (unarchivedEvents) => {
    const calendarEvents = db.collection("calendar_events");

    let desavanja = [];
    let promises = [];
    getDocs(calendarEvents).then((snapshot) => {
      snapshot.docs.forEach((pod) => {
        let data = pod.data();

        if (data.title !== undefined && data.description !== undefined) {
          promises.push(
            db
              .collection("users")
              .doc(data.user)
              .get()
              .then((snaps) => {
                let dat = snaps.data();

                if (dat) {
                  let eventid = data.event_id;
                  if (!eventid) {
                    eventid = "All";
                  }

                  if (
                    eventid == "All" ||
                    unarchivedEvents.find((e) => e.event_id == eventid) !=
                      undefined
                  )
                    desavanja.push({
                      id: pod.id,
                      title: data.title,
                      description: data.description,
                      beginning: data.beginning.toDate(),
                      end: data.end.toDate(),
                      user: dat.name + " " + dat.surname,
                      slika: dat.profile_pic_uri,
                      ime: dat.name,
                      prezime: dat.surname,
                      team_id: data.team_id ? data.team_id : "All",

                      event_id: eventid,
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
        .then(() => {
          let events = {};
          desavanja.forEach((e) => {
            console.log(e.event_id);
            if (events[Moment(e.beginning).format("yyyy-MM-DD")] == undefined) {
              events[Moment(e.beginning).format("yyyy-MM-DD")] = {
                dots: [
                  {
                    color: (() => {
                      let ev = unarchivedEvents.find(
                        (a) => a.event_id == e.event_id
                      );
                      if (ev) return ev.checkbox_color;
                      if (e.event_id == "General") return bordColor;
                      return allColor;
                    })(),
                  },
                ],
              };
            } else {
              //ako treba nesto kad ima vise desavanja
              if (
                events[Moment(e.beginning).format("yyyy-MM-DD")].dots.length <
                10
              )
                events[Moment(e.beginning).format("yyyy-MM-DD")].dots.push({
                  color: (() => {
                    let ev = unarchivedEvents.find(
                      (a) => a.event_id == e.event_id
                    );
                    if (ev) return ev.checkbox_color;

                    if (e.event_id == "General") return bordColor;
                    return allColor;
                  })(),
                });
            }
          });
          setMarked(events);
          setSelectedDate(Moment(new Date()).format("yyyy-MM-DD"));

          setCalendarEvent(desavanja);
          setLoaded(true);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };
  const pressTest = (timeStr, timeObj) => {
    // console.log(timeStr);
    // console.log(timeObj);
  };
  const addEvent = () => {
    const event = {
      title: title,
      description: description,
      beginning: beginning,
      end: end,
      user: props.user.user_id,
    };
    const calendarEvents = db.collection("calendar_events").doc();
    return calendarEvents
      .set(event)
      .then(() => {
        console.log("Događaj je uspešno dodat");
      })
      .catch((error) => {
        console.error("Greška pri dodavanju događaja: ", error);
      });
  };
  return (
    <BottomNav nav={props.navigation} active="calendar">
      <View style={{ flex: 1 }}>
        {loaded ? (
          <>
            <Calendar
              theme={{
                selectedDayBackgroundColor: "orange",
                selectedDayTextColor: "green",
              }}
              onDayPress={handleDatePress}
              onPointerDown={() => console.log("down")}
              markedDates={marked}
              firstDay={1}
              displayLoadingIndicator={false}
              hideExtraDays={true}
              enableSwipeMonths={false}
              onDayLongPress={(date) => console.log(date)}
              markingType="multi-dot"
              style={{
                borderWidth: 1,
                borderColor: "gray",
                height: 350,
              }}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                textSectionTitleDisabledColor: "#d9e1e8",
                selectedDayBackgroundColor: "#00adf5",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#00adf5",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                dotColor: "#00adf5",
                selectedDotColor: "#ffffff",
                arrowColor: "orange",
                disabledArrowColor: "#d9e1e8",
                monthTextColor: "blue",
                indicatorColor: "blue",
                textDayFontFamily: "monospace",
                textMonthFontFamily: "monospace",
                textDayHeaderFontFamily: "monospace",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
              }}
            />
            {selectedDate ? (
              <CalendarProvider
                onMonthChange={() => console.log("onm")}
                onDateChanged={(date) => {
                  console.log("changed");
                  console.log(date);
                  setSelectedDate(date);
                }}
                date={selectedDate}
              >
                <TimelineList
                  timelineProps={{
                    onBackgroundLongPressOut: (timeString, newEventTime) => {
                      //console.log(timeString);
                      // console.log(newEventTime);
                    },
                    timelineLeftInset: 60,
                    overlapEventsSpacing: 8,
                    format24h: true,
                    onBackgroundLongPress: (timeString, newTimeEvent) => {
                      pressTest(timeString, newTimeEvent);
                    },
                    onEventPress: (event) => {
                      console.log("Event pressed:", event);
                    },

                    renderEvent: (event) => (
                      <Text>
                        {event.title}
                        {event.idk}
                      </Text>
                    ),
                  }}
                  showNowIndicator={true}
                  scrollToFirst={true}
                  events={(() => {
                    let events = {};
                    calendarEvent.forEach((e) => {
                      //console.log(e);
                      if (
                        events[Moment(e.beginning).format("yyyy-MM-DD")] ==
                        undefined
                      ) {
                        events[Moment(e.beginning).format("yyyy-MM-DD")] = [
                          {
                            id: e.id,
                            title: e.title,
                            end: Moment(e.end).format("yyyy-MM-DD HH:mm:ss"),
                            start: Moment(e.beginning).format(
                              "yyyy-MM-DD HH:mm:ss"
                            ),
                            color: (() => {
                              let ev = unarchivedEvents.find(
                                (a) => a.event_id == e.event_id
                              );
                              if (ev) return ev.checkbox_color;
                              if (e.event_id == "General") return bordColor;
                              return allColor;
                            })(),
                            idk: "idk",
                          },
                        ];
                      } else {
                        events[Moment(e.beginning).format("yyyy-MM-DD")].push({
                          id: e.id,
                          title: e.title,
                          end: Moment(e.end).format("yyyy-MM-DD HH:mm:ss"),
                          start: Moment(e.beginning).format(
                            "yyyy-MM-DD HH:mm:ss"
                          ),
                          color: (() => {
                            let ev = unarchivedEvents.find(
                              (a) => a.event_id == e.event_id
                            );
                            if (ev) return ev.checkbox_color;
                            if (e.event_id == "General") return bordColor;
                            return allColor;
                          })(),
                          idk: "idk",
                        });
                      }
                    });
                    return events;
                  })()}
                />
              </CalendarProvider>
            ) : (
              <></>
            )}
          </>
        ) : (
          <LoadingIndicator />
        )}

        <View>
          <Text style={{ fontWeight: "bold" }}>Dodaj događaj:</Text>
          <Pressable onPress={() => setShowModal(true)}>
            <Text>Otvori modal</Text>
          </Pressable>
        </View>

        <Modal visible={showModal} animationType="slide">
          <View>
            <Text style={{ fontWeight: "bold" }}>
              Unesite detalje događaja:
            </Text>
            <TextInput
              placeholder="Naslov"
              value={title}
              onChangeText={(text) => setTitle(text)}
              autoCorrect={false}
            />
            <TextInput
              placeholder="Opis"
              value={description}
              onChangeText={(text) => setDescription(text)}
              autoCorrect={false}
            />

            <Text>
              Početak:{" "}
              <Text
                onPress={() => {
                  setMode("date");
                  showBeginningPickerModal();
                }}
              >
                {Moment(beginning).format("DD/MM/yy")}
              </Text>{" "}
              <Text
                onPress={() => {
                  setMode("time");
                  showBeginningPickerModal();
                }}
              >
                {Moment(beginning).format("HH:mm")}
              </Text>
            </Text>
            {showBeginningPicker && (
              <DateTimePicker
                testID="testdate"
                value={beginning}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={(event, date) => handleBeginningConfirm(date)}
              />
            )}

            <Text>
              Kraj:{" "}
              <Text
                onPress={() => {
                  setMode("date");
                  showEndPickerModal();
                }}
              >
                {Moment(end).format("DD/MM/yy")}
              </Text>{" "}
              <Text
                onPress={() => {
                  setMode("time");
                  showEndPickerModal();
                }}
              >
                {Moment(end).format("HH:mm")}
              </Text>
            </Text>
            {showEndPicker && (
              <DateTimePicker
                testID="datepicker"
                value={end}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={(event, date) => handleEndConfirm(date)}
              />
            )}
            <View style={{ height: 150 }}></View>
            <Pressable onPress={addEvent}>
              <Text>Dodaj</Text>
            </Pressable>
            <Pressable onPress={() => setShowModal(false)}>
              <Text>Zatvori</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </BottomNav>
  );
};
