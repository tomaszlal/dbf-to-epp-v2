import type { Item } from "./Types";

export class JsonToEpp {

    private contractors: Array<Item> | undefined;
    private mergedGoods: Array<Item> | undefined;
    private rootDirectoryHandle: any | null = null; // Zmienna do przechowywania uchwytu katalogu

    public convertContractorsToEpp(contractorsData: Array<Item>) {
        this.contractors = contractorsData;
        const lines: string[] = [];

        // Sekcja nagłówkowa  "1.05",3,1250,,,,,,,,,,,,,0,,,,20260122170115,,"PL","PL0000000000",1
        lines.push("[INFO]");
        lines.push(`"1.05",3,1250,,,,,,,,,,,,,0,,,,20260122170115,,"PL","PL0000000000",1`);
        lines.push("");
        lines.push("[NAGLOWEK]");
        lines.push(`"KONTRAHENCI"`);
        lines.push("");
        lines.push("[ZAWARTOSC]");

        for (const contractor of this.contractors) {
            // Generowanie rekordów kontrahentów (sekcja [ZAWARTOSC] w [KONTRAHENCI])
            const typ = "0";//typ kontrahenta: 0 = odbiorca/dostawca, 1 = odbiorca, 2 = dostawca
            const kod = contractor.Kontrahent ? `"${contractor.Kontrahent}"` : "";//kod identyfikacyjny kontrahenta (Symbol/Kod) - unikalny identyfikator kontrahenta w systemie Subiekt GT
            const nazwaSkrocona = contractor.Kontrahent ? `"${contractor.Kontrahent}"` : "";//nazwa skrócona kontrahenta (Nazwa 1) - krótka nazwa kontrahenta, np. skrót firmy
            const nazwaPelna = this.getFullName(contractor);//nazwa pełna kontrahenta (Nazwa 2) - pełna nazwa kontrahenta, np. pełna nazwa firmy
            const miasto = contractor.Miasto ? `"${contractor.Miasto}"` : "";//miasto - miejscowość kontrahenta
            const kodPocztowy = this.getPostCode(contractor);  //kod pocztowy - kod pocztowy kontrahenta
            const ulica = contractor.Ulica ? `"${contractor.Ulica}"` : "";//ulica i numer domu/lokalu kontrahenta
            const nip = contractor.Nip ? `"${contractor.Nip}"` : "";//nip - numer identyfikacji podatkowej kontrahenta
            const regon = contractor.Regon ? `"${contractor.Regon}"` : ""; //regon - numer REGON kontrahenta
            const telefon = contractor.Telefon ? `"${contractor.Telefon}"` : ""; //telefon - numer telefonu kontrahenta
            const fax = ""; //fax - numer faksu kontrahenta
            //teleks - numer telex kontrahenta
            //email - adres e-mail kontrahenta
            //www - adres strony internetowej kontrahenta
            //nazwisko kontaktu - imię i nazwisko osoby kontaktowej w firmie kontrahenta
            //analityka dostawcy
            //analityka odbiorcy
            //pole uzytkownika 1
            //pole uzytkownika 2
            //pole uzytkownika 3
            //pole uzytkownika 4
            //pole uzytkownika 5
            //pole uzytkownika 6
            //pole uzytkownika 7
            //pole uzytkownika 8
            //nazwa banku - nazwa banku kontrahenta
            //numer konta bankowego kontrahenta
            //państwo banku kontrahenta
            //prefix panstwa Eu
            //czy kontrahent unijny
            //prefix państwa wedlug ISO 3166-1
            //adres oddziału banku kontrahenta

            lines.push(`${typ},${kod},${nazwaSkrocona},${nazwaPelna},${miasto},${kodPocztowy},${ulica},${nip},${regon},${telefon},${fax},,,,,,,,,,,,,,,,,"Polska",,0,`);
        }

        console.log('Contractors data by lines:', lines);
        this.downloadEPP(lines, 'kontrahenci.epp');
    }

