import { Text } from "@react-native-material/core";
import Toast from "react-native-root-toast";
import {
  View,
  ScrollView,
  Button,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import {
  RoundedCheckbox,
  PureRoundedCheckbox,
} from "react-native-rounded-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import { FAB } from "@react-native-material/core";
import { colorTheme } from "../styles/color_constants";
import { addTask } from "../styles/addTask-style";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Tasks } from "./Task";
import React, { Component } from "react";
import { modal_style } from "../styles/modal-style";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import NumericInput from "react-native-numeric-input";
import {
  getTeams,
  getMembers,
  getEvents,
  newTask,
  getActiveMembers,
  getManagedTeams,
} from "../firebase_functions";
import Moment from "moment";

export class AddTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTeam: "",
      board: false,
      orgTeam: false,
      teamsvalue: null,
      membersisFocus: false,
      teamsisFocus: false,
      datePicked: false,
      timePicked: false,
      teams: [],
      checked: false,
      members: [],
      membersSorted: [],
      membersvalue: null,
      membersid: null,
      poeni: 0,
      events: [],
      eventsFiltered: [],
      naziv: null,
      opis: null,
      milestones: [],
      milestoneText: null,
      milestoneIndex: 0,
      deadlineDate: new Date(),
      showDatePicker: false,
      showTimePicker: false,
      teamsicon: "",
      modalPoints: false,
      modalMilestones: false,
      modalMilestonesVisible: false,
      modalPointsVisible: false,
      modalMessage: "",
      numericflag: false,
      filterFlag1: false,
      filterFlag2: false,
      teamChecked: false,
    };
  }
  componentDidMount() {
    let b = false,
      o =
        this.props.user.positions.filter((p) => p.collection == "events")
          .length > 0;
    b =
      this.props.user.positions.filter(
        (p) => p.collection == "board" && p.document == "board"
      ).length > 0;

    this.setState({ orgTeam: o });
    this.setState({ board: b });
    this.getTeam();
    this.getMember();
    this.getEvent();
  }
  getTeam() {
    getTeams()
      .then((res) => {
        let array = [];
        let index = 0;

        res = res.map((x, i) => {
          array.push({
            label: x.name,
            value: i + index + 1,
            icon: x.iconName,
            id: x.id,
          });
        });
        let finalArray = [];
        if (this.state.board) {
          finalArray.push({
            label: "Bord",
            value: 1 + "",
            icon: "account-cowboy-hat",
            id: "Bord",
          });
          index = 1;
        }
        if (this.state.orgTeam || this.state.board) {
          finalArray.push({
            label: "Org Tim",
            value: 1 + index + "",
            icon: "account-group",
            id: "Org Tim",
          });
          index++;
        }

        this.props.user.managed_teams.forEach((item, i) => {
          let temp = item.split(" ");
          array.forEach((item) => {
            if (
              (temp.length == 2 &&
                item.id == temp[1] &&
                !finalArray.includes(item) &&
                temp[1] != "General") ||
              (temp.length == 1 &&
                item.id == temp[0] &&
                !finalArray.includes(item) &&
                temp[0] != "General")
            ) {
              item.value = item.value + index + "";
              finalArray.push(item);
            }
          });
        });
        this.setState({ teams: finalArray, eventsFiltered: [] });
        this.setState({ filterFlag1: true });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;

    this.setState({ deadlineDate: currentDate, showDatePicker: false });
  };
  onTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate;

    this.setState({ deadlineDate: currentDate, showTimePicker: false });
  };
  getMember() {
    getMembers()
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

        this.setState({ members: array });
        this.setState({ membersSorted: [] });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  getEvent() {
    getEvents()
      .then((res) => {
        let array = [
          {
            label: "General",
            color: "#f14c52",
            textcolor: "#fff",
            id: "General",
            value: 0,
            checked: false,
            sortValue: 1,
          },
        ];
        res.forEach((x, i) => {
          if (!x.archived) {
            array.push({
              label: x.checkbox_abb,
              color: x.checkbox_color,
              textcolor: x.checkbox_text_color,
              id: x.id,
              value: i + 1,
              checked: false,
              sortValue: x.sortValue,
            });
          }
        });

        /* array.join();
        array.sort((a, b) => {
          if (a.sortValue > b.sortValue) {
            return 1;
          }
          if (a.sortValue == b.sortValue) {
            return 0;
          }
          return -1;
        });
        let finalArray = [];
        let board = false;
        this.props.user.managed_teams.forEach((item, i) => {
          let temp = item.split(" ");
          if (temp.length == 2) {
            board = true;
            finalArray = array;
          }
          if (!board)
            array.forEach((item) => {
              if (item.id == temp[0] && !finalArray.includes(item)) {
                finalArray.push(item);
              }
            });
        });*/
        this.setState({ eventsFiltered: [] });
        this.setState({ events: array });
        this.setState({ filterFlag2: true });
      })
      .catch((err) => {
        console.error(err);
      });
  }
  removeMilestone(milestone) {
    let a = this.state.milestones.filter((element) => element.key != milestone);
    this.setState({ milestones: a });
  }
  dodajTask() {
    let flag = false;
    this.state.events.forEach((x) => {
      if (x.checked) {
        flag = true;
      }
      if (this.state.board && this.state.teamsvalue == 1) {
        flag = true;
        if (x.id == "General") {
          x.checked = true;
        }
      }
    });

    if (
      this.state.naziv == null ||
      this.state.naziv == "" ||
      this.state.naziv == undefined
    )
      Toast.show("Nije unet naziv zaduženja", {
        duration: Toast.durations.SHORT,
      });
    else if (
      this.state.teamsvalue == null ||
      this.state.teamsvalue == "" ||
      this.state.teamsvalue == undefined
    )
      Toast.show("Nije odabran tim", { duration: Toast.durations.LONG });
    else if (flag == false)
      Toast.show("Nije odabran događaj", { duration: Toast.durations.LONG });
    else if (this.state.deadlineDate == null)
      Toast.show("Nije unet deadline", { duration: Toast.durations.LONG });
    else {
      if (
        (this.state.poeni == null ||
          this.state.poeni == 0 ||
          this.state.poeni == undefined) &&
        !this.state.modalPoints
      ) {
        this.setState({ modalPointsVisible: true });
        this.setState({
          modalMessage:
            "Da li ste sigurni da želite da unesete zaduženje koje nosi 0 poena?\n\nIspod možete uneti novi broj poena",
        });
      } else if (
        (this.state.milestones[0] == null ||
          this.state.milestones[0] == [] ||
          this.state.milestones[0] == undefined) &&
        !this.state.modalMilestones
      ) {
        this.setState({ modalMilestonesVisible: true });
        this.setState({
          modalMessage:
            "Nisu uneti Milestones, proverite da li je u pitanju greška",
        });
      } else {
        let team;
        this.state.teams.forEach((item) => {
          if (item.value == this.state.teamsvalue) team = item.id;
          if (item.id == "Bord" || item.id == "Org Tim") team = "General";
        });

        if (
          this.state.deadlineDate.getTime() < new Date().getTime() ||
          this.state.deadlineDate.getFullYear() < new Date().getFullYear()
        ) {
          if (
            this.state.deadlineDate.toDateString() != new Date().toDateString()
          )
            Toast.show("Unet neispravan datum\n");
          else Toast.show("Uneto neispravno vreme\n");
        } else if (this.state.checked && this.state.membersvalue == null) {
          Toast.show("Odaberite osobu ili odčekirajte\npolje za Posebnu osobu");
        } else {
          newTask(
            this.state.poeni,
            team,
            this.state.membersid,
            this.state.naziv,
            this.state.opis,
            this.state.events,
            this.state.milestones,
            this.state.deadlineDate,
            this.props.user.user_id
          );
          this.props.navigation.goBack();
        }
      }
    }
  }

  render() {
    return (
      <ScrollView style={addTask.pageContainer}>
        <Text style={addTask.title}>Novo zaduženje</Text>
        <Modal
          animationType="fade"
          visible={this.state.modalPointsVisible}
          transparent={true}
          onRequestClose={() => {
            this.setState({ modalPoints: false });
          }}
        >
          <View style={addTask.modalContainer}>
            <Text style={addTask.modal}>{this.state.modalMessage}</Text>
            <View style={addTask.modalNumeric}>
              <NumericInput
                onChange={(value) => this.setState({ poeni: value })}
                value={this.state.poeni}
                containerStyle={addTask.numericContainer}
                inputStyle={addTask.numericInput}
                totalHeight={60}
                totalWidth={210}
                type="plus-minus"
                rounded
                minValue={0}
              />
            </View>
            <Pressable
              style={addTask.button}
              onPress={() => {
                this.setState({ modalPoints: true, modalPointsVisible: false });
              }}
            >
              <Text style={addTask.buttonText}>Zatvori</Text>
            </Pressable>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          visible={this.state.modalMilestonesVisible}
          transparent={true}
          onRequestClose={() => {
            this.setState({ modalMilestones: false });
          }}
        >
          <View style={addTask.modalContainer}>
            <Text style={addTask.modal}>{this.state.modalMessage}</Text>
            <Pressable
              style={addTask.button}
              onPress={() => {
                this.setState({
                  modalMilestones: true,
                  modalMilestonesVisible: false,
                });
              }}
            >
              <Text style={addTask.buttonText}>Zatvori</Text>
            </Pressable>
          </View>
        </Modal>
        <View style={addTask.points}>
          <Text style={addTask.pointsText}>Poeni: </Text>
          <NumericInput
            key={this.state.poeni}
            onChange={(value) => this.setState({ poeni: value })}
            value={this.state.poeni}
            containerStyle={addTask.numericContainer}
            inputStyle={addTask.numericInput}
            totalHeight={40}
            totalWidth={150}
            type="plus-minus"
            rounded
            minValue={0}
          />
        </View>
        <View style={addTask.inputAndCbs}>
          <View style={addTask.input}>
            <Text style={addTask.inputLabel}>Naziv: </Text>
            <TextInput
              style={addTask.textInputNaziv}
              inputMode="search"
              keyboardType="email-address"
              multiline={true}
              onChangeText={(input) => {
                this.setState({ naziv: input });
              }}
              autoCorrect={false}
            ></TextInput>

            <Text style={addTask.inputLabel}>Opis: </Text>
            <TextInput
              style={addTask.textInputOpis}
              multiline={true}
              onChangeText={(input) => {
                this.setState({ opis: input });
              }}
              autoCorrect={false}
            ></TextInput>
          </View>
        </View>
        <View style={addTask.milestonesContainer}>
          <Text style={addTask.milestoneTitle}>Milestones: </Text>
          <View style={addTask.milestones}>
            {this.state.milestones.map((milestone) => {
              return (
                <View style={addTask.milestone} key={milestone.key}>
                  <Text style={addTask.milestoneText}>
                    {milestone.description}
                  </Text>
                  <Pressable
                    style={addTask.milestoneIcon}
                    onPress={() => this.removeMilestone(milestone.key)}
                  >
                    <Feather name="x" size={24} color="black" />
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={addTask.milestoneInputContainer}>
            <TextInput
              style={addTask.milestoneInput}
              onChangeText={(inputValue) =>
                this.setState({ milestoneText: inputValue })
              }
              ref={(input) => {
                this.milestoneText = input;
              }}
            ></TextInput>
            <Pressable
              style={addTask.milestoneIcon}
              onPress={() => {
                let msText = this.state.milestoneText;
                let flag = false;
                this.state.milestones.forEach((element) => {
                  if (element.text == msText) flag = true;
                });
                if (this.state.milestoneText != null && !flag) {
                  this.setState({
                    milestoneIndex: this.state.milestoneIndex + 1,
                  });
                  let mText = {
                    key: this.state.milestoneIndex,
                    description: this.state.milestoneText,
                    done: false,
                    confirmed_done: false,
                  };
                  this.setState({
                    milestones: [...this.state.milestones, mText],
                  });
                  this.milestoneText.clear();
                }
              }}
            >
              <MaterialCommunityIcons name="check" size={24} color="black" />
            </Pressable>
          </View>
        </View>
        <View style={addTask.pointsAndTeams}>
          <Dropdown
            style={[
              addTask.dropdownTeams,
              this.state.teamsisFocus && {
                backgroundColor: colorTheme.light_primary_color + "33",
              },
            ]}
            containerStyle={addTask.containerDdTeams}
            activeColor={addTask.active}
            placeholderStyle={addTask.placeholderStyle}
            selectedTextStyle={addTask.selectedTextStyle}
            itemTextStyle={addTask.itemtext}
            iconStyle={addTask.iconStyle}
            data={this.state.teams}
            autoScroll={false}
            labelField="label"
            valueField="value"
            placeholder={!this.state.teamsisFocus ? "Tim" : "..."}
            value={this.state.teamsvalue}
            onFocus={() => {
              this.setState({ teamsisFocus: true });
            }}
            onBlur={() => {
              this.setState({ teamsisFocus: false });
            }}
            onChange={(item) => {
              this.setState({ teamsicon: item.icon });
              this.setState({ selectedTeam: item.label });
              this.setState({ teamsvalue: item.value });
              this.setState({ teamsisFocus: false });
              this.setState({ teamChecked: true });
              this.setState({
                membersvalue: null,
                checked: false,
                membersid: null,
              });
              let array = [];
              let allEventsUnchecked = this.state.events.map((e) => {
                e.checked = false;
                return e;
              });
              this.setState({ events: allEventsUnchecked });
              if (item.id != "Bord" && item.id != "Org Tim") {
                let myEventIds = [];
                this.props.user.managed_teams.forEach((t) => {
                  let parts = t.split(" ");

                  if (parts.length == 1) {
                    if (parts[0] == item.id) {
                      allEventsUnchecked.forEach((e) => {
                        if (!myEventIds.includes(e.id)) myEventIds.push(e.id);
                      });
                    }
                  } else {
                    if (parts[1] == item.id && parts[1] != "General") {
                      if (!myEventIds.includes(parts[0]))
                        myEventIds.push(parts[0]);
                    }
                  }
                });
                let myEvents = allEventsUnchecked.filter((e) =>
                  myEventIds.includes(e.id)
                );
                let teamMembers = this.state.members.filter(
                  (m) =>
                    m.positions.filter(
                      (p) =>
                        p.collection == "teams" &&
                        p.document == item.id &&
                        p.position == "member"
                    ).length > 0
                );
                this.setState({
                  eventsFiltered: myEvents,
                  membersSorted: teamMembers,
                });
              } else if (item.id == "Bord") {
                let boardMembers = this.state.members.filter(
                  (m) =>
                    m.positions.filter(
                      (p) => p.collection == "board" && p.document == "board"
                    ).length > 0
                );
                this.setState({
                  eventsFiltered: [],
                  membersSorted: boardMembers,
                });
              } else {
                if (this.state.board) {
                  this.setState({
                    eventsFiltered: allEventsUnchecked.filter(
                      (e) => e.id != "General"
                    ),
                  });
                } else {
                  let myEventIds = this.props.user.positions.filter(
                    (p) => p.collection == "events"
                  );
                  myEventIds = myEventIds.map((p) => p.document);
                  let myEvents = allEventsUnchecked.filter((e) => {
                    return myEventIds.includes(e.id);
                  });

                  this.setState({
                    eventsFiltered: myEvents,
                  });
                }
              }

              return;
            }}
            renderLeftIcon={() => (
              <MaterialCommunityIcons
                style={addTask.icon}
                color={
                  this.state.teamsisFocus
                    ? colorTheme.light_secondary_color
                    : "black"
                }
                name={this.state.teamsicon}
                size={20}
              />
            )}
          />

          <View style={addTask.teamsCb}>
            {this.state.eventsFiltered.map((x, i) => {
              return (
                <View
                  style={addTask.team}
                  key={this.state.teamsvalue + i + x.checked + x.id}
                >
                  <PureRoundedCheckbox
                    style={addTask.checkbox}
                    onPress={(checked) => {
                      if (
                        (this.state.board && this.state.teamsvalue == 2) ||
                        (!this.state.board && this.state.teamsvalue == 1)
                      ) {
                        let uncheckedAllEvents = this.state.eventsFiltered.map(
                          (e) => {
                            if (e.id != x.id) e.checked = false;
                            else {
                              x.checked = checked;
                              e.checked = checked;
                            }
                            return e;
                          }
                        );
                        this.setState({
                          eventsFiltered: uncheckedAllEvents,
                        });
                        if (x.checked) {
                          orgMembers = this.state.members.filter(
                            (m) =>
                              m.positions.filter(
                                (p) =>
                                  p.collection == "events" && p.document == x.id
                              ).length > 0
                          );
                        }
                        this.setState({ membersSorted: orgMembers });
                      } else x.checked = checked;
                      let orgMembers = [];
                    }}
                    text="✓"
                    textStyle={addTask.teamsCbText}
                    uncheckedColor="#fff"
                    checkedColor={x.color}
                    uncheckedTextColor="#000"
                    checkedTextColor={x.textcolor}
                    outerStyle={addTask.checkbox}
                    isChecked={x.checked}
                  ></PureRoundedCheckbox>
                  <Text style={{ flexShrink: 1 }} adjustsFontSizeToFit={true}>
                    {x.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={addTask.posebnojOsobiContainer}>
          <View style={addTask.posebnojOsobiCb}>
            <PureRoundedCheckbox
              onPress={(checked) => {
                this.setState({ checked: !checked });
                if (this.state.checked) {
                  this.setState({ membersisFocus: false });
                  this.setState({ membersvalue: null });
                  this.setState({ membersid: null });
                }
              }}
              text="●"
              active={this.state.checked}
              uncheckedColor="#fff"
              checkedColor={colorTheme.light_primary_color + "aa"}
              uncheckedTextColor={colorTheme.light_primary_color + "aa"}
              checkedTextColor="#fff"
            />
            <Text style={addTask.checkboxLabel}> Posebnoj osobi </Text>
          </View>
          <Dropdown
            style={[
              addTask.dropdownMembers,
              this.state.membersisFocus && {
                borderColor: colorTheme.light_primary_color,
              },
              //{ flex: 1 },
            ]}
            search
            searchPlaceholder="Nađi člana..."
            activeColor={addTask.active}
            placeholderStyle={addTask.placeholderStyle}
            selectedTextStyle={addTask.selectedTextStyle}
            inputSearchStyle={addTask.inputSearchStyle}
            itemTextStyle={addTask.itemtext}
            iconStyle={addTask.iconStyle}
            data={this.state.membersSorted}
            autoScroll={false}
            labelField="label"
            valueField="value"
            placeholder={""}
            value={this.state.membersvalue}
            onFocus={() => {
              this.setState({ membersisFocus: true });
            }}
            onBlur={() => {
              this.setState({ membersisFocus: false });
            }}
            onChange={(item) => {
              this.state.membersid = item.id;
              this.state.membersvalue = item.value;
              this.setState({ membersisFocus: true });
              this.setState({ checked: true });
            }}
          />
        </View>
        <View style={addTask.date}>
          <Text style={addTask.dateTitle}>Krajnji rok: </Text>
          <View style={addTask.dateInput}>
            <Text
              onPress={() => this.setState({ showDatePicker: true })}
              style={[
                addTask.dateInputText,
                this.state.datePicked && {
                  fontWeight: "normal",
                  color: "black",
                },
              ]}
            >
              {Moment(this.state.deadlineDate).format("DD/MM/yy")}
            </Text>
            <Text
              onPress={() => this.setState({ showTimePicker: true })}
              style={[
                addTask.dateInputText,
                this.state.timePicked && {
                  fontWeight: "normal",
                  color: "black",
                },
              ]}
            >
              {" "}
              {Moment(this.state.deadlineDate).format("HH:mm")}
            </Text>
          </View>
        </View>
        {this.state.showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={this.state.deadlineDate}
            mode={"date"}
            is24Hour={true}
            onChange={(event, date) => {
              this.onDateChange(event, date);
              this.setState({ datePicked: true });
            }}
          />
        )}
        {this.state.showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker2"
            value={this.state.deadlineDate}
            mode={"time"}
            is24Hour={true}
            onChange={(event, date) => {
              this.onTimeChange(event, date);
              this.setState({ timePicked: true });
            }}
          />
        )}
        <Pressable
          style={addTask.button}
          onPress={() => {
            this.dodajTask();
          }}
        >
          <Text style={addTask.buttonText}> Dodaj zaduženje </Text>
        </Pressable>
      </ScrollView>
    );
  }
}
