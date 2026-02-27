import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { orgAplicant_style } from "../styles/orgAplicant_style";
import { Button } from "@react-native-material/core";
import { getOrgTeamApplicantPositions } from "../firebase_functions";
import { LoadingIndicator } from "./LoadingIndicator";
import { Keyboard } from "react-native";
import Toast from "react-native-root-toast";
import { newOrgTeamApplication } from "../firebase_functions";
import { useNavigation } from "@react-navigation/native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { colorTheme } from "../styles/color_constants";

export class OrgTeamAplicationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      motivacionoPismo: "",
      selectedOption: null,
      options: [],
      loading: true,
      applying: false,
    };
    this.event_id = this.props.route.params.event_id;
  }
  handleApply() {
    Keyboard.dismiss();
    this.setState({ applying: true });
    if (this.state.selectedOption == null) {
      Toast.show("Morate selektovati poziciju");

      this.setState({ applying: false });
      return;
    }
    if (this.state.motivacionoPismo == "") {
      Toast.show("Morate uneti motivaciono pismo");

      this.setState({ applying: false });
      return;
    }

    let application = {
      email: this.props.user.user_id,
      motivational_letter: this.state.motivacionoPismo,
      position: this.state.selectedOption.id,
    };
    newOrgTeamApplication(application, this.event_id)
      .then((r) => {
        Toast.show("Uspešno ste napravili prijavu");
        this.props.navigation.pop();

        this.setState({ applying: false });
      })
      .catch((err) => {
        console.log(err);
        if (err.message == "exists") {
          Toast.show("Već ste napravili prijavu za izabranu poziciju");
        } else Toast.show("Došlo je do greške. Proverite konekciju");

        this.setState({ applying: false });
      });
  }
  componentDidMount() {
    getOrgTeamApplicantPositions(this.event_id)
      .then((res) => {
        let newOptions = [];
        res.forEach((element) => {
          if (element.id != undefined && element.name != undefined) {
            newOptions.push({ id: element.id, label: element.name });
          }
        });
        this.setState({ options: newOptions, loading: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  handleOptionSelect = (option) => {
    this.setState({ selectedOption: option });
  };
  render() {
    return (
      <View>
        <ScrollView
          style={
            this.state.loading && {
              backgroundColor: colorTheme.primary_color + "44",
              minHeight: "100%",
            }
          }
        >
          <View style={!this.state.loading && orgAplicant_style.container}>
            {this.state.loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <Text style={orgAplicant_style.title}>
                  Apliciranje za Organizacioni tim
                </Text>
                <View style={orgAplicant_style.radioButtonContainer}>
                  {this.state.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        orgAplicant_style.touchable,
                        this.state.selectedOption?.id === option.id && {
                          borderColor: "white",
                          borderWidth: 3,
                          backgroundColor: "#ffffff55",
                        },
                      ]}
                      onPress={() => this.handleOptionSelect(option)}
                    >
                      <Text
                        style={[
                          orgAplicant_style.labela,
                          this.state.selectedOption?.id === option.id && {
                            color: colorTheme.tertiary_color,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={orgAplicant_style.labelaMotPismo}>
                    Motivaciono pismo:
                  </Text>
                  <TextInput
                    multiline={true}
                    defaultValue={this.state.motivacionoPismo}
                    onChangeText={(motivacionoPismoNovo) =>
                      this.setState({ motivacionoPismo: motivacionoPismoNovo })
                    }
                    style={orgAplicant_style.input}
                    autoCorrect={false}
                  ></TextInput>
                  {this.state.applying ? (
                    <LoadingIndicator />
                  ) : (
                    <Pressable
                      style={orgAplicant_style.button}
                      onPress={() => this.handleApply()}
                    >
                      <Text style={orgAplicant_style.buttonText}>
                        PRIJAVI SE
                      </Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}
