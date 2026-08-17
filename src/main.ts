import { JsonToEpp } from "./JsonToEpp";
import { JsonTools } from "./JsonTools";

const formUpload = document.querySelector<HTMLFormElement>('#upload-form')!;
const formMerge = document.querySelector<HTMLFormElement>('#form-merge')!;
const fileInputGoods = document.querySelector<HTMLInputElement>('#file-input-goods')!;
const fileInputNames = document.querySelector<HTMLInputElement>('#file-input-names')!;
const fileInputContractors = document.querySelector<HTMLInputElement>('#file-input-contractors')!;
const fileInfoGoods = document.querySelector<HTMLDivElement>('#file-info-goods')!;
const fileInfoNames = document.querySelector<HTMLDivElement>('#file-info-names')!;
const fileUploadContractors = document.querySelector<HTMLDivElement>('#upload-form-contractors')!;
const searchInput = document.querySelector<HTMLInputElement>('#search-symbol');
const resultsDiv = document.querySelector<HTMLDivElement>('#search-results');
const formSearch = document.querySelector<HTMLFormElement>('#form-search');
const fileUploadMergedGoods = document.getElementById('upload-form-merged-goods') as HTMLFormElement;
const fileInputMergedGoods = document.getElementById('file-input-merged-goods') as HTMLInputElement;
const jsonTools = new JsonTools();
const jsonToEpp = new JsonToEpp();




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

fileUploadContractors.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  const selectedFileContractors = fileInputContractors.files?.[0];

  if (!selectedFileContractors) {
    alert('Najpierw wybierz plik z kontrahentami!');
    return;
  }

  jsonTools.addContractors(selectedFileContractors);
});

fileUploadMergedGoods.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  const selectedFileMergedGoods = fileInputMergedGoods.files?.[0];

  if (!selectedFileMergedGoods) {
    alert('Najpierw wybierz plik JSON z połączonymi towarami (merged goods)!');
    return;
  }

  try {
    const jsonText = await selectedFileMergedGoods.text();
    const mergedGoodsData = JSON.parse(jsonText);

    // Wywołanie metody konwersji do EPP dla merged goods
    jsonToEpp.convertMergedGoodsToEpp(mergedGoodsData);

  } catch (error) {
    console.error('Błąd podczas odczytu pliku JSON:', error);
    alert('Nie udało się przetworzyć pliku JSON!');
  }
});


formMerge.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  jsonTools.mergeGoodsAndNames();
});

formSearch?.addEventListener('submit', (e: Event) => {
  e.preventDefault();

  const value = searchInput?.value.trim();
  if (!value) return;

  const results = jsonTools.findGoodsBySymbol(value);

  if (results.length > 0) {
    // Mapujemy wyniki na listę elementów HTML
    const htmlResults = results.map((item: any) => `
      <div class="result-item" style="border-bottom: 1px solid #eee; padding: 8px 0;">
        <strong>Symbol:</strong> ${item.Symbol} <br>
        <small>${JSON.stringify(item)}</small>
      </div>
    `).join('');

    resultsDiv!.innerHTML = `
      <p>Znaleziono dopasowań: <strong>${results.length}</strong></p>
      <div class="results-list">${htmlResults}</div>
    `;
  } else {
    resultsDiv!.innerHTML = `<p style="color: red;">Nie znaleziono towarów pasujących do: ${value}</p>`;
  }
});