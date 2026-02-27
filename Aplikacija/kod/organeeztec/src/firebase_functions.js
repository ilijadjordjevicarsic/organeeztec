import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  FieldValue,
  Timestamp,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  increment,
} from "firebase/firestore";
import { app } from "./firebase_config";
import {
  QuerySnapshot,
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  addDoc,
  setDoc,
} from "firebase/firestore";
import * as firebase1 from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { staticPositions } from "./scripts/helperFunctions";

export const auth = getAuth(app);
export const db = app.firestore();
export const signIn = signInWithEmailAndPassword;

const functions = getFunctions(app);

export const registerUser = httpsCallable(functions, "registerUser");
export const deleteUser = httpsCallable(functions, "deleteUser");
export const changePass = httpsCallable(functions, "changePass");

export const notifTest = httpsCallable(functions, "sendNotif");

export const getTeams = () => {
  const table = collection(db, "teams");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let teams = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (data.name !== undefined) {
            teams.push({
              name: data.name,
              id: pod.id,
              info: data.info,
              muted_by: data.muted_by,
              iconName: data.iconName,
              color: data.color,
            });
          }
        });
        resolve(teams);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

//ako se prenese null parametar, vraca sve taskove
//ako se prenese user, vraca samo za tog usera
export const getTasks = (person) => {
  const table = collection(db, "tasks");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let tasks = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();

          if (
            // data.done !== true &&
            !person ||
            data.worker == person.user_id ||
            data.user_id == person.user_id
          ) {
            tasks.push({
              title: data.title,
              id: pod.id,
              description: data.description,
              points: data.points,
              team_id: data.team_id,
              milestones: data.milestones,
              events: data.event_id,
              deadline: data.deadline.toDate(),
              worker: data.worker,
              user_id: data.user_id,
              done: data.done,
              accepted: data.accepted,
              confirmed_done: data.confirmed_done,
              deleted: data.deleted,
            });
          }
        });
        resolve(tasks);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

