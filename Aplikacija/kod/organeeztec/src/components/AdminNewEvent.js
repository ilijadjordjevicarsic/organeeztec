import { SafeAreaView, Text } from "react-native";
import { addNewEvent } from "../firebase_functions";
import { LoadingIndicator } from "./LoadingIndicator";
import { adminnewevent_style } from "../styles/adminnewevent-style";
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

export class AdminNewEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      naziv: "",
      info: "",
      loading: false,
      pozicije: [],
      pozIme: "",
      allTeams: [],
      initialLoad: true,
      modalVisible: false,
      abb: "",
    };
  }

  componentDidMount() {
    let all = [];
    getTeams()
      .then((t) => {
        t.forEach((element) => {
          if (element.id != "General")
            all.push({ id: element.id, selected: false, label: element.name });
        });
        this.setState({ allTeams: all, initialLoad: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  dodaj = () => {
    Keyboard.dismiss();
    this.setState({ loading: true });
    if (this.state.naziv == "") {
      Alert.alert("Nevalidan unos", "Unesite naziv događaja");

      this.setState({ loading: false });
      return;
    }
    if (this.state.abb == "") {
      Alert.alert("Nevalidan unos", "Unesite skraćenicu za naziv događaja");

      this.setState({ loading: false });
      return;
    }
    if (this.state.abb.length > 5) {
      Alert.alert(
        "Nevalidan unos",
        "Skraćenica za naziv događaja može maksimalno da ima 5 slova"
      );

      this.setState({ loading: false });
      return;
    }
    if (this.state.info == "") {
      Alert.alert("Nevalidan unos", "Unesite informacije o događaju");

      this.setState({ loading: false });
      return;
    }
    addNewEvent(
      {
        info: this.state.info,
        archived: false,
        applications_open: true,
        name: this.state.naziv,
        muted_by: [],
        checkbox_color: "#ff00ff",
        checkbox_text_color: "#000000",
        checkbox_abb: this.state.abb,
        sortValue: 0,
        HO: "",
      },
      this.state.pozicije
    )
      .then(() => {
        Toast.show("Uspešno napravljen događaj");
        this.props.navigation.pop();
        this.setState({ loading: false });
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Pokušajte ponovo");
        this.setState({ loading: false });
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
    console.log(this.state.pozIme);
    if (this.state.pozIme == "") {
      Alert.alert("Nevalidan unos", "Morate uneti naziv pozicije");
      return;
    }
    let pozTimovi = this.state.allTeams
      .filter((t) => t.selected == true)
      .map((t) => t.id);
    console.log(pozTimovi);
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
    console.log(index);
    let poz = this.state.pozicije;
    poz.splice(index, 1);
    console.log(poz);
    this.setState({ pozicije: poz });
  }

  render() {
    return (
      <SafeAreaView style={adminnewevent_style.container}>
        {this.state.initialLoad ? (
          <LoadingIndicator />
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              style={{ flex: 1, height: "100%" }}
            >
              <View style={adminnewevent_style.contentContainer}>
                <Text style={adminnewevent_style.label}>Naziv:</Text>
                <TextInput
                  onChangeText={(text) => this.setState({ naziv: text })}
                  style={adminnewevent_style.input}
                  autoCorrect={false}
                ></TextInput>
                <Text style={adminnewevent_style.label}>Skraćenica:</Text>
                <TextInput
                  onChangeText={(text) => this.setState({ abb: text })}
                  style={adminnewevent_style.input}
                  autoCorrect={false}
                ></TextInput>
                <Text style={adminnewevent_style.label}>
                  Informacije o događaju:
                </Text>
                <TextInput
                  onChangeText={(text) => this.setState({ info: text })}
                  multiline={true}
                  style={adminnewevent_style.input}
                  autoCorrect={false}
                ></TextInput>
                <Text style={adminnewevent_style.label}>
                  Uloge u organizacionom timu:
                </Text>
                <Text style={adminnewevent_style.teamLabel}>
                  {`\u2022`} Glavni organizator
                </Text>
                {this.state.pozicije.map((p, index) => {
                  return (
                    <>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={adminnewevent_style.positionLabel}>
                          {`\u2022 `}
                          {p.name}
                          {/*  {p.managed_teams.length > 0 ? "Nadležan za:" : ""}
                          {p.managed_teams.map((t) => t)}*/}
                        </Text>
                        <Pressable onPress={() => this.removePos(index)}>
                          <Feather name="x" size={24} color="black" />
                        </Pressable>
                      </View>
                    </>
                  );
                })}
              </View>

              <View style={adminnewevent_style.buttonContainer}>
                {this.state.loading ? (
                  <LoadingIndicator />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => this.openNewPos()}
                      style={adminnewevent_style.button}
                    >
                      <Text style={adminnewevent_style.buttonText}>
                        Dodaj novu poziciju
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => this.dodaj()}
                      style={adminnewevent_style.button}
                    >
                      <Text style={adminnewevent_style.buttonText}>
                        Dodaj događaj
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </>
        )}
        <Modal visible={this.state.modalVisible} transparent={true}>
          <Pressable
            style={adminnewevent_style.modalContainer}
            onPress={() => {
              this.setState({ modalVisible: false });
            }}
          >
            <Pressable style={adminnewevent_style.modalContent}>
              <Text style={adminnewevent_style.label}>Naziv:</Text>
              <TextInput
                onChangeText={(text) => this.setState({ pozIme: text })}
                style={adminnewevent_style.input}
                autoCorrect={false}
              ></TextInput>
              <Text style={adminnewevent_style.label}>Nadležna za timove:</Text>
              <View style={adminnewevent_style.checkboxContainer}>
                {this.state.allTeams.map((t, i) => {
                  return (
                    <>
                      <PureRoundedCheckbox
                        style={adminnewevent_style.checkboxItem}
                        key={t.name + t.selected}
                        isChecked={t.selected}
                        text="✓"
                        onPress={(checked) => (t.selected = checked)}
                      />
                      <Text style={adminnewevent_style.checkboxLabel}>
                        {t.label}
                      </Text>
                    </>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => this.dodajNovuPoz()}
                style={adminnewevent_style.buttonmodal}
              >
                <Text style={adminnewevent_style.buttonTextmodal}>
                  Dodaj poziciju
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.closeNewPos()}
                style={adminnewevent_style.buttonmodal}
              >
                <Text style={adminnewevent_style.buttonTextmodal}>Otkaži</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }
}
