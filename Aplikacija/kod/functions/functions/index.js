const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");

admin.initializeApp(functions.config().firebase);

const getPushToken = (email) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .doc(email)
      .get()
      .then((snap) => {
        let data = snap.data();
        console.log("procitano");
        console.log(data);
        if (
          data.pushToken == undefined ||
          data.pushToken == null ||
          !Expo.isExpoPushToken(data.pushToken)
        ) {
          reject("non-existant");
        }
        resolve(data.pushToken);
      })
      .catch((err) => reject(err));
  });
};
const makeMessages = (emails, title, message, data) => {
  let messages = [];
  return new Promise((resolve, reject) => {
    let promises = [];
    emails.forEach((e) => {
      console.log("neki email");
      console.log(e);
      promises.push(
        getPushToken(e)
          .then((token) => {
            console.log(token);
            messages.push({
              to: token,
              sound: "default",
              title: title,
              body: message,
              vibrate: true,
              channelId: "default",
              data: data,
            });
          })
          .catch((err) => console.log(err))
      );
    });
    Promise.all(promises)
      .then(() => {
        console.log("all messages");
        messages.forEach((m) => console.log(m));
        resolve(messages);
      })
      .catch((err) => reject(err));
  });
};
const sendNotifications = (messages) => {
  console.log("salje se");
  console.log(messages);
  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
const getAllBoardEmails = () => {
  return new Promise((resolve, reject) => {
    let emails = [];
    admin
      .firestore()
      .collection("board")
      .doc("board")
      .get()
      .then((b) => {
        let chair = b.data().chairperson;
        let cp = b.data().cp;
        if (chair != null && chair != "") {
          emails.push(chair);
        }
        if (cp != null && cp != "" && cp != chair) {
          emails.push(cp);
        }
        return admin
          .firestore()
          .collection("board")
          .doc("board")
          .collection("positions")
          .get();
      })
      .then((snaps) => {
        snaps.forEach((snap) => {
          let data = snap.data();
          if (
            data.user != null &&
            data.user != "" &&
            emails.indexOf(data.user) == -1
          ) {
            emails.push(data.user);
          }
        });
        resolve(emails);
      })
      .catch((err) => reject(err));
  });
};
const getBoardEmailsForTeam = (teamid) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    admin
      .firestore()
      .collection("board")
      .doc("board")
      .get()
      .then((b) => {
        let chair = b.data().chairperson;
        if (chair != null && chair != "") {
          emails.push(chair);
        }
        return admin
          .firestore()
          .collection("board")
          .doc("board")
          .collection("positions")
          .where("managed_teams", "array-contains", teamid)
          .get();
      })
      .then((snaps) => {
        snaps.forEach((snap) => {
          let data = snap.data();
          if (
            data.user != null &&
            data.user != "" &&
            emails.indexOf(data.user) == -1
          ) {
            emails.push(data.user);
          }
        });
        resolve(emails);
      })
      .catch((err) => reject(err));
  });
};
const getAllOrgTeamEmails = (eventid) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    admin
      .firestore()
      .collection("events")
      .doc(eventid)
      .get()
      .then((b) => {
        let ho = b.data().HO;
        if (ho != null && ho != "") {
          emails.push(ho);
        }
        return admin
          .firestore()
          .collection("events")
          .doc(eventid)
          .collection("positions")
          .get();
      })
      .then((snaps) => {
        snaps.forEach((snap) => {
          let data = snap.data();
          if (
            data.user != null &&
            data.user != "" &&
            emails.indexOf(data.user) == -1
          ) {
            emails.push(data.user);
          }
        });
        resolve(emails);
      })
      .catch((err) => reject(err));
  });
};
const getOrgEmailsForTeam = (eventid, teamid) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    admin
      .firestore()
      .collection("events")
      .doc(eventid)
      .get()
      .then((b) => {
        let ho = b.data().HO;
        if (ho != null && ho != "") {
          emails.push(ho);
        }
        return admin
          .firestore()
          .collection("events")
          .doc(eventid)
          .collection("positions")
          .where("managed_teams", "array-contains", teamid)
          .get();
      })
      .then((snaps) => {
        snaps.forEach((snap) => {
          let data = snap.data();
          if (
            data.user != null &&
            data.user != "" &&
            emails.indexOf(data.user) == -1
          ) {
            emails.push(data.user);
          }
        });
        resolve(emails);
      })
      .catch((err) => reject(err));
  });
};
const getEmailsForTeam = (teamid) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .where("admin", "==", false)
      .where("positions", "array-contains", {
        collection: "teams",
        document: teamid,
        position: "member",
      })
      .get()
      .then((snaps) => {
        let emails = [];
        snaps.forEach((snap) => {
          if (emails.includes(snap.id)) {
            emails.push(snap.id);
          }
        });

        resolve(emails);
      })
      .catch((err) => reject(err));
  });
};
const newExternalAnnouncement = (announcement, eventid) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .where("admin", "==", false)
      .get()
      .then((snaps) => {
        let emails = [];
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });

        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: eventid,
          team_id: announcement.team_id,
          type: "external-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newUnapprovedAnnouncement = (eventid, announcement) => {
  //does nothing
  return;
  return new Promise((resolve, reject) => {
    let emails = [];
    getBoardEmailsForTeam(announcement.team_id)
      .then((snaps) => {
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });
        return getOrgEmailsForTeam();

        return makeMessages(emails, announcement.title, announcement.text);
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newBoardInternalAnnouncement = (announcement) => {
  return new Promise((resolve, reject) => {
    getAllBoardEmails()
      .then((emails) => {
        emails = emails.filter((e) => e != announcement.poster);
        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: "General",
          team_id: "General",
          type: "internal-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newOrgTeamInternalAnnouncement = (eventid, announcement) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    getBoardEmails()
      .then((bEmails) => {
        let boardEmails = bEmails.filter((e) => e != announcement.poster);
        boardEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });
        return getAllOrgTeamEmails(eventid);
      })
      .then((oTeamEmails) => {
        let orgTeamEmails = oTeamEmails.filter((e) => e != announcement.poster);
        orgTeamEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });
        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: eventid,
          team_id: "General",
          type: "internal-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newBoardExternalAnnouncement = (announcement) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .where("admin", "==", false)
      .get()
      .then((snaps) => {
        let emails = [];
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });

        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: "General",
          team_id: "General",
          type: "external-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newTeamExternalAnnouncement = (teamid, announcement) => {
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .where("admin", "==", false)
      .get()
      .then((snaps) => {
        let emails = [];
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });

        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: "General",
          team_id: teamid,
          type: "external-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newUnapprovedTeamAnnouncement = (teamid, announcement) => {
  //not functional
  return;
  return new Promise((resolve, reject) => {
    admin
      .firestore()
      .collection("users")
      .where("admin", "==", false)
      .get()
      .then((snaps) => {
        let emails = [];
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });

        return makeMessages(emails, announcement.title, announcement.text);
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newTeamInternalAnnouncement = (teamid, announcement) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    getEmailsForTeam(teamid)
      .then((snaps) => {
        snaps.forEach((snap) => {
          if (snap.id != announcement.poster) {
            emails.push(snap.id);
          }
        });
        return getBoardEmailsForTeam(teamid);
      })
      .then((bEmails) => {
        let boardEmails = bEmails.filter((e) => e != announcement.poster);
        boardEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });

        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: "General",
          team_id: teamid,
          type: "internal-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
const newEventTeamInternalAnnouncement = (eventid, announcement) => {
  return new Promise((resolve, reject) => {
    let emails = [];
    getBoardEmails()
      .then((bEmails) => {
        let boardEmails = bEmails.filter((e) => e != announcement.poster);
        boardEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });
        return getAllOrgTeamEmails(eventid);
      })
      .then((oTeamEmails) => {
        let orgTeamEmails = oTeamEmails.filter((e) => e != announcement.poster);
        orgTeamEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });
        return getEmailsForTeam(announcement.team_id);
      })
      .then((tEmails) => {
        let teamEmails = tEmails.filter((e) => e != announcement.poster);
        teamEmails.forEach((e) => {
          if (emails.indexOf(e) == -1) emails.push(e);
        });
        return makeMessages(emails, announcement.title, announcement.text, {
          event_id: eventid,
          team_id: announcement.team_id,
          type: "internal-notification",
        });
      })
      .then((messages) => {
        console.log(messages.length);
        sendNotifications(messages);
        resolve();
      })
      .catch((err) => reject(err));
  });
};
exports.onBoardExternalAnnouncement = functions.firestore
  .document("board/board/external_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        newBoardExternalAnnouncement(after)
          .then(() => {
            resolve();
          })
          .catch((err) => reject(err));
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        resolve();
      }
    });
  });
