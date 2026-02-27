export const refFromURL = (url) => {
  let withoutPrefix = url.slice(
    url.indexOf("organeeztec.appspot.com/o/") +
      "organeeztec.appspot.com/o/".length
  );
  return withoutPrefix.substring(0, withoutPrefix.indexOf("?"));
};

export const sortDates = (a, b) => {
  return a.date_created.toDate().getTime() > b.date_created.toDate().getTime()
    ? 1
    : a.date_created.toDate().getTime() == b.date_created.toDate().getTime()
    ? 0
    : -1;
};
export const sortMeetings = (a, b) => {
  return a.beginning.toDate().getTime() > b.beginning.toDate().getTime()
    ? 1
    : a.beginning.toDate().getTime() == b.beginning.toDate().getTime()
    ? a.end.toDate().getTime() > b.end.toDate().getTime()
      ? 1
      : a.end.toDate().getTime() == b.end.toDate().getTime()
      ? 0
      : -1
    : -1;
};
export const sortAnnouncements = (a, b) => {
  return a.date_posted.getTime() > b.date_posted.getTime()
    ? -1
    : a.date_posted.getTime() == b.date_posted.getTime()
    ? 0
    : 1;
};
export const staticPositions = () => {
  return new Array(
    { id: "chairperson", name: "Predsednik" },
    { name: "CP", id: "cp" }
  );
};

export const validatePhoneNum = (phone) => {
  const phoneRegEx = /^0\d{9}$/g;

  return phoneRegEx.test(phone);
};

export const validateName = (name) => {
  const nameRegex = /^[\p{L} ,.'-]+$/u;

  return nameRegex.test(name);
};

export const validatePass = (pass) => {
  const passRegEx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d$!%*?&()~#;:+*=%'\^\[\]]{8,20}$/;

  return passRegEx.test(pass);
};

export const validateEmail = (email) => {
  const emailRegEx = /([a-z0-9]+)([\.{1}])?([a-z0-9]+)@eestec.rs$/;
  return emailRegEx.test(email);
};
export const isValidHttpUrl = (URL) => {
  const regex = new RegExp(
    "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  );
  return regex.test(URL);
};
