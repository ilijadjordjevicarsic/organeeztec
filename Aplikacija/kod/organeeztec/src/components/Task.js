import { StyleSheet } from "react-native";
import {
  View,
  Button,
  Pressable,
  UIManager,
  LayoutAnimation,
  Platform,
  Modal,
} from "react-native";
import Moment from "moment";
import { Text } from "@react-native-material/core";
import { colorTheme } from "../styles/color_constants";
import { task } from "../styles/task-style";
import * as Progress from "react-native-progress";
import React, { useEffect, useState } from "react";
import { getTeams, updateTask, getMemberName } from "../firebase_functions";
import { Feather, Ionicons } from "@expo/vector-icons";
import { updateCurrentUser } from "firebase/auth";
import { Vibration } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

type TaskProps = {
  key: Number,
  id: String,
  title: String,
  description: String,
  milestones: Array,
  deadline: Date,
  points: Number,
  team: String,
  givenBy: String,
  worker: String,
  tab: Number,
  done: Boolean,
  event_id: Array,
  deleted: Boolean,
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default Task = (props: TaskProps) => {
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("#fff");
  const [visible, setVisible] = useState(false);
  const [milestoneCheck, setMilestoneCheck] = useState([]);
  const [done, setDone] = useState(props.done);
  const [givenBy, setGivenBy] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalGiven, setModalGiven] = useState(false);

  const MY_TASKS = 1,
    PENDING_TASKS = 2,
    FINISHED_TASKS = 3,
    GIVEN_TASKS = 4,
    UNTAKEN_TASKS = 5;

  calculateProgress = (x) => {
    let total = 0;
    let calc = 0;
    x.milestones.forEach((element) => {
      if (element.done) calc++;
      total++;
    });
    if (total != 0) return calc / total;
    return 1;
  };

  const teamColor = () => {
    let colors = "#ee0b03";
    getTeams()
      .then((res) => {
        res.forEach((element) => {
          if (element.id == props.team) {
            colors = element.color;
          }
        });
        setColor(colors);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    let x = null;
    getMemberName(props.givenBy)
      .then((resolve) => {
        setGivenBy(resolve);
      })
      .catch((err) => {
        console.error(err);
      });
    teamColor();
    setRemoved(props.deleted);
    setProgress(calculateProgress(props));
    let array = [];
    props.milestones.sort((a, b) => {
      if (!a.done && b.done) return -1;
      if (a.done && !b.done) return 1;
      return 0;
    });
    let i = 0;
    props.milestones.forEach((element) => {
      element.key = i++;
    });
  }, []);

  const checkMilestone = (key) => {
    if (!props.milestones[key].done && props.givenBy == props.worker)
      props.milestones[key].confirmed_done =
        !props.milestones[key].confirmed_done;
    props.milestones[key].done = !props.milestones[key].done;
    updateTask(props.id, props.milestones, "milestones");
    setProgress(calculateProgress(props));
    let array = milestoneCheck.slice();
    array[key] = !array[key];
    setMilestoneCheck(array);
  };
  const checkDone = () => {
    updateTask(props.id, !props.done, "done");
  };

  const checkConfirmedDone = () => {
    updateTask(props.id, true, "confirmed_done");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRemoved(true);
  };

  const checkPending = (accepted) => {
    updateTask(props.id, accepted, "pending");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRemoved(true);
  };

  const checkTaken = (accepted) => {
    if (accepted) {
      updateTask(props.id, accepted, "taken", props.worker.user_id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRemoved(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisible(false);
  };

  const giveTaskBack = () => {
    updateTask(props.id, false, "giveBack", props.milestones);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRemoved(true);
  };

  return (
    !removed &&
    !props.deleted && (
      <PanGestureHandler>
        <Animated.View
          style={[
            task.container,
            { backgroundColor: color + "3f" },
            props.done &&
              props.tab == GIVEN_TASKS && {
                borderWidth: 4,
                borderColor: "#38d100",
                borderRadius: 14,
              },
          ]}
        >
          {modal && (
            <Modal
              animationType="fade"
              transparent={true}
              onRequestClose={() => {
                setModal(false);
              }}
            >
              <Pressable onPress={() => setModal(false)}>
                <Pressable style={task.modal}>
                  <Text style={task.modalText}>
                    Da li ste sigurni da želite da odustanete od zaduženja?
                  </Text>
                  <View style={task.modalChoice}>
                    <Pressable
                      style={task.modalPressable}
                      onPress={() => {
                        setModal(false);
                        updateTask(props.id, false, "pending");
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut
                        );
                        setRemoved(true);
                      }}
                    >
                      <Text style={task.modalPressableText}>Da</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setModal(false);
                      }}
                      style={[
                        task.modalPressable,
                        {
                          backgroundColor: colorTheme.button + "ee",
                        },
                      ]}
                    >
                      <Text style={task.modalPressableText}>Ne</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}
          {modalGiven && (
            <Modal
              animationType="fade"
              transparent={true}
              onRequestClose={() => {
                setModalGiven(false);
              }}
            >
              <Pressable onPress={() => setModalGiven(false)}>
                <Pressable style={task.modal}>
                  <Text style={task.modalText}>
                    Da li ste sigurni da želite{"\n"}da obrišete zaduženje{" "}
                    {"\n"}
                    <Text
                      style={
                        task.modalText && {
                          fontWeight: "800",
                          fontSize: 24,
                          paddingTop: 10,
                        }
                      }
                    >
                      {props.title}
                    </Text>{" "}
                    ?
                  </Text>
                  <View style={task.modalChoice}>
                    <Pressable
                      style={task.modalPressable}
                      onPress={() => {
                        setModalGiven(false);
                        updateTask(props.id, false, "delete");
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut
                        );
                        setRemoved(true);
                      }}
                    >
                      <Text style={task.modalPressableText}>Da</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setModalGiven(false);
                      }}
                      style={[
                        task.modalPressable,
                        {
                          backgroundColor: colorTheme.button + "ee",
                        },
                      ]}
                    >
                      <Text style={task.modalPressableText}>Ne</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setVisible(!visible);
              props.milestones.sort((a, b) => {
                if (!a.done && b.done) return -1;
                if (a.done && !b.done) return 1;
                return 0;
              });
              let i = 0;
              props.milestones.forEach((element) => {
                element.key = i++;
              });
            }}
            style={[task.taskContainer]}
            onLongPress={() => {
              if (props.tab == MY_TASKS && !done) {
                setModal(true);
                Vibration.vibrate(80);
              } else if (props.tab == GIVEN_TASKS) {
                setModalGiven(true);
                Vibration.vibrate(80);
              }
            }}
          >
            <View>
              <View style={task.titleAndPoints}>
                <Text style={task.title}>{props.title}</Text>
                <Text style={task.points}>{props.points}p</Text>
              </View>
              <View style={task.milestones}>
                {visible && (props.description || props.milestones) && (
                  <View>
                    <Text style={task.description}>{props.description}</Text>
                    <View style={task.milestones}>
                      {props.milestones.map((milestone) => {
                        return (
                          <View style={task.milestone} key={milestone.key}>
                            {(!milestone.done &&
                              (props.tab == MY_TASKS ||
                                props.tab == GIVEN_TASKS) && (
                                <View style={task.milestone}>
                                  <Text style={[task.milestoneText]}>
                                    {milestone.description}
                                  </Text>
                                  {props.tab == MY_TASKS && (
                                    <Pressable
                                      hitSlop={15}
                                      style={task.milestoneIcon}
                                      onPress={() =>
                                        checkMilestone(milestone.key)
                                      }
                                    >
                                      <Feather
                                        name="check"
                                        size={24}
                                        color="black"
                                      />
                                    </Pressable>
                                  )}
                                </View>
                              )) ||
                              //Ako je oznaceno da je MILESTONE zavrsen
                              (milestone.done && (
                                <View style={task.milestone}>
                                  <Text
                                    style={[
                                      task.milestoneText,
                                      props.tab == MY_TASKS ||
                                        (props.tab == GIVEN_TASKS && {
                                          color: "#888",
                                        }),
                                    ]}
                                  >
                                    {milestone.description}
                                  </Text>
                                  {/* Ako je potvrdjeno da je MILESTONE zavrsen */}
                                  {!milestone.confirmed_done && (
                                    <Pressable
                                      hitSlop={15}
                                      style={task.milestoneIcon}
                                      onPress={() =>
                                        checkMilestone(milestone.key)
                                      }
                                    >
                                      {!done && props.tab == MY_TASKS && (
                                        <Feather
                                          name="x"
                                          size={24}
                                          color="#888"
                                        />
                                      )}
                                    </Pressable>
                                  )}
                                </View>
                              )) || ( //Svi ostali slucajevi
                                <View style={task.milestone}>
                                  <Text style={[task.milestoneText]}>
                                    {milestone.description}
                                  </Text>
                                </View>
                              )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
              <View>
                {(visible && props.tab != GIVEN_TASKS && (
                  <Text>Zaduženje od: {givenBy} </Text>
                )) ||
                  (visible && props.tab == GIVEN_TASKS && (
                    <View>
                      {/*<Text>
                      Zaduženje u timu:{" "}
                      {props.team == "General" ? props.events : props.team}
                </Text>*/}
                      <Text>Zaduženje radi: {props.worker} </Text>
                    </View>
                  ))}
              </View>
              {props.tab != FINISHED_TASKS && !done && (
                <View style={task.deadlineAndProgress}>
                  <Text style={task.deadline}>
                    {Moment(props.deadline).format("DD.MM.yy")}
                  </Text>
                  {props.tab == MY_TASKS ||
                    (props.tab == GIVEN_TASKS && (
                      <Progress.Bar
                        progress={progress}
                        width={null}
                        height={10}
                        color={color}
                      />
                    ))}
                </View>
              )}
            </View>
          </Pressable>

          {progress == 1 && props.tab == MY_TASKS && (
            <Pressable
              style={[task.markedDone, { backgroundColor: color + "40" }]}
              onPress={() => {
                setDone(!done);
                checkDone();
              }}
              onLongPress={() => {
                if (!done) setModal(true);
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                {" "}
                {done
                  ? "Zaduženje markirano kao urađeno!\nKlikni da odmarkiraš"
                  : "Markiraj zaduženje kao urađeno!"}{" "}
              </Text>
              {!done && (
                <Ionicons name="ios-checkmark-done" size={24} color="black" />
              )}
            </Pressable>
          )}
          {visible && props.tab == PENDING_TASKS && (
            <View style={task.pending}>
              <Pressable
                onPress={() => checkPending(true)}
                style={[
                  task.pendingYes,
                  {
                    // borderBottomRightRadius: 10,
                    borderRightWidth: 1,
                    // borderBottomWidth: 1,
                  },
                ]}
                onLongPress={() => {
                  setModal(true);
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    margin: "3%",
                  }}
                >
                  Prihvati zaduženje
                </Text>
                <Ionicons name="ios-checkmark-done" size={24} color="black" />
              </Pressable>
              <Pressable
                onPress={() => checkPending(false)}
                style={[
                  task.pendingNo,
                  {
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                  },
                ]}
              >
                <Text
                  style={{
                    textAlign: "center",
                    margin: "3%",
                  }}
                >
                  Odbij zaduženje
                </Text>
                <Feather name="x" size={24} color="black" />
              </Pressable>
            </View>
          )}
          {visible && props.tab == UNTAKEN_TASKS && (
            <View style={task.pending}>
              <Pressable
                onPress={() => checkTaken(true)}
                style={[
                  task.pendingYes,
                  {
                    borderBottomRightRadius: 10,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                  },
                ]}
                onLongPress={() => {
                  setModal(true);
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    margin: "3%",
                  }}
                >
                  Prihvatam zaduženje
                </Text>
                <Ionicons name="ios-checkmark-done" size={24} color="black" />
              </Pressable>
            </View>
          )}
          {visible && props.tab == GIVEN_TASKS && props.done && (
            <View style={task.pending}>
              <Pressable
                onPress={() => checkConfirmedDone(true)}
                style={task.pendingYes}
              >
                <Text
                  style={{
                    textAlign: "center",
                    margin: "3%",
                  }}
                >
                  Potvrdi urađeno zaduženje
                </Text>
                <Ionicons name="ios-checkmark-done" size={24} color="black" />
              </Pressable>
              <Pressable onPress={() => giveTaskBack()} style={task.pendingNo}>
                <Text
                  style={{
                    textAlign: "center",
                    margin: "3%",
                  }}
                >
                  Vrati zaduženje
                </Text>
                <Ionicons name="ios-checkmark-done" size={24} color="black" />
              </Pressable>
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    )
  );
};