exports.onBoardInternalAnnouncement = functions.firestore
  .document("board/board/internal_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        newBoardInternalAnnouncement(after)
          .then(() => {
            resolve();
          })
          .catch((err) => reject(err));
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        resolve();
      }
    });
  });
exports.onExternalAnnouncement = functions.firestore
  .document("events/{eventid}/external_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.eventid + " " + context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        if (after.approved == true) {
          newExternalAnnouncement(after, context.params.eventid)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        } else {
          newUnapprovedAnnouncement(context.params.eventid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        }
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        if (before.approved == false && after.approved == true) {
          newExternalAnnouncement(after, context.params.eventid)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        } else resolve();
      }
    });
  });
exports.onTeamExternalAnnouncement = functions.firestore
  .document("teams/{teamid}/external_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.teamid + " " + context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        if (after.approved == true) {
          newTeamExternalAnnouncement(context.params.teamid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        } else {
          newUnapprovedTeamAnnouncement(context.params.teamid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        }
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        if (before.approved == false && after.approved == true) {
          newTeamExternalAnnouncement(context.params.teamid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        } else resolve();
      }
    });
  });
exports.onInternalAnnouncement = functions.firestore
  .document("events/{eventid}/internal_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.eventid + " " + context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        if (after.team_id == "General") {
          newOrgTeamInternalAnnouncement(context.params.eventid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        } else {
          newEventTeamInternalAnnouncement(context.params.eventid, after)
            .then(() => {
              resolve();
            })
            .catch((err) => reject(err));
        }
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        resolve();
      }
    });
  });

