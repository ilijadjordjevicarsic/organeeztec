import { Text } from "@react-native-material/core";
import {
  View,
  Button,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

import { LoadingIndicator } from "./LoadingIndicator";
import { tasksPage } from "../styles/tasksPage-style";
import { FAB } from "@react-native-material/core";
import { colorTheme } from "../styles/color_constants";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import Task from "./Task";
import React, { Component } from "react";
import { modal_style } from "../styles/modal-style";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { firebaseConfig } from "../firebase_functions";
import { NavigationHelpersContext } from "@react-navigation/native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { getTasks, updateTask } from "../firebase_functions";
import { BottomNav } from "./BottomNav";
import { useEffect } from "react";

export const TasksPage = ({ navigation, user }) => {
  const [tasks, setTasks] = useState([]);
  const [boardOrOrgTeam, setBoardOrOrgTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const month = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const MY_TASKS = 1,
    PENDING_TASKS = 2,
    FINISHED_TASKS = 3,
    GIVEN_TASKS = 4;

  const [selected, setSelected] = useState(MY_TASKS);

  useEffect(() => {
    getTask();
    if (
      user.positions.filter(
        (p) => p.collection == "board" && p.document == "board"
      ).length > 0 ||
      user.positions.filter((p) => p.collection == "events").length > 0
    )
      setBoardOrOrgTeam(true);
  }, []);

  const getTask = () => {
    getTasks(user)
      .then((res) => {
        let array = [];
        res = res.map((data, i) => {
          array.push({
            title: data.title,
            id: data.id,
            description: data.description,
            points: data.points,
            team_id: data.team_id,
            milestones: data.milestones,
            events: data.events,
            deadline: data.deadline,
            value: i + 1 + "",
            worker: data.worker,
            user_id: data.user_id,
            done: data.done,
            accepted: data.accepted,
            confirmed_done: data.confirmed_done,
            deleted: data.deleted,
          });
        });

        array.sort((a, b) => a.deadline - b.deadline);
        setTasks(array);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const update = () => {
    setLoading(true);
    getTasks(user)
      .then((res) => {
        let array = [];
        res = res.map((data, i) => {
          array.push({
            title: data.title,
            id: data.id,
            description: data.description,
            points: data.points,
            team_id: data.team_id,
            milestones: data.milestones,
            events: data.events,
            deadline: data.deadline,
            value: i + 1 + "",
            worker: data.worker,
            user_id: data.user_id,
            done: data.done,
            accepted: data.accepted,
            confirmed_done: data.confirmed_done,
            deleted: data.deleted
          });
        });

        array.sort((a, b) => a.deadline - b.deadline);
        if (array != tasks) setTasks(array);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <BottomNav nav={navigation} active="tasks">
      <View style={{ height: "90%" }}>
        <View>
          <View style={tasksPage.navButtonsContainer}>
            <Pressable
              onPress={() => {
                if (selected != PENDING_TASKS) {
                  setSelected(PENDING_TASKS);
                  update();
                }
              }}
              style={[
                tasksPage.navButton,
                selected == PENDING_TASKS
                  ? {
                      backgroundColor: "#f3f3f3",
                      borderRadius: 0,
                    }
                  : {
                      backgroundColor: "#ddd",
                      borderRadius: 0,
                    },
              ]}
            >
              <Text style={tasksPage.navButtonText}>Zaduženja na čekanju</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (selected != MY_TASKS) {
                  setSelected(MY_TASKS);
                  update();
                }
              }}
              style={[
                tasksPage.navButton,
                selected == MY_TASKS
                  ? {
                      backgroundColor: "#f3f3f3",
                      borderRadius: 0,
                    }
                  : {
                      backgroundColor: "#ddd",
                      borderRadius: 0,
                    },
              ]}
            >
              <Text style={tasksPage.navButtonText}>Moja zaduženja</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (selected != FINISHED_TASKS) {
                  setSelected(FINISHED_TASKS);
                  update();
                }
              }}
              style={[
                tasksPage.navButton,
                selected == FINISHED_TASKS
                  ? {
                      backgroundColor: "#f3f3f3",
                      borderRadius: 0,
                    }
                  : {
                      backgroundColor: "#ddd",
                      borderRadius: 0,
                    },
              ]}
            >
              <Text style={tasksPage.navButtonText}>Završena zaduženja</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (selected != GIVEN_TASKS) {
                  setSelected(GIVEN_TASKS);
                  update();
                }
              }}
              style={[
                tasksPage.navButton,
                selected == GIVEN_TASKS
                  ? {
                      backgroundColor: "#f3f3f3",
                      borderRadius: 0,
                    }
                  : {
                      backgroundColor: "#ddd",
                      borderRadius: 0,
                    },
              ]}
            >
              <Text style={tasksPage.navButtonText}>Data zaduženja</Text>
            </Pressable>
          </View>

          <ScrollView style={tasksPage.scrollView}>
            {loading ? (
              <View style={tasksPage.taskspage}>
                <LoadingIndicator />
              </View>
            ) : (
              <View style={tasksPage.taskspage}>
                {/*<View style={tasksPage.titleview}>
                   {selected == MY_TASKS && boardOrOrgTeam && (
                  <Pressable onPress={() => addTask()} style={tasksPage.button}>
                    <Text>Novo zaduženje</Text>
                  </Pressable>
                )} 
                </View>*/}

                <View style={tasksPage.tasks}>
                  {(() => {
                    let renderedTasks = [];
                    tasks.forEach((x) => {
                      let counter = 0;
                      let confirmed = x.confirmed_done;
                      x.milestones.forEach((element) => {
                        if (element.confirmed_done) counter++;
                      });
                      if (counter == x.milestones.length) {
                        confirmed = true;
                      }
                      if (
                        (!x.confirmed_done || !x.done) &&
                        x.accepted &&
                        selected == MY_TASKS &&
                        x.worker == user.user_id
                      )
                        renderedTasks.push(
                          <Task
                            onPress={() => {
                              //funkcija za auto scroll na element
                            }}
                            key={x.id}
                            id={x.id}
                            title={x.title}
                            description={x.description}
                            milestones={x.milestones}
                            deadline={x.deadline}
                            points={x.points}
                            team={x.team_id}
                            givenBy={x.user_id}
                            event_id={x.events}
                            worker={user.user_id}
                            tab={selected}
                            done={x.done}
                            confirmed_done={x.confirmed_done}
                            deleted={x.deleted}
                          />
                        );
                      if (
                        !x.accepted &&
                        /*!confirmed &&*/
                        selected == PENDING_TASKS &&
                        x.worker == user.user_id
                      )
                        renderedTasks.push(
                          <Task
                            onPress={() => {
                              //funkcija za auto scroll na element
                            }}
                            key={x.id}
                            id={x.id}
                            title={x.title}
                            description={x.description}
                            milestones={x.milestones}
                            deadline={x.deadline}
                            points={x.points}
                            team={x.team_id}
                            event_id={x.events}
                            givenBy={x.user_id}
                            worker={user.user_id}
                            tab={selected}
                            done={x.done}
                            confirmed_done={x.confirmed_done}
                            deleted={x.deleted}
                          />
                        );
                      if (
                        x.confirmed_done &&
                        x.done &&
                        selected == FINISHED_TASKS &&
                        x.worker == user.user_id
                      )
                        renderedTasks.push(
                          <Task
                            onPress={() => {
                              //funkcija za auto scroll na element
                            }}
                            key={x.id}
                            id={x.id}
                            title={x.title}
                            description={x.description}
                            milestones={x.milestones}
                            deadline={x.deadline}
                            points={x.points}
                            team={x.team_id}
                            givenBy={x.user_id}
                            worker={x.worker}
                            tab={selected}
                            event_id={x.events}
                            done={x.done}
                            confirmed_done={x.confirmed_done}
                            deleted={x.deleted}
                          />
                        );
                      if (
                        x.user_id == user.user_id &&
                        !x.confirmed_done &&
                        selected == GIVEN_TASKS
                      )
                        renderedTasks.push(
                          <Task
                            onPress={() => {
                              //funkcija za auto scroll na element
                            }}
                            key={x.id}
                            id={x.id}
                            title={x.title}
                            description={x.description}
                            milestones={x.milestones}
                            deadline={x.deadline}
                            points={x.points}
                            team={x.team_id}
                            givenBy={x.user_id}
                            worker={x.worker}
                            tab={selected}
                            event_id={x.events}
                            done={x.done}
                            confirmed_done={x.confirmed_done}
                            deleted={x.deleted}
                          />
                        );
                    });
                    if (renderedTasks.length > 0) return renderedTasks;
                    return (
                      <Text style={tasksPage.noTasksText}>
                        Nema
                        {(() => {
                          if (selected == MY_TASKS) return " preuzetih";
                          if (selected == FINISHED_TASKS) return " gotovih";
                          if (selected == GIVEN_TASKS) return " zadatih";
                        })()}{" "}
                        zaduženja{" "}
                        {selected == PENDING_TASKS ? "na čekanju" : ""}
                      </Text>
                    );
                  })()}
                </View>
              </View>
            )}
          </ScrollView>

          {boardOrOrgTeam && (
            <Pressable onPress={() => addTask()} style={tasksPage.button}>
              <Text style={tasksPage.buttonText}>Novo zaduženje</Text>
            </Pressable>
          )}
        </View>
      </View>
    </BottomNav>
  );

  function addTask() {
    navigation.navigate("AddTask");
  }
};
