import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeAuth } from "firebase/auth";

import { getReactNativePersistence, getAuth } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import setGlobalVars from "indexeddbshim/dist/indexeddbshim-noninvasive";
import { LogBox } from "react-native";
import {
  FirestoreSettings,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";

window.localStorage = {
  _data: {},

  getItem: function (key) {
    return this._data[key];
  },
  setItem: function (key, value) {
    this._data[key] = value;
  },
  removeItem: function (key) {
    delete this._data[key];
  },
  clear: function () {
    this._data = {};
  },
  key: function (i) {
    return Object.keys(this._data)[i];
  },
};

setGlobalVars(window, { checkOrigin: false, win: SQLite });

const firebaseConfig = {
  apiKey: "AIzaSyAt7TNPDlVr7OJtERaPLoa68J-2zBO4-os",
  authDomain: "organeeztec.firebaseapp.com",
  projectId: "organeeztec",
  storageBucket: "organeeztec.appspot.com",
  messagingSenderId: "821445180991",
  appId: "1:821445180991:web:f035aec98447f3487c828a",
};
let app, auth;

if (!firebase.apps.length) {
  try {
    app = firebase.initializeApp(firebaseConfig);
    LogBox.ignoreLogs(["Warning: ..."]);
    LogBox.ignoreAllLogs();
    firebase.firestore().enablePersistence();
  } catch (error) {
    console.log("Error initializing app: " + error);
  }
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.log("Error initializing app: " + error);
  }
  try {
    app = firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.log("Error initializing app: " + error);
  }
} else {
  app = firebase.app();
}

export { app };
