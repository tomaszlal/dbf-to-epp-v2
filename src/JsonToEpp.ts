import type { Item } from "./Types";

export class JsonToEpp {

    private contractors: Array<Item> | undefined;
    private mergedGoods: Array<Item> | undefined;


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

    public convertMergedGoodsToEpp(mergedGoodsData: Array<Item>) {
        this.mergedGoods = mergedGoodsData;
        const lines: string[] = [];

        // Sekcja nagłówkowa  "1.05",3,1250,,,,,,,,,,,,,0,,,,20260122170115,,"PL","PL0000000000",1
        lines.push("[INFO]");
        lines.push(`"1.05",3,1250,,,,,,,,,,,,,0,,,,20260122170115,,"PL","PL0000000000",1`);
        lines.push("");
        lines.push("[NAGLOWEK]");
        lines.push(`"TOWARY"`);
        lines.push("");
        lines.push("[ZAWARTOSC]");

        console.log('Merged goods data:', this.mergedGoods);

        for (const mergedGood of this.mergedGoods) {
            const typ = 1; //typ towaru: 1 = towar, 2 = usługa,
            // const typ = mergedGood.Rodzaj === "T" ? 1 : 2; //typ towaru: 1 = towar, 2 = usługa,
            // if (typ === 2) console.log(`Processing merged good: ${mergedGood.Symbol} - ${mergedGood.Nrid}`);
            const kod = mergedGood.Symbol ? `"${mergedGood.Symbol}"` : "";
            const kodTowProducenta = "";
            const kodKreskowy = "";
            const nazwa = mergedGood.Opis ? `"${mergedGood.Opis}"` : "";
            const opis: string = nazwa;
            const nazwaFisk: string = nazwa;
            const symbolSWW = `""`;
            const symbolPKWIU = mergedGood.Pkwiu ? `"${mergedGood.Pkwiu}"` : `""`;
            const jednMiary = mergedGood.Jm ? `"${mergedGood.Jm}"` : `""`;
            const symbVat = mergedGood.Pvat ? `"${mergedGood.Pvat}"` : `""`;
            const stawkaVat = Number(mergedGood.Pvat).toFixed(4);



            lines.push(`${typ},${kod},${kodTowProducenta},${kodKreskowy},${nazwa},${opis},${nazwaFisk},${symbolSWW},${symbolPKWIU},${jednMiary},${symbVat},${stawkaVat},${symbVat},${stawkaVat}`);
        }

        console.log('Merged goods data by lines:', lines);
    }
}