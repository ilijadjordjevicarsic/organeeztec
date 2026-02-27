import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Button } from "@react-native-material/core";
import { myRoles_style } from "../styles/myRoles-style";
import { db } from "../firebase_functions";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  deleteDoc,
  getAuth,
  getDocs,
} from "firebase/firestore";
import React from "react";
import Toast from "react-native-root-toast";
import { LoadingIndicator } from "./LoadingIndicator";
import { Alert } from "react-native";
import {
  addTeamRequest,
  deleteTeamRequest,
  getBoardPosition,
  replaceMemberInBoardPosition,
  getOCPosition,
  getEventInfo,
  replaceMemberInEventPosition,
} from "../firebase_functions";

const userStatus = {
  nonMember: "",
  member: "member",
  supervisor: "supervisor",
  pending: "pending",
};

export class MyRolesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.user,
      userTeamsInfo: [],
      selectedTeam: [],
      modalVisible: false,
      loading: false,
      initialLoad: true,
      boardPositions: [],
      boardRemoveVisible: false,
      boardRemoveIndex: -1,
      ocPositions: [],
      ocRemoveVisible: false,
      ocRemoveIndex: -1,
    };
  }
  componentDidMount() {
    this.getAllTeams()
      .then(() => {
        return this.getAllBoardPositions();
      })
      .then(() => {
        return this.getOCPositions();
      })
      .then(() => {
        this.setState({ initialLoad: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  getOCPositions() {
    return new Promise((resolve, reject) => {
      let ocPositions = this.props.user.positions.filter(
        (collection) => collection.collection === "events"
      );
      let promises = [];
      ocPositions.forEach((x, i) => {
        if (x.position == "HO") {
          promises.push(
            new Promise((res, rej) => {
              getEventInfo(x.document)
                .then((e) => {
                  ocPositions[i] = {
                    id: "HO",
                    name: "Glavni organizator",
                    removing: false,
                    event: e,
                  };
                  res(x.position);
                })
                .catch((err) => rej(err));
            })
          );
        } else
          promises.push(
            new Promise((res, rej) => {
              let eventInfo;
              getEventInfo(x.document)
                .then((e) => {
                  eventInfo = e;
                  return getOCPosition(x.document, x.position);
                })
                .then((p) => {
                  ocPositions[i] = {
                    id: x.position,
                    name: p.name,
                    removing: false,
                    event: eventInfo,
                  };
                  res(p.name);
                })
                .catch((err) => rej(err));
            })
          );
      });

      Promise.all(promises)
        .then(() => {
          this.setState({ ocPositions: ocPositions });
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }
  getAllBoardPositions() {
    return new Promise((resolve, reject) => {
      let boardPositions = this.props.user.positions.filter(
        (collection) =>
          collection.collection === "board" && collection.document === "board"
      );
      let promises = [];

      boardPositions.forEach((x, i) => {
        if (x.position == "cp")
          boardPositions[i] = { id: "cp", name: "CP", removing: false };
        else if (x.position == "chairperson")
          boardPositions[i] = {
            id: "chairperson",
            name: "Predsednik",
            removing: false,
          };
        else
          promises.push(
            new Promise((res, rej) => {
              getBoardPosition(x.position)
                .then((p) => {
                  boardPositions[i] = {
                    id: x.position,
                    name: p.name,
                    removing: false,
                  };
                  res(p.name);
                })
                .catch((err) => rej(err));
            })
          );
      });

      Promise.all(promises)
        .then(() => {
          this.setState({ boardPositions: boardPositions });
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }
  getAllTeams() {
    return new Promise((res, rej) => {
      let teamPositions = this.props.user.positions.filter(
        (collection) => collection.collection === "teams"
      );
      getTeams()
        .then((allTeams) => {
          let userTeamsInfo = allTeams.map((team) => {
            let t = team;
            let p = null;
            teamPositions.forEach((teamp) => {
              if (teamp.document == team.id) {
                p = teamp;
              }
            });
            if (p != null) {
              t.userStatus = p.position;
            } else t.userStatus = userStatus.nonMember;
            t.changingStatus = false;
            return t;
          });
          userTeamsInfo = userTeamsInfo.filter((t) => t.id != "General");
          this.setState({ userTeamsInfo });
          res();
        })
        .catch((err) => rej(err));
    });
  }
  removeOCPos() {
    let b = [...this.state.ocPositions];
    b[this.state.ocRemoveIndex].removing = true;
    this.setState({ ocPositions: b, loading: true });
    replaceMemberInEventPosition(
      this.state.ocPositions[this.state.ocRemoveIndex].event.id,
      this.state.ocPositions[this.state.ocRemoveIndex].id,
      ""
    )
      .then(() => {
        let b = [...this.state.ocPositions];
        b.splice(this.state.ocRemoveIndex, 1);
        this.setState({
          ocRemoveVisible: false,
          ocRemoveIndex: -1,
          ocPositions: b,
          loading: false,
        });
        Toast.show("Uspešno ste napustili poziciju");
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Pokušajte ponovo");
      });
  }
  removeBoardPos() {
    let b = [...this.state.boardPositions];
    b[this.state.boardRemoveIndex].removing = true;
    this.setState({ boardPositions: b, loading: true });
    replaceMemberInBoardPosition(
      this.state.boardPositions[this.state.boardRemoveIndex].id,
      ""
    )
      .then(() => {
        let b = [...this.state.boardPositions];
        b.splice(this.state.boardRemoveIndex, 1);
        this.setState({
          boardRemoveVisible: false,
          boardRemoveIndex: -1,
          boardPositions: b,
          loading: false,
        });
        Toast.show("Uspešno ste napustili poziciju");
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Pokušajte ponovo");
      });
  }
  removePosition() {
    this.setState({ loading: true });
    let pomocni = this.props.user.positions;

    for (let i = 0; i < pomocni.length; i++)
      if (
        pomocni[i].collection === "teams" &&
        pomocni[i].document === this.state.selectedTeam.id
      ) {
        const userRef = db.collection("users").doc(this.props.user.user_id);
        pomocni.splice(i, 1);
        return userRef
          .update({
            positions: pomocni,
          })
          .then(() => {
            let newInfo = this.state.userTeamsInfo;
            newInfo.map((team) => {
              if (team.id == this.state.selectedTeam.id) {
                team.userStatus = userStatus.nonMember;
              }
            });
            this.setState({
              userTeamsInfo: newInfo,
              loading: false,
              modalVisible: false,
            });
          })
          .catch((err) => {
            console.log(err);
            Alert.alert("Greška", "Došlo je do greške");
            this.setState({ loading: false });
          });
      }
  }

  setChangingStatus(index) {
    let u = this.state.userTeamsInfo;
    u[index].changingStatus = true;
    this.setState({ userTeamsInfo: u });
  }
  removeChangingStatus(index) {
    let u = this.state.userTeamsInfo;
    u[index].changingStatus = false;
    this.setState({ userTeamsInfo: u });
  }
  makeRequest(index) {
    this.setChangingStatus(index);
    let team = this.state.userTeamsInfo[index];
    addTeamRequest(team.id, this.props.user.user_id)
      .then((positions) => {
        let newInfo = this.state.userTeamsInfo;
        newInfo.map((te) => {
          if (te.id == team.id) {
            te.userStatus = userStatus.pending;
          }
        });
        this.setState({
          userTeamsInfo: newInfo,
        });
        this.removeChangingStatus(index);
      })
      .catch((err) => {
        console.log(err);
        Toast.show("Došlo je do greške. Proverite konekciju");
        this.removeChangingStatus(index);
      });
  }
  deleteReq(index) {
    this.setChangingStatus(index);
    let team = this.state.userTeamsInfo[index];
    deleteTeamRequest(team.id, this.props.user.user_id)
      .then(() => {
        let newInfo = this.state.userTeamsInfo;
        newInfo.map((te) => {
          if (te.id == team.id) {
            te.userStatus = userStatus.nonMember;
          }
        });
        this.setState({
          userTeamsInfo: newInfo,
        });

        this.removeChangingStatus(index);
      })
      .catch((err) => {
        console.log(err);

        Toast.show("Došlo je do greške. Proverite konekciju");
        this.removeChangingStatus(index);
      });
  }
  render() {
    const { modalVisible, selectedTeam } = this.state;
    return (
      <ScrollView>
        <View style={myRoles_style.container}>
          {this.state.initialLoad ? (
            <LoadingIndicator style={{ alignSelf: "center" }} />
          ) : (
            <>
              <Text style={myRoles_style.title}>Moje uloge</Text>
              <View style={myRoles_style.teamContainer}>
                <Text style={myRoles_style.boxTitle}>Član timova:</Text>
                {this.state.userTeamsInfo.map((team, index) => {
                  return (
                    <View style={myRoles_style.team} key={team.name + index}>
                      <Text style={myRoles_style.text}>{team.name}</Text>
                      {team.changingStatus ? (
                        <LoadingIndicator style={{ alignSelf: "center" }} />
                      ) : (
                        <>
                          {team.userStatus != userStatus.nonMember ? (
                            <>
                              {team.userStatus == userStatus.pending ? (
                                <Pressable
                                  style={myRoles_style.button}
                                  onPress={() => {
                                    this.deleteReq(index);
                                  }}
                                >
                                  <Text style={myRoles_style.buttonText}>
                                    Obriši prijavu
                                  </Text>
                                </Pressable>
                              ) : (
                                <Pressable
                                  style={myRoles_style.button}
                                  onPress={() => {
                                    this.setState({
                                      modalVisible: true,
                                      selectedTeam: team,
                                    });
                                  }}
                                >
                                  <Text style={myRoles_style.buttonText}>
                                    Izađi
                                  </Text>
                                </Pressable>
                              )}
                            </>
                          ) : (
                            <Pressable
                              style={myRoles_style.button}
                              onPress={() => {
                                this.makeRequest(index);
                              }}
                            >
                              <Text style={myRoles_style.buttonText}>Uđi</Text>
                            </Pressable>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={this.state.boardPositions.length > 0 && myRoles_style.teamContainer}>
                {this.state.boardPositions.length > 0 ? (
                  <>
                    <Text style={myRoles_style.boxTitle}>
                      Pozicija u bordu:
                    </Text>
                    {this.state.boardPositions.map((pos, index) => {
                      return (
                        <View style={myRoles_style.team} key={pos.name + index}>
                          <Text style={myRoles_style.text}>{pos.name}</Text>
                          {pos.removing ? (
                            <LoadingIndicator style={{ alignSelf: "center" }} />
                          ) : (

                            <Pressable
                              style={myRoles_style.button}
                              onPress={() => {
                                this.setState({
                                  boardRemoveIndex: index,
                                  boardRemoveVisible: true,
                                });
                              }}
                            >
                              <Text style={myRoles_style.buttonText}>
                                Napusti poziciju
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </View>
              <View style={this.state.ocPositions.length > 0 && myRoles_style.teamContainer}>
                {this.state.ocPositions.length > 0 ? (
                  <>
                    <Text style={myRoles_style.boxTitle}>
                      Pozicija u organizacionom timu:
                    </Text>
                    {this.state.ocPositions.map((pos, index) => {
                      return (
                        <View style={myRoles_style.team} key={pos.name + index}>
                          <Text style={myRoles_style.text}>
                            {pos.event.checkbox_abb} - {pos.name}
                          </Text>
                          {pos.removing ? (
                            <LoadingIndicator style={{ alignSelf: "center" }} />
                          ) : (
                            <Pressable
                              style={myRoles_style.button}
                              onPress={() => {
                                this.setState({
                                  ocRemoveIndex: index,
                                  ocRemoveVisible: true,
                                });
                              }}
                            >
                              <Text style={myRoles_style.buttonText}>
                                Napusti poziciju
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </View>
            </>
          )}

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              this.setState({ modalVisible: false });
            }}
          >
            <Pressable
              style={myRoles_style.modalContainer}
              onPress={() => {
                this.setState({ modalVisible: false });
              }}
            >
              <Pressable style={myRoles_style.modalContent}>
                <Text style={myRoles_style.modalText}>
                  Da li ste sigurni da želite da izađete iz {selectedTeam.name}{" "}
                  tima?
                </Text>

                <View style={myRoles_style.buttons}>
                  {this.state.loading ? (
                    <LoadingIndicator style={{ alignSelf: "center" }} />
                  ) : (
                    <>
                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() => {
                          this.removePosition();
                        }}
                      >
                        <Text style={myRoles_style.buttonText}>Da</Text>
                      </Pressable>
                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() => this.setState({ modalVisible: false })}
                      >
                        <Text style={myRoles_style.buttonText}>Ne</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.boardRemoveVisible}
          >
            <Pressable
              style={myRoles_style.modalContainer}
              onPress={() => {
                this.setState({ boardRemoveVisible: false });
              }}
            >
              <Pressable style={myRoles_style.modalContent}>
                <Text style={myRoles_style.modalText}>
                  Da li ste sigurni da ne želite da budete{" "}
                  {this.state.boardRemoveIndex >= 0
                    ? this.state.boardPositions[this.state.boardRemoveIndex]
                        .name
                    : ""}
                  ?
                </Text>

                <View style={myRoles_style.buttons}>
                  {this.state.loading ? (
                    <LoadingIndicator style={{ alignSelf: "center" }} />
                  ) : (
                    <>
                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() => {
                          this.removeBoardPos();
                        }}
                      >
                        <Text style={myRoles_style.buttonText}>Da</Text>
                      </Pressable>

                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() =>
                          this.setState({ boardRemoveVisible: false })
                        }
                      >
                        <Text style={myRoles_style.buttonText}>Ne</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.ocRemoveVisible}
          >
            <Pressable
              style={myRoles_style.modalContainer}
              onPress={() => {
                this.setState({ ocRemoveVisible: false });
              }}
            >
              <Pressable style={myRoles_style.modalContent}>
                <Text style={myRoles_style.modalText}>
                  Da li ste sigurni da ne želite da budete{" "}
                  {this.state.ocRemoveIndex >= 0
                    ? this.state.ocPositions[this.state.ocRemoveIndex].name +
                      " za " +
                      this.state.ocPositions[this.state.ocRemoveIndex].event
                        .name
                    : ""}
                  ?
                </Text>

                <View style={myRoles_style.buttons}>
                  {this.state.loading ? (
                    <LoadingIndicator style={{ alignSelf: "center" }} />
                  ) : (
                    <>
                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() => {
                          this.removeOCPos();
                        }}
                      >
                        <Text style={myRoles_style.buttonText}>Da</Text>
                      </Pressable>
                      <Pressable
                        style={[myRoles_style.button, { marginTop: 10 }]}
                        onPress={() =>
                          this.setState({ ocRemoveVisible: false })
                        }
                      >
                        <Text style={myRoles_style.buttonText}>Ne</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </ScrollView>
    );
  }
}

export const getTeams = async () => {
  const table = collection(db, "teams");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let teams = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (data.name !== undefined) {
            teams.push({
              name: data.name,
              id: pod.id,
            });
          }
        });
        resolve(teams);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};
