import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { getColourFromUserId, md5Bytes } from '../mobileColour.js';

/**
 * Reference implementation mirroring AppApiCommon.GetColourFromUserID():
 * MD5 the user id, then (hash[3] << 8) | hash[4].
 * @param {string} userId
 * @returns {number}
 */
function referenceColour(userId) {
    const hash = createHash('md5').update(userId, 'utf8').digest();
    return (hash[3] << 8) | hash[4];
}

describe('md5Bytes', () => {
    it.each([
        '',
        'a',
        'abc',
        'usr_9d73bff9-4543-4b6f-a004-9e257869ff50',
        // 56-64 byte inputs cross the MD5 padding block boundary
        'x'.repeat(55),
        'x'.repeat(56),
        'x'.repeat(63),
        'x'.repeat(64),
        'x'.repeat(65),
        'マルチバイト文字のユーザー名テスト'
    ])('matches node:crypto MD5 for %j', (input) => {
        const expected = createHash('md5').update(input, 'utf8').digest('hex');
        const actual = Buffer.from(md5Bytes(input)).toString('hex');
        expect(actual).toBe(expected);
    });
});

describe('getColourFromUserId', () => {
    it('matches the C# AppApiCommon.GetColourFromUserID algorithm', () => {
        const userIds = [
            'usr_9d73bff9-4543-4b6f-a004-9e257869ff50',
            'usr_00000000-0000-0000-0000-000000000000',
            'usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469'
        ];
        for (const userId of userIds) {
            expect(getColourFromUserId(userId)).toBe(referenceColour(userId));
        }
    });

    it('returns a hue in the 0-65535 range', () => {
        const hue = getColourFromUserId('usr_test');
        expect(hue).toBeGreaterThanOrEqual(0);
        expect(hue).toBeLessThanOrEqual(65535);
    });
});
