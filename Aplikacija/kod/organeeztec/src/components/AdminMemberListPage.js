import { View, Image, TextInput, Pressable } from "react-native";
import { Text } from "@react-native-material/core";
import React from "react";
import { getAdminMembers } from "../firebase_functions";
import { adminMemberList_style } from "../styles/adminMemberList-style";
import { Button } from "@react-native-material/core";
import { LoadingIndicator } from "./LoadingIndicator";
import { ScrollView } from "react-native";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase_functions";

export class AdminMemberListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      admins: [],
      searchValue: "",
      loading: true,
    };
    this.userListener = null;
    this.handlePress1 = () => {
      props.navigation.navigate("AdminEditProfile");
    };
  }

  componentDidMount() {
    this.getMember();
  }
  componentWillUnmount() {
    this.userListener();
  }
  getMember() {
    const table = collection(db, "users");
    this.userListener = onSnapshot(
      table,
      (snapshot) => {
        let members = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (
            data.name !== undefined &&
            data.surname !== undefined &&
            data.admin !== undefined &&
            data.admin == false
          )
            members.push({
              id: members.length,
              admin: data.admin,
              name: data.name,
              surname: data.surname,
              email: pod.id,
              active: data.active,
              points: data.points,
              positions: data.positions,
              birthdate: data.birthdate,
              phone_number: data.phone_number,
              instagram_username: data.instagram_username,
              cv: data.cv,
              achievements: data.achievements,
              profile_pic_uri: data.profile_pic_uri,
            });
        });

        this.setState({ admins: members, loading: false });
      },
      (err) => {
        console.error(err);
      }
    );
  }

  handleSearch = (value) => {
    this.setState({ searchValue: value });
  };
  handlePress = (member) => {
    this.props.navigation.navigate("AdminEditProfile", {
      member: member,
      positions: member.positions,
    });
  };

  render() {
    return (
      <View style={adminMemberList_style.container}>
        <TextInput
          style={adminMemberList_style.searchBox}
          placeholder="Pretraži članove"
          value={this.state.searchValue}
          onChangeText={this.handleSearch}
          autoCorrect={false}
        />
        <ScrollView>
          {this.state.loading ? (
            <LoadingIndicator></LoadingIndicator>
          ) : (
            this.state.admins.map((member) => {
              if (
                (member.name + " " + member.surname)
                  .toLowerCase()
                  .includes(this.state.searchValue.toLowerCase())
              ) {
                return (
                  <View
                    style={adminMemberList_style.memberContainer}
                    key={member.id}
                  >
                    {member.profile_pic_uri ? (
                      <Image
                        source={{ uri: member.profile_pic_uri }}
                        style={adminMemberList_style.memberImage}
                      />
                    ) : (
                      <View style={adminMemberList_style.noImageContainer}>
                        <Text style={adminMemberList_style.memberInitials}>
                          {member.name.charAt(0)}
                          {member.surname.charAt(0)}
                        </Text>
                      </View>
                    )}

                    <View style={adminMemberList_style.textContainer}>
                      <Text style={adminMemberList_style.memberName}>
                        {member.name + " " + member.surname}
                      </Text>
                      <Text style={adminMemberList_style.memberActivity}>
                        {member.active ? "Aktivan" : "Neaktivan"}
                      </Text>
                    </View>
                    <View style={adminMemberList_style.container}>
                      <Pressable
                        style={adminMemberList_style.memberButton}
                        onPress={() => this.handlePress(member)}
                      >
                        <Text style={adminMemberList_style.memberButtonText}>
                          Info
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }
            })
          )}
        </ScrollView>
      </View>
    );
  }
}
