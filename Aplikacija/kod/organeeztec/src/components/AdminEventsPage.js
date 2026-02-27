import { Text, Button } from "@react-native-material/core";
import React from "react";
import { getEvents, unarchiveEvent, archiveEvent } from "../firebase_functions";
import { LoadingIndicator } from "./LoadingIndicator";
import {
  SafeAreaView,
  ScrollView,
  View,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { admineventspage_style } from "../styles/admineventspage-style";
import { colorTheme } from "../styles/color_constants";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Toast from "react-native-root-toast";
import { db, deleteEvent } from "../firebase_functions";
import { Feather } from "@expo/vector-icons";

export class AdminEventsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      archivedEvents: [],
      unarchivedEvents: [],
      loadingEvents: true,
      selectedEvent: null,
      eventForDelete: null,
      deleting: false,
    };
    this.eventListener = null;
    console.log(props.navigation);
  }
  closeDeleteModal() {
    this.setState({ eventForDelete: null });
  }

  endLoadingEvents() {
    this.setState({ loadingEvents: false });
  }

  componentWillUnmount() {
    if (this.eventListener) this.eventListener();
  }
  componentDidMount() {
    this.eventListener = db.collection("events").onSnapshot(
      (snaps) => {
        let events = [];
        snaps.docs.forEach((d) => {
          let e = d.data();
          events.push({ ...e, id: d.id, loadingChange: false });
        });
        let unarchivedEvents = events.filter((e) => !e.archived);

        let archivedEvents = events.filter((e) => e.archived);
        this.setState({ unarchivedEvents, archivedEvents });
        this.endLoadingEvents();
      },
      (err) => {
        console.log(err);

        this.endLoadingEvents();
      }
    );
  }

  setDeleting() {
    this.setState({ deleting: true });
  }

  removeDeleting() {
    this.setState({ deleting: false });
  }

  newEvent() {
    this.props.navigation.navigate("AdminNewEvent");
  }
  setArchivedChanging(index) {
    let u = this.state.archivedEvents;
    u[index].loadingChange = true;
    this.setState({ archivedEvents: u });
  }
  removedArchivedChanging(index) {
    let u = this.state.archivedEvents;
    u[index].loadingChange = false;
    this.setState({ archivedEvents: u });
  }
  setUnarchivedChanging(index) {
    let u = this.state.unarchivedEvents;
    u[index].loadingChange = true;
    this.setState({ unarchivedEvents: u });
  }
  removedUnarchivedChanging(index) {
    let u = this.state.unarchivedEvents;
    u[index].loadingChange = false;
    this.setState({ unarchivedEvents: u });
  }
  archiveEvent(index) {
    let event = this.state.unarchivedEvents[index];
    this.setUnarchivedChanging(index);
    archiveEvent(event.id)
      .then(() => {
        /*let u = this.state.unarchivedEvents;
        let a = this.state.archivedEvents;
        event.archived = true;
        event.loadingChange = false;
        a.push(event);

        u = u.filter((e) => !(e.id == event.id));
        this.setState({ unarchivedEvents: u, archivedEvents: a });*/
      })
      .catch((err) => {
        console.log(err);

        Toast.show("Došlo je do greške. Proverite konekciju");
        this.removedUnarchivedChanging(index);
      });
  }
  unarchiveEvent(index) {
    let event = this.state.archivedEvents[index];
    this.setArchivedChanging(index);
    unarchiveEvent(event.id)
      .then(() => {
        /*let u = this.state.unarchivedEvents;
        let a = this.state.archivedEvents;
        event.archived = false;
        event.loadingChange = false;
        u.push(event);

        a = a.filter((e) => !(e.id == event.id));
        this.setState({ unarchivedEvents: u, archivedEvents: a });*/
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Proverite konekciju");
      });
  }
  delete() {
    this.setDeleting();
    deleteEvent(this.state.eventForDelete.id)
      .then(() => {
        Toast.show("Uspešno izbrisan događaj");

        this.setState({ eventForDelete: null });
        this.removeDeleting();
      })
      .catch((e) => {
        console.log(e);
        Toast.show("Došlo je do greške");
        this.removeDeleting();
      });
  }
  deleteArchivedEvent(index) {
    let event = this.state.archivedEvents[index];
    this.setState({ eventForDelete: event });
  }
  deleteUnarchivedEvent(index) {
    let event = this.state.unarchivedEvents[index];

    this.setState({ eventForDelete: event });
  }
  render() {
    return (
      <SafeAreaView style={admineventspage_style.container}>
        {this.state.loadingEvents ? (
          <LoadingIndicator />
        ) : (
          <>
            <View style={{ flex: 0.9 }}>
              <Text style={admineventspage_style.title}>
                Nearhivirani događaji:
              </Text>
              <ScrollView>
                {this.state.unarchivedEvents.length == 0 ? (
                  <Text>Nema nearhiviranih događaja</Text>
                ) : (
                  <>
                    {this.state.unarchivedEvents.map((e, index) => {
                      return (
                        <View style={admineventspage_style.row} key={e.id}>
                          <View style={admineventspage_style.eventInfo}>
                            <Pressable
                              onPress={() =>
                                this.props.navigation.navigate(
                                  "AdminUpdateEvent",
                                  { event: e }
                                )
                              }
                            >
                              <Feather
                                name="edit"
                                size={24}
                                color={colorTheme.button}
                              />
                            </Pressable>
                          </View>
                          <Text
                            numberOfLines={1}
                            style={admineventspage_style.eventName}
                          >
                            {e.name}
                          </Text>

                          {e.loadingChange ? (
                            <View style={admineventspage_style.eventBtns}>
                              <LoadingIndicator />
                            </View>
                          ) : (
                            <>
                              <Pressable
                                title="Obriši"
                                onPress={() => {
                                  this.deleteUnarchivedEvent(index);
                                }}
                                style={admineventspage_style.button}
                              >
                                <Text style={admineventspage_style.buttonText}>
                                  Izbriši
                                </Text>
                              </Pressable>
                              <Pressable
                                onPress={() => this.archiveEvent(index)}
                                style={admineventspage_style.button}
                              >
                                <Text style={admineventspage_style.buttonText}>
                                  Arhiviraj
                                </Text>
                              </Pressable>
                            </>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}
              </ScrollView>
              <Text style={admineventspage_style.title}>
                Arhivirani događaji:
              </Text>
              <ScrollView>
                {this.state.archivedEvents.length == 0 ? (
                  <Text>Nema arhiviranih događaja</Text>
                ) : (
                  <>
                    {this.state.archivedEvents.map((e, index) => {
                      return (
                        <View style={admineventspage_style.row} key={e.id}>
                          <View style={admineventspage_style.eventInfo}>
                            <Pressable
                              onPress={() =>
                                this.props.navigation.navigate(
                                  "AdminUpdateEvent",
                                  { event: e }
                                )
                              }
                            >
                              <Feather
                                name="edit"
                                size={24}
                                color={colorTheme.button}
                              />
                            </Pressable>
                          </View>
                          <Text
                            numberOfLines={1}
                            style={admineventspage_style.eventName}
                          >
                            {e.name}
                          </Text>

                          {e.loadingChange ? (
                            <View style={{ width: "50%" }}>
                              <LoadingIndicator />
                            </View>
                          ) : (
                            <>
                              <Pressable
                                onPress={() => {
                                  this.deleteArchivedEvent(index);
                                }}
                                style={admineventspage_style.button}
                              >
                                <Text style={admineventspage_style.buttonText}>
                                  Izbriši
                                </Text>
                              </Pressable>
                              <Pressable
                                onPress={() => this.unarchiveEvent(index)}
                                style={admineventspage_style.button}
                              >
                                <Text style={admineventspage_style.buttonText}>
                                  Dearhiviraj
                                </Text>
                              </Pressable>
                            </>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}
              </ScrollView>
            </View>
            <View style={{ flex: 0.1 }}>
              <Pressable
                onPress={() => this.newEvent()}
                style={admineventspage_style.buttonadd}
              >
                <Text style={admineventspage_style.buttonText}>
                  Dodaj događaj
                </Text>
              </Pressable>
            </View>
          </>
        )}
        <Modal
          transparent={true}
          visible={this.state.eventForDelete != null}
          animationType="slide"
        >
          <Pressable
            style={admineventspage_style.modalContainer}
            onPress={() => {
              this.closeDeleteModal();
            }}
          >
            <Pressable style={admineventspage_style.modalContent}>
              <Text>
                Da li ste sigurni da želite da izbrišete{" "}
                {this.state.eventForDelete != null
                  ? this.state.eventForDelete.name
                  : ""}
                ?
              </Text>
              <View>
                {this.state.deleting ? (
                  <LoadingIndicator style={{ width: "100%" }} />
                ) : (
                  <View style={admineventspage_style.rowmod}>
                    <Pressable
                      style={admineventspage_style.buttonmod}
                      onPress={() => {
                        this.delete();
                      }}
                    >
                      <Text style={admineventspage_style.buttonText}>Da</Text>
                    </Pressable>
                    <Pressable
                      style={admineventspage_style.buttonmod}
                      onPress={() => this.closeDeleteModal()}
                    >
                      <Text style={admineventspage_style.buttonText}>Ne</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }
}
