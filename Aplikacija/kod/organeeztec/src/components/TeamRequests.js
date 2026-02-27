import { Button, Text, Pressable } from "@react-native-material/core";
import React from "react";
import { teamRequests_style } from "../styles/teamRequests-style";
import { BasicListItemBG } from "./BasicListItemBG";
import { SafeAreaView, FlatList } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";
import { collection, onSnapshot } from "firebase/firestore";
import { colorTheme } from "../styles/color_constants";
import Moment from "moment";
import { View } from "react-native";
import {
  db,
  deleteTeamRequest,
  acceptTeamRequest,
} from "../firebase_functions";
import { getDoc } from "firebase/firestore";
import { sortDates } from "../scripts/helperFunctions";
export class TeamRequestsPage extends React.Component {
  constructor(props) {
    super(props);
    this.onReqChange = null;
    this.state = {
      applications: [],
      loading: true,
    };
    this.team_id = this.props.route.params.team_id;
  }
  componentDidMount() {
    let reqRef = collection(db, "teams", this.team_id, "applications");
    this.onReqChange = onSnapshot(
      reqRef,
      (snapshots) => {
        let h = [];
        return new Promise((resolve, reject) => {
          let promises = [];
          snapshots.docs.forEach((f) => {
            if (f.data != undefined) {
              let data = f.data();
              if (data.email != undefined) {
                promises.push(
                  db
                    .collection("users")
                    .doc(data.email)
                    .get()
                    .then((usersnap) => {
                      let e = { id: f.id, ...data };
                      let userdata = usersnap.data();
                      userdata.user_id = usersnap.id;
                      e.userdata = userdata;
                      e.loading = false;
                      h.push(e);
                    })
                );
              }
            }
          });

          return Promise.all(promises)
            .then(() => {
              this.setState({ applications: h, loading: false });
            })
            .catch((err) => console.log(err));
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  componentWillUnmount() {
    this.onReqChange();
  }
  renderEmpty() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text style={teamRequests_style.label}>Nema prijava za tim</Text>
      </View>
    );
  }
  render() {
    return (
      <SafeAreaView style={teamRequests_style.container}>
        {this.state.loading ? (
          <LoadingIndicator />
        ) : (
          <FlatList
            contentContainerStyle={{
              borderWidth: 6,
              borderColor: colorTheme.button + "cc",
              borderRadius: 25,
            }}
            ListEmptyComponent={this.renderEmpty()}
            data={this.state.applications}
            renderItem={({ item, index }) => {
              return (
                <BasicListItemBG
                  onPress={() => {
                    /*this.props.navigation.navigate("AdminViewBordAplicant", {
                      application: item,
                      applications_open:
                        this.props.route.params.applications_open,
                    });*/
                  }}
                  itemStyle={teamRequests_style.listItem}
                >
                  <View style={teamRequests_style.itemContainer}>
                    {/*<Text style={teamRequests_style.date}>
                      {Moment(item.date_created.toDate()).format(
                        "DD/MM/yy HH:mm"
                      ) + "h"}
                    </Text>*/}
                    <View style={teamRequests_style.user}>
                      <Text style={teamRequests_style.label}>
                        {item.userdata.name} {item.userdata.surname}
                      </Text>
                    </View>
                    <>
                      {item.loading ? (
                        <LoadingIndicator />
                      ) : (
                        <View style={teamRequests_style.buttons}>
                          <Pressable
                            style={teamRequests_style.button}
                            onPress={() => {
                              let b = this.state.applications;
                              b[index].loading = true;
                              this.setState({ applications: b });
                              acceptTeamRequest(
                                this.team_id,
                                item.userdata.user_id
                              );
                            }}
                          >
                            <Text style={teamRequests_style.buttonText}>
                              Prihvati
                            </Text>
                          </Pressable>
                          <Pressable
                            style={teamRequests_style.button}
                            onPress={() => {
                              let b = this.state.applications;
                              b[index].loading = true;
                              this.setState({ applications: b });
                              deleteTeamRequest(
                                this.team_id,
                                item.userdata.user_id
                              );
                            }}
                          >
                            <Text style={teamRequests_style.buttonText}>
                              Odbij
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  </View>
                </BasicListItemBG>
              );
            }}
            keyExtractor={(item, index) => String(index)}
          />
        )}
      </SafeAreaView>
    );
  }
}
