import { Text } from "@react-native-material/core";
import { BasicListItemBG } from "./BasicListItemBG";
import { SafeAreaView, FlatList } from "react-native";
import { colorTheme } from "../styles/color_constants";
import React from "react";
import { authTable } from "../scripts/tableRefs";
import { onSnapshot } from "firebase/firestore";
import { LoadingIndicator } from "./LoadingIndicator";
import { adminreq_style } from "../styles/adminauthreq-style";
import { sortDates } from "../scripts/helperFunctions";
import Moment from "moment";
import { View } from "react-native";
import { adminviewauthreq_style } from "../styles/adminviewauthreq-style";
export class AdminAuthentificationPage extends React.Component {
  constructor(props) {
    super(props);
    this.onReqChange = null;
    this.state = {
      auth_requests: [],
      loading: true,
    };
  }
  componentDidMount() {
    this.onReqChange = onSnapshot(
      authTable,
      (snapshots) => {
        let h = [];
        snapshots.docs.forEach((f) => {
          if (f.data != undefined) {
            let data = f.data();
            if (
              data.name != undefined &&
              data.surname != undefined &&
              data.birthdate != undefined &&
              data.cv != undefined &&
              data.date_created != undefined &&
              data.instagram_username != undefined &&
              data.phone_number != undefined &&
              data.profile_pic_uri != undefined
            ) {
              let e = { id: f.id, ...data };

              h.push(e);
            }
          }
        });
        h.sort((a, b) => {
          sortDates(a, b);
        });
        this.setState({ auth_requests: h, loading: false });
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
        <Text style={adminviewauthreq_style.label}>
          Nema zahteva za autentifikaciju
        </Text>
      </View>
    );
  }
  render() {
    return (
      <SafeAreaView style={adminreq_style.container}>
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
            data={this.state.auth_requests}
            renderItem={({ item }) => {
              return (
                <BasicListItemBG
                  onPress={() => {
                    this.props.navigation.navigate("AdminAuthReq", {
                      req: item,
                    });
                  }}
                  itemStyle={adminreq_style.listItem}
                >
                  <View style={adminreq_style.itemContainer}>
                    <Text style={adminreq_style.date}>
                      {Moment(item.date_created.toDate()).format(
                        "DD/MM/yy HH:mm"
                      ) + "h"}
                    </Text>
                    <View style={adminreq_style.user}>
                      <Text style={adminviewauthreq_style.label}>
                        {item.name} {item.surname}
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
