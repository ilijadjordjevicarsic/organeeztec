import { Text } from "@react-native-material/core";
import React from "react";
import { bordApplications } from "../scripts/tableRefs";
import { adminboardapplications_style } from "../styles/adminbordapplications-style";
import { BasicListItemBG } from "./BasicListItemBG";
import { SafeAreaView, FlatList } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";
import { onSnapshot } from "firebase/firestore";
import { colorTheme } from "../styles/color_constants";
import Moment from "moment";
import { View } from "react-native";
import { db } from "../firebase_functions";
import { getDoc } from "firebase/firestore";
import { sortDates } from "../scripts/helperFunctions";
export class AdminBordAplicantPage extends React.Component {
  constructor(props) {
    super(props);
    this.onReqChange = null;
    this.state = {
      applications: [],
      loading: true,
    };
  }
  componentDidMount() {
    this.onReqChange = onSnapshot(
      bordApplications,
      (snapshots) => {
        let h = [];
        return new Promise((resolve, reject) => {
          let promises = [];
          snapshots.docs.forEach((f) => {
            if (f.data != undefined) {
              let data = f.data();
              if (
                data.email != undefined &&
                data.motivational_letter != undefined &&
                data.position != undefined &&
                data.date_created != undefined
              ) {
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
                      h.push(e);
                    })
                );
              }
            }
          });

          return Promise.all(promises)
            .then(() => {
              h.sort((a, b) => sortDates(a, b));
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
        <Text style={adminboardapplications_style.label}>
          Nema prijava za upravni odbor
        </Text>
      </View>
    );
  }
  render() {
    return (
      <SafeAreaView style={adminboardapplications_style.container}>
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
            renderItem={({ item }) => {
              return (
                <BasicListItemBG
                  onPress={() => {
                    this.props.navigation.navigate("AdminViewBordAplicant", {
                      application: item,
                      applications_open:
                        this.props.route.params.applications_open,
                    });
                  }}
                  itemStyle={adminboardapplications_style.listItem}
                >
                  <View style={adminboardapplications_style.itemContainer}>
                    <Text style={adminboardapplications_style.date}>
                      {Moment(item.date_created.toDate()).format(
                        "DD/MM/yy HH:mm"
                      ) + "h"}
                    </Text>
                    <View style={adminboardapplications_style.user}>
                      <Text style={adminboardapplications_style.label}>
                        {item.userdata.name} {item.userdata.surname}
                      </Text>
                    </View>
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
