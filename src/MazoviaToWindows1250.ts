export class MazoviaToWindows1250Converter {
    // Mapa bajtów Mazovia -> kody Unicode
    private static readonly mazoviaToUnicodeMap: Record<number, number> = {
        0x8F: 'Ą'.charCodeAt(0), 0x95: 'Ć'.charCodeAt(0), 0x90: 'Ę'.charCodeAt(0),
        0x9C: 'Ł'.charCodeAt(0), 0xA5: 'Ń'.charCodeAt(0), 0xA3: 'Ó'.charCodeAt(0),
        0x98: 'Ś'.charCodeAt(0), 0xA0: 'Ź'.charCodeAt(0), 0xA1: 'Ż'.charCodeAt(0),
        0x86: 'ą'.charCodeAt(0), 0x8D: 'ć'.charCodeAt(0), 0x91: 'ę'.charCodeAt(0),
        0x92: 'ł'.charCodeAt(0), 0xA4: 'ń'.charCodeAt(0), 0xA2: 'ó'.charCodeAt(0),
        0x9E: 'ś'.charCodeAt(0), 0xA6: 'ź'.charCodeAt(0), 0xA7: 'ż'.charCodeAt(0)
    };

    // Mapa kodów Unicode -> bajty Windows-1250
    private static readonly unicodeToWin1250Map: Record<number, number> = {
        ['Ą'.charCodeAt(0)]: 0xA1, ['Ć'.charCodeAt(0)]: 0xC6, ['Ę'.charCodeAt(0)]: 0xCA,
        ['Ł'.charCodeAt(0)]: 0xC8, ['Ń'.charCodeAt(0)]: 0xD1, ['Ó'.charCodeAt(0)]: 0xD3,
        ['Ś'.charCodeAt(0)]: 0xA6, ['Ź'.charCodeAt(0)]: 0xAC, ['Ż'.charCodeAt(0)]: 0xAF,
        ['ą'.charCodeAt(0)]: 0xB1, ['ć'.charCodeAt(0)]: 0xE6, ['ę'.charCodeAt(0)]: 0xEA,
        ['ł'.charCodeAt(0)]: 0xB8, ['ń'.charCodeAt(0)]: 0xF1, ['ó'.charCodeAt(0)]: 0xF3,
        ['ś'.charCodeAt(0)]: 0xB6, ['ź'.charCodeAt(0)]: 0xBC, ['ż'.charCodeAt(0)]: 0xBF
    };

    public static async convertFileToWindows1250(inputFile: File): Promise<File> {
        const arrayBuffer = await inputFile.arrayBuffer();
        const inputBuffer = new Uint8Array(arrayBuffer);
        
        // 1. Dekoduj bajty Mazovii do bufora bajtów Windows-1250
        const outputBuffer = this.convertMazoviaToWin1250Buffer(inputBuffer);

        // 2. Zwróć plik z właściwym nagłówkiem charset
        return new File([outputBuffer], inputFile.name, {
            type: inputFile.type || 'text/plain;charset=windows-1250',
            lastModified: Date.now()
        });
    }

    public static convertMazoviaToWin1250Buffer(buffer: Uint8Array): Uint8Array {
        const result = new Uint8Array(buffer.length);

        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];

            // Jeśli bajt występuje w Mazovii, pobierz kod Unicode
            const unicodeCharCode = this.mazoviaToUnicodeMap[byte];

            if (unicodeCharCode !== undefined) {
                // Zamień polski kod Unicode na bajt Windows-1250
                result[i] = this.unicodeToWin1250Map[unicodeCharCode] ?? byte;
            } else {
                // Dla standardowego ASCII i pozostałych znaków zachowaj bajt
                result[i] = byte;
            }
        }

        return result;
    }
}