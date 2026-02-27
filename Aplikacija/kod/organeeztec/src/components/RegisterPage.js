import React from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { Button } from "@react-native-material/core";
import { register_style } from "../styles/register-style";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Moment, { duration } from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addAuthRequest, uploadFileAsync } from "../scripts/registerjs";
import { LoadingIndicator } from "./LoadingIndicator";
import { validateName, validatePhoneNum } from "../scripts/helperFunctions";

import Toast from "react-native-root-toast";
export const RegisterPage = ({ navigation }) => {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [brojTelfona, setBrojTelefona] = useState("");
  const [korisnickoIme, setKorisnickoIme] = useState("");
  const [cvInfo, setCvUri] = useState(null);
  const [profileURI, setProfileUri] = useState(null);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const [registering, setRegistering] = useState(false);

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

  return (
    <SafeAreaView style={register_style.container}>
      <ScrollView
        centerContent={true}
        style={register_style.scrollview}
        contentContainerStyle={register_style.scrollviewContainerStyle}
        bounces={false}
      >
        <View>
          <TouchableOpacity
            title="+"
            style={register_style.addButton}
            onPress={handleChoosePhoto}
          >
            {profileURI ? (
              <Image
                source={{ uri: profileURI }}
                style={register_style.profileImage}
              ></Image>
            ) : (
              <Text style={register_style.addButtonText}>Izaberi sliku</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={register_style.text}>
          Ime<Text style={register_style.required}> *</Text>
        </Text>

        <TextInput
          defaultValue={ime}
          onChangeText={(newIme) => setIme(newIme)}
          style={register_style.input}
          autoCorrect={false}
        ></TextInput>
        <Text style={register_style.text}>
          Prezime<Text style={register_style.required}> *</Text>
        </Text>

        <TextInput
          defaultValue={prezime}
          onChangeText={(newPrezime) => setPrezime(newPrezime)}
          style={register_style.input}
          autoCorrect={false}
        ></TextInput>
        <Text style={register_style.text}>
          Datum rođenja<Text style={register_style.required}> *</Text>
        </Text>
        <TouchableOpacity
          onPress={() => showDatepicker()}
          style={register_style.input}
        >
          <Text style={register_style.inputText}>
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
        <Text style={register_style.text}>
          Broj telefona<Text style={register_style.required}> *</Text>
        </Text>

        <TextInput
          keyboardType="number-pad"
          inputMode="numeric"
          defaultValue={brojTelfona}
          onChangeText={(broj) => {
            setBrojTelefona(broj);
          }}
          autoCorrect={false}
          onKeyPress={(e) => {
            if (e.nativeEvent.key != "Backspace" && brojTelfona.length == 10) {
              Toast.show("Broj telefona ne može da ima više od 10 cifara", {
                duration: Toast.durations.SHORT,
              });
            }
          }}
          maxLength={10}
          style={register_style.input}
        />

        <Text style={register_style.text}>Korisničko ime na instagramu</Text>
        <TextInput
          defaultValue={korisnickoIme}
          onChangeText={(korisnickoIme) => setKorisnickoIme(korisnickoIme)}
          style={register_style.input}
          autoCorrect={false}
        ></TextInput>
        <View style={register_style.cvContainer}>
          {cvInfo ? (
            <Text numberOfLines={1} style={register_style.cvText}>
              {cvInfo.name}
            </Text>
          ) : (
            <Text style={register_style.cvText}>CV nije izabran</Text>
          )}
          <Pressable style={register_style.button} onPress={handlePickDocument}>
            <Text style={register_style.buttonText}>Izaberi CV</Text>
          </Pressable>
        </View>

        {registering ? (
          <View style={register_style.updateButtonContainer}>
            <LoadingIndicator />
          </View>
        ) : (
          <View style={register_style.updateButtonContainer}>
            <Pressable
              style={[register_style.updateButton]}
              onPress={() => {
                register();
              }}
            >
              <Text style={register_style.buttonText}>Registruj se</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function register() {
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

    let requestData = {
      profile_pic_uri: "",
      name: ime,
      surname: prezime,
      birthdate: date,
      phone_number: brojTelfona,
      instagram_username: korisnickoIme,
      cv: "",
      date_created: new Date(),
    };
    uploadPhoto()
      .then((photoUrl) => {
        requestData.profile_pic_uri = photoUrl;
        return uploadCV();
      })
      .then((cvURL) => {
        requestData.cv = cvURL;
        addAuthRequest(
          requestData,
          () => {
            Toast.show("Došlo je do greške. Proverite vašu konekciju", {
              duration: Toast.durations.SHORT,
            });
            setRegistering(false);
          },
          () => {
            Toast.show(
              "Uspešno ste napravili prijavu. Dobićete poruku kada admin verifikuje vaše podatke",
              {
                duration: Toast.durations.LONG,
              }
            );
            setRegistering(false);
            navigation.pop();
          }
        );
      })
      .catch((err) => {
        console.log(err);
        setRegistering(false);
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
  async function uploadPhoto() {
    return new Promise((resolve, reject) => {
      if (profileURI != null && profileURI != "") {
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
};
