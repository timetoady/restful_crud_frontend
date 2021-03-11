export const buildJsonFormData = (form) => {
    console.log("Form is:", form)
    const jsonFormData = {}
    for (const pair of new FormData(form)) {
        jsonFormData[pair[0]] = pair[1]
     }
return jsonFormData
}