const { ipcRenderer } = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        documentName: document.getElementById("documentName"),
        createDocumentBtn: document.getElementById("createDocumentBtn"),
        fileTextArea: document.getElementById("fileTextArea"),
        openDocumentBtn: document.getElementById("openDocumentBtn"),
        saveDocumentBtn: document.getElementById("saveDocumentBtn")
    };

    const handleDocumentChange = (filePath, content) => {
        el.documentName.innerHTML = path.parse(filePath).base;
        el.fileTextArea.removeAttribute("disabled");
        el.fileTextArea.value = content;
        el.fileTextArea.focus();
    }

    el.createDocumentBtn.addEventListener("click", () => {
        ipcRenderer.send("create-document-triggered");
    });

    el.openDocumentBtn.addEventListener("click", () => {
        ipcRenderer.send("open-document-triggered");
    });

    el.saveDocumentBtn.addEventListener("click", () =>{
        ipcRenderer.send("file-content-updated", el.fileTextArea.value);
    });

    ipcRenderer.on("document-opened", (_, {filePath, content}) => {
        handleDocumentChange(filePath, content);
    })

    ipcRenderer.on("document-created", (_, filePath) => {
        handleDocumentChange(filePath, "");
    });
})