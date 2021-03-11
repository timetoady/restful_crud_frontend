//Main default fetch method
export default async function tryCatch(URL, modifier = "", method = "GET", headers = {} ) {
    try {
      const response = await fetch(URL + `${modifier}`, {
        method: method,
        headers: headers,
      });
      const data = await response.json();
	  //console.log("Data is:", data)
      return data;
    } catch (error) {
      console.error(error);
    }
  }

export async function sendAPIData(URL, upload) {
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(upload),
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function editAPIData(URL, upload) {
  try {
    const response = await fetch(URL, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: upload,
    });
    const data = await response;
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}