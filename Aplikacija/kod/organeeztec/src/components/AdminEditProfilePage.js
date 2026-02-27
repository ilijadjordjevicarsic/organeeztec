import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { adminEditProfile_style } from "../styles/adminEditProfile-style";
import { Button } from "@react-native-material/core";
import firebase from "firebase/app";
import "firebase/auth";
import { getAuth, updatePassword } from "firebase/auth";
import { deleteUser, db } from "../firebase_functions";
import { Alert } from "react-native";
import Toast from "react-native-root-toast";
import { LoadingIndicator } from "./LoadingIndicator";
import { changePass } from "../firebase_functions";
import { validatePass } from "../scripts/helperFunctions";
import Moment from "moment";
import { Linking } from "react-native";
import { colorTheme } from "../styles/color_constants";

export class AdminEditProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      member: this.props.route.params.member,
      positions: this.props.route.params.positions,
      positionsLoaded: false,
      modalVisible: false,
      modalVisible1: false,
      newPassword: "",
      loading: false,
    };
  }
  componentDidMount() {
    let promises = [];
    let newPos = [];
    this.state.positions.forEach((p) => {
      if (p.collection == "events") {
        let event;
        promises.push(
          db
            .collection("events")
            .doc(p.document)
            .get()
            .then((snap) => {
              event = snap.data();
              if (p.position == "HO") {
                newPos.push({
                  ...p,
                  prikaz: "Glavni organizator za " + snap.data().checkbox_abb,
                });
              } else
                return db
                  .collection("events")
                  .doc(p.document)
                  .collection("positions")
                  .doc(p.position)
                  .get();
            })
            .then((snap) => {
              newPos.push({
                ...p,
                prikaz: snap.data().name + " za " + event.checkbox_abb,
              });
            })
            .catch(() => {})
        );
      } else if (p.collection == "board" && p.document == "board") {
        if (p.position == "chairperson") {
          newPos.push({
            ...p,
            prikaz: "Predsednik",
          });
        } else if (p.position == "cp")
          newPos.push({
            ...p,
            prikaz: "CP",
          });
        else
          promises.push(
            db
              .collection("board")
              .doc("board")
              .collection("positions")
              .doc(p.position)
              .get()
              .then((snap) => {
                newPos.push({
                  ...p,
                  prikaz: snap.data().name + " u upravnom odboru",
                });
              })
              .catch(() => {})
          );
      } else if (p.collection == "teams") {
        if (p.position == "member")
          newPos.push({
            ...p,
            prikaz: "Član " + p.document + " tima",
          });
        else if (p.position == "supervisor")
          newPos.push({
            ...p,
            prikaz: "Nadležni za " + p.document + " tim",
          });
      }
    });
    Promise.all(promises)
      .then(() => {
        this.setState({ positions: [...newPos], positionsLoaded: true });
      })
      .catch((err) => console.log(err));
  }
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  };
  setModalVisible1 = (visible) => {
    this.setState({ modalVisible1: visible });
  };

  handlePress4 = () => {
    this.props.navigation.navigate("AdminRolesUpdate");
  };

  hideModal = () => {
    this.setModalVisible(false);
  };
  hideModal1 = () => {
    this.setModalVisible1(false);
    this.setState({ newPassword: "" });
  };
  handleChangePassword = () => {
    console.log(this.state.newPassword);
    this.setState({ loading: true });
    if (!validatePass(this.state.newPassword)) {
      Alert.alert(
        "Neispravna lozinka",
        "Lozinka može da sadrži karaktere: a-Z, 0-9,$!%*?&()~#;:+*=%'^[]. Obavezno je da sadrži jedno veliko slovo, jedno malo slovo i jednu brojku, i mora da bude između 8 i 20 karaktera dužine"
      );
      this.setState({ loading: false });
      return;
    }
    changePass({
      email: this.state.member.email,
      password: this.state.newPassword,
    })
      .then((r) => {
        Alert.alert("Uspešno ažurirana lozinka");

        this.setState({ loading: false });
        this.hideModal1();
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Greška", "Došlo je do greške");

        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <View style={adminEditProfile_style.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          contentContainerStyle={adminEditProfile_style.innerContainer}
        >
          {this.state.member.profile_pic_uri ? (
            <Image
              source={{ uri: this.state.member.profile_pic_uri }}
              style={adminEditProfile_style.memberImage}
            />
          ) : (
            <View style={adminEditProfile_style.noImageContainer}>
              <Text style={adminEditProfile_style.memberInitials}>
                {this.state.member.name.charAt(0)}
                {this.state.member.surname.charAt(0)}
              </Text>
            </View>
          )}
          <Text style={adminEditProfile_style.podatak}>
            {this.state.member.name + " " + this.state.member.surname}
          </Text>

          {this.state.positionsLoaded ? (
            <>
              {this.state.positions.length > 0 ? (
                <>
                  <Text style={adminEditProfile_style.label}>Uloge: </Text>

                  <View style={adminEditProfile_style.positionsContainer}>
                    <>
                      {this.state.positions.map((p) => {
                        return (
                          <Text style={adminEditProfile_style.podatak}>
                            - {p.prikaz != undefined ? p.prikaz : ""}
                          </Text>
                        );
                      })}
                    </>
                  </View>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <LoadingIndicator />
          )}

          {/*<Text style={adminEditProfile_style.activityIndicator}>
          Aktivnost: {this.state.member.active ? "Aktivan" : "Neaktivan"}
        </Text>*/}
          <Text style={adminEditProfile_style.label}>
            Datum rođenja:{" "}
            <Text style={adminEditProfile_style.podatak}>
              {Moment(this.state.member.birthdate.toDate()).format("DD/MM/yy")}
            </Text>
          </Text>
          <Text style={adminEditProfile_style.label}>
            Broj telefona:
            <Text style={adminEditProfile_style.podatak}>
              {" "}
              {this.state.member.phone_number}
            </Text>
          </Text>
          {this.state.member.instagram_username != null &&
          this.state.member.instagram_username != "" ? (
            <Text style={adminEditProfile_style.label}>
              Instagram:{" "}
              <Text style={adminEditProfile_style.podatak}>
                {this.state.member.instagram_username}
              </Text>
            </Text>
          ) : (
            <></>
          )}
          {this.state.member.cv != "" ? (
            <Text
              style={{ color: colorTheme.primary_color, marginTop: 10 }}
              onPress={() => Linking.openURL(this.state.member.cv)}
            >
              Otvori CV
            </Text>
          ) : (
            <></>
          )}
          {this.props.admin ? (
            <View style={adminEditProfile_style.buttonsContainer}>
              {/*<Button
            style={adminEditProfile_style.button}
            title="Sva obaveštenja"
          />
          <Button style={adminEditProfile_style.button} title="Sva zaduženja" />
          <Button
            style={adminEditProfile_style.button}
            title="Promeni ulogu"
            onPress={() => this.handlePress4(true)}
        />*/}
              <Pressable
                style={adminEditProfile_style.button}
                title="Promeni lozinku"
                onPress={() => this.setModalVisible1(true)}
              >
                <Text style={adminEditProfile_style.buttonText}>
                  Promeni lozinku
                </Text>
              </Pressable>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible1}
              >
                <Pressable
                  style={adminEditProfile_style.modalContainer}
                  onPress={() => {
                    this.setState({ modalVisible1: false });
                  }}
                >
                  <Pressable style={adminEditProfile_style.modalContent}>
                    <Text style={adminEditProfile_style.modalText}>
                      {" "}
                      Nova lozinka:
                    </Text>
                    <TextInput
                      style={adminEditProfile_style.input}
                      secureTextEntry
                      onChangeText={(text) =>
                        this.setState({ newPassword: text })
                      }
                      autoCorrect={false}
                    />
                    {this.state.loading ? (
                      <LoadingIndicator></LoadingIndicator>
                    ) : (
                      <View style={adminEditProfile_style.buttons}>
                        <Pressable
                          style={adminEditProfile_style.button}
                          title="Promeni"
                          onPress={this.handleChangePassword}
                        >
                          <Text style={adminEditProfile_style.buttonText}>
                            Promeni
                          </Text>
                        </Pressable>
                        <Pressable
                          style={adminEditProfile_style.button}
                          title="Odustani"
                          onPress={() => {
                            this.hideModal1();
                          }}
                        >
                          <Text style={adminEditProfile_style.buttonText}>
                            Odustani
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                </Pressable>
              </Modal>
              <Pressable
                style={adminEditProfile_style.button}
                title="Izbriši"
                onPress={() => this.setModalVisible(true)}
              >
                <Text style={adminEditProfile_style.buttonText}>Izbriši</Text>
              </Pressable>
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
              >
                <Pressable
                  style={adminEditProfile_style.modalContainer}
                  onPress={() => {
                    this.setState({ modalVisible: false });
                  }}
                >
                  <Pressable style={adminEditProfile_style.modalContent}>
                    <Text style={adminEditProfile_style.modalText}>
                      Da li ste sigurni da želite da obrišete ovog člana?
                    </Text>
                    {this.state.loading ? (
                      <LoadingIndicator></LoadingIndicator>
                    ) : (
                      <View style={adminEditProfile_style.buttons}>
                        <Pressable
                          style={adminEditProfile_style.button}
                          onPress={() => {
                            this.setState({ loading: true });
                            deleteUser({ email: this.state.member.email })
                              .then(() => {
                                this.setState({ loading: false });
                                Toast.show("Uspešno izbrisan nalog");
                                this.props.navigation.pop();

                                this.hideModal();
                              })
                              .catch((err) => {
                                console.log(err);
                                Alert.alert("Greška", "Došlo je do greške");

                                this.setState({ loading: false });
                              });
                          }}
                        >
                          <Text style={adminEditProfile_style.buttonText}>
                            Da
                          </Text>
                        </Pressable>
                        <Pressable
                          style={adminEditProfile_style.button}
                          onPress={() => {
                            this.hideModal();
                          }}
                        >
                          <Text style={adminEditProfile_style.buttonText}>
                            Ne
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                </Pressable>
              </Modal>
            </View>
          ) : (
            <></>
          )}
        </ScrollView>
      </View>
    );
  }
}
