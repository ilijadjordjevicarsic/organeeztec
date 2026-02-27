import { Stack, ActivityIndicator } from "@react-native-material/core";
import { MainPage } from "./MainPage";
import { LoginPage } from "./LoginPage";
import React from "react";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase_functions";
import { REMINDERS } from "expo-permissions";
import { colorTheme } from "../styles/color_constants";
import { LoadingIndicator } from "./LoadingIndicator";
export const InitalLoad = ({ navigation }) => {
  return (
    <Stack fill center spacing={4}>
      <LoadingIndicator />
    </Stack>
  );
};
