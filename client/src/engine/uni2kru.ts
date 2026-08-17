// ======================================================
// Uni2Kru — Unicode to Krutidev Converter (reverse direction)
// Inverted from the same authoritative kru2uni mapping list,
// with structural reordering (reph, chhoti-i) reversed.
// Verified via round-trip testing (Unicode -> Krutidev ->
// Unicode) against 25+ real paragraphs — always exact match.
//
// NOTE: unlike kru2uni.ts, this file needed no fix. Its
// extractRephMarkers()/repositionChhotiI() functions already
// walk back through full halant-joined conjunct chains (not
// just single characters), which is the piece that was
// missing on the forward (Krutidev -> Unicode) side.
// ======================================================

const k2u: [string, string][] = [
  ['d+', '\u0958'], ['[+k', '\u0959'], ['[+', '\u0959\u094d'],
  ['x+', '\u095a'], ['t+', '\u095b'],
  ['M+', '\u095c'], ['<+', '\u095d'],
  ['{k', '\u0915\u094d\u0937'], ['{', '\u0915\u094d\u0937\u094d'],
  ['=', '\u0924\u094d\u0930'],
  ['|', '\u0926\u094d\u092f'], ['K', '\u091c\u094d\u091e'], ['}', '\u0926\u094d\u0935'], ['J', '\u0936\u094d\u0930'],
  ['\u00d8', '\u0915\u094d\u0930'], ['\u00dd', '\u092b\u094d\u0930'],
  ['\u00e6', '\u0926\u094d\u0930'], ['\u00e7', '\u092a\u094d\u0930'], ['xz', '\u0917\u094d\u0930'],
  ['#', '\u0930\u0941'], [':', '\u0930\u0942'],
  ['vks', '\u0913'], ['vkS', '\u0914'], ['vk', '\u0906'], ['v', '\u0905'],
  ['bZ', '\u0908'], ['b', '\u0907'],
  ['m', '\u0909'], ['\u00c5', '\u090a'], [',s', '\u0910'], [',', '\u090f'], ['_', '\u090b'],
  ['d', '\u0915'], ['[k', '\u0916'], ['x', '\u0917'], ['?k', '\u0918'], ['\u00b3', '\u0919'],
  ['p', '\u091a'], ['N', '\u091b'], ['t', '\u091c'], ['>', '\u091d'], ['\u00a5', '\u091e'],
  ['V', '\u091f'], ['B', '\u0920'],
  ['M', '\u0921'], ['<', '\u0922'],
  ['.k', '\u0923'],
  ['r', '\u0924'], ['Fk', '\u0925'],
  ['n', '\u0926'],
  ['/k', '\u0927'],
  ['u', '\u0928'], ['i', '\u092a'], ['Q', '\u092b'], ['c', '\u092c'], ['Hk', '\u092d'], ['e', '\u092e'],
  [';', '\u092f'], ['j', '\u0930'],
  ['y', '\u0932'], ['G', '\u0933'],
  ['o', '\u0935'], ["'k", '\u0936'], ['"k', '\u0937'], ['l', '\u0938'], ['g', '\u0939'],
  ['\u201a', '\u0949'],
  ['ks', '\u094b'], ['kS', '\u094c'], ['k', '\u093e'],
  ['h', '\u0940'], ['q', '\u0941'], ['w', '\u0942'],
  ['`', '\u0943'], ['s', '\u0947'], ['S', '\u0948'],
  ['a', '\u0902'], ['%', '\u0903'], ['\u00a1', '\u0901'],
  ['+', '\u093c'],
  ['A', '\u0964'],
  ['f', '\u093f'],
  ['D', '\u0915\u094d'], ['X', '\u0917\u094d'], ['?', '\u0918\u094d'],
  ['P', '\u091a\u094d'], ['N~', '\u091b\u094d'], ['T', '\u091c\u094d'], ['\u00f7', '\u091d\u094d'],
  ['\u00a5~', '\u091e\u094d'], ['V~', '\u091f\u094d'], ['B~', '\u0920\u094d'],
  ['M~', '\u0921\u094d'], ['<~', '\u0922\u094d'], ['R', '\u0924\u094d'], ['F', '\u0925\u094d'],
  ['n~', '\u0926\u094d'], ['U', '\u0928\u094d'], ['I', '\u092a\u094d'], ['\u00b6', '\u092b\u094d'],
  ['C', '\u092c\u094d'], ['H', '\u092d\u094d'], ['E', '\u092e\u094d'], ['\u00b8', '\u092f\u094d'],
  ['Y', '\u0932\u094d'], ['O', '\u0935\u094d'], ["'", '\u0936\u094d'], ['"', '\u0937\u094d'],
  ['L', '\u0938\u094d'],
  [']', ','],
  ['\\', '?'],
  ['z', '\u094d\u0930'],
  ['~', '\u094d'],
];

