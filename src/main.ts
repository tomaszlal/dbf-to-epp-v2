import { ToJsonTools } from "./ToJsonTools";

const formUpload = document.querySelector<HTMLFormElement>('#upload-form')!;
const formMerge = document.querySelector<HTMLFormElement>('#form-merge')!;
const fileInputGoods = document.querySelector<HTMLInputElement>('#file-input-goods')!;
const fileInputNames = document.querySelector<HTMLInputElement>('#file-input-names')!;
const fileInfoGoods = document.querySelector<HTMLDivElement>('#file-info-goods')!;
const fileInfoNames = document.querySelector<HTMLDivElement>('#file-info-names')!;
const jsonTools = new ToJsonTools();

fileInputGoods.addEventListener('change', () => {
  const files = fileInputGoods.files;

  if (files && files.length > 0) {
    const file = files[0];
    fileInfoGoods.textContent = `Plik: ${file.name} | Rozmiar: ${(file.size / 1024).toFixed(1)} KB`;
  } else {
    fileInfoGoods.textContent = "Nie wybrano pliku";
  }
});

fileInputNames.addEventListener('change', () => {
  const files = fileInputNames.files;

  if (files && files.length > 0) {
    const file = files[0];
    fileInfoNames.textContent = `Plik: ${file.name} | Rozmiar: ${(file.size / 1024).toFixed(1)} KB`;
  } else {
    fileInfoNames.textContent = "Nie wybrano pliku";
  }
});



formUpload.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  const selectedFileGoods = fileInputGoods.files?.[0];
  const selectedFileNames = fileInputNames.files?.[0];

  if (!selectedFileGoods || !selectedFileNames) {
    alert('Najpierw wybierz oba pliki!');
    return;
  }

  jsonTools.addGoods(selectedFileGoods);
  jsonTools.addNames(selectedFileNames);
});

formMerge.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  jsonTools.mergeGoodsAndNames();
});