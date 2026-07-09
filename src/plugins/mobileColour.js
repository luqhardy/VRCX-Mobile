/**
 * Compact MD5 (RFC 1321) returning the 16-byte digest.
 * Replicates the hashing used by AppApiCommon.GetColourFromUserID() in the
 * C# backend so user name colours match the desktop app.
 * @param {string} input
 * @returns {Uint8Array}
 */
function md5Bytes(input) {
    const bytes = new TextEncoder().encode(input);
    const K = new Int32Array(64);
    for (let i = 0; i < 64; i++) {
        K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    }
    // prettier-ignore
    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    const bitLen = bytes.length * 8;
    const paddedLen = (((bytes.length + 8) >> 6) + 1) << 6;
    const buf = new Uint8Array(paddedLen);
    buf.set(bytes);
    buf[bytes.length] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(paddedLen - 8, bitLen >>> 0, true);
    view.setUint32(paddedLen - 4, Math.floor(bitLen / 4294967296), true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const M = new Int32Array(16);
    for (let off = 0; off < paddedLen; off += 64) {
        for (let i = 0; i < 16; i++) {
            M[i] = view.getUint32(off + i * 4, true);
        }
        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;
        for (let i = 0; i < 64; i++) {
            let F, g;
            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }
            F = (F + A + K[i] + M[g]) | 0;
            A = D;
            D = C;
            C = B;
            B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
        }
        a0 = (a0 + A) | 0;
        b0 = (b0 + B) | 0;
        c0 = (c0 + C) | 0;
        d0 = (d0 + D) | 0;
    }
    const out = new Uint8Array(16);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, a0 >>> 0, true);
    outView.setUint32(4, b0 >>> 0, true);
    outView.setUint32(8, c0 >>> 0, true);
    outView.setUint32(12, d0 >>> 0, true);
    return out;
}

/**
 * Port of AppApiCommon.GetColourFromUserID(): hue (0-65535) derived from the
 * MD5 hash of the user id.
 * @param {string} userId
 * @returns {number}
 */
function getColourFromUserId(userId) {
    const hash = md5Bytes(String(userId));
    return (hash[3] << 8) | hash[4];
}

export { getColourFromUserId, md5Bytes };
