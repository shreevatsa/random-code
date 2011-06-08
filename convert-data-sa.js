var virama = '्';
var implicita = 'अ';

var barematras = {
  'sk' : ['', 'ा', 'ि', 'ी', 'ु', 'ू',
          'ृ', 'ॄ', 'ॢ', 'ॣ',
          'े', 'ै',
          'ो', 'ौ',
          'ं', 'ः',
          '।', '॥']
};

var vowels = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ',
              'ऋ', 'ॠ', 'ऌ', 'ॡ',
              'ए', 'ऐ', 'ओ', 'औ',
              'ं', 'ः',
              '।', '॥'];

var consonants = ['क', 'ख', 'ग', 'घ', 'ङ',
                  'च', 'छ', 'ज', 'झ', 'ञ',
                  'ट', 'ठ', 'ड', 'ढ', 'ण',
                  'त', 'थ', 'द', 'ध', 'न',
                  'प', 'फ', 'ब', 'भ', 'म',
                  'य', 'र', 'ल', 'व',
                  'श', 'ष', 'स', 'ह'];

var alphabets = {

  'sk': vowels.concat(consonants),

'harvardkyoto':['a', 'A', 'i', 'I', 'u', 'U',
              'R', 'RR', 'lR', 'lRR',
              'e', 'ai', 'o', 'au',
              'M', 'H',
              '|', '||',

              'k', 'kh', 'g', 'gh', 'G',
              'c', 'ch', 'j', 'jh', 'J',
              'T', 'Th', 'D', 'Dh', 'N',
              't', 'th', 'd', 'dh', 'n',
              'p', 'ph', 'b', 'bh', 'm',
              'y', 'r', 'l', 'v',
              'z', 'S', 's', 'h'],

'itrans':     ['a', ['aa','A'], 'i', ['ii','I'], 'u', ['uu','U'],
              ['RRi','R^i'], ['RRI','R^I'], ['LLi','L^i'], ['LLI','L^I'],
              'e', 'ai', 'o', 'au',
              'M', 'H',
              '|', '||',

              'k', 'kh', 'g', 'gh', ['~N','N^'],
              'ch', 'Ch', 'j', 'jh', ['~n','JN'],
              'T', 'Th', 'D', 'Dh', 'N',
              't', 'th', 'd', 'dh', 'n',
              'p', 'ph', 'b', 'bh', 'm',
              'y', 'r', 'l', ['v','w'],
              'sh', 'Sh', 's', 'h'],

'velthuis':   ['a', 'aa', 'i', 'ii', 'u', 'uu',
              '.r', '.rr', '.l', '.ll',
              'e', 'ai', 'o', 'au',
              '.m', '.h',
               '|', '||',

              'k', 'kh', 'g', 'gh', '"n',
              'c', 'ch', 'j', 'jh', '~n',
              '.t', '.th', '.d', '.dh', '.n',
              't', 'th', 'd', 'dh', 'n',
              'p', 'ph', 'b', 'bh', 'm',
              'y', 'r', 'l', 'v',
               '"s', '.s', 's', 'h'],

'iast':          ['a', 'ā', 'i', 'ī', 'u', 'ū',
                'ṛ', 'ṝ', 'ḷ', 'ḹ',
                'e', 'ai', 'o', 'au',
                'ṃ', 'ḥ',
                '|', '||',

                'k', 'kh', 'g', 'gh', 'ṅ',
                'c', 'ch', 'j', 'jh', 'ñ',
                'ṭ', 'ṭh', 'ḍ', 'ḍh', 'ṇ',
                't', 'th', 'd', 'dh', 'n',
                'p', 'ph', 'b', 'bh', 'm',
                'y', 'r', 'l', 'v',
                'ś', 'ṣ', 's', 'h'],

'IAST':          ['A', 'Ā', 'I', 'Ī', 'U', 'Ū',
                'Ṛ', 'Ṝ', 'Ḷ', 'Ḹ',
                'E', 'Ai', 'O', 'Au',
                'Ṃ', 'Ḥ',
                '|', '||',

                'K', 'Kh', 'G', 'Gh', 'Ṅ',
                'C', 'Ch', 'J', 'Jh', 'Ñ',
                'Ṭ', 'Ṭh', 'Ḍ', 'Ḍh', 'Ṇ',
                'T', 'Th', 'D', 'Dh', 'N',
                'P', 'Ph', 'B', 'Bh', 'M',
                'Y', 'R', 'L', 'V',
                'Ś', 'Ṣ', 'S', 'H'],

'kannada':       ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ',
                  'ಋ', 'ೠ', 'ಌ', 'ೡ',
                  'ಏ', 'ಐ', 'ಓ', 'ಔ',
                  'ಂ', 'ಃ',

                  'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ',
                  'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ',
                  'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
                  'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ',
                  'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ',
                  'ಯ', 'ರ', 'ಲ', 'ವ',
                  'ಶ', 'ಷ', 'ಸ', 'ಹ'],

'ipa':           ['ɐ', 'ɑː', 'i', 'iː', 'u', 'uː',
                  'ɻ', 'ɻː', 'ɭ', 'ɭː',
                  'eː', 'əi', 'oː', 'əu',
                  '[anusvara]', '[visarga]',
                  '[danda]', '[ddanda]',

                  'k', 'kʰ', 'g', 'gʱ', 'ŋ',
                  //'c͡ç', 'c͡çʰ', 'ɟ͡ʝ', 'ɟ͡ʝʱ', 'ɲ',
                  'c', 'cʰ', 'ɟ', 'ɟʱ', 'ɲ',
                  'ʈ', 'ʈʰ', 'ɖ', 'ɖʱ', 'ɳ',
                  't̪', 't̪ʰ', 'd̪', 'd̪ʱ', 'n̪',
                  'p', 'pʰ', 'b', 'bʱ', 'm',

                  'j', 'r', 'l', 'ʋ',
                  'ɕ', 'ʂ', 's̪', 'ɦ']
};