exports.onTeamInternalAnnouncement = functions.firestore
  .document("teams/{teamid}/internal_announcements/{announcementid}")
  .onWrite((change, context) => {
    console.log(context.params.teamid + " " + context.params.announcementid);
    let before = change.before.data();
    let after = change.after.data();
    return new Promise((resolve, reject) => {
      if (before == undefined) {
        console.log("created");
        newTeamInternalAnnouncement(context.params.teamid, after)
          .then(() => {
            resolve();
          })
          .catch((err) => reject(err));
      } else if (after == undefined) {
        console.log("deleted");
        resolve();
      } else {
        console.log("updated");
        resolve();
      }
    });
  });
exports.sendNotif = functions.https.onCall((data, context) => {
  let emails = [];
  emails.push(data.email);
  console.log("emails");
  console.log(emails);
  makeMessages(emails, "Test", "Test")
    .then((messages) => {
      console.log("messages");
      console.log(messages);
      sendNotifications(messages);
    })
    .catch((err) => console.log(err));
});
exports.changePass = functions.https.onCall((data, context) => {
  let email = data.email;
  let newPass = data.password;

  return admin
    .auth()
    .getUserByEmail(email)
    .then((user) => {
      return admin.auth().updateUser(user.uid, {
        password: newPass,
      });
    })
    .then((userRecord) => {
      console.log("Successfully updated user", userRecord.toJSON());
      return userRecord;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
});
const refFromURL = (URL) =>
  decodeURIComponent(URL.split("/").pop().split("?")[0]);
exports.deleteUser = functions.https.onCall((data, context) => {
  console.log(data.email);

  return admin
    .firestore()
    .collection("users")
    .doc(data.email)
    .get()
    .then((r) => {
      console.log(r);

      console.log("read results");
      console.log(r);
      let userData = r.data();
      console.log("cv");
      console.log(refFromURL(userData.cv));

      console.log("profile pic uri");
      console.log(refFromURL(userData.profile_pic_uri));
      if (userData.cv != undefined && userData.cv != "")
        admin.storage().bucket().file(refFromURL(userData.cv)).delete();
      if (
        userData.profile_pic_uri != undefined &&
        userData.profile_pic_uri != ""
      )
        admin
          .storage()
          .bucket()
          .file(refFromURL(userData.profile_pic_uri))
          .delete();
      return admin
        .firestore()
        .collection("events")
        .where("HO", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin.firestore().collection("events").doc(d.id).update({ HO: "" })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("events")
        .where("muted_by", "array-contains", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin
            .firestore()
            .collection("events")
            .doc(d.id)
            .update({
              muted_by: admin.firestore.FieldValue.arrayRemove(data.email),
            })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collectionGroup("positions")
        .where("user", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        console.log("read collectiongroup");
        console.log(d);
        promises.push(d.ref.update({ user: "" }));
      });
      return Promise.all(promises);
    })
    .then(() => {
      console.log("got to next");
      return admin.firestore().collection("board").doc("board").get();
    })
    .then((boardsn) => {
      let board = boardsn.data();
      let promises = [];
      if (board.chairperson && board.chairperson == data.email)
        promises.push(
          admin
            .firestore()
            .collection("board")
            .doc("board")
            .update({ chairperson: "" })
        );
      if (board.cp && board.cp == data.email)
        promises.push(
          admin.firestore().collection("board").doc("board").update({ cp: "" })
        );
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collectionGroup("applications_for_oc")
        .where("email", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(d.ref.delete());
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collectionGroup("external_announcements")
        .where("poster", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(d.ref.delete());
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collectionGroup("internal_announcements")
        .where("poster", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(d.ref.delete());
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collectionGroup("applications")
        .where("email", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(d.ref.delete());
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("finished_meetings")
        .where("attendees", "array-contains", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin
            .firestore()
            .collection("finished_meetings")
            .doc(d.id)
            .update({
              attendees: admin.firestore.FieldValue.arrayRemove(data.email),
            })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("finished_meetings")
        .where("user", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin
            .firestore()
            .collection("finished_meetings")
            .doc(d.id)
            .update({ user: "" })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("meetings")
        .where("user", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin.firestore().collection("meetings").doc(d.id).delete()
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("meetings")
        .where("attendance_confirmations", "array-contains", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin
            .firestore()
            .collection("meetings")
            .doc(d.id)
            .update({
              attendance_confirmations: admin.firestore.FieldValue.arrayRemove(
                data.email
              ),
            })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("tasks")
        .where("user_id", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(d.ref.delete());
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin
        .firestore()
        .collection("tasks")
        .where("worker", "==", data.email)
        .get();
    })
    .then((snaps) => {
      let promises = [];
      snaps.docs.forEach((d) => {
        promises.push(
          admin
            .firestore()
            .collection("tasks")
            .doc(d.id)
            .update({ worker: null })
        );
      });
      return Promise.all(promises);
    })
    .then(() => {
      return admin.firestore().collection("users").doc(data.email).delete();
    })
    .then(() => {
      return admin.auth().getUserByEmail(data.email);
    })
    .then((user) => {
      console.log(user);

      return admin.auth().deleteUser(user.uid);
    })

    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((error) => {
      console.log(error);
      throw new functions.https.HttpsError(error.code);
    });
});

exports.registerUser = functions.https.onCall((data, context) => {
  const userEmail = data.email;
  const userPassword = data.password;
  return admin
    .auth()
    .getUsers([{ email: userEmail }])
    .then((getUsersResult) => {
      console.log(userEmail + " " + getUsersResult.users);
      if (getUsersResult.users.length != 0) {
        console.log("ima ih");
        throw new functions.https.HttpsError(
          "already-exists",
          "Email je već registrovan"
        );
      } else {
        console.log("nema ih");
        return admin.auth().createUser({
          email: userEmail,
          password: userPassword,
          emailVerified: true,
        });
      }
    })
    .then((userRecord) => {
      console.log("success");
      return {
        data: userRecord,
      };
    })
    .catch((error) => {
      console.log("Error fetching user data:", error);
      throw new functions.https.HttpsError("invalid-argument", error);
    });
});
