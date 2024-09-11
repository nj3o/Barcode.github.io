document.addEventListener('DOMContentLoaded', function() {
    // Überprüfe docx Bibliothek
    if (typeof docx !== 'undefined' && docx.Document) {
        console.log('docx-Bibliothek erfolgreich geladen.');
    } else {
        console.error('docx-Bibliothek ist nicht geladen.');
    }

    // Überprüfe FileSaver Bibliothek
    if (typeof saveAs !== 'undefined') {
        console.log('FileSaver.js Bibliothek erfolgreich geladen.');
    } else {
        console.error('FileSaver.js Bibliothek ist nicht geladen.');
    }

    if (window.location.pathname.includes('index.html')) {
        const form = document.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            sessionStorage.setItem('anrede_id', document.getElementById('dropdownanrede').value);
            sessionStorage.setItem('anschrift_id', document.getElementById('anschrifttxt').value);
            sessionStorage.setItem('adresse_id', document.getElementById('adressetxt').value);
            sessionStorage.setItem('ort_id', document.getElementById('ortxt').value);
            sessionStorage.setItem('telefon_id', document.getElementById('telefontxt').value);

            console.log("Daten gespeichert:");
            console.log("Anrede: ", sessionStorage.getItem('anrede_id'));
            console.log("Anschrift: ", sessionStorage.getItem('anschrift_id'));
            console.log("Adresse: ", sessionStorage.getItem('adresse_id'));
            console.log("Ort: ", sessionStorage.getItem('ort_id'));
            console.log("Telefon: ", sessionStorage.getItem('telefon_id'));

            alert('Informationen gespeichert. Sie können nun zur nächsten Seite navigieren.');
        });
    }

 // Plattform-Erkennung: Überprüfen, ob das Gerät Android ist
 const isAndroid = navigator.userAgent.toLowerCase().includes('android');

 // Funktionen zur Verwaltung von Ordnern mit File System Access API
 async function androidOpenDirectory() {
     try {
         const dirHandle = await window.showDirectoryPicker();
         console.log("Verzeichnis auf Android ausgewählt:", dirHandle.name);
         alert('Ordner erfolgreich ausgewählt: ' + dirHandle.name);
         return dirHandle;
     } catch (err) {
         console.error('Fehler beim Auswählen des Ordners auf Android:', err);
         alert('Fehler beim Auswählen des Ordners.');
         return null;
     }
 }

 async function androidCreateDirectory(parentDirHandle, folderName) {
     try {
         const newDirHandle = await parentDirHandle.getDirectoryHandle(folderName, { create: true });
         console.log("Ordner auf Android erstellt: " + newDirHandle.name);
         alert("Ordner erfolgreich erstellt: " + newDirHandle.name);
     } catch (err) {
         console.error('Fehler beim Erstellen des Ordners auf Android:', err);
         alert('Fehler beim Erstellen des Ordners.');
     }
 }

 if (isAndroid) {
     // Android-spezifische Funktion für Ordner öffnen
     document.getElementById('buttonordnerauswahlen').addEventListener('click', async function() {
         chosenDirHandle = await androidOpenDirectory();
     });

     // Android-spezifische Funktion für Ordner erstellen
     document.getElementById('buttonordnererstellen').addEventListener('click', async function() {
         if (!chosenDirHandle) {
             alert('Bitte wählen Sie zuerst einen Ordner aus.');
             return;
         }

         const anrede = sessionStorage.getItem('anrede_id');
         const anschrift = sessionStorage.getItem('anschrift_id');
         const folderName = generateFolderName(anrede, anschrift);

         await androidCreateDirectory(chosenDirHandle, folderName);
     });
 } else {
     // Originale Funktionen für nicht-Android-Geräte (z. B. Laptop)
     document.getElementById('buttonordnerauswahlen').addEventListener('click', async function() {
         try {
             chosenDirHandle = await window.showDirectoryPicker();
             console.log("Verzeichnis ausgewählt:", chosenDirHandle.name);
             alert('Ordner erfolgreich ausgewählt: ' + chosenDirHandle.name);
         } catch (err) {
             console.error('Fehler beim Auswählen des Ordners:', err);
             alert('Fehler beim Auswählen des Ordners.');
         }
     });

     document.getElementById('buttonordnererstellen').addEventListener('click', async function() {
         if (!chosenDirHandle) {
             alert('Bitte wählen Sie zuerst einen Ordner aus.');
             return;
         }
         const anrede = sessionStorage.getItem('anrede_id');
         const anschrift = sessionStorage.getItem('anschrift_id');
         const folderName = generateFolderName(anrede, anschrift);
         
         try {
             const newDirHandle = await chosenDirHandle.getDirectoryHandle(folderName, { create: true });
             console.log("Ordner erstellt: " + newDirHandle.name);
             alert("Ordnername generiert und Ordner erstellt: " + newDirHandle.name);
         } catch (err) {
             console.error('Fehler beim Erstellen des Ordners:', err);
             alert('Fehler beim Erstellen des Ordners.');
         }
     });
 

        document.getElementById('buttonmangel').addEventListener('click', function() {
            openCameraPopup();
            loadDropdownOptions();
        });
        
        document.getElementById('abspeichernmangel').addEventListener('click', function() {
            saveMangelData();
        });

        document.getElementById('popupweg').addEventListener('click', closePopup);

        document.getElementById('buttonword').addEventListener('click', function() {
            generateDocument();
        });
    }
});

