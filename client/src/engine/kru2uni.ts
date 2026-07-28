// ======================================================
// Kru2Uni — Krutidev to Unicode Converter
// Based on IIIT-Hyderabad LTRC's open-source kru2uni tool
// (https://github.com/ltrc/kru2uni, GPL-3.0), ported to
// TypeScript and fixed for a reph-placement edge case
// (verified via round-trip testing against our own dataset).
// ======================================================

const k2u: [string, string][] = [
    ['\u00f1', '\u0970'],
    ['Q+Z', 'QZ+'],
    ['sas', 'sa'],
    ['aa', 'a'],
    [')Z', '\u0930\u094d\u0926\u094d\u0927'],
    ['ZZ', 'Z'],
    ['\u2018', '"'], ['\u2019', '"'], ['\u201c', "'"], ['\u201d', "'"],
    ['\u00e5', '\u0966'], ['\u0192', '\u0967'], ['\u201e', '\u0968'], ['\u2026', '\u0969'],
    ['\u2020', '\u096a'], ['\u2021', '\u096b'], ['\u02c6', '\u096c'], ['\u2030', '\u096d'],
    ['\u0160', '\u096e'], ['\u2039', '\u096f'],
    ['\u00b6+', '\u095e\u094d'],
    ['d+', '\u0958'], ['[+k', '\u0959'], ['[+', '\u0959\u094d'],
    ['x+', '\u095a'], ['T+', '\u091c\u093c\u094d'], ['t+', '\u095b'],
    ['M+', '\u095c'], ['<+', '\u095d'], ['Q+', '\u095e'], [';+', '\u095f'],
    ['j+', '\u0931'], ['u+', '\u0929'],
    ['\u00d9k', '\u0924\u094d\u0924'], ['\u00d9', '\u0924\u094d\u0924\u094d'],
    ['\u00e4', '\u0915\u094d\u0924'],
    ['\u2013', '\u0926\u0943'], ['\u2014', '\u0915\u0943'],
    ['\u00e9', '\u0928\u094d\u0928'], ['\u2122', '\u0928\u094d\u0928\u094d'],
    ['=kk', '=k'], ['f=k', 'f='],
    ['\u00e0', '\u0939\u094d\u0928'], ['\u00e1', '\u0939\u094d\u092f'], ['\u00e2', '\u0939\u0943'],
    ['\u00e3', '\u0939\u094d\u092e'], ['\u00baz', '\u0939\u094d\u0930'], ['\u00ba', '\u0939\u094d'],
    ['\u00ed', '\u0926\u094d\u0926'],
    ['{k', '\u0915\u094d\u0937'], ['{', '\u0915\u094d\u0937\u094d'],
    ['=', '\u0924\u094d\u0930'], ['\u00ab', '\u0924\u094d\u0930\u094d'],
    ['N\u00ee', '\u091b\u094d\u092f'], ['V\u00ee', '\u091f\u094d\u092f'], ['B\u00ee', '\u0920\u094d\u092f'],
    ['M\u00ee', '\u0921\u094d\u092f'], ['<\u00ee', '\u0922\u094d\u092f'],
    ['|', '\u0926\u094d\u092f'], ['K', '\u091c\u094d\u091e'], ['}', '\u0926\u094d\u0935'], ['J', '\u0936\u094d\u0930'],
    ['V\u00aa', '\u091f\u094d\u0930'], ['M\u00aa', '\u0921\u094d\u0930'], ['<\u00aa\u00aa', '\u0922\u094d\u0930'],
    ['N\u00aa', '\u091b\u094d\u0930'], ['\u00d8', '\u0915\u094d\u0930'], ['\u00dd', '\u092b\u094d\u0930'],
    ['nzZ', '\u0930\u094d\u0926\u094d\u0930'], ['\u00e6', '\u0926\u094d\u0930'], ['\u00e7', '\u092a\u094d\u0930'],
    ['\u00c1', '\u092a\u094d\u0930'], ['xz', '\u0917\u094d\u0930'],
    ['#', '\u0930\u0941'], [':', '\u0930\u0942'],
    ['v\u201a', '\u0911'], ['vks', '\u0913'], ['vkS', '\u0914'], ['vk', '\u0906'], ['v', '\u0905'],
    ['b\u00b1', '\u0908\u0902'], ['\u00c3', '\u0908'], ['bZ', '\u0908'], ['b', '\u0907'],
    ['m', '\u0909'], ['\u00c5', '\u090a'], [',s', '\u0910'], [',', '\u090f'], ['_', '\u090b'],
    ['\u00f4', '\u0915\u094d\u0915'],
    ['d', '\u0915'], ['Dk', '\u0915'], ['D', '\u0915\u094d'],
    ['[k', '\u0916'], ['[', '\u0916\u094d'],
    ['x', '\u0917'], ['Xk', '\u0917'], ['X', '\u0917\u094d'],
    ['\u00c4', '\u0918'], ['?k', '\u0918'], ['?', '\u0918\u094d'],
    ['\u00b3', '\u0919'],
    ['pkS', '\u091a\u0948'], ['p', '\u091a'], ['Pk', '\u091a'], ['P', '\u091a\u094d'],
    ['N', '\u091b'],
    ['t', '\u091c'], ['Tk', '\u091c'], ['T', '\u091c\u094d'],
    ['>', '\u091d'], ['\u00f7', '\u091d\u094d'],
    ['\u00a5', '\u091e'],
    ['\u00ea', '\u091f\u094d\u091f'], ['\u00eb', '\u091f\u094d\u0920'], ['V', '\u091f'], ['B', '\u0920'],
    ['\u00ec', '\u0921\u094d\u0921'], ['\u00ef', '\u0921\u094d\u0922'],
    ['M+', '\u0921\u093c'], ['<+', '\u0922\u093c'],
    ['M', '\u0921'], ['<', '\u0922'],
    ['.k', '\u0923'], ['.', '\u0923\u094d'],
    ['r', '\u0924'], ['Rk', '\u0924'], ['R', '\u0924\u094d'],
    ['Fk', '\u0925'], ['F', '\u0925\u094d'],
    [')', '\u0926\u094d\u0927'],
    ['n', '\u0926'],
    ['/k', '\u0927'], ['/', '\u0927\u094d'], ['\u00cb', '\u0927\u094d'], ['\u00e8', '\u0927'],
    ['u', '\u0928'], ['Uk', '\u0928'], ['U', '\u0928\u094d'],
    ['i', '\u092a'], ['Ik', '\u092a'], ['I', '\u092a\u094d'],
    ['Q', '\u092b'], ['\u00b6', '\u092b\u094d'],
    ['c', '\u092c'], ['Ck', '\u092c'], ['C', '\u092c\u094d'],
    ['Hk', '\u092d'], ['H', '\u092d\u094d'],
    ['e', '\u092e'], ['Ek', '\u092e'], ['E', '\u092e\u094d'],
    [';', '\u092f'], ['\u00b8', '\u092f\u094d'],
    ['j', '\u0930'],
    ['y', '\u0932'], ['Yk', '\u0932'], ['Y', '\u0932\u094d'],
    ['G', '\u0933'],
    ['o', '\u0935'], ['Ok', '\u0935'], ['O', '\u0935\u094d'],
    ["'k", '\u0936'], ["'", '\u0936\u094d'],
    ['"k', '\u0937'], ['"', '\u0937\u094d'],
    ['l', '\u0938'], ['Lk', '\u0938'], ['L', '\u0938\u094d'],
    ['g', '\u0939'],
    ['\u00c8', '\u0940\u0902'],
    ['saz', '\u094d\u0930\u0947\u0902'], ['z', '\u094d\u0930'],
    ['\u00cc', '\u0926\u094d\u0926'], ['\u00cd', '\u091f\u094d\u091f'], ['\u00ce', '\u091f\u094d\u0920'],
    ['\u00cf', '\u0921\u094d\u0921'], ['\u00d1', '\u0915\u0943'], ['\u00d2', '\u092d'],
    ['\u00d3', '\u094d\u092f'], ['\u00d4', '\u0921\u094d\u0922'], ['\u00d6', '\u091d\u094d'],
    ['\u00d8', '\u0915\u094d\u0930'], ['\u00d9', '\u0924\u094d\u0924\u094d'],
    ['\u00dck', '\u0936'], ['\u00dc', '\u0936\u094d'],
    ['\u201a', '\u0949'],
    ['kas', '\u094b\u0902'], ['ks', '\u094b'], ['kS', '\u094c'],
    ['\u00a1k', "\u093e\u0901'"], ['ak', 'k\u0902'], ['k', '\u093e'],
    ['ah', '\u0940\u0902'], ['h', '\u0940'],
    ['aq', '\u0941\u0902'], ['q', '\u0941'],
    ['aw', '\u0942\u0902'], ['\u00a1w', '\u0942\u0901'], ['w', '\u0942'],
    ['`', '\u0943'], ['\u0300', '\u0943'],
    ['as', '\u0947\u0902'], ['\u00b1s', 's\u00b1'], ['s', '\u0947'],
    ['aS', '\u0948\u0902'], ['S', '\u0948'],
    ['a\u00aa', '\u094d\u0930\u0902'], ['\u00aa', '\u094d\u0930'],
    ['fa', '\u0902f'], ['a', '\u0902'],
    ['\u00a1', '\u0901'],
    ['%', ':'],
    ['W', '\u0945'],
    ['\u2022', '\u093d'], ['\u00b7', '\u093d'], ['\u2219', '\u093d'],
    ['~j', '\u094d\u0930'], ['~', '\u094d'],
    ['\\', '?'],
    ['+', '\u093c'],
    ['^', '\u2018'], ['*', '\u2019'],
    ['\u00de', '\u201c'], ['\u00df', '\u201d'],
    ['(', ';'], ['\u00bc', '('], ['\u00bd', ')'], ['\u00bf', '{'], ['\u00c0', '}'], ['\u00be', '='],
    ['A', '\u0964'],
    ['-', '.'], ['&', '-'], ['&', '\u00b5'],
    ['\u03bc', '-'], ['\u0152', '\u0970'],
    [']', ','],
    ['~ ', '\u094d '],
    ['@', '/'],
    ['\u00ae', '\u0948\u0902'],
  ];
  
  const unicode_vowel_signs = [
    '\u0905','\u0906','\u0907','\u0908','\u0909','\u090a','\u090f','\u0910','\u0913','\u0914',
    '\u093e','\u093f','\u0940','\u0941','\u0942','\u0943','\u0947','\u0948','\u094b','\u094c',
    '\u0902','\u0903','\u0901','\u0945',
  ];
  const unicode_unattached_vowel_signs = [
    '\u093e','\u093f','\u0940','\u0941','\u0942','\u0943','\u0947','\u0948','\u094b','\u094c',
    '\u0902','\u0903','\u0901','\u0945',
  ];
  const krutidev_consonants = [
    'd','[k','x','?k','\u00b3','p','N','t','>','\u00a5','V','B','M','<','.k','r','Fk','n','/k','u','u',
    'i','Q','c','Hk','e',';','j','j','y','G','\u0934','o',"'k",'"k','l','g',
    'd','[k','x','t','M+','<+','Q',';',
    'D','[','X','?','\u00b3~','P','N~','T','\u00f7','\u00a5~','V~','B~','M~','<~','.','R','F','n~','/','\u00cb','\u00e8',
    'U','I','\u00b6','C','H','E','\u00b8','Z','Y','O',"'","\u00dc",'"','L','\u00ba',
  ];
  const krutidev_unattached_vowel_signs = ['k','f','h','q','w','`','s','S','ks','kS','a','%','\u00a1','W'];
  
  export function kru2uni(input: string): string {
    let kruText = input;
    kruText = kruText.replace(/ \u00aa/g, '\u00aa');
    kruText = kruText.replace(/ ~j/g, '~j');
    kruText = kruText.replace(/ z/g, 'z');
  
    // – / — not followed by krutidev consonant/matra -> '&'
    {
      let out = '';
      for (let i = 0; i < kruText.length; i++) {
        const ch = kruText[i];
        if ((ch === '\u2014' || ch === '\u2013') && i < kruText.length - 1) {
          const nextCh = kruText[i + 1];
          if (!krutidev_consonants.includes(nextCh) && !krutidev_unattached_vowel_signs.includes(nextCh)) {
            out += '&';
            continue;
          }
        }
        out += ch;
      }
      kruText = out;
    }
  
    for (const [a, b] of k2u) {
      kruText = kruText.split(a).join(b);
    }
  
    kruText = kruText.split('\u00b1').join('Z\u0902');
    kruText = kruText.split('\u00c6').join('\u0930\u094df');
  
    {
      let m;
      let guard = 0;
      while ((m = kruText.match(/f(.?)/)) && guard < 10000) {
        guard++;
        const misplaced = m[1];
        kruText = kruText.split('f' + misplaced).join(misplaced + '\u093f');
      }
    }
  
    kruText = kruText.split('\u00c7').join('fa');
    kruText = kruText.split('\u00af').join('fa');
    kruText = kruText.split('\u00c9').join('\u0930\u094dfa');
  
    {
      let m;
      let guard = 0;
      while ((m = kruText.match(/fa(.?)/)) && guard < 10000) {
        guard++;
        const misplaced = m[1];
        kruText = kruText.split('fa' + misplaced).join(misplaced + '\u093f\u0902');
      }
    }
  
    kruText = kruText.split('\u00ca').join('\u0940Z');
  
    {
      let m;
      let guard = 0;
      while ((m = kruText.match(/\u093f\u094d(.?)/)) && guard < 10000) {
        guard++;
        const misplaced = m[1];
        kruText = kruText.split('\u093f\u094d' + misplaced).join('\u094d' + misplaced + '\u093f');
      }
    }
  
    kruText = kruText.split('\u094dZ').join('Z');
  
    // reph (Z) repositioning -- FIXED: original algorithm mis-handled the
    // case where Z sits directly after a plain consonant (no matra between).
    // Verified via round-trip testing against our own known-correct dataset.
    {
      let m;
      let guard = 0;
      while ((m = kruText.match(/(.?)Z/)) && guard < 10000) {
        guard++;
        const capturedChar = m[1];
        if (!capturedChar) { kruText = kruText.replace('Z', ''); continue; }
  
        const idxOfCaptured = kruText.indexOf(capturedChar + 'Z');
        let span = capturedChar;
        let i = idxOfCaptured - 1;
  
        if (unicode_vowel_signs.includes(capturedChar)) {
          while (i >= 0 && unicode_vowel_signs.includes(kruText[i])) {
            span = kruText[i] + span;
            i--;
          }
          if (i >= 0) {
            span = kruText[i] + span;
          }
        }
        kruText = kruText.split(span + 'Z').join('\u0930\u094d' + span);
      }
    }
  
    for (const matra of unicode_unattached_vowel_signs) {
      kruText = kruText.split(' ' + matra).join(matra);
      kruText = kruText.split(',' + matra).join(matra + ',');
      kruText = kruText.split('\u094d' + matra).join(matra);
    }
  
    kruText = kruText.split('\u094d\u094d\u0930').join('\u094d\u0930');
    kruText = kruText.split('\u094d\u0930\u094d').join('\u0930\u094d');
    kruText = kruText.split('\u094d\u094d').join('\u094d');
    kruText = kruText.split('\u094d ').join(' ');
  
    return kruText.normalize('NFC');
  }