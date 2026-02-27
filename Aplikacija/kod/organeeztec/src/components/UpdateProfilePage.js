import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Linking,
  Pressable,
} from "react-native";
import { Button } from "@react-native-material/core";
import { updateProfile_style } from "../styles/updateProfile-style";
import { useState, useEffect } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebase_functions";
import { getAuth, doc, getDoc, updateDoc } from "firebase/firestore";
import { validateName, validatePhoneNum } from "../scripts/helperFunctions";
import Toast from "react-native-root-toast";
import { uploadFileAsync } from "../scripts/registerjs";
import { LoadingIndicator } from "./LoadingIndicator";
import { refFromURL } from "../scripts/helperFunctions";
import { getStorage, ref, deleteObject } from "firebase/storage";

export const UpdateProfilePage = (props) => {
  const [ime, setIme] = useState(props.user.name);
  const [prezime, setPrezime] = useState(props.user.surname);
  const [brojTelfona, setBrojTelefona] = useState(props.user.phone_number);
  const [korisnickoIme, setKorisnickoIme] = useState(
    props.user.instagram_username
  );
  const [cvInfo, setCvUri] = useState(null);
  const [profileURI, setProfileUri] = useState(null);

  const [registering, setRegistering] = useState(false);

  const [date, setDate] = useState(props.user.birthdate.toDate());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      setCvUri(result);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChoosePhoto = async () => {
    const options = {
      title: "Izaberi sliku",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      quality: 1,
    });
    if (result.canceled) {
      return;
    }
    setProfileUri(result.assets[0].uri);
  };

  const handleUpdateProfile = async () => {
    try {
      const userRef = db.collection("users").doc(props.user.user_id);
      setRegistering(true);

      if (ime === "") {
        Toast.show("Obavezno polje Ime je prazno.", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (!validateName(ime)) {
        Toast.show("Uneto ime nije validno", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (prezime === "") {
        Toast.show("Obavezno polje Prezime je prazno.", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (!validateName(prezime)) {
        Toast.show("Uneto prezime nije validno", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (brojTelfona === "") {
        Toast.show("Obavezno polje Broj telefona je prazno.", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (!validatePhoneNum(brojTelfona)) {
        Toast.show("Uneti broj telefona nije validan", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      const getAge = (birthDate) =>
        Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e10);
      const age = getAge(date);
      if (age < 0) {
        Toast.show("Uneti datum rođenja nije validan", {
          duration: Toast.durations.SHORT,
        });
        setRegistering(false);
        return;
      }
      if (getAge(date) < 18) {
        Toast.show(
          "Proverite uneti datum rođenja. Za ulazak u EESTEC je neophodno imati 18 godina",
          {
            duration: Toast.durations.SHORT,
          }
        );
        setRegistering(false);
        return;
      }
      let profilepic = props.user.profile_pic_uri;

      uploadPhoto()
        .then((photoUrl) => {
          if (photoUrl != "") profilepic = photoUrl;
          return uploadCV();
        })
        .then((cvURL) => {
          if (cvURL == "") cvURL = props.user.cv;

          if (props.user.cv != cvURL) deleteFile(refFromURL(props.user.cv));
          if (props.user.profile_pic_uri != profilepic)
            deleteFile(refFromURL(props.user.profile_pic_uri));
          return userRef.update({
            profile_pic_uri: profilepic,
            name: ime,
            surname: prezime,
            phone_number: brojTelfona,
            instagram_username: korisnickoIme,
            cv: cvURL,
          });
        })
        .then(() => {
          setRegistering(false);

          Toast.show("Uspešno ste ažurirali podatke", {
            duration: Toast.durations.SHORT,
          });
          props.navigation.pop();
        });
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return (
    <SafeAreaView style={updateProfile_style.container}>
      <ScrollView
        centerContent={true}
        style={updateProfile_style.scrollview}
        contentContainerStyle={updateProfile_style.scrollviewContainerStyle}
        bounces={false}
      >
        <View>
          <TouchableOpacity
            title="+"
            style={updateProfile_style.addButton}
            onPress={handleChoosePhoto}
          >
            {props.user.profile_pic_uri != "" || profileURI != null ? (
              <Image
                source={{
                  uri:
                    profileURI != null
                      ? profileURI
                      : props.user.profile_pic_uri,
                }}
                style={updateProfile_style.profileImage}
              ></Image>
            ) : (
              <Text style={updateProfile_style.addButtonText}>
                Izaberi sliku
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={updateProfile_style.text}>Ime:</Text>

        <TextInput
          defaultValue={props.user.name}
          onChangeText={(newIme) => setIme(newIme)}
          style={updateProfile_style.input}
          autoCorrect={false}
        ></TextInput>
        <Text style={updateProfile_style.text}>Prezime:</Text>

        <TextInput
          defaultValue={props.user.surname}
          onChangeText={(newPrezime) => setPrezime(newPrezime)}
          style={updateProfile_style.input}
          autoCorrect={false}
        ></TextInput>

        <Text style={updateProfile_style.text}>Datum rođenja:</Text>
        <TouchableOpacity
          style={[
            updateProfile_style.input,
            {
              backgroundColor: "lightgrey",
              borderColor: "grey",
            },
          ]}
        >
          <Text style={updateProfile_style.inputText}>
            {Moment(date).format("DD/MM/yy")}
          </Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={mode}
            is24Hour={true}
            onChange={onChange}
          />
        )}
        <Text style={updateProfile_style.text}>Broj telefona:</Text>

        <TextInput
          defaultValue={props.user.phone_number}
          onChangeText={(brojTelfona) => setBrojTelefona(brojTelfona)}
          style={updateProfile_style.input}
          autoCorrect={false}
        />

        <Text style={updateProfile_style.text}>
          Korisničko ime na instagramu:
        </Text>
        <TextInput
          defaultValue={props.user.instagram_username}
          onChangeText={(korisnickoIme) => setKorisnickoIme(korisnickoIme)}
          style={updateProfile_style.input}
          autoCorrect={false}
        ></TextInput>
        <View style={updateProfile_style.cvContainer}>
          <Text
            onPress={function () {
              if (cvInfo == null && props.user.cv != "")
                Linking.openURL(props.user.cv);
            }}
            numberOfLines={1}
            style={{
              ...updateProfile_style.cvText,
              color:
                cvInfo == null && props.user.cv != ""
                  ? "#0000ff"
                  : cvInfo != null
                  ? "#000000"
                  : "#ff0000",
              textDecorationLine:
                cvInfo == null && props.user.cv != "" ? "underline" : "none",
            }}
          >
            {cvInfo != null
              ? cvInfo.name
              : props.user.cv != ""
              ? "Otvori priložen CV"
              : "CV nije izabran"}
          </Text>
          <Text style={{ color: "blue" }}></Text>
          <Pressable
            style={updateProfile_style.button}
            onPress={handlePickDocument}
          >
            <Text style={updateProfile_style.buttonText}>Izaberi CV</Text>
          </Pressable>
        </View>
        {registering ? (
          <LoadingIndicator style={{ marginBottom: 30 }} />
        ) : (
          <View style={updateProfile_style.updateButtonContainer}>
            <Pressable
              style={[updateProfile_style.updateButton]}
              onPress={handleUpdateProfile}
            >
              <Text style={updateProfile_style.buttonText}>
                Ažuriraj profil
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  async function uploadPhoto() {
    return new Promise((resolve, reject) => {
      if (profileURI != null) {
        uploadFileAsync(profileURI)
          .then((url) => {
            resolve(url);
          })
          .catch((err) => {
            Toast.show(
              "Došlo je do greške tokom uploadovanja vaše slike. Proverite konekciju",
              {
                duration: Toast.durations.SHORT,
              }
            );
            reject(err);
          });
      } else resolve("");
    });
  }

  async function uploadCV() {
    return new Promise((resolve, reject) => {
      if (cvInfo != null) {
        uploadFileAsync(cvInfo.uri)
          .then((url) => {
            resolve(url);
          })
          .catch((err) => {
            Toast.show(
              "Došlo je do greške tokom uploadovanja vašeg CVa. Proverite konekciju",
              {
                duration: Toast.durations.SHORT,
              }
            );
            reject(err);
          });
      } else resolve("");
    });
  }
};

async function deleteFile(fileRef) {
  return new Promise((resolve, reject) => {
    if (fileRef == "") resolve();
    const storage = getStorage();

    const fullRef = ref(storage, fileRef);

    deleteObject(fullRef)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}