function generateFolderName(anrede, anschrift) {
    let folderName = '';
    if (anrede === 'optionherr' || anrede === 'optionfrau') {
        const parts = anschrift.trim().split(' ');
        const lastName = parts[0].toLowerCase();
        const firstName = parts.length > 1 ? parts[1].toLowerCase() : '';
        folderName = `${lastName}-${firstName}-mangel`;
    } else {
        folderName = `${anschrift.toLowerCase().replace(/ /g, '-')}-mangel`;
    }
    return folderName;
}

function openCameraPopup() {
    const popup = document.getElementById('popupmangel');
    if (!popup) {
        console.error("Popup-Element nicht gefunden.");
        return;
    }
    popup.style.display = 'block';

    const videoElement = document.getElementById('videomangel');
    const captureButton = document.getElementById('bildmangel');
    const frozenImage = document.getElementById('frozenImage'); // Neues img-Element

    if (!videoElement) {
        console.error("Video-Element nicht gefunden.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            videoElement.srcObject = stream;

            captureButton.onclick = function() {
                // Einfrieren des Kamerabildes
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                // Daten-URL des eingefrorenen Bildes speichern
                const dataUrl = canvas.toDataURL('image/png');
                sessionStorage.setItem('bildmangel', dataUrl);

                // Stream stoppen (Kamera ausschalten)
                stream.getTracks().forEach(track => track.stop());

                // Video verstecken und eingefrorenes Bild anzeigen
                videoElement.style.display = 'none';
                frozenImage.src = dataUrl; // Setze das gespeicherte Bild als Quelle
                frozenImage.style.display = 'block';
            };
        })
        .catch(function(error) {
            console.error("Fehler beim Zugriff auf die Kamera: ", error);
            alert("Kamera kann nicht gestartet werden: " + error.message);
        });
}

function loadDropdownOptions() {
    fetch('Mangel.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden: ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            const options = text.split('\n').filter(line => line.trim() !== ''); // Leerzeilen entfernen
            const dropdown = document.getElementById('dropdownmangel');
            dropdown.innerHTML = options.map(option => `<option value="${option.trim()}">${option.trim()}</option>`).join('');
        })
        .catch(error => {
            console.error('Fehler beim Laden der Dropdown-Optionen:', error);
            alert('Fehler beim Laden der Dropdown-Optionen. Bitte prüfen Sie die Konsole für mehr Informationen.');
        });
}

function saveMangelData() {
    const selectedOption = document.getElementById('dropdownmangel').value;
    const textInput = document.getElementById('textmangel').value;
    const imageBase64 = sessionStorage.getItem('bildmangel');

    const uniqueId = Date.now();
    const mangelData = {
        option: selectedOption,
        description: textInput,
        image: imageBase64
    };

    sessionStorage.setItem(`mangelData_${uniqueId}`, JSON.stringify(mangelData));
    console.log('Mangel-Daten gespeichert mit ID:', uniqueId);
    alert('Mangel-Daten gespeichert mit ID: ' + uniqueId);
}

function closePopup() {
    const popup = document.getElementById('popupmangel');
    if (popup) {
        popup.style.display = 'none';
    }
}

function generateDocument() {
    // Stelle sicher, dass alle Objekte korrekt von der docx-Bibliothek geladen sind
    const { Document, Packer, Paragraph, TextRun, ImageRun } = window.docx;

    const anrede = sessionStorage.getItem('anrede_id') || '';
    const anschrift = sessionStorage.getItem('anschrift_id') || '';
    const adresse = sessionStorage.getItem('adresse_id') || '';
    const ort = sessionStorage.getItem('ort_id') || '';
    const telefon = sessionStorage.getItem('telefon_id') || '';
    const mangelData = retrieveMangelData();

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Anrede: ${anrede}`, size: 24, bold: true }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Anschrift: ${anschrift}`, size: 24 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Adresse: ${adresse}`, size: 24 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Ort: ${ort}`, size: 24 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Telefon: ${telefon}`, size: 24 }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Mangelfälle:", size: 24, bold: true, underline: true }),
                        ],
                    }),
                    ...mangelData.map(data => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Problemfall: ${data.option}`, size: 20, bold: true }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: data.description, size: 16 }),
                            ],
                        }),
                        ...data.image ? [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: dataURLtoArrayBuffer(data.image),
                                        transformation: { width: 320, height: 240 }
                                    })
                                ],
                            })
                        ] : []
                    ]).flat()
                ],
            },
        ],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "gesammelte_daten.docx");
        console.log("Dokument erfolgreich erstellt und heruntergeladen.");
    }).catch(err => {
        console.error('Fehler beim Erstellen des Dokuments:', err);
    });
}

// Funktion zum Abrufen der Mangel-Daten aus dem sessionStorage
function retrieveMangelData() {
    const mangelData = [];
    for (const key in sessionStorage) {
        if (key.startsWith('mangelData_')) {
            mangelData.push(JSON.parse(sessionStorage.getItem(key)));
        }
    }
    return mangelData;
}

// Hilfsfunktion zum Umwandeln von DataURL in ArrayBuffer
function dataURLtoArrayBuffer(dataURL) {
    const binaryString = window.atob(dataURL.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}