export const updateTask = (id, updatedValue, type, person) => {
  getTasks()
    .then((tasks) => {
      if (type == "milestones") {
        return db.collection("tasks").doc(id).update({
          milestones: updatedValue,
          updated: true,
          confirmed_done: false,
        });
      } else if (type == "done") {
        return db.collection("tasks").doc(id).update({
          done: updatedValue,
          updated: true,
          confirmed_done: false,
        });
      } else if (type == "confirmed_done") {
        db.collection("tasks")
          .doc(id)
          .get()
          .then((doc) => {
            if (doc.data().worker && doc.data().points)
              db.collection("users")
                .doc(doc.data().worker)
                .update({ points: increment(doc.data().points) });
            return db.collection("tasks").doc(id).update({
              confirmed_done: true,
            });
          })
          .catch((err) => console.log(err));
      } else if (type == "pending") {
        if (updatedValue)
          return db.collection("tasks").doc(id).update({
            accepted: updatedValue,
            updated: true,
          });
        else
          return db.collection("tasks").doc(id).update({
            worker: null,
            accepted: updatedValue,
            updated: true,
          });
      } else if (type == "taken") {
        return db.collection("tasks").doc(id).update({
          worker: person,
          accepted: updatedValue,
          updated: true,
        });
      } else if (type == "giveBack") {
        person.forEach((x) => {
          x.done = false;
        });
        return db.collection("tasks").doc(id).update({
          done: false,
          confirmed_done: false,
          milestones: person,
        });
      } else if (type == "delete") {
        return db.collection("tasks").doc(id).update({
          deleted: true,
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const addTaskComment = (id, user_id, message) => {
  return new Promise((resolve, reject) => {
    let date = Timestamp.fromDate(new Date());
    const table = collection(db, "tasks", id, "comments");
    return addDoc(table, {
      user_id: user_id,
      message: message,
      date: date,
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

export const getTaskComments = (id) => {
  // console.log("nesto se desava");
  return new Promise((resolve, reject) => {
    const table = db.collection("tasks").doc(id).collection("comments");
    let array = [];
    let members = [];
    getMembers()
      .then((res) => {
        let array = [];
        res = res.map((x, i) => {
          members.push({
            name: x.name,
            surname: x.surname,
            id: x.email,
            profile_pic_uri: x.profile_pic_uri,
          });
        });
        getDocs(table)
          .then((res) => {
            res.docs.forEach((comment) => {
              let data = comment.data();
              // console.log(data);
              for (let i = 0; i < members.length; i++)
                if (members[i].id == data.user_id) {
                  array.push({
                    user_id: data.user_id,
                    message: data.message,
                    date: data.date,
                    user: members[i].name + " " + members[i].surname,
                    picture: members[i].profile_pic_uri,
                  });
                }
            });
          })
          .then(() => {
            resolve(array);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
//citanje svih nearhiviranih dogadjaja iz baze
export const getUnarchivedEvents = () => {
  const table = collection(db, "events");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let events = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (
            data.info !== undefined &&
            data.archived !== undefined &&
            data.archived === false &&
            data.applications_open !== undefined &&
            data.name !== undefined &&
            data.muted_by !== undefined &&
            data.checkbox_color != undefined
          )
            events.push({
              info: data.info,
              archived: data.archived,
              applications_open: data.applications_open,
              name: data.name,
              muted_by: data.muted_by,
              event_id: pod.id,
              skraceno: data.checkbox_abb,
              checkbox_color: data.checkbox_color,
            });
        });
        resolve(events);
      })
      .catch((err) => {
        console.log("greska u functions");
        reject(err.message);
      });
  });
};

export const getMembers = (team) => {
  const table = collection(db, "users");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let members = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (
            data.name !== undefined &&
            data.surname !== undefined &&
            data.admin !== undefined &&
            data.admin == false
          )
            members.push({
              name: data.name,
              surname: data.surname,
              email: pod.id,
              active: data.active,
              points: data.points,
              positions: data.positions,
              birthdate: data.birthdate,
              phone_number: data.phone_number,
              instagram_username: data.instagram_username,
              cv: data.cv,
              achievements: data.achievements,
              profile_pic_uri: data.profile_pic_uri,
            });
        });
        resolve(members);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

export const getMemberName = (id) => {
  const table = doc(db, "users", id);

  return new Promise((resolve, reject) => {
    getDoc(table)
      .then((snapshot) => {
        let x = snapshot.data();
        let y = x.name + " " + x.surname;
        resolve(y);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

export const getAdminMembers = (team) => {
  const table = collection(db, "users");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let members = [];
        snapshot.docs.forEach((pod) => {
          let data = pod.data();
          if (
            data.name !== undefined &&
            data.surname !== undefined &&
            data.admin !== undefined
          )
            members.push({
              admin: data.admin,
              name: data.name,
              surname: data.surname,
              email: pod.id,
              active: data.active,
              points: data.points,
              positions: data.positions,
              birthdate: data.birthdate,
              phone_number: data.phone_number,
              instagram_username: data.instagram_username,
              cv: data.cv,
              achievements: data.achievements,
              profile_pic_uri: data.profile_pic_uri,
            });
        });
        resolve(members);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

//svi dogadjaji i guess
export const getEvents = (event) => {
  const table = collection(db, "events");
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((snapshot) => {
        let events = [];
        snapshot.docs.forEach((x) => {
          let data = x.data();
          events.push({
            info: data.info,
            id: x.id,
            archived: data.archived,
            applications_open: data.applications_open,
            applications_for_oc: data.applications_for_oc,
            positions: data.positions,
            name: data.name,
            internal_announcements: data.internal_announcements,
            external_announcements: data.external_announcements,
            muted_by: data.muted_by,
            checkbox_color: data.checkbox_color,
            checkbox_text_color: data.checkbox_text_color,
            checkbox_abb: data.checkbox_abb,
            sortValue: data.sortValue,
          });
        });
        resolve(events);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};
export const archiveEvent = (id) => {
  console.log(id);

  return new Promise((resolve, reject) => {
    if (!id) {
      reject();
      return;
    }
    db.collection("events")
      .doc(id)
      .get()
      .then((eventSnap) => {
        let eventData = eventSnap.data();
        let promises = [];
        if (eventData.HO && eventData.HO != "")
          return db
            .collection("users")
            .doc(eventData.HO)
            .update({
              points: increment(150),
              positions: arrayRemove({
                collection: "events",
                document: id,
                position: "HO",
              }),
            });
        return Promise.resolve(true);
      })
      .then(() => {
        return db.collection("events").doc(id).collection("positions").get();
      })
      .then((allPosSnaps) => {
        let promises = [];
        allPosSnaps.docs.forEach((doc) => {
          let data = doc.data();
          console.log(data);

          if (data.user && data.user != "") {
            promises.push(
              db
                .collection("users")
                .doc(data.user)
                .update({
                  points: increment(100),
                  positions: arrayRemove({
                    collection: "events",
                    document: id,
                    position: doc.id,
                  }),
                })
            );
            promises.push(
              db
                .collection("events")
                .doc(id)
                .collection("positions")
                .doc(doc.id)
                .update({ user: "" })
            );
          }
        });
        return Promise.resolve(promises);
      })
      .then(() => {
        return db
          .collection("tasks")
          .where("event_id", "array-contains", id)
          .get();
      })
      .then((snaps) => {
        let promises = [];
        snaps.docs.forEach((d) => {
          promises.push(
            db.collection("tasks").doc(d.id).update({ deleted: true })
          );
        });
        return Promise.all(promises);
      })
      .then(() => {
        return db
          .collection("events")
          .doc(id)
          .update({ archived: true, HO: "" });
      })

      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const unarchiveEvent = (id) => {
  return new Promise((resolve, reject) => {
    db.collection("events")
      .doc(id)
      .update({ archived: false })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const addNewEvent = (event, positions) => {
  return new Promise((resolve, reject) => {
    let eventid = "";
    db.collection("events")
      .add(event)
      .then((docref) => {
        eventid = docref.id;
        let promises = [];
        if (positions.length > 0) {
          positions.forEach((p) => {
            promises.push(
              db.collection("events").doc(eventid).collection("positions").add({
                name: p.name,
                managed_teams: p.managed_teams,
                user: "",
              })
            );
          });

          return Promise.all(promises);
        }

        return Promise.resolve(true);
      })
      .then(() => {
        return db.collection("teams").get();
      })
      .then((snaps) => {
        let promises = [];
        snaps.docs.forEach((docref) => {
          promises.push(
            db
              .collection("teams")
              .doc(docref.id)
              .collection("subteams")
              .doc(eventid)
              .set({ info: "" })
          );
        });
        return Promise.all(promises);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const deleteEvent = (eventid) => {
  return new Promise((resolve, reject) => {
    db.collection("events")
      .doc(eventid)
      .collection("positions")
      .get()
      .then((d) => {
        let promises = [];
        d.forEach((docref) => {
          promises.push(
            db
              .collection("events")
              .doc(eventid)
              .collection("positions")
              .doc(docref.id)
              .delete()
          );
          if (docref.data().user != null && docref.data().user != "") {
            promises.push(
              db
                .collection("users")
                .doc(docref.data().user)
                .update({
                  positions: arrayRemove({
                    collection: "events",
                    document: eventid,
                    position: docref.id,
                  }),
                })
            );
          }
        });
        if (promises.length > 0) return Promise.all(promises);

        return Promise.resolve(true);
      })
      .then(() => {
        return db
          .collection("events")
          .doc(eventid)
          .collection("internal_announcements")
          .get();
      })
      .then((d) => {
        let promises = [];
        d.forEach((docref) => {
          promises.push(
            db
              .collection("events")
              .doc(eventid)
              .collection("internal_announcements")
              .doc(docref.id)
              .delete()
          );
          if (promises.length > 0) return Promise.all(promises);

          return Promise.resolve(true);
        });
      })
      .then(() => {
        return db
          .collection("events")
          .doc(eventid)
          .collection("external_announcements")
          .get();
      })
      .then((d) => {
        let promises = [];
        d.forEach((docref) => {
          promises.push(
            db
              .collection("events")
              .doc(eventid)
              .collection("external_announcements")
              .doc(docref.id)
              .delete()
          );
          if (promises.length > 0) return Promise.all(promises);

          return Promise.resolve(true);
        });
      })
      .then(() => {
        return db
          .collection("events")
          .doc(eventid)
          .collection("applications_for_oc")
          .get();
      })
      .then((d) => {
        let promises = [];
        d.forEach((docref) => {
          promises.push(
            db
              .collection("events")
              .doc(eventid)
              .collection("applications_for_oc")
              .doc(docref.id)
              .delete()
          );
          if (promises.length > 0) return Promise.all(promises);

          return Promise.resolve(true);
        });
      })
      .then(() => {
        return db.collection("events").doc(eventid).get();
      })
      .then((d) => {
        let data = d.data();
        if (data.HO != null && data.HO != "")
          return db
            .collection("users")
            .doc(data.HO)
            .update({
              positions: arrayRemove({
                collection: "events",
                document: eventid,
                position: "HO",
              }),
            });
        return Promise.resolve(true);
      })
      .then(() => {
        return db
          .collection("tasks")
          .where("event_id", "array-contains", eventid)
          .get();
      })
      .then((p) => {
        let promises = [];
        p.docs.forEach((d) => {
          promises.push(db.collection("tasks").doc(d.id).delete());
        });
        if (promises.length > 0) return Promise.all(promises);
        return Promise.resolve(true);
      })
      .then(() => {
        return db
          .collection("meetings")
          .where("event_id", "array-contains", eventid)
          .get();
      })
      .then((p) => {
        let promises = [];
        p.docs.forEach((d) => {
          promises.push(db.collection("meetings").doc(d.id).delete());
        });
        if (promises.length > 0) return Promise.all(promises);
        return Promise.resolve(true);
      })
      .then(() => {
        return db
          .collection("finished_meetings")
          .where("event_id", "array-contains", eventid)
          .get();
      })
      .then((p) => {
        let promises = [];
        p.docs.forEach((d) => {
          promises.push(db.collection("finised_meetings").doc(d.id).delete());
        });
        if (promises.length > 0) return Promise.all(promises);
        return Promise.resolve(true);
      })
      .then(() => {
        return db
          .collection("calendar_events")
          .where("event_id", "==", eventid)
          .get();
      })
      .then((p) => {
        let promises = [];
        p.docs.forEach((d) => {
          promises.push(db.collection("calendar_events").doc(d.id).delete());
        });
        if (promises.length > 0) return Promise.all(promises);
        return Promise.resolve(true);
      })
      .then(() => {
        return db.collection("events").doc(eventid).delete();
      })
      .then(() => {
        return db.collection("teams").get();
      })
      .then((snaps) => {
        let promises = [];
        snaps.docs.forEach((docref) => {
          promises.push(
            db
              .collection("teams")
              .doc(docref.id)
              .collection("subteams")
              .doc(eventid)
              .delete()
          );
        });
        if (promises.length > 0) return Promise.all(promises);
        return Promise.resolve(true);
      })
      .then(() => {
        return db.collection("events").doc(eventid).delete();
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getApplicationsForPosition = (position) => {
  const table = db
    .collection("board")
    .doc("board")
    .collection("applications")
    .where("position", "==", position);
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const newBoardApplication = (application) => {
  const table = collection(db, "board", "board", "applications");
  if (application.date_created == undefined) {
    application.date_created = new Date();
  }
  return new Promise((resolve, reject) => {
    getApplicationsForPosition(application.position)
      .then((snaps) => {
        snaps.docs.forEach((doc) => {
          if (doc.data().email == application.email) throw new Error("exists");
        });
        return addDoc(table, application);
      })
      .then((r) => {
        resolve(r);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getBoardApplicantPositions = () => {
  return new Promise((resolve, reject) => {
    const table = db.collection("board").doc("board").collection("positions");
    getDocs(table)
      .then((snaps) => {
        let positions = [...staticPositions()];
        snaps.docs.forEach((s) => {
          let data = s.data();
          if (
            data.name != undefined &&
            data.name != "" &&
            data.managed_teams != undefined
          ) {
            let pos = { ...data, id: s.id };
            positions.push(pos);
          }
        });

        resolve(positions);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

export const newTask = (
  poeni,
  team,
  membersvalue,
  naziv,
  opis,
  events,
  milestones,
  deadline,
  user
) => {
  var customId = "";
  customId = customId + new Date().getDate();
  customId = customId + ".";
  customId = customId + (new Date().getMonth() + 1);
  customId = customId + ".";
  customId = customId + new Date().getFullYear();
  customId = customId + "-";
  customId = customId + new Date().getHours();
  customId = customId + ":";
  customId = customId + new Date().getMinutes();
  customId = customId + ":";
  customId = customId + new Date().getSeconds();
  customId = customId + "-";
  customId = customId + team;
  console.log(customId);
  const table = doc(db, "tasks", customId);

  let eventsChecked = [];
  events.forEach((x) => {
    if (x.checked) eventsChecked.push(x.id);

    // ako nam treba kao objekat
    // eventsChecked.push({event_id: x.id});
  });

  setDoc(table, {
    accepted: false,
    user_id: user,
    worker: membersvalue,
    points: poeni,
    title: naziv,
    description: opis,
    deadline: Timestamp.fromDate(new Date(deadline)),
    event_id: eventsChecked,
    team_id: team,
    milestones: milestones,
    confirmed_done: false,
    done: false,
    deleted: false,
  });
};
export const acceptTeamRequest = (teamid, email) => {
  return new Promise((resolve, reject) => {
    db.collection("users")
      .doc(email)
      .update({
        positions: arrayUnion({
          collection: "teams",
          document: teamid,
          position: "member",
        }),
      })
      .then(() => {
        deleteTeamRequest(teamid, email);
      })
      .catch((err) => reject(err));
  });
};
export const deleteTeamRequest = (teamid, email) => {
  const table = db
    .collection("teams")
    .doc(teamid)
    .collection("applications")
    .where("email", "==", email);
  const userTable = doc(db, "users", email);
  return new Promise((resolve, reject) => {
    table
      .get()
      .then((snap) => {
        let promises = [];
        snap.forEach((doc) => {
          promises.push(doc.ref.delete());
        });
        return Promise.all(promises);
      })
      .then(() => {
        return updateDoc(userTable, {
          positions: arrayRemove({
            collection: "teams",
            document: teamid,
            position: "pending",
          }),
        });
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const addTeamRequest = (teamid, email) => {
  const table = collection(db, "teams", teamid, "applications");
  const userTable = doc(db, "users", email);
  return new Promise((resolve, reject) => {
    addDoc(table, {
      email: email,
    })
      .then(() => {
        return updateDoc(userTable, {
          positions: arrayUnion({
            collection: "teams",
            document: teamid,
            position: "pending",
          }),
        });
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getBoard = () => {
  return new Promise((resolve, reject) => {
    db.collection("board")
      .doc("board")
      .get()
      .then((b) => {
        resolve(b);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const replaceMemberInBoardPosition = (position_id, email) => {
  if (email == undefined || email == null) email = "";
  return new Promise((resolve, reject) => {
    getBoardMemberByPosition(position_id)
      .then((oldMember) => {
        if (oldMember != "") {
          return db
            .collection("users")
            .doc(oldMember)
            .update({
              positions: arrayRemove({
                collection: "board",
                document: "board",
                position: position_id,
              }),
            });
        }
        return Promise.resolve(true);
      })
      .then(() => {
        let staticPos = staticPositions().find((x) => x.id == position_id);
        if (staticPos != undefined) {
          return db
            .collection("board")
            .doc("board")
            .update({
              [staticPos.id]: email,
            });
        }
        return db
          .collection("board")
          .doc("board")
          .collection("positions")
          .doc(position_id)
          .update({
            user: email,
          });
      })
      .then(() => {
        if (email != "")
          return db
            .collection("users")
            .doc(email)
            .update({
              positions: arrayUnion({
                collection: "board",
                document: "board",
                position: position_id,
              }),
            });
        return Promise.resolve(true);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getBoardMemberByPosition = (position_id) => {
  return new Promise((resolve, reject) => {
    getBoard()
      .then((b) => {
        let brd = b.data();
        let staticPos = staticPositions().find((x) => x.id == position_id);
        if (staticPos != undefined) {
          return resolve(brd[position_id]);
        }
        let pos = db
          .collection("board")
          .doc("board")
          .collection("positions")
          .doc(position_id);
        return pos.get();
      })
      .then((p) => {
        resolve(p.data().user);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getBoardPosition = (id) => {
  console.log(id);
  const posRef = db
    .collection("board")
    .doc("board")
    .collection("positions")
    .doc(id);
  return new Promise((resolve, reject) => {
    posRef
      .get()
      .then((position) => {
        console.log("procitano");
        console.log(position);
        resolve(position.data());
      })
      .catch((err) => {
        console.log("ne radi");
        reject(err);
      });
  });
};

export const deleteBoardApplication = (id) => {
  return new Promise((resolve, reject) => {
    const appRef = db
      .collection("board")
      .doc("board")
      .collection("applications")
      .doc(id);
    appRef
      .delete()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

export const updateEvent = (id, changes) => {
  return new Promise((resolve, reject) => {
    db.collection("events")
      .doc(id)
      .update({ ...changes })
      .then(() => {
        resolve();
      })
      .catch((err) => reject(err));
  });
};
export const getOrgMemberByPosition = (event_id, position_id) => {
  return new Promise((resolve, reject) => {
    db.collection("events")
      .doc(event_id)
      .get()
      .then((b) => {
        let data = b.data();
        if (position_id == "HO") {
          return resolve(data.HO);
        }
        let pos = db
          .collection("events")
          .doc(event_id)
          .collection("positions")
          .doc(position_id);
        return pos.get();
      })
      .then((p) => {
        resolve(p.data().user);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const replaceMemberInEventPosition = (event_id, position_id, email) => {
  if (email == undefined || email == null) email = "";
  return new Promise((resolve, reject) => {
    getOrgMemberByPosition(event_id, position_id)
      .then((oldMember) => {
        if (oldMember != "") {
          return db
            .collection("users")
            .doc(oldMember)
            .update({
              positions: arrayRemove({
                collection: "events",
                document: event_id,
                position: position_id,
              }),
            });
        }
        return Promise.resolve(true);
      })
      .then(() => {
        if (position_id == "HO") {
          return db.collection("events").doc(event_id).update({
            HO: email,
          });
        }
        return db
          .collection("events")
          .doc(event_id)
          .collection("positions")
          .doc(position_id)
          .update({
            user: email,
          });
      })
      .then(() => {
        if (email != "")
          return db
            .collection("users")
            .doc(email)
            .update({
              positions: arrayUnion({
                collection: "events",
                document: event_id,
                position: position_id,
              }),
            });
        return Promise.resolve(true);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getEventPositions = (id) => {
  return new Promise((resolve, reject) => {
    db.collection("events")
      .doc(id)
      .collection("positions")
      .get()
      .then((p) => {
        let n = [];
        p.docs.forEach((d) => {
          n.push({ ...d.data(), id: d.id });
        });
        resolve(n);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getManagedTeams = (positions) => {
  let promises = [];
  let managed = [];
  return new Promise((resolve, reject) => {
    positions.forEach((p) => {
      if (
        p.position !== "chairperson" &&
        p.position !== "cp" &&
        p.position !== "HO" &&
        p.collection !== "teams"
      ) {
        promises.push(
          db
            .collection(p.collection)
            .doc(p.document)
            .collection("positions")
            .doc(p.position)
            .get()
            .then((snap) => {
              let data = snap.data();

              data.managed_teams.forEach((x) => {
                if (p.collection == "events")
                  managed.push(p.document + " " + x);
                else if (p.document == "board") managed.push(x);
              });
            })
        );
        return;
      }
      if (p.collection === "teams" && p.position === "supervisor") {
        managed.push(p.document);
      } else if (p.position === "HO" || p.position === "chairperson") {
        promises.push(
          getTeams().then((snaps) => {
            snaps.forEach((x) => {
              if (p.position == "HO") managed.push(p.document + " " + x.id);
              else managed.push(x.id);
            });
            if (p.position == "HO") managed.push(p.document + " " + "General");
            else managed.push("General");
          })
        );
      }
    });
    if (promises.length > 0)
      Promise.all(promises)
        .then(() => {
          console.log("pročitano managed");
          console.log(managed);
          resolve(managed);
        })
        .catch((err) => {
          console.log("greska managed");
          reject(err.message);
        });
    else resolve(managed);
  });
};

export const getOrgTeamApplicantPositions = (event_id) => {
  return new Promise((resolve, reject) => {
    const table = db.collection("events").doc(event_id).collection("positions");
    getDocs(table)
      .then((snaps) => {
        let positions = [{ id: "HO", name: "HO" }];
        console.log(snaps.docs);
        snaps.docs.forEach((s) => {
          let data = s.data();

          if (
            data.name != undefined &&
            data.name != "" &&
            data.managed_teams != undefined
          ) {
            let pos = { ...data, id: s.id };
            positions.push(pos);
          }
        });

        resolve(positions);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
export const openOrgApplications = (event_id) => {
  return new Promise((resolve, reject) => {
    db.collection("events").doc(event_id).update({
      applications_open: true,
    });
  });
};
export const closeOrgApplications = (event_id) => {
  return new Promise((resolve, reject) => {
    db.collection("events").doc(event_id).update({
      applications_open: false,
    });
  });
};
export const newOrgTeamApplication = (application, event_id) => {
  const table = collection(db, "events", event_id, "applications_for_oc");
  if (application.date_created == undefined) {
    application.date_created = new Date();
  }
  return new Promise((resolve, reject) => {
    getApplicationsForOrgPosition(application.position, event_id)
      .then((snaps) => {
        snaps.docs.forEach((doc) => {
          if (doc.data().email == application.email) throw new Error("exists");
        });
        return addDoc(table, application);
      })
      .then((r) => {
        resolve(r);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getApplicationsForOrgPosition = (position, event_id) => {
  const table = db
    .collection("events")
    .doc(event_id)
    .collection("applications_for_oc")
    .where("position", "==", position);
  return new Promise((resolve, reject) => {
    getDocs(table)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const deleteOCApplication = (event_id, id) => {
  return new Promise((resolve, reject) => {
    const appRef = db
      .collection("events")
      .doc(event_id)
      .collection("applications_for_oc")
      .doc(id);
    appRef
      .delete()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};
export const getOCPosition = (event_id, id) => {
  const posRef = db
    .collection("events")
    .doc(event_id)
    .collection("positions")
    .doc(id);
  return new Promise((resolve, reject) => {
    posRef
      .get()
      .then((position) => {
        resolve(position.data());
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getEventInfo = (event_id) => {
  const docRef = db.collection("events").doc(event_id);

  return new Promise((resolve, reject) => {
    docRef
      .get()
      .then((event) => {
        let e = { ...event.data(), id: event_id };
        resolve(e);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const checkPushToken = (token) => {
  console.log("Checking: " + auth.currentUser.email);
  return new Promise((resolve, reject) => {
    db.collection("users")
      .doc(auth.currentUser.email)
      .get()
      .then((d) => {
        console.log("done");
        let data = d.data();
        if (
          data.pushToken != undefined &&
          data.pushToken != null &&
          data.pushToken != token
        ) {
          reject();
        } else resolve();
      })
      .catch((err) => {
        console.log("slay");
        reject(err);
      });
  });
};
export const setPushToken = (token) => {
  console.log("setting token");
  return new Promise((resolve, reject) => {
    db.collection("users")
      .doc(auth.currentUser.email)
      .update({
        pushToken: token,
      })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

const deletePushToken = () => {
  return new Promise((resolve, reject) => {
    db.collection("users")
      .doc(auth.currentUser.email)
      .update({
        pushToken: null,
      })
      .then(() => {
        resolve();
      })
      .catch(() => reject());
  });
};

export const logOut = () => {
  return new Promise((resolve, reject) => {
    deletePushToken()
      .then(() => {
        return signOut(auth);
      })
      .then(() => resolve())
      .catch((err) => {
        console.log(err);
        signOut(auth)
          .then(() => resolve())
          .catch((err) => {
            console.log(err);
            reject();
          });
      });
  });
};

export const addNewMeeting = (meeting) => {
  return new Promise((resolve, reject) => {
    if (
      meeting.title == null ||
      meeting.title == "" ||
      meeting.description == null ||
      meeting.description == "" ||
      meeting.beginning == null ||
      meeting.end == null ||
      meeting.event_ids == null ||
      meeting.team_id == null
    ) {
      reject("loš unos");
      return;
    }
    let forUpload = {
      ...meeting,
      attendance_confirmations: [auth.currentUser.email],
      outsiders: [],
      user: auth.currentUser.email,
    };
    console.log(forUpload);
    db.collection("meetings")
      .add(forUpload)
      .then(() => {
        resolve();
      })
      .catch((err) => reject(err));
  });
};
export const deleteMeeting = (id) => {
  return new Promise((resolve, reject) => {
    if (id == null) {
      reject("id invalid");
      return;
    }
    db.collection("meetings")
      .doc(id)
      .delete()
      .then(() => {
        console.log("resolved");
        resolve();
      })
      .catch((err) => {
        console.log("rejected");
        reject(err);
      });
  });
};
export const confirmAttendance = (id) => {
  return new Promise((resolve, reject) => {
    if (id == null) {
      reject("invalid id");
      return;
    }
    db.collection("meetings")
      .doc(id)
      .update({ attendance_confirmations: arrayUnion(auth.currentUser.email) })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};
export const unconfirmAttendance = (id) => {
  return new Promise((resolve, reject) => {
    if (id == null) {
      reject("invalid id");
      return;
    }
    db.collection("meetings")
      .doc(id)
      .update({ attendance_confirmations: arrayRemove(auth.currentUser.email) })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

export const finishMeeting = (id, MoMURL) => {
  return new Promise((resolve, reject) => {
    if (id == null || MoMURL == null) {
      reject("invalid");
      return;
    }
    db.collection("meetings")
      .doc(id)
      .get()
      .then((meetingDoc) => {
        let data = meetingDoc.data();
        let finishedMeeting = {
          user: data.user,
          team_id: data.team_id,
          beginning: data.beginning,
          end: data.end,
          MoM: MoMURL,
          event_ids: data.event_ids,
          attendees: data.attendance_confirmations,
          title: data.title,
          description: data.description,
        };
        return db.collection("finished_meetings").add(finishedMeeting);
      })
      .then(() => {
        resolve();
        return db.collection("meetings").doc(id).delete();
      })
      .then(() => {})
      .catch((err) => reject("neuspesno"));
  });
};
