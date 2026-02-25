import type { Item } from "./Types";

export class ToJsonTools {
    
    private goods: Array<Item> | undefined;
    private names: Array<Item> | undefined;

    public async addGoods(selectedFile: File) {
        const goodsContent = await this.addContent(selectedFile);
        const blocksOfGoods = goodsContent.trim().split(/\n\s*\n/);

        console.log(`Found ${blocksOfGoods.length} blocks.`);
        this.goods = this.getGoods(blocksOfGoods);
        console.log('Parsed goods:', this.goods);
    }

    public async addNames(selectedFile: File) {
        const namesContent = await this.addContent(selectedFile);
        const blocksOfNames = namesContent.trim().split(/\n\s*\n/);

        console.log(`Found ${blocksOfNames.length} blocks.`);
        this.names = this.getGoods(blocksOfNames);
        console.log('Parsed names:', this.names);
    }

    public mergeGoodsAndNames() {
     
        
        this.goods?.forEach((good) => {

            if (good.Nrid ==="024540") {
                console.log('Good with Nrid 024540:', good);
            }


            // const matchingName = this.names?.find(name => name.Nrid === good.Nrid);
        });

        debugger;



    }

    private getGoods(blocksOfGoods: Array<string>): Array<Item> {
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