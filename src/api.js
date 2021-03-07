//Main default fetch method
export default async function tryCatch(URL, modifier = "", method = "GET", headers = {} ) {
    try {
      const response = await fetch(URL + `${modifier}`, {
        method: method,
        headers: headers,
      });
      const data = await response.json();
	  console.log("Data is:", data)
      return data;
    } catch (error) {
      console.error(error);
    }
  }
