import { JsonToEpp } from "./JsonToEpp";
import { MazoviaConverter } from "./MazoviaConverter";
import type { Item } from "./Types";

export class JsonTools {

    private goods: Array<Item> | undefined;
    private names: Array<Item> | undefined;
    private mergedGoodsData: Array<Item> | undefined;
    private contractors: Array<Item> | undefined;
    private jsonToEpp: JsonToEpp | undefined;

    constructor() {
        this.jsonToEpp = new JsonToEpp();
    }


    public async addGoods(selectedFile: File) {
        const goodsContent = await this.addContent(selectedFile);
        const blocksOfGoods = goodsContent.trim().split(/\n\s*\n/);

        console.log(`Found ${blocksOfGoods.length} blocks.`);
        this.goods = this.getDataFromDbf(blocksOfGoods);
        console.log('Parsed goods:', this.goods);
    }

    public async addNames(selectedFile: File) {
        const namesContent = await this.addContent(selectedFile);
        const blocksOfNames = namesContent.trim().split(/\n\s*\n/);

        console.log(`Found ${blocksOfNames.length} blocks.`);
        this.names = this.getDataFromDbf(blocksOfNames);
        console.log('Parsed names:', this.names);
    }

    public async addContractors(selectedFile: File) {
        // MazoviaConverter.convertFileToUtf8 is a static method
        const convertedFile = await MazoviaConverter.convertFileToUtf8(selectedFile);

        const contractorsContent = await this.addContent(convertedFile);
        const blocksOfContractors = contractorsContent.trim().split(/\n\s*\n/);

        console.log(`Found ${blocksOfContractors.length} blocks.`);
        this.contractors = this.getDataFromDbf(blocksOfContractors);
        console.log('Parsed contractors:', this.contractors);

        this.jsonToEpp?.convertContractorsToEpp(this.contractors);
    }

    public mergeGoodsAndNames() {
        const nrId: string = "004819";
        const nameOfGood: string = "OLEJ TRAWOL 1LX";

        this.goods?.forEach((good) => {
            if (good.Nrid === nrId) {
                console.log(`Good with Nrid ${nrId}:`, good);
            }
        });

        this.names?.forEach((name) => {
            if (name.Nrid === nrId) {
                console.log(`Name with Nrid ${nrId}:`, name);
            }
        });

        this.names?.forEach(name => {
            if (name.Symbol === nameOfGood) {
                console.log(`Name with Symbol ${nameOfGood}:`, name);
            }
        });

        this.mergedGoodsData = [];
        let i = 0;
        this.names?.forEach(name => {
            const matchingGoods = this.goods?.filter(good => good.Nrid === name.Nrid) || [];
            if (matchingGoods.length > 0) {
                const newItem: Item = { ...matchingGoods[0], ...name };
                if (matchingGoods && matchingGoods.length > 1) {
                    for (let i = 1; i < matchingGoods.length; i++) {
                        const good = matchingGoods[i];
                        const lastStan_a = newItem.Stan_a || 0;
                        Object.assign(newItem, good);
                        newItem.Stan_a = lastStan_a + (good.Stan_a || 0);
                    }
                }
                this.mergedGoodsData?.push(newItem);
            }
            i++;
            if (i % 1000 === 0) {
                console.log(`Processed ${i} names...`);
            }

        });
        console.log(`Processed ${i} names in total.`);
        console.log('Merged goods data:', this.mergedGoodsData);
        this.saveMergedDataToJsonBrowser();
    }

    public saveMergedDataToJsonBrowser(fileName: string = 'mergedGoodsData.json'): void {
        if (!this.mergedGoodsData || this.mergedGoodsData.length === 0) {
            console.warn('Brak danych w mergedGoodsData do pobrania.');
            return;
        }

        const jsonData = JSON.stringify(this.mergedGoodsData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(url);
        console.log(`Wygenerowano pobieranie pliku: ${fileName}`);
    }

    findGoodsBySymbol(symbol: string) {
        if (!this.mergedGoodsData) return [];
        const searchPhrase = symbol.toLowerCase();
        // Zwraca wszystkie elementy, które zawierają wpisany ciąg w Symbolu
        return this.mergedGoodsData.filter((item: any) =>
            item.Symbol?.toString().toLowerCase().includes(searchPhrase)
        );
    }

    private getDataFromDbf(blocksOfGoods: Array<string>): Array<Item> {
        return blocksOfGoods.map(block => {
            const item: Item = {};
            const lines = block.split('\n');
            lines.forEach(line => {
                const separatorIndex = line.indexOf(':');
                if (separatorIndex === -1) return;

                let key = line.substring(0, separatorIndex).trim();
                if (key.includes(' ')) {
                    key = key.replace(/\s/g, '_');
                }
                const value = line.substring(separatorIndex + 1).trim();

                if (key) {
                    if (value === '') {
                        item[key] = null;
                    } else if (key === 'Nrid') {
                        // Nrid this must be a string, even if it looks like a number
                        item[key] = value;
                    } else if (!isNaN(Number(value)) && value !== '') {
                        item[key] = Number(value);
                    } else {
                        item[key] = value;
                    }
                }
            });
            return item;
        });
    }

    public async addContent(goodsFile: File): Promise<string> {
        try {
            const content = await goodsFile.text();
            return content;
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }
}