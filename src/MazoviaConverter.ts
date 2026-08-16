export class MazoviaConverter {
    // Statyczna mapa bajtów Mazovii na kody Unicode
    private static readonly toUnicodeMap: Record<number, number> = {
        0x8F: 'Ą'.charCodeAt(0), 0x95: 'Ć'.charCodeAt(0), 0x90: 'Ę'.charCodeAt(0),
        0x9C: 'Ł'.charCodeAt(0), 0xA5: 'Ń'.charCodeAt(0), 0xA3: 'Ó'.charCodeAt(0),
        0x98: 'Ś'.charCodeAt(0), 0xA0: 'Ź'.charCodeAt(0), 0xA1: 'Ż'.charCodeAt(0),
        0x86: 'ą'.charCodeAt(0), 0x8D: 'ć'.charCodeAt(0), 0x91: 'ę'.charCodeAt(0),
        0x92: 'ł'.charCodeAt(0), 0xA4: 'ń'.charCodeAt(0), 0xA2: 'ó'.charCodeAt(0),
        0x9E: 'ś'.charCodeAt(0), 0xA6: 'ź'.charCodeAt(0), 0xA7: 'ż'.charCodeAt(0)
    };

    public static async convertFileToUtf8(inputFile: File): Promise<File> {
        const arrayBuffer = await inputFile.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer)
        const text = this.decode(buffer);

        return new File([text], inputFile.name, {
            type: inputFile.type || 'text/plain;charset=utf-8',
            lastModified: Date.now()
        });
    }

    public static decode(buffer: Uint8Array): string {
        const result: Array<string> = [];
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            // Jeśli bajt to polski znak, weź kod Unicode. W innym wypadku zachowaj ASCII.
            result.push(String.fromCharCode(this.toUnicodeMap[byte] ?? byte));
        }

        return result.join('');
    }
}