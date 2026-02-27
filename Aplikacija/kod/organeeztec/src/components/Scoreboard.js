import { Text } from "@react-native-material/core";
import { View, ScrollView, Image, FlatList, Pressable } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";
import { colorTheme } from "../styles/color_constants";
import { useState } from "react";
import React, { Component } from "react";
import { initializeApp } from "firebase/app";
import { getMembers } from "../firebase_functions";
import { NavigationHelpersContext } from "@react-navigation/native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { BottomNav } from "./BottomNav";
import { useEffect } from "react";
import { scoreboard } from "../styles/scoreboard-style.js";
import { addTaskComment, getTaskComments } from "../firebase_functions";
import { Avatar } from "@react-native-material/core";

export const Scoreboard = ({ navigation, user }) => {
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const getMember = () => {
    getMembers()
      .then((res) => {
        let array = [];
        res = res.map((x, i) => {
          if (x.active)
            array.push({
              id: x.email,
              name: x.name,
              surname: x.surname,
              positions: x.positions,
              label: x.name + " " + x.surname,
              value: i + 1 + "",
              points: x.points,
              profile_pic_uri: x.profile_pic_uri,
            });
        });
        // array.forEach((item)=>{
        //     array.push(item);
        // })
        array.sort((a, b) => b.points - a.points);
        setMembers(array);
        setLoaded(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getMember();
  }, []);

  return (
    <BottomNav nav={navigation} active="scoreboard">
      <View style={scoreboard.container}>
        <View style={scoreboard.titleContainer}>
          <Text style={scoreboard.title}>Rang lista</Text>
          {/* <Pressable
            onPress={() => {
              // addTaskComment("1.6.2023-19:47:39-FR", "ilija.djordjevic.arsic@eestec.rs", "Prvi komentar");
              let id = "1.6.2023-19:47:39-FR";
              navigation.navigate("TaskComments", { id: id });
            }}
            style={{ width: "90%", height: 50, backgroundColor: "white" }}
          >
            <Text> Klikni jednom </Text>
          </Pressable>*/}
        </View>
        {loaded ? (
          <FlatList
            style={scoreboard.scrollViewContainer}
            contentContainerStyle={scoreboard.membersContainer}
            data={members}
            renderItem={({ item, index }) => {
              return (
                <View
                  style={[
                    scoreboard.singleMemberContainer,
                    item.id == user.user_id && {
                      backgroundColor: "#ffffffd0",
                      borderColor: colorTheme.light_secondary_color,
                    },
                    index == 0 && {
                      backgroundColor: colorTheme.tertiary_color + "99",
                      borderColor: colorTheme.tertiary_color,
                    },
                  ]}
                  key={index}
                >
                  <View style={scoreboard.leftAlign}>
                    {
                      <>
                        {(index == 0 && (
                          <Image
                            source={require("../../assets/scoreboard1.png")}
                            style={scoreboard.firstPlace}
                          ></Image>
                        )) ||
                          (index != 0 && (
                            <View style={scoreboard.numberContainer}>
                              <Text
                                style={[
                                  scoreboard.numberText,
                                  item.id == user.user_id && {
                                    color: colorTheme.light_secondary_color,
                                  },
                                ]}
                              >
                                {" "}
                                {index + 1}{" "}
                              </Text>
                            </View>
                          ))}
                        <View style={scoreboard.memberInfo}>
                          {item.profile_pic_uri != null &&
                          item.profile_pic_uri != "" ? (
                            <Image
                              source={{ uri: item.profile_pic_uri }}
                              style={[
                                scoreboard.profileImage,
                                index == 0 && { borderColor: "#fcd303" },
                              ]}
                            ></Image>
                          ) : (
                            <Avatar
                              style={[
                                scoreboard.profileImage,
                                index == 0 && { borderColor: "#fcd303" },
                              ]}
                              label={
                                item != undefined &&
                                item != undefined &&
                                item.name != undefined &&
                                item.name != null &&
                                item.surname != undefined &&
                                item.surname != null
                                  ? item.name + " " + item.surname
                                  : "AA"
                              }
                              size={60}
                            />
                          )}
                          <Text
                            style={[
                              scoreboard.memberName,
                              item.id == user.user_id && {
                                color: colorTheme.light_secondary_color,
                                fontWeight: "500",
                              },
                              index == 0 && {
                                fontWeight: "600",
                                color: "#fcd303",
                              },
                            ]}
                          >
                            {item.name + " " + item.surname}
                          </Text>
                        </View>
                      </>
                    }
                  </View>
                  <Text
                    style={[
                      scoreboard.points,
                      item.id == user.user_id && {
                        color: colorTheme.light_secondary_color,
                        fontWeight: "500",
                      },
                      index == 0 && { color: "#fcd303" },
                    ]}
                  >
                    {item.points}p
                  </Text>
                </View>
              );
            }}
          ></FlatList>
        ) : (
          <LoadingIndicator />
        )}

        <View style={{ height: 200 }}></View>
      </View>
    </BottomNav>
  );
};
