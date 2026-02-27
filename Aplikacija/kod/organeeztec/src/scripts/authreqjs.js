import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, getDoc, setDoc, collection, deleteDoc } from "firebase/firestore";
import { db } from "../firebase_functions";

export async function deleteFile(fileRef) {
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

//treba zapravo i da kreira nalog, ovo samo premesta u user kolekciju
export async function acceptAuthRequest(id, email, pass) {
  return new Promise((resolve, reject) => {
    if (id == null || id == "") reject("Nije dobar id");

    const docRef = doc(db, "auth_requests", id);
    getDoc(docRef)
      .then((docSnap) => {
        let newUserInfo = {
          ...docSnap.data(),
          achievements: [],
          active: true,
          admin: false,
          points: 0,
          positions: [],
        };
        let newUser = (({ date_created, ...object }) => object)(newUserInfo);
        const usersRef = collection(db, "users");
        return setDoc(doc(usersRef, email), newUser);
      })
      .then(() => {
        return deleteDoc(doc(db, "auth_requests", id));
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