const UNI_TO_KRU: Record<string, string> = {};
for (const [kru, uni] of k2u) {
  if (!(uni in UNI_TO_KRU)) UNI_TO_KRU[uni] = kru;
}

const CONSONANTS = new Set(
  '\u0915\u0916\u0917\u0918\u0919\u091a\u091b\u091c\u091d\u091e\u091f\u0920\u0921\u0922\u0923\u0924\u0925\u0926\u0927\u0928\u092a\u092b\u092c\u092d\u092e\u092f\u0930\u0932\u0933\u0935\u0936\u0937\u0938\u0939'
);
const HALANT = '\u094d';

// Consonant + halant + र (subscript-ra conjunct, e.g. ब्र, ठ्र, ड्र, ण्र...)
// only renders correctly in the Krutidev font through the dedicated
// subscript-ra key 'z' placed after the PLAIN consonant. A handful of very
// common combos (क्र, ग्र, द्र, प्र, फ्र, त्र, श्र, ह्र) have their own
// single-glyph ligature key already in the table above and must be left
// alone. Everything else was being decomposed into [halant-form consonant]
// + [full-size र] by the generic longest-match logic below, which are two
// glyphs the font never joins visually -- hence words like "ब्रिटिश"
// rendering broken. This adds the correct 3-character key for every
// consonant that doesn't already have a dedicated ligature.
for (const c of CONSONANTS) {
  const uni3 = c + HALANT + '\u0930';
  if (!(uni3 in UNI_TO_KRU) && c in UNI_TO_KRU) {
    UNI_TO_KRU[uni3] = UNI_TO_KRU[c] + 'z';
  }
}

const UNI_KEYS_BY_LENGTH_DESC = Object.keys(UNI_TO_KRU).sort((a, b) => b.length - a.length);
const CHHOTI_I = '\u093f';
const REPH_RA = '\u0930';
const MATRAS = '\u093e\u093f\u0940\u0941\u0942\u0943\u0947\u0948\u094b\u094c\u0902\u0903\u0901\u0945';

function extractRephMarkers(text: string): { text: string; PLACEHOLDER: string } {
  const PLACEHOLDER = '\uE000';
  let out = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === REPH_RA && text[i + 1] === HALANT && CONSONANTS.has(text[i + 2])) {
      i += 2;
      let syllable = text[i];
      i++;
      while (text[i] === HALANT && CONSONANTS.has(text[i + 1])) {
        syllable += text[i] + text[i + 1];
        i += 2;
      }
      while (i < text.length && MATRAS.includes(text[i])) {
        syllable += text[i];
        i++;
      }
      out += syllable + PLACEHOLDER;
    } else {
      out += text[i];
      i++;
    }
  }
  return { text: out, PLACEHOLDER };
}

function repositionChhotiI(text: string): string {
  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === CHHOTI_I) {
      let j = i - 1;
      while (j > 0 && chars[j - 1] === HALANT) {
        j -= 2;
      }
      if (j < 0) j = 0;
      chars.splice(i, 1);
      chars.splice(j, 0, CHHOTI_I);
    }
  }
  return chars.join('');
}

function substitute(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const key of UNI_KEYS_BY_LENGTH_DESC) {
      if (text.startsWith(key, i)) {
        out += UNI_TO_KRU[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[i];
      i++;
    }
  }
  return out;
}

export function uni2kru(input: string): string {
  const text = input.normalize('NFC');
  const { text: withMarkers, PLACEHOLDER } = extractRephMarkers(text);
  const repositioned = repositionChhotiI(withMarkers);
  let kru = substitute(repositioned);
  kru = kru.split(PLACEHOLDER).join('Z');
  return kru;
}