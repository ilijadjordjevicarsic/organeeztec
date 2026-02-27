import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { adminviewauthreq_style } from "../styles/adminviewauthreq-style";
import Moment from "moment";
import { Linking, Modal } from "react-native";
import { Button } from "@react-native-material/core";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase_functions";
import Toast from "react-native-root-toast";
import { LoadingIndicator } from "./LoadingIndicator";
import { refFromURL } from "../scripts/helperFunctions";
import { deleteFile } from "../scripts/authreqjs";
import { validateEmail, validatePass } from "../scripts/helperFunctions";
import { Alert } from "react-native";
import { getStorage, ref } from "firebase/storage";
import { acceptAuthRequest } from "../scripts/authreqjs";
import { useNavigation } from "@react-navigation/native";
import { registerUser } from "../firebase_functions";
import { colorTheme } from "../styles/color_constants";
import { adminEditProfile_style } from "../styles/adminEditProfile-style";

export class AdminviewAuthRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      req: this.props.route.params.req,
      deleteReq: false,
      deleting: false,
      acceptReq: false,
      reqEmail: "",
      reqPass: "",
      creating: false,
      email: "",
      pass: "",
    };
  }
  deleteRequest() {
    this.setState({ deleting: true });
    deleteFile(this.state.req.cv)
      .then(() => {
        return deleteFile(this.state.req.profile_pic_uri);
      })
      .then(() => {
        return deleteDoc(doc(db, "auth_requests", this.state.req.id));
      })
      .then(() => {
        Toast.show("Prijava je uspešno izbrisana", {
          duration: Toast.durations.SHORT,
        });

        this.props.navigation.goBack();

        this.setState({ deleting: false });
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Proverite konekciju", {
          duration: Toast.durations.SHORT,
        });

        this.setState({ deleting: false });
      });
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={adminviewauthreq_style.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            overScrollMode="never"
            contentContainerStyle={adminEditProfile_style.innerContainer}
          >
            <View style={adminviewauthreq_style.info}>
              {this.state.req.profile_pic_uri != "" ? (
                <View style={adminviewauthreq_style.row}>
                  <Image
                    source={{ uri: this.state.req.profile_pic_uri }}
                    style={adminviewauthreq_style.profileImage}
                  ></Image>
                </View>
              ) : (
                <></>
              )}
              <View style={adminviewauthreq_style.row}>
                <Text style={adminviewauthreq_style.label}>Ime:</Text>
                <Text style={adminviewauthreq_style.podatak}>
                  {this.state.req.name} {this.state.req.surname}
                </Text>
              </View>
              <View style={adminviewauthreq_style.row}>
                <Text style={adminviewauthreq_style.label}>Datum rođenja:</Text>
                <Text style={adminviewauthreq_style.podatak}>
                  {Moment(this.state.req.birthdate.toDate()).format("DD/MM/yy")}
                </Text>
              </View>
              <View style={adminviewauthreq_style.row}>
                <Text style={adminviewauthreq_style.label}>Broj telefona:</Text>
                <Text style={adminviewauthreq_style.podatak}>
                  {this.state.req.phone_number}
                </Text>
              </View>
              <View style={adminviewauthreq_style.row}>
                <Text style={adminviewauthreq_style.label}>
                  Korisničko ime na instagramu:
                </Text>
                <Text style={adminviewauthreq_style.podatak}>
                  {this.state.req.instagram_username == ""
                    ? "Nije uneto"
                    : this.state.req.instagram_username}
                </Text>
              </View>
              <View style={adminviewauthreq_style.row}>
                {this.state.req.cv != "" ? (
                  <Text
                    style={{ color: colorTheme.primary_color }}
                    onPress={() => Linking.openURL(this.state.req.cv)}
                  >
                    Otvori priložen CV
                  </Text>
                ) : (
                  <Text style={adminviewauthreq_style.podatak}>
                    CV nije priložen
                  </Text>
                )}
              </View>
            </View>
            <View style={adminviewauthreq_style.buttons}>
              <Pressable
                style={adminviewauthreq_style.button}
                onPress={() => this.setState({ acceptReq: true })}
              >
                <Text style={adminviewauthreq_style.buttonText}>Prihvati</Text>
              </Pressable>
              <Pressable
                style={adminviewauthreq_style.button}
                onPress={() => this.setState({ deleteReq: true })}
              >
                <Text style={adminviewauthreq_style.buttonText}>Obriši</Text>
              </Pressable>
            </View>
            <Modal
              transparent={true}
              visible={this.state.deleteReq}
              animationType="slide"
            >
              <Pressable
                style={adminviewauthreq_style.modalContainer}
                onPress={() => {
                  this.setState({ deleteReq: false });
                }}
              >
                <Pressable style={adminviewauthreq_style.modalContent}>
                  <Text style={adminviewauthreq_style.label}>
                    Da li ste sigurni da želite da izbrišete ovaj zahtev?
                  </Text>
                  <View style={adminviewauthreq_style.modalBtns}>
                    {this.state.deleting ? (
                      <LoadingIndicator style={{ width: "100%" }} />
                    ) : (
                      <>
                        <Pressable
                          style={adminviewauthreq_style.buttonmodal}
                          onPress={() => {
                            this.deleteRequest();
                          }}
                        >
                          <Text style={adminviewauthreq_style.buttonText}>
                            Da
                          </Text>
                        </Pressable>
                        <Pressable
                          style={adminviewauthreq_style.buttonmodal}
                          onPress={() => this.setState({ deleteReq: false })}
                        >
                          <Text style={adminviewauthreq_style.buttonText}>
                            Ne
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
            <Modal
              transparent={true}
              visible={this.state.acceptReq}
              animationType="slide"
            >
              <Pressable
                style={adminviewauthreq_style.modalContainer}
                onPress={() => {
                  this.setState({ acceptReq: false });
                }}
              >
                <Pressable style={adminviewauthreq_style.modalContent}>
                  <Text style={adminviewauthreq_style.label}>Email:</Text>
                  <TextInput
                    autoCapitalize="none"
                    style={adminviewauthreq_style.input}
                    onChangeText={(newem) => {
                      this.setState({ email: newem });
                    }}
                    value={this.state.email}
                    autoCorrect={false}
                  />
                  <Text style={adminviewauthreq_style.label}>Lozinka:</Text>
                  <TextInput
                    style={adminviewauthreq_style.input}
                    onChangeText={(newpass) => {
                      this.setState({ pass: newpass });
                    }}
                    value={this.state.pass}
                    secureTextEntry={true}
                    autoCorrect={false}
                  />
                  <View>
                    {this.state.creating ? (
                      <LoadingIndicator />
                    ) : (
                      <>
                        <Pressable
                          style={adminviewauthreq_style.buttonmodal}
                          onPress={() => {
                            this.setState({
                              creating: true,
                              email: this.state.email.toLowerCase(),
                            });
                            if (!validateEmail(this.state.email)) {
                              Alert.alert(
                                "Nevalidan email",
                                "Proverite ponovo"
                              );
                              this.setState({ creating: false });
                              return;
                            }
                            if (!validatePass(this.state.pass)) {
                              Alert.alert(
                                "Neispravna lozinka",
                                "Lozinka može da sadrži karaktere: a-Z, 0-9,$!%*?&()~#;:+*=%'^[]. Obavezno je da sadrži jedno veliko slovo, jedno malo slovo i jednu brojku, i mora da bude između 8 i 20 karaktera dužine"
                              );
                              this.setState({ creating: false });
                              return;
                            }
                            registerUser({
                              email: this.state.email,
                              password: this.state.pass,
                            })
                              .then((r) => {
                                return acceptAuthRequest(
                                  this.state.req.id,
                                  this.state.email,
                                  this.state.pass
                                );
                              })
                              .then(() => {
                                this.setState({
                                  creating: false,
                                  acceptReq: false,
                                });
                                Toast.show("Uspešno kreiran nalog");
                                this.props.navigation.pop();
                              })
                              .catch((err) => {
                                console.log("error");
                                console.log(err);
                                Alert.alert("Greška", "Email već u upotrebi");
                                this.setState({ creating: false });
                              });
                          }}
                        >
                          <Text style={adminviewauthreq_style.buttonText}>
                            Napravi nalog
                          </Text>
                        </Pressable>
                        <Pressable
                          style={adminviewauthreq_style.buttonmodal}
                          onPress={() => {
                            this.setState({
                              acceptReq: false,
                              email: "",
                              pass: "",
                            });
                          }}
                        >
                          <Text style={adminviewauthreq_style.buttonText}>
                            Otkaži
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}
