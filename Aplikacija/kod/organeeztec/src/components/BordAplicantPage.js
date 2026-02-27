import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { bordAplicant_style } from "../styles/bordAplicant-style";
import { Button } from "@react-native-material/core";
import { getBoardApplicantPositions } from "../firebase_functions";
import { LoadingIndicator } from "./LoadingIndicator";
import { Keyboard } from "react-native";
import Toast from "react-native-root-toast";
import { newBoardApplication } from "../firebase_functions";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { colorTheme } from "../styles/color_constants";

export class BordAplicantPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      motivacionoPismo: "",
      selectedOption: null,
      options: [],
      loading: true,
      applying: false,
      keyboardVisible: false,
    };
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
    newBoardApplication(application)
      .then((r) => {
        Toast.show("Uspešno ste napravili prijavu za Upravni Odbor");
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
    getBoardApplicantPositions()
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
          <View style={!this.state.loading && bordAplicant_style.container}>
            {this.state.loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <Text style={bordAplicant_style.title}>
                  Apliciranje za Upravni odbor
                </Text>
                <View style={bordAplicant_style.radioButtonContainer}>
                  {this.state.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        bordAplicant_style.touchable,
                        this.state.selectedOption?.id === option.id && {
                          borderColor: "white",
                          borderWidth: 3,
                          backgroundColor: "#ffffff55",
                        },
                      ]}
                      onPress={() => this.handleOptionSelect(option)}
                    >
                      {/* <View
                      style={[
                        bordAplicant_style.radioButton,
                        {
                          borderColor:
                            this.state.selectedOption?.id === option.id
                              ? "white"
                              : "black",
                        },
                      ]}
                    >
                      {this.state.selectedOption?.id === option.id && (
                        <View
                          style={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: "white",
                          }}
                        />
                      )}
                    </View> */}
                      <Text
                        style={[
                          bordAplicant_style.labela,
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
                  <Text style={bordAplicant_style.labelaMotPismo}>
                    Motivaciono pismo:
                  </Text>
                  <TextInput
                    multiline={true}
                    defaultValue={this.state.motivacionoPismo}
                    onChangeText={(motivacionoPismoNovo) =>
                      this.setState({ motivacionoPismo: motivacionoPismoNovo })
                    }
                    style={bordAplicant_style.input}
                    autoCorrect={false}
                  ></TextInput>
                  {this.state.applying ? (
                    <LoadingIndicator />
                  ) : (
                    <Pressable
                      style={bordAplicant_style.button}
                      onPress={() => this.handleApply()}
                    >
                      <Text style={bordAplicant_style.buttonText}>
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
