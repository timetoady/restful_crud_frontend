export const buildJsonFormData = (form) => {
  console.log("Form is:", form);
  const jsonFormData = {};
  for (const pair of new FormData(form)) {
    jsonFormData[pair[0]] = pair[1];
  }
  return jsonFormData;
};

export function getNested(fn, defaultVal) {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
}

export function returnDateTo(object) {
  let year = getNested(() => object["prop"].to["year"]);
  let month = getNested(() => object["prop"].to["month"]);
  let day = getNested(() => object["prop"].to["day"]);
  let theDate = new Date(year, month, day);
  if (year === null) {
    return null;
  } else {
    return theDate;
  }
}

export function returnDateFrom(object) {
  let year = getNested(() => object["prop"].from["year"]);
  let month = getNested(() => object["prop"].from["month"]);
  let day = getNested(() => object["prop"].from["day"]);
  let theDate = new Date(year, month, day);
  console.log("Date from is: ", theDate)
  return theDate;
}

export function getAuthors(authorArray) {
  const theAuthors = [];
  authorArray.forEach((author) => {
    theAuthors.push(author.name);
  });
  if (theAuthors.length === 1) {
    return theAuthors[0];
  } else {
    return theAuthors.join(" & ");
  }
}

export function getGenres(genreArray) {
  const theGenres = [];
  genreArray.forEach((genre) => {
    theGenres.push(genre.name);
  });
  return theGenres;
}
