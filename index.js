/***************************************/
/*               CONSTANTS             */
/***************************************/
const inpUploadFileNode = document.querySelector("#inp-upload-file")
const btnUploadFileNode = document.querySelector("#btn-upload-file")
const tblTableBodyNode = document.querySelector("#table-body")

// const BASE_URL = "http://localhost:7071/api"
const BASE_URL = "https://jsfn-stech.azurewebsites.net/api"

/***************************************/
/*               FUNCTIONS             */
/***************************************/
async function uploadFile(e) {
  const files = document.querySelector("#inp-upload-file").files
  if(!files.length) return
  btnUploadFileNode.setAttribute("disabled", "")
  showSnackbar("Subiendo el archivos", 1500)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileBase64 = await getBase64(file)
    let filename = file.name.split(".")
    const extension = filename.pop()
    filename.push(`${extension}`)
    console.log("El filename es: ", filename)
    await fetch(`${BASE_URL}/upload-file`, {
      method: "POST",
      body: JSON.stringify({
        file: fileBase64,
        filename: filename.join("."),
        mimetype: file.type
      })
    })
    await getAllFiles()
    showSnackbar(`Se ha subido el archivo exitosamente ${(i + 1)} de ${files.length}.`)
  }
  inpUploadFileNode.value = ""
  btnUploadFileNode.removeAttribute("disabled")
  // console.log(files)
  // return
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result)
    };
    reader.onerror = function (error) {
      reject(error)
    };
  })
}

function copyText(e) {
  /* Get the text field */
  const id = e.target.getAttribute("data-id")
  if (!id || !e.target.classList.contains("copy-url")) return
  const textValue = document.getElementById(id)
  
  /* Select the text field */
  textValue.select();
  textValue.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  const baseUrl = `${BASE_URL}/downloads/zips?name=${textValue.value.split("/").pop()}`
  navigator.clipboard.writeText(`<p>${baseUrl}</p>`)
  showSnackbar("La url ha sido copiada.")
}

function showSnackbar(message, time = 3000) {
  // Get the snackbar DIV
  var divSnackbarNode = document.getElementById("snackbar");

  // Add the "show" class to DIV
  divSnackbarNode.className = "show";

  divSnackbarNode.innerText = message

  // After 3 seconds, remove the show class from DIV
  setTimeout(_ => divSnackbarNode.className = divSnackbarNode.className.replace("show", ""), time);
}

async function getAllFiles() {
  try {
    const records = await (await fetch(`${BASE_URL}/urls-media`)).json()
    loadPagination(records)
  } catch (error) { }
}

function renderElements(records) {
  let html = ""
  for (const record of records) {
    html += createRowElement(record)
  }

  return html
}

function createRowElement(record) {
  const filenameWithoutExtension = record.filename.split(".").shift()
  return `
    <tr class="table-active">
      <td class="table-active">${record.filename}</td>
      <td>${record.extension}</td>
      <td>
        <span>
          <input type="text" class="url-file" value="${record.url}" style="display: none;" id="${filenameWithoutExtension}" data-file-name="${record.filename}">
          <img class="img-url-file mx-2 cp copy-url" src="./assets/url.png" data-id="${filenameWithoutExtension}" width="25px" height="25px">
        </span>
        <span>
          <img class="mx-2 download-file-icon cp" src="./assets/cloud-computing.png" width="25px" height="25px" data-id="${filenameWithoutExtension}">
        </span>
        <span>
          <img class="cp mx-2" src="${/(jpeg|jpg|png|gif)\b/i.test(record.extension) ? record.url : './assets/no-preview.png' }" width="25px" height="25px">
        </span>
      </td>
    </tr>
  `
}

async function loadPagination(records) {
  $('#pagination').pagination({
    dataSource: records,
    callback: data => {
      const html = renderElements(data);
      $("#table-body").html(html);
    }
  })
}

async function downloadFile(e) {
  const node = e.target

  if (!node.classList.contains("download-file-icon")) return
  const id = node.getAttribute("data-id")
  const inpNode = document.getElementById(id)
  const url = inpNode.value
  window.open(url)
}

/***************************************/
/*               LISTENERS             */
/***************************************/
btnUploadFileNode.addEventListener("click", uploadFile)
tblTableBodyNode.addEventListener("click", copyText)
tblTableBodyNode.addEventListener("click", downloadFile)
document.addEventListener("DOMContentLoaded", getAllFiles)
