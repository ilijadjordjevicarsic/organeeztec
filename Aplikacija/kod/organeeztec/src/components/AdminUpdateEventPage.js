import { SafeAreaView, Text } from "react-native";
import {
  getMembers,
  getEventPositions,
  updateEvent,
  replaceMemberInEventPosition,
} from "../firebase_functions";
import { LoadingIndicator } from "./LoadingIndicator";
import { adminupdateevent_style } from "../styles/adminupdateevent-style";
import {
  TextInput,
  ScrollView,
  View,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Button } from "@react-native-material/core";
import React, { useState } from "react";
import { getTeams } from "../firebase_functions";
import {
  RoundedCheckbox,
  PureRoundedCheckbox,
} from "react-native-rounded-checkbox";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Alert } from "react-native";
import Toast from "react-native-root-toast";
import { Keyboard } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export class AdminUpdateEventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: { ...props.route.params.event },
      loading: false,
      pozicije: [],
      pozIme: "",
      initialLoad: true,
      modalVisible: false,
      allTeams: [],
      members: [],
    };
    this.oldevent = props.route.params.event;
    this.oldpositions = [];
  }

  componentDidMount() {
    let all = [];
    let po = [];
    getTeams()
      .then((t) => {
        t.forEach((element) => {
          all.push({ id: element.id, selected: false, label: element.name });
        });
        return getEventPositions(this.state.event.id);
      })
      .then((p) => {
        po = p;
        return getMembers();
      })
      .then((res) => {
        let array = [];
        res = res.map((x, i) => {
          if (x.active == true)
            array.push({
              id: x.email,
              positions: x.positions,
              label: x.name + " " + x.surname,
              value: i + 1 + "",
            });
        });

        this.setState({
          members: array,
          pozicije: po,
          allTeams: all,
          initialLoad: false,
        });
        this.oldpositions = JSON.parse(JSON.stringify(po));
      })

      .catch((err) => {
        console.log(err);
      });
  }
  save = () => {
    Keyboard.dismiss();
    this.setState({ loading: true });
    if (this.state.event.name == "") {
      Alert.alert("Nevalidan unos", "Naziv događaja ne može da bude prazan");

      this.setState({ loading: false });
      return;
    }
    if (this.state.event.checkbox_abb == "") {
      Alert.alert(
        "Nevalidan unos",
        "Skraćenica za naziv događaja ne može da bude prazna"
      );

      this.setState({ loading: false });
      return;
    }
    if (this.state.event.info == "") {
      Alert.alert(
        "Nevalidan unos",
        "Informacije o događaju ne mogu da ostanu prazne"
      );

      this.setState({ loading: false });
      return;
    }

    this.changes()
      .then(() => {
        Toast.show("Uspešno ažuriran događaj");
        this.props.navigation.pop();
        this.setState({ loading: false });
      })
      .catch((err) => {
        if (err == "no-changes") {
          Toast.show("Nisu napravljene promene");
          this.setState({ loading: false });

          return;
        }
        console.log(err);
        Toast.show("Došlo je do greške. Pokušajte ponovo");
        this.setState({ loading: false });
      });
  };
  changes = () => {
    return new Promise((resolve, reject) => {
      let changes = {};
      if (this.oldevent.name != this.state.event.name)
        changes.name = this.state.event.name;
      if (this.oldevent.info != this.state.event.info)
        changes.info = this.state.event.info;
      if (this.oldevent.checkbox_abb != this.state.event.checkbox_abb)
        changes.checkbox_abb = this.state.event.checkbox_abb;
      let promises = [];
      if (JSON.stringify(changes) !== "{}") {
        promises.push(updateEvent(this.state.event.id, changes));
      }
      this.oldpositions.forEach((p, i) => {
        if (p.user != this.state.pozicije[i].user)
          promises.push(
            replaceMemberInEventPosition(
              this.state.event.id,
              p.id,
              this.state.pozicije[i].user
            )
          );
      });
      if (this.oldevent.HO != this.state.event.HO) {
        promises.push(
          replaceMemberInEventPosition(
            this.state.event.id,
            "HO",
            this.state.event.HO
          )
        );
      }
      if (promises.length == 0) {
        reject("no-changes");
        return;
      }
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  openNewPos = () => {
    this.setState({ modalVisible: true });
  };

  closeNewPos = () => {
    let pozTimovi = this.state.allTeams.map((t) => {
      t.selected = false;
      return t;
    });
    this.setState({
      modalVisible: false,
      pozIme: "",
      allTeams: pozTimovi,
    });
  };

  dodajNovuPoz = () => {
    if (this.state.pozIme == "") {
      Alert.alert("Nevalidan unos", "Morate uneti naziv pozicije");
      return;
    }
    let pozTimovi = this.state.allTeams
      .filter((t) => t.selected == true)
      .map((t) => t.id);
    let novePoz = this.state.pozicije;
    novePoz.push({
      name: this.state.pozIme,
      managed_teams: pozTimovi,
      user: "",
    });
    pozTimovi = this.state.allTeams.map((t) => {
      t.selected = false;
      return t;
    });
    this.setState({
      modalVisible: false,
      pozicije: novePoz,
      pozIme: "",
      allTeams: pozTimovi,
    });
  };

  removePos(index) {
    let poz = this.state.pozicije;
    poz.splice(index, 1);
    this.setState({ pozicije: poz });
  }

  changePos(index) {}
  render() {
    return (
      <SafeAreaView style={adminupdateevent_style.container}>
        {this.state.initialLoad ? (
          <LoadingIndicator />
        ) : (
          <>
            <ScrollView style={{ flex: 1, height: "100%" }}>
              <View style={adminupdateevent_style.contentContainer}>
                <Text style={adminupdateevent_style.label}>Naziv:</Text>
                <TextInput
                  value={this.state.event.name}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    let e = this.state.event;
                    e.name = text;
                    this.setState({ event: e });
                  }}
                  style={adminupdateevent_style.input}
                ></TextInput>
                <Text style={adminupdateevent_style.label}>Skraćenica:</Text>
                <TextInput
                  value={this.state.event.checkbox_abb}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    let e = this.state.event;
                    e.checkbox_abb = text;
                    this.setState({ event: e });
                  }}
                  style={adminupdateevent_style.input}
                ></TextInput>
                <Text style={adminupdateevent_style.label}>
                  Informacije o događaju:
                </Text>
                <TextInput
                  value={this.state.event.info}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    let e = this.state.event;
                    e.info = text;
                    this.setState({ event: e });
                  }}
                  multiline={true}
                  style={adminupdateevent_style.input}
                ></TextInput>
                <Text style={adminupdateevent_style.label}>
                  Organizacioni tim:
                </Text>
                <View style={adminupdateevent_style.row}>
                  <Text style={adminupdateevent_style.teamLabel}>
                    {`\u2022`} Glavni organizator
                  </Text>
                  <Pressable
                    onPress={() => {
                      let e = this.state.event;
                      e.HO = "";
                      this.setState({ event: e });
                    }}
                  >
                    <Feather name="x" size={24} color="black" />
                  </Pressable>
                  <Dropdown
                    style={adminupdateevent_style.dropdownMembers}
                    search
                    searchPlaceholder="Nađi člana..."
                    data={this.state.members}
                    autoScroll={false}
                    labelField="label"
                    valueField="value"
                    placeholder={""}
                    value={this.state.members.find(
                      (x) => x.id == this.state.event.HO
                    )}
                    onChange={(item) => {
                      this.state.event.HO = item.id;
                    }}
                  />
                </View>
                {this.state.pozicije.map((p, index) => {
                  return (
                    <>
                      <View style={adminupdateevent_style.row} key={index}>
                        <Text style={adminupdateevent_style.positionLabel}>
                          {`\u2022 `}
                          {p.name}
                          {/*{p.managed_teams.length > 0 ? "Nadležan za:" : ""}
                          {p.managed_teams.map((t) => t)}*/}
                        </Text>
                        <Pressable
                          onPress={() => {
                            let g = [...this.state.pozicije];

                            g[index].user = "";
                            this.setState({ pozicije: g });
                          }}
                        >
                          <Feather name="x" size={24} color="black" />
                        </Pressable>
                        <Dropdown
                          key={p.user}
                          style={adminupdateevent_style.dropdownMembers}
                          search
                          searchPlaceholder="Nađi člana..."
                          data={this.state.members}
                          autoScroll={false}
                          labelField="label"
                          valueField="value"
                          placeholder={""}
                          value={this.state.members.find((x) => x.id == p.user)}
                          onChange={(item) => {
                            let g = [...this.state.pozicije];

                            g[index].user = item.id;

                            this.setState({ pozicije: g });
                          }}
                        />

                        {/*<Pressable onPress={() => this.changePos(index)}>
                          <Feather name="edit" size={24} color="black" />
                        </Pressable>*/}
                      </View>
                    </>
                  );
                })}
              </View>

              <View style={adminupdateevent_style.buttonContainer}>
                {this.state.loading ? (
                  <LoadingIndicator />
                ) : (
                  <>
                    {/*<Button
                      onPress={() => this.openNewPos()}
                      title="Dodaj novu poziciju"
                ></Button>*/}
                    <TouchableOpacity
                      onPress={() => this.save()}
                      title="Sačuvaj promene"
                      style={adminupdateevent_style.button}
                    >
                      <Text style={adminupdateevent_style.buttonText}>
                        Sačuvaj promene
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </>
        )}
        <Modal visible={this.state.modalVisible} transparent={true}>
          <View style={adminupdateevent_style.modalContainer}>
            <View style={adminupdateevent_style.modalContent}>
              <Text>Naziv:</Text>
              <TextInput
                onChangeText={(text) => this.setState({ pozIme: text })}
                autoCorrect={false}
                style={adminupdateevent_style.input}
              ></TextInput>
              <Text>Nadležna za timove:</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {this.state.allTeams.map((t, i) => {
                  return (
                    <>
                      <PureRoundedCheckbox
                        key={t.name + t.selected}
                        isChecked={t.selected}
                        text="✓"
                        onPress={(checked) => (t.selected = checked)}
                      />
                      <Text>{t.label}</Text>
                    </>
                  );
                })}
              </View>
              <Button
                onPress={() => this.dodajNovuPoz()}
                title="Dodaj poziciju"
              ></Button>
              <Button
                onPress={() => this.closeNewPos()}
                title="Otkaži"
              ></Button>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}
