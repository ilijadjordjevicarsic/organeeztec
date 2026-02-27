import { adminviewboardapplication_style } from "../styles/adminviewboardapplication-style";
import React from "react";
import { View, Text, Modal, Image, Pressable } from "react-native";
import { SafeAreaView, ScrollView } from "react-native";
import { Button } from "@react-native-material/core";
import {
  getOCPosition,
  deleteOCApplication,
  replaceMemberInEventPosition,
} from "../firebase_functions";
import Toast from "react-native-root-toast";
import { LoadingIndicator } from "./LoadingIndicator";
import { staticPositions } from "../scripts/helperFunctions";
import { Alert } from "react-native";
import { adminEditProfile_style } from "../styles/adminEditProfile-style";

export class ViewOCApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      application: this.props.route.params.application,
      modalLoading: false,
      declineModal: false,
      acceptModal: false,
    };
    this.event = this.props.route.params.event;
  }
  prihvatiPrijavu() {
    this.setState({ modalLoading: true });
    replaceMemberInEventPosition(
      this.event.event_id,
      this.state.application.position.id,
      this.state.application.userdata.user_id
    )
      .then(() => {
        return deleteOCApplication(
          this.event.event_id,
          this.state.application.id
        );
      })
      .then(() => {
        Toast.show("Uspešno prihvaćena prijava");
        this.props.navigation.pop();
        this.setState({ modalLoading: false });
      })
      .catch((e) => {
        console.log(e);

        Toast.show("Došlo je do greške. Proverite konekciju");

        this.setState({ modalLoading: false });
      });
  }
  obrisiPrijavu() {
    this.setState({ modalLoading: true });
    deleteOCApplication(this.event.event_id, this.state.application.id)
      .then(() => {
        this.props.navigation.pop();
        Toast.show("Uspešno izbrisana prijava");
        this.setState({ modalLoading: false });
      })
      .catch((err) => {
        console.log(err);

        Toast.show("Došlo je do greške. Proverite konekciju");
        this.setState({ modalLoading: false });
      });
  }
  componentDidMount() {
    if (this.state.application.position == "HO") {
      inStatic = true;
      let newapp = { ...this.state.application };
      newapp.position = { name: "HO", id: "HO" };
      this.setState({ application: { ...newapp }, loading: false });
    } else {
      getOCPosition(this.event.event_id, this.state.application.position)
        .then((pos) => {
          let ap = {};
          ap.id = this.state.application.position;
          ap.name = pos.name;
          let newapp = { ...this.state.application };
          newapp.position = ap;
          this.setState({ application: { ...newapp }, loading: false });
        })
        .catch((err) => {
          console.log(err);
          Toast.show("Došlo je do greške");
        });
    }
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={adminviewboardapplication_style.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            overScrollMode="never"
            contentContainerStyle={adminEditProfile_style.innerContainer}
          >
            {this.state.loading ? (
              <LoadingIndicator />
            ) : (
              <>
                {this.state.application.userdata.profile_pic_uri != "" ? (
                  <View style={adminviewboardapplication_style.row}>
                    <Image
                      source={{
                        uri: this.state.application.userdata.profile_pic_uri,
                      }}
                      style={adminviewboardapplication_style.profileImage}
                    ></Image>
                  </View>
                ) : (
                  <></>
                )}
                <Text style={adminviewboardapplication_style.podatak}>
                  {this.state.application.userdata.name}{" "}
                  {this.state.application.userdata.surname}
                </Text>
                <Text style={adminviewboardapplication_style.label}>
                  Pozicija:{" "}
                </Text>
                <Text style={adminviewboardapplication_style.podatak}>
                  {this.state.application.position.name}
                </Text>
                <Text style={adminviewboardapplication_style.label}>
                  Motivaciono pismo:{" "}
                </Text>
                <ScrollView>
                  <Text style={adminviewboardapplication_style.podatak}>
                    {this.state.application.motivational_letter}
                  </Text>
                </ScrollView>
                {!this.props.route.params.applications_open && (
                  <View style={adminviewboardapplication_style.buttons}>
                    <Pressable
                      onPress={() => this.setState({ acceptModal: true })}
                      style={adminviewboardapplication_style.button}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
                        Prihvati
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => this.setState({ declineModal: true })}
                      style={adminviewboardapplication_style.button}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
                        Obriši
                      </Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
        <Modal
          transparent={true}
          visible={this.state.acceptModal}
          animationType="slide"
        >
          <Pressable
            style={adminviewboardapplication_style.modalContainer}
            onPress={() => {
              this.setState({ acceptModal: false });
            }}
          >
            <Pressable style={adminviewboardapplication_style.modalContent}>
              <Text style={adminviewboardapplication_style.label}>
                Da li ste sigurni da želite da{" "}
                {this.state.application.userdata.name}{" "}
                {this.state.application.userdata.surname} postane{" "}
                {this.state.application.position.name}?
              </Text>
              <View
                style={adminviewboardapplication_style.modalButtonContainer}
              >
                {this.state.modalLoading ? (
                  <LoadingIndicator />
                ) : (
                  <View style={adminviewboardapplication_style.buttons}>
                    <Pressable
                      style={adminviewboardapplication_style.buttonmodal}
                      onPress={() => this.prihvatiPrijavu()}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
                        Da
                      </Text>
                    </Pressable>
                    <Pressable
                      style={adminviewboardapplication_style.buttonmodal}
                      onPress={() => this.setState({ acceptModal: false })}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
                        Ne
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
        <Modal
          transparent={true}
          visible={this.state.declineModal}
          animationType="slide"
        >
          <Pressable
            style={adminviewboardapplication_style.modalContainer}
            onPress={() => {
              this.setState({ declineModal: false });
            }}
          >
            <Pressable style={adminviewboardapplication_style.modalContent}>
              <Text style={adminviewboardapplication_style.label}>
                Da li ste sigurni da želite da obrišete ovu prijavu?
              </Text>
              <View
                style={adminviewboardapplication_style.modalButtonContainer}
              >
                {this.state.modalLoading ? (
                  <LoadingIndicator />
                ) : (
                  <View style={adminviewboardapplication_style.buttons}>
                    <Pressable
                      style={adminviewboardapplication_style.buttonmodal}
                      onPress={() => this.obrisiPrijavu()}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
                        Da
                      </Text>
                    </Pressable>
                    <Pressable
                      style={adminviewboardapplication_style.buttonmodal}
                      onPress={() => this.setState({ declineModal: false })}
                    >
                      <Text style={adminviewboardapplication_style.buttonText}>
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
    );
  }
}
