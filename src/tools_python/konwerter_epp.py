# -*- coding: utf-8 -*-
import glob
import os

def konwertuj_pliki_epp():
    # Szukamy wszystkich plików zaczynających się od 'towary_' i kończących na '.epp'
    pliki = glob.glob('towary_*.epp')
    
    if not pliki:
        print("Nie znaleziono żadnych plików pasujących do wzorca 'towary_*.epp' w tym folderze.")
        return

    print(f"Znaleziono plików do przetworzenia: {len(pliki)}")
    
    for plik_wejsciowy in pliki:
        # Tworzymy nową nazwę, np. towary_1_win1250.epp
        nazwa, rozszerzenie = os.path.splitext(plik_wejsciowy)
        plik_wyjsciowy = f"{nazwa}_win1250{rozszerzenie}"
        
        try:
            # Odczyt pliku w UTF-8
            with open(plik_wejsciowy, 'r', encoding='utf-8') as f:
                tresc = f.read()
                
            # Zapis pliku w Windows-1250
            with open(plik_wyjsciowy, 'w', encoding='windows-1250', errors='replace') as f:
                f.write(tresc)
                
            print(f"Sukces: {plik_wejsciowy} -> {plik_wyjsciowy}")
            
        except Exception as e:
            print(f"Błąd podczas przetwarzania pliku {plik_wejsciowy}: {e}")

if __name__ == '__main__':
    konwertuj_pliki_epp()
    input("\nNaciśnij Enter, aby zamknąć program...")
