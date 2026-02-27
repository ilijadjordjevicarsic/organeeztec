import {
  Image,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { myProfile_style } from "../styles/myProfile-style";
import { Button, Avatar } from "@react-native-material/core";
import { deleteUser } from "../firebase_functions";

import React, { useState, useEffect } from "react";
import {
  getAuth,
  updatePassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db, logOut, auth } from "../firebase_functions";
import { colorTheme } from "../styles/color_constants";
import { LoadingIndicator } from "./LoadingIndicator";
import { Keyboard, Alert } from "react-native";
import { validatePass } from "../scripts/helperFunctions";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-root-toast";
import { notifTest } from "../firebase_functions";

export const MyProfilePage = (props) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const auth = getAuth();
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [loggingIn, setLoggingIn] = useState(true);
  const [activeStatus, setActiveStatus] = useState(props.user.active);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleChangePassword = () => {
    // Check if the old password is correct

    Keyboard.dismiss();
    const user = auth.currentUser;
    setChangingPass(true);
    const credential = signInWithEmailAndPassword(auth, user.email, oldPassword)
      .then(() => {
        // Old password is correct, update the user's password in Firebase Auth
        if (newPassword.length < 8 || newPassword.length > 20) {
          Alert.alert(
            "Neispravna lozinka",
            "Dužina lozinke mora da bude između 8 i 20 karaktera"
          );
          setChangingPass(false);
          return;
        }
        if (!validatePass(newPassword)) {
          Alert.alert(
            "Neispravna lozinka",
            "Lozinka može da sadrži karaktere: a-Z, 0-9,$!%*?&()~#;:+*=%'^[]. Obavezno je da sadrži jedno veliko slovo, jedno malo slovo i jednu brojku"
          );
          setChangingPass(false);
          return;
        }
        setTimeout(() => {
          updatePassword(user, newPassword)
            .then(() => {
              Alert.alert("Uspešno ste promenili šifru");
              setModalVisible(false);
              setChangingPass(false);
              setOldPassword("");

              setNewPassword("");
            })
            .catch((error) => {
              console.log(`Error updating password: ${error}`);
              Alert.alert("Došlo je do greške", "Proverite konekciju");
              setErrorMessage(error.message);
              setChangingPass(false);
            });
        }, 1000);
      })
      .catch((error) => {
        // Old password is incorrect, display an error message

        Alert.alert("Uneta stara lozinka nije tačna. Pokušajte ponovo");
        setErrorMessage("Incorrect old password");
        setChangingPass(false);
      });
  };
  useEffect(() => {
    setLoggingIn(true);

    const boardRef = db.collection("board").doc("board");
    const listener = boardRef.onSnapshot((doc) => {
      setIsApplicationsOpen(doc.data().applications_open);

      setTimeout(() => {
        setLoggingIn(false);
      }, 1000);
    });
    return () => {
      setLoggingIn(true);
      listener();
    };
  }, []);

  const buttonStyle = {
    ...myProfile_style.button,
    backgroundColor: isApplicationsOpen ? colorTheme.button : "#BEBEBE",
  };
  const handleChangeActiveStatus = () => {
    setLoading(true);
    const user = getAuth().currentUser;
    const userRef = db.collection("users").doc(user.email);

    userRef
      .update({ active: !activeStatus })
      .then(() => {
        setActiveStatus(!activeStatus);
        setModalVisible2(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        setLoading(false);
      });
  };
  const handlePress1 = () => {
    props.navigation.navigate("UpdateProfile");
  };
  const handlePress2 = () => {
    props.navigation.navigate("BordAplicant");
  };
  const handlePress3 = () => {
    props.navigation.navigate("MyRoles");
  };

  const handleLeave = () => {
    setLoading(true);
    deleteUser({ email: props.user.user_id })
      .then((r) => {
        setTimeout(() => {
          Toast.show(
            "Uspešno ste napustili organizaciju",
            Toast.durations.LONG
          );
        }, 1000);
        setModalVisible1(false);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Greška", "Došlo je do greške");

        setLoading(false);
      });
  };

  return (
    <ScrollView>
      <View style={myProfile_style.container}>
        {loggingIn ? (
          <LoadingIndicator></LoadingIndicator>
        ) : (
          <>
            <View style={myProfile_style.avatar}>
              {props.user != undefined &&
              props.user != null &&
              props.user.profile_pic_uri != "" ? (
                <Image
                  source={{ uri: props.user.profile_pic_uri }}
                  style={myProfile_style.profileImage}
                ></Image>
              ) : (
                <Avatar
                  label={
                    props.user != undefined &&
                    props.user != undefined &&
                    props.user.name != undefined &&
                    props.user.name != null &&
                    props.user.surname != undefined &&
                    props.user.surname != null
                      ? props.user.name + " " + props.user.surname
                      : "AA"
                  }
                  size={100}
                />
              )}
            </View>

            <Text style={myProfile_style.name}>
              {props.user != undefined &&
              props.user != null &&
              props.user.name != undefined &&
              props.user.name != null
                ? props.user.name + " "
                : ""}
              {props.user != undefined &&
              props.user != null &&
              props.user.surname != undefined &&
              props.user.surname != null
                ? props.user.surname
                : ""}
            </Text>

            {/* Moje uloge */}
            <Pressable style={myProfile_style.button} onPress={handlePress3}>
              <Text style={myProfile_style.buttonText}>Moje uloge</Text>
            </Pressable>

            {/* Izmeni Profil */}
            <Pressable style={myProfile_style.button} onPress={handlePress1}>
              <Text style={myProfile_style.buttonText}>Izmeni profil</Text>
            </Pressable>

            {/* Aktivan/Neaktivan */}
            <Pressable
              style={myProfile_style.button}
              onPress={() => setModalVisible2(true)}
            >
              <Text style={myProfile_style.buttonText}>
                {activeStatus ? "Deaktiviraj se" : "Aktiviraj se"}
              </Text>
            </Pressable>

            <Modal
              transparent={true}
              visible={modalVisible2}
              animationType="fade"
            >
              <Pressable
                style={myProfile_style.modalContainer}
                onPress={() => setModalVisible2(false)}
              >
                <Pressable style={myProfile_style.modalContent}>
                  {loading ? (
                    <>
                      <Text
                        style={[myProfile_style.label, { color: "#ffffff00" }]}
                      >
                        {activeStatus
                          ? "Da li ste sigurni da želite da se deaktivirate?"
                          : "Potvrdite da želite da se aktivirate?"}
                      </Text>
                      <LoadingIndicator />
                      <Text
                        style={[myProfile_style.label, { color: "#ffffff00" }]}
                      >
                        {activeStatus
                          ? "Da li ste sigurni da želite da se deaktivirate?"
                          : "Potvrdite da želite da se aktivirate?"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={myProfile_style.label}>
                        {activeStatus
                          ? "Da li ste sigurni da želite da se deaktivirate?"
                          : "Potvrdite da želite da se aktivirate?"}
                      </Text>
                      <View style={myProfile_style.modalButtonContainer}>
                        <>
                          <Pressable
                            style={[
                              myProfile_style.button,
                              !activeStatus && {
                                backgroundColor: colorTheme.button + "ee",
                              },
                            ]}
                            onPress={handleChangeActiveStatus}
                          >
                            <Text style={myProfile_style.buttonText}>Da</Text>
                          </Pressable>
                          <Pressable
                            style={[
                              myProfile_style.button,
                              activeStatus && {
                                backgroundColor: colorTheme.button + "ee",
                              },
                            ]}
                            onPress={() => setModalVisible2(false)}
                          >
                            <Text style={myProfile_style.buttonText}>Ne</Text>
                          </Pressable>
                        </>
                      </View>
                    </>
                  )}
                </Pressable>
              </Pressable>
            </Modal>

            {/* Prijave za bord */}
            {isApplicationsOpen && (
              <Pressable
                style={[
                  myProfile_style.button,
                  { backgroundColor: colorTheme.button + "ee" },
                ]}
                onPress={handlePress2}
              >
                <Text style={myProfile_style.buttonText}>
                  Apliciranje za Upravni odbor
                </Text>
              </Pressable>
            )}

            {/* Password change */}
            <Pressable
              style={myProfile_style.button}
              onPress={() => setModalVisible(true)}
            >
              <Text style={myProfile_style.buttonText}>Promeni lozinku</Text>
            </Pressable>

            {/* Izlaz iz organizacije */}
            <Pressable
              style={myProfile_style.button}
              onPress={() => setModalVisible1(true)}
            >
              <Text style={myProfile_style.buttonText}>
                Izlaz iz organizacije
              </Text>
            </Pressable>

            {/* Odjavi se */}
            {loggingOut ? (
              <LoadingIndicator />
            ) : (
              <Pressable
                style={[
                  myProfile_style.button,
                  { backgroundColor: "lightgrey", borderColor: "grey" },
                ]}
                onPress={() => logout()}
              >
                <Text style={[myProfile_style.buttonText, { color: "grey" }]}>
                  Odjavi se
                </Text>
              </Pressable>
            )}

            <Modal
              transparent={true}
              visible={modalVisible1}
              animationType="fade"
            >
              <Pressable
                style={myProfile_style.modalContainer}
                onPress={() => setModalVisible1(false)}
              >
                <Pressable style={myProfile_style.modalContent}>
                  <Text style={myProfile_style.label}>
                    Da li ste sigurni da želite da napustite organizaciju?
                  </Text>
                  <View style={myProfile_style.modalButtonContainer}>
                    {loading ? (
                      <LoadingIndicator />
                    ) : (
                      <>
                        <Pressable
                          style={myProfile_style.button}
                          onPress={() => {
                            handleLeave();
                          }}
                        >
                          <Text style={myProfile_style.buttonText}>Da</Text>
                        </Pressable>
                        <Pressable
                          style={[
                            myProfile_style.button,
                            { backgroundColor: colorTheme.button + "ee" },
                          ]}
                          onPress={() => setModalVisible1(false)}
                        >
                          <Text style={myProfile_style.buttonText}>Ne</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>

            <Modal
              transparent={true}
              visible={modalVisible}
              animationType="fade"
            >
              <Pressable
                style={myProfile_style.modalContainer}
                onPress={() => setModalVisible(false)}
              >
                <Pressable style={myProfile_style.modalContent}>
                  <Text style={myProfile_style.titleModal}>
                    Promena lozinke
                  </Text>
                  <Text style={myProfile_style.labelPassChange}>
                    Stara lozinka
                  </Text>
                  <TextInput
                    style={myProfile_style.input}
                    secureTextEntry
                    onChangeText={setOldPassword}
                    value={oldPassword}
                    autoCorrect={false}
                  />
                  <Text style={myProfile_style.labelPassChange}>
                    Nova lozinka
                  </Text>
                  <TextInput
                    style={myProfile_style.input}
                    secureTextEntry
                    onChangeText={setNewPassword}
                    value={newPassword}
                    autoCorrect={false}
                  />
                  <View style={myProfile_style.modalButtonContainer}>
                    {changingPass ? (
                      <LoadingIndicator />
                    ) : (
                      <>
                        <Pressable
                          style={myProfile_style.button}
                          onPress={handleChangePassword}
                        >
                          <Text style={myProfile_style.buttonText}>
                            Promeni lozinku
                          </Text>
                        </Pressable>
                        <Pressable
                          style={{ marginTop: 20 }}
                          onPress={() => {
                            setModalVisible(false);
                            setOldPassword("");

                            setNewPassword("");
                          }}
                        >
                          <Text style={myProfile_style.labelPassChange}>
                            Otkaži
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}
      </View>
    </ScrollView>
  );
  function logout() {
    setLoggingOut(true);
    logOut(auth)
      .then(() => {
        Toast.show("Uspešna odjava");

        setLoggingOut(false);
      })
      .catch((g) => {
        console.log(g);

        setLoggingOut(false);
      });
  }
};