    private getFullName(contractor: Item): string {
        const czystaNazwa = String(contractor.Nazwa1 || "")
            .replace(/['"]/g, "")
            .trim();

        return czystaNazwa ? `"${czystaNazwa}"` : "";
    }

    private getPostCode(contractor: Item): string {
        const rawKod = String(contractor.Kod || "")
            .replace(/\D/g, "")
            .slice(0, 5)
            .padEnd(5, "0");

        return `"${rawKod.slice(0, 2)}-${rawKod.slice(2)}"`;
    }

    public async selectTargetDirectory(): Promise<void> {
        try {
            // @ts-ignore
            this.rootDirectoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            console.log('Katalog wybrany pomyślnie!');
        } catch (error) {
            console.error('Użytkownik anulował lub wystąpił błąd:', error);
        }
    }

    private async saveSingleFile(lines: string[], fileName: string, subPath: string = ''): Promise<void> {
        if (!this.rootDirectoryHandle) {
            console.error('Brak uprawnień! Najpierw wywołaj selectTargetDirectory().');
            return;
        }

        try {
            let currentDirectory = this.rootDirectoryHandle;
            // Jeśli podano ścieżkę (np. "styczen/kontrahenci"), przejdź głąb drzewa katalogów
            if (subPath) {
                // Rozbijamy ścieżkę na tablicę (obsługuje zarówno slashe "/" jak i backslashe "\")
                const folders = subPath.split(/[/\\]/).filter(folder => folder.length > 0);

                for (const folderName of folders) {
                    // Pobiera podfolder, a jeśli nie istnieje - tworzy go
                    currentDirectory = await currentDirectory.getDirectoryHandle(folderName, { create: true });
                }
            }

            const content = lines.join('\r\n');

            // Stwórz plik w docelowym folderze
            const fileHandle = await currentDirectory.getFileHandle(fileName, { create: true });

            // Zapisz strumień danych na dysk
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();

            console.log(`Zapisano plik: ${subPath ? subPath + '/' : ''}${fileName}`);
        } catch (error) {
            console.error(`Błąd zapisu pliku ${fileName}:`, error);
        }
    }


    private downloadEPP(lines: string[], fileName: string = 'kontrahenci.epp'): void {
        const content = lines.join('\r\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Sprzątanie po pobraniu
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    public async convertMergedGoodsToEpp(mergedGoodsData: Array<Item>) {
        const chunkSize = 1000;
        await this.selectTargetDirectory();  // Wywołanie funkcji wyboru katalogu
        // Jeśli brak danych, przerywamy
        if (!mergedGoodsData || mergedGoodsData.length === 0) {
            return;
        }

        // Dzielimy tablicę towarów na paczki po max 1000 elementów
        for (let i = 0; i < mergedGoodsData.length; i += chunkSize) {
            const chunk = mergedGoodsData.slice(i, i + chunkSize);
            const partNumber = Math.floor(i / chunkSize) + 1;

            const lines: string[] = [];

            // Sekcja nagłówkowa
            lines.push("[INFO]");
            lines.push(`"1.11",3,1250,"Subiekt GT","SKLEP_BRODA","sklep_broda_test","Sklep Broda tesy",,,,"6550011383","MAG","Główny","Magazyn główny",,0,,,"Szef",20260819165547,"Polska","PL","6550011383",1`);
            lines.push("");
            lines.push("[NAGLOWEK]");
            lines.push(`"TOWARY"`);
            lines.push("");
            lines.push("[ZAWARTOSC]");

            // console.log(`Przetwarzanie paczki ${partNumber} (elementy od ${i + 1} do ${i + chunk.length})`);

            for (const mergedGood of chunk) {
                const typ = 1; // typ towaru: 1 = towar, 2 = usługa
                const symbol = this.clearText(mergedGood.Symbol as string);
                const kod = `"${symbol}"`;
                const kodTowProducenta = "";
                const kodKreskowy = "";

                if (mergedGood.Opis === null || mergedGood.Opis === undefined) {
                    mergedGood.Opis = kod;
                }

                const descriptionOfGood = this.clearText(mergedGood.Opis as string);
                const nazwa = descriptionOfGood ? `"${descriptionOfGood}"` : "";
                const opisTowaru: string = nazwa;
                const nazwaFisk: string = nazwa;
                const symbolSWW = "";
                const symbolPKWIU = mergedGood.Pkwiu ? `"${mergedGood.Pkwiu}"` : ``;
                const jm = (mergedGood.Jm?.toString())?.toLowerCase() ?? "";
                const jednMiary = jm.includes("sz") ? `"szt."` : `"${jm}"`;

                const vatValue = (Number(mergedGood.Pvat) === 22 ? 23 : Number(mergedGood.Pvat));
                const symbVat = `"${vatValue}"`;
                const stawkaVat = vatValue.toFixed(4);
                const cenaZNetto = `0.0000`;
                const cenaWalutowa = `0.0000`;

                lines.push(`${typ},${kod},${kodTowProducenta},${kodKreskowy},${nazwa},${opisTowaru},${nazwaFisk},${symbolSWW},${symbolPKWIU},${jednMiary},${symbVat},${stawkaVat},${symbVat},${stawkaVat},${cenaZNetto},${cenaWalutowa},,0,,,,0.0000,0,,,0,${jednMiary},0.0000,0.0000,,0,,0,0,,,,,,,,`);
            }

            // WAŻNE: Przekazujemy 'chunk' zamiast pełnego 'mergedGoodsData'
            await this.generatePricesInEPP(lines, chunk);

            // Tworzymy unikalną nazwę pliku dla każdej paczki, np. towary_czesc_1.epp, towary_czesc_2.epp
            const fileName = mergedGoodsData.length > chunkSize
                ? `towary_${partNumber}.epp`
                : 'towary.epp';

            // this.downloadEPP(lines, fileName);
            await this.saveSingleFile(lines, fileName);  // Zapis do wybranego katalogu
        }
    }

    private async generatePricesInEPP(lines: string[], mergedGoodsData: Array<Item>) {
        lines.push("");
        lines.push("[NAGLOWEK]");
        lines.push(`"CENNIK"`);
        lines.push("");
        lines.push("[ZAWARTOSC]");

        for (const mergedGood of mergedGoodsData) {
            const symbol = this.clearText(mergedGood.Symbol as string);
            const kod = `"${symbol}"`;
            const vatValue = Number(mergedGood.Pvat) === 22 ? 23 : Number(mergedGood.Pvat);

            // 1. Wyliczenie wartości i zaokrąglenie do 2 miejsc po przecinku (do pełnych groszy)
            const nettoRounded = Math.round((Number(mergedGood.Cena_1) / (1 + vatValue / 100)) * 100) / 100;
            const bruttoRounded = Math.round(Number(mergedGood.Cena_1) * 100) / 100;

            // 2. Sformatowanie do ciągu tekstowego z 4 miejscami po przecinku
            const cenaNetto = nettoRounded.toFixed(4);
            const cenaBrutto = bruttoRounded.toFixed(4);

            // lines.push(`${kod},"Detaliczna",${cenaNetto},${cenaBrutto},10.0000,0.0000,0.0000`);

            // lines.push(`${kod},"Detaliczna",${cenaNetto},,,,`);
            lines.push(`${kod},"Detaliczna",${cenaNetto},${cenaBrutto},10.0000,100.0000,${cenaNetto}`);
        }
    }

    private clearText(textToClear: string | undefined): string {
        if (textToClear === undefined || textToClear === null) {
            return "";
        }
        if (typeof textToClear !== "string") {
            textToClear = String(textToClear);
        }

        return textToClear
            .replace(/['"]/g, "")
            .replace(/[\\,]/g, ".")
            .trim();
    }

    public async generatePWToEPP(mergedGoodsData: Array<Item>) {
        this.mergedGoods = mergedGoodsData;
        const lines: string[] = [];

        lines.push("[INFO]");
        lines.push(`"1.11",3,1250,"Subiekt GT","SKLEP_BRODA","sklep_broda_test","Sklep Broda test",,,,"6550011383","MAG","Główny","Magazyn główny",,0,,,"Szef",20260819165547,"Polska","PL","6550011383",1`);
        lines.push("");
        lines.push("[NAGLOWEK]");
        lines.push(`"PW",1,0,1,,,"2/2026",,,,,,,,,,,,"Magazyn","Dokument magazynowy",,20260819000000,20260819000000,,3,1,"Cena ostatniej dost.",0.0000,0.0000,0.0000,0.0000,,0.0000,,20260819000000,0.0000,0.0000,0,0,0,0,";Szef","Szef",,0.0000,0.0000,"PLN",1.0000,,,,,0,0,0,,0.0000,,0.0000,,,0`);
        lines.push("[ZAWARTOSC]");

        var counter = 0;
        for (const mergedGood of this.mergedGoods) {
            counter++;
            const typ = 1; //typ towaru: 1 = towar, 2 = usługa,
            const symbol = this.clearText(mergedGood.Symbol as string);
            const kod = `"${symbol}"`;
            const jm = (mergedGood.Jm?.toString())?.toLowerCase() ?? "";
            const jednMiary = jm.includes("sz") ? `"szt."` : `"${jm}"`;
            const ilosc = mergedGood.Stan_k1 ? Number(mergedGood.Stan_k1).toFixed(4) : "0.0000";
            const vatValue = (Number(mergedGood.Pvat) === 22 ? 23 : Number(mergedGood.Pvat));
            const cenaNetto = (Number(mergedGood.Cena_1) / (1 + vatValue / 100)).toFixed(4);
            const cenaBrutto = Number(mergedGood.Cena_1).toFixed(4);
            const stawkaVat = vatValue.toFixed(4);
            const wartNetto = (Number(mergedGood.Cena_1) * Number(ilosc) / (1 + vatValue / 100)).toFixed(4);
            const wartVat = (Number(wartNetto) * vatValue / 100).toFixed(4);
            const wartBrutto = (Number(mergedGood.Cena_1) * Number(ilosc)).toFixed(4);

            lines.push(`${counter},${typ},${kod},0,0,0,0,0.0000,0.0000,${jednMiary},${ilosc},${ilosc},0.0000,${cenaNetto},${cenaBrutto},${stawkaVat},${wartNetto},${wartVat},${wartBrutto},${wartNetto},,`);
        }

        for (const mergedGood of this.mergedGoods) {
            const typ = 1; //typ towaru: 1 = towar, 2 = usługa,
            const symbol = this.clearText(mergedGood.Symbol as string);
            const kod = `"${symbol}"`;
            const kodTowProducenta = "";
            const kodKreskowy = "";
            if (mergedGood.Opis === null || mergedGood.Opis === undefined) {
                mergedGood.Opis = kod;
            }
            const descriptionOfGood = this.clearText(mergedGood.Opis as string);
            const nazwa = descriptionOfGood ? `"${descriptionOfGood}"` : "";
            const opisTowaru: string = nazwa; //opis towaru - opis towaru w systemie Subiekt GT
            const nazwaFisk: string = nazwa; //nazwa fiskalna towaru - nazwa towaru używana w dokumentach fiskalnych
            const symbolSWW = "";
            const symbolPKWIU = mergedGood.Pkwiu ? `"${mergedGood.Pkwiu}"` : ``;
            const jm = (mergedGood.Jm?.toString())?.toLowerCase() ?? "";
            const jednMiary = jm.includes("sz") ? `"szt."` : `"${jm}"`;
            // if (!jednMiary.includes("szt.")) console.log(`Jednostka miary is szt.: ${jednMiary} - ${mergedGood.Nrid}`);
            const vatValue = (Number(mergedGood.Pvat) === 22 ? 23 : Number(mergedGood.Pvat));
            const symbVat = `"${vatValue}"`;
            const stawkaVat = vatValue.toFixed(4);
            const cenaZNetto = `0.0000`;
            const cenaWalutowa = `0.0000`;

            lines.push(`${typ},${kod},${kodTowProducenta},${kodKreskowy},${nazwa},${opisTowaru},${nazwaFisk},${symbolSWW},${symbolPKWIU},${jednMiary},${symbVat},${stawkaVat},${symbVat},${stawkaVat},${cenaZNetto},${cenaWalutowa},,0,,,,0.0000,0,,,0,${jednMiary},0.0000,0.0000,,0,,0,0,,,,,,,,`);
        }

        await this.generatePricesInEPP(lines, mergedGoodsData);

        console.log('Merged goods data by lines for PW:', lines);
        this.downloadEPP(lines, 'pw.epp');
    }

    //TODO: Old version widthout chunking, can be removed after testing
    // public convertMergedGoodsToEpp(mergedGoodsData: Array<Item>) {
    //     this.mergedGoods = mergedGoodsData;
    //     const lines: string[] = [];

    //     // Sekcja nagłówkowa  "1.05",3,1250,,,,,,,,,,,,,0,,,,20260122170115,,"PL","PL0000000000",1
    //     lines.push("[INFO]");
    //     lines.push(`"1.11",3,1250,"Subiekt GT","SKLEP_BRODA","sklep_broda_test","Sklep Broda tesy",,,,"6550011383","MAG","Główny","Magazyn główny",,0,,,"Szef",20260819165547,"Polska","PL","6550011383",1`);
    //     lines.push("");
    //     lines.push("[NAGLOWEK]");
    //     lines.push(`"TOWARY"`);
    //     lines.push("");
    //     lines.push("[ZAWARTOSC]");

    //     console.log('Merged goods data:', this.mergedGoods);

    //     for (const mergedGood of this.mergedGoods) {
    //         const typ = 1; //typ towaru: 1 = towar, 2 = usługa,
    //         const symbol = this.clearText(mergedGood.Symbol as string);
    //         const kod = `"${symbol}"`;
    //         const kodTowProducenta = "";
    //         const kodKreskowy = "";
    //         if (mergedGood.Opis === null || mergedGood.Opis === undefined) {
    //             mergedGood.Opis = kod;
    //         }
    //         const descriptionOfGood = this.clearText(mergedGood.Opis as string);
    //         const nazwa = descriptionOfGood ? `"${descriptionOfGood}"` : "";
    //         const opisTowaru: string = nazwa; //opis towaru - opis towaru w systemie Subiekt GT
    //         const nazwaFisk: string = nazwa; //nazwa fiskalna towaru - nazwa towaru używana w dokumentach fiskalnych
    //         const symbolSWW = "";
    //         const symbolPKWIU = mergedGood.Pkwiu ? `"${mergedGood.Pkwiu}"` : ``;
    //         const jm = (mergedGood.Jm?.toString())?.toLowerCase() ?? "";
    //         const jednMiary = jm.includes("sz") ? `"szt."` : `"${jm}"`;
    //         // if (!jednMiary.includes("szt.")) console.log(`Jednostka miary is szt.: ${jednMiary} - ${mergedGood.Nrid}`);
    //         const vatValue = (Number(mergedGood.Pvat) === 22 ? 23 : Number(mergedGood.Pvat));
    //         const symbVat = `"${vatValue}"`;
    //         const stawkaVat = vatValue.toFixed(4);
    //         const cenaZNetto = `0.0000`;
    //         const cenaWalutowa = `0.0000`;

    //         lines.push(`${typ},${kod},${kodTowProducenta},${kodKreskowy},${nazwa},${opisTowaru},${nazwaFisk},${symbolSWW},${symbolPKWIU},${jednMiary},${symbVat},${stawkaVat},${symbVat},${stawkaVat},${cenaZNetto},${cenaWalutowa},,0,,,,0.0000,0,,,0,${jednMiary},0.0000,0.0000,,0,,0,0,,,,,,,,`);
    //     }

    //     this.generatePricesInEPP(lines, mergedGoodsData);

    //     console.log('Merged goods data by lines:', lines);
    //     this.downloadEPP(lines, 'towary.epp');
    // }
}