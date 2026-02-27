import { db } from "../firebase_functions";

import { collection } from "firebase/firestore";
export const authTable = db.collection("auth_requests");
export const bordApplications = db
  .collection("board")
  .doc("board")
  .collection("applications");
