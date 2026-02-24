const form = document.querySelector<HTMLFormElement>('#upload-form')!;
const fileInput = document.querySelector<HTMLInputElement>('#file-input')!;
const fileInfo = document.querySelector<HTMLDivElement>('#file-info')!;


fileInput.addEventListener('change', () => {
  const files = fileInput.files;

  if (files && files.length > 0) {
    const file = files[0];
    fileInfo.textContent = `Plik: ${file.name} | Rozmiar: ${(file.size / 1024).toFixed(1)} KB`;
  } else {
    fileInfo.textContent = "Nie wybrano pliku";
  }
});

form.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  const selectedFile = fileInput.files?.[0];

  if (!selectedFile) {
    alert('Najpierw wybierz plik!');
    return;
  }
  
  selectedFile.text().then(content => {
    console.log('Zawartość pliku:', content);
    alert('Plik został wczytany. Sprawdź konsolę, aby zobaczyć jego zawartość.');
  }).catch(error => {
    console.error('Błąd podczas odczytu pliku:', error);
    alert('Wystąpił błąd podczas odczytu pliku.');
  }); 

});
