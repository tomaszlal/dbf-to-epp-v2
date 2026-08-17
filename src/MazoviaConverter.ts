export class MazoviaConverter {
    // Static map bajts Mazoviia on Unicode
    private static readonly toUnicodeMap: Record<number, number> = {
        0x8F: 'Ą'.charCodeAt(0), 0x95: 'Ć'.charCodeAt(0), 0x90: 'Ę'.charCodeAt(0),
        0x9C: 'Ł'.charCodeAt(0), 0xA5: 'Ń'.charCodeAt(0), 0xA3: 'Ó'.charCodeAt(0),
        0x98: 'Ś'.charCodeAt(0), 0xA0: 'Ź'.charCodeAt(0), 0xA1: 'Ż'.charCodeAt(0),
        0x86: 'ą'.charCodeAt(0), 0x8D: 'ć'.charCodeAt(0), 0x91: 'ę'.charCodeAt(0),
        0x92: 'ł'.charCodeAt(0), 0xA4: 'ń'.charCodeAt(0), 0xA2: 'ó'.charCodeAt(0),
        0x9E: 'ś'.charCodeAt(0), 0xA6: 'ź'.charCodeAt(0), 0xA7: 'ż'.charCodeAt(0)
    };

    //TODO: to delete, this is not needed anymore, we are converting to UTF-8 only
    private static readonly mazoviaToWin1250Map: Record<number, number> = {
        0x8F: 0xA1, // Ą
        0x95: 0xC6, // Ć
        0x90: 0xCA, // Ę
        0x9C: 0xC8, // Ł
        0xA5: 0xD1, // Ń
        0xA3: 0xD3, // Ó
        0x98: 0xA6, // Ś
        0xA0: 0xAC, // Ź
        0xA1: 0xAF, // Ż
        0x86: 0xB1, // ą
        0x8D: 0xE6, // ć
        0x91: 0xEA, // ę
        0x92: 0xB8, // ł
        0xA4: 0xF1, // ń
        0xA2: 0xF3, // ó
        0x9E: 0xB6, // ś
        0xA6: 0xBC, // ź
        0xA7: 0xBF  // ż
    };

    public static async convertFileToUtf8(inputFile: File): Promise<File> {
        const arrayBuffer = await inputFile.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer)
        const text = this.decode(buffer);

        //TODO: to delete, this is not needed anymore, we are converting to UTF-8 only
        // const copy = new Uint8Array(text.byteLength);
        // copy.set(text);
        // const arrayBufferPart = copy.buffer;

        return new File([text], inputFile.name, {
            type: inputFile.type || 'text/plain;charset=utf-8',
            lastModified: Date.now()
        });
    }

    public static decode(buffer: Uint8Array):string {
        const result: Array<string> = [];
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            // Jeśli bajt to polski znak, weź kod Unicode. W innym wypadku zachowaj ASCII.
            result.push(String.fromCharCode(this.toUnicodeMap[byte] ?? byte));
        }

        return result.join('');

        //TODO: to delete, this is not needed anymore, we are converting to UTF-8 only
        // const result = new Uint8Array(buffer.length);
        // for (let i = 0; i < buffer.length; i++) {
        //     const byte = buffer[i];
        //     // Podmień bajt na odpowiednik z Windows-1250 lub pozostaw bez zmian (ASCII)
        //     result[i] = this.mazoviaToWin1250Map[byte] ?? byte;
        // }
        // return result;
    }
}