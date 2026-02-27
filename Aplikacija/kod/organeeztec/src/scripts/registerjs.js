import { db } from "../firebase_functions";
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { authTable } from "./tableRefs";
import uuid from "uuid";
/*export function availableFilename(username, type) {
  let file = username.replace(/\s/g, "") + "-" + type;
  let storage=getStorage();
  let storageFile=storage
  return file;
}*/
export async function uploadFileAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileRef = ref(getStorage(), uuid.v4());
  const result = await uploadBytes(fileRef, blob);

  blob.close();

  return await getDownloadURL(fileRef);
}

export const addAuthRequest = (data, failCB, successCB) => {
  const authTable = collection(db, "auth_requests");
  addDoc(authTable, data)
    .then(() => {
      successCB();
    })
    .catch((err) => {
      console.log(err);
      failCB();
    });
};
