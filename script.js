/* =========================================================
   ALL LEARNING HUB
   FINAL SCRIPT.JS
   =========================================================

   FEATURES
   ---------------------------------------------------------
   • English + Hindi
   • Human Body
   • Animals
   • Birds
   • Countries
   • All Country Flags
   • Currency Information
   • States
   • State Foods
   • Festivals
   • National Symbols
   • Seasons
   • Months
   • Days
   • Calendar
   • Languages
   • Numbers 1-100
   • Tables 2-10
   • General Knowledge
   • Food & Vegetables
   • Fruits
   • Vegetables
   • Common Foods
   • Search
   • Listen / Speech
   • Previous / Next
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL
   ========================================================= */

let currentLanguage = "en";
let currentTopic = null;

const homePage = document.getElementById("homePage");
const learningPage = document.getElementById("learningPage");

const backBtn = document.getElementById("backBtn");
const topicIcon = document.getElementById("topicIcon");
const topicTitle = document.getElementById("topicTitle");
const topicSubtitle = document.getElementById("topicSubtitle");
const topicSearch = document.getElementById("topicSearch");
const topicContent = document.getElementById("topicContent");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const searchInput = document.getElementById("searchInput");

const languageBtn =
    document.getElementById("languageBtn") ||
    document.querySelector(".language-btn") ||
    document.querySelector("[data-language]");


/* =========================================================
   TOPIC ORDER
   ========================================================= */

const topicOrder = [
    "humanBody",
    "animals",
    "birds",
    "countries",
    "flags",
    "states",
    "stateFoods",
    "festivals",
    "nationalSymbols",
    "seasons",
    "months",
    "days",
    "calendar",
    "languages",
    "numbers",
    "foodVegetables",
    "generalKnowledge"
];


/* =========================================================
   VISUAL ICONS
   ========================================================= */

const VISUAL_ICONS = {

    /* HUMAN BODY */

    Brain: "🧠",
    Eye: "👁️",
    Head: "🧑‍🦱",
    Ear: "👂",
    Nose: "👃",
    Mouth: "👄",
    Teeth: "🦷",
    Tongue: "👅",
    Neck: "🧍",
    Shoulder: "💪",
    Arm: "💪",
    Hand: "🖐️",
    Finger: "☝️",
    Chest: "🫀",
    Heart: "❤️",
    Lungs: "🫁",
    Stomach: "🫃",
    Liver: "🫀",
    Kidney: "🫘",
    Leg: "🦵",
    Knee: "🦵",
    Foot: "🦶",
    Bone: "🦴",
    Skin: "🧍",

    /* ANIMALS */

    Lion: "🦁",
    Tiger: "🐅",
    Elephant: "🐘",
    Dog: "🐕",
    Cat: "🐈",
    Cow: "🐄",
    Horse: "🐎",
    Goat: "🐐",
    Deer: "🦌",
    Monkey: "🐒",
    Bear: "🐻",
    Panda: "🐼",
    Giraffe: "🦒",
    Zebra: "🦓",
    Rabbit: "🐇",

    /* BIRDS */

    Peacock: "🦚",
    Parrot: "🦜",
    Eagle: "🦅",
    Sparrow: "🐦",
    Owl: "🦉",
    Penguin: "🐧",
    Flamingo: "🦩",
    Duck: "🦆",
    Swan: "🦢",
    Crow: "🐦‍⬛",

    /* FOOD */

    Apple: "🍎",
    Banana: "🍌",
    Mango: "🥭",
    Orange: "🍊",
    Watermelon: "🍉",
    Grapes: "🍇",
    Pineapple: "🍍",
    Strawberry: "🍓",
    Coconut: "🥥",
    Papaya: "🥭",
    Guava: "🍐",
    Pomegranate: "🍎",

    Carrot: "🥕",
    Potato: "🥔",
    Tomato: "🍅",
    Onion: "🧅",
    Brinjal: "🍆",
    Broccoli: "🥦",
    Corn: "🌽",
    Cucumber: "🥒",
    Peas: "🫛",
    Chilli: "🌶️",
    Garlic: "🧄",
    Spinach: "🥬",
    Mushroom: "🍄",
    Pumpkin: "🎃",
    Radish: "🥕",
    Cauliflower: "🥦",

    Rice: "🍚",
    Bread: "🍞",
    Milk: "🥛",
    Egg: "🥚",
    Cheese: "🧀",
    Butter: "🧈",
    Pizza: "🍕",
    Burger: "🍔",
    Noodles: "🍜",
    Soup: "🍲",
    Cake: "🍰",
    Chocolate: "🍫",
    IceCream: "🍦",

    /* GENERAL */

    Earth: "🌍",
    Sun: "☀️",
    Moon: "🌙",
    Star: "⭐",
    Water: "💧",
    Fire: "🔥",
    Tree: "🌳",
    Book: "📚",
    Science: "🔬",
    Computer: "💻",
    Language: "🗣️",
    Calendar: "📅",
    Number: "🔢",
    Festival: "🎉",
    Flag: "🚩",
    Food: "🍽️"
};


/* =========================================================
   COUNTRY DATABASE
   195 COUNTRIES
   NAME EN | NAME HI | ISO | CODE | SYMBOL | CURRENCY
   ========================================================= */

const COUNTRY_DATABASE = `

Afghanistan|अफ़ग़ानिस्तान|AF|AFN|؋|Afghan Afghani
Albania|अल्बानिया|AL|ALL|Lek|Albanian Lek
Algeria|अल्जीरिया|DZ|DZD|دج|Algerian Dinar
Andorra|अंडोरा|AD|EUR|€|Euro
Angola|अंगोला|AO|AOA|Kz|Angolan Kwanza
Antigua and Barbuda|एंटीगुआ और बारबुडा|AG|XCD|$|East Caribbean Dollar
Argentina|अर्जेंटीना|AR|ARS|$|Argentine Peso
Armenia|आर्मेनिया|AM|AMD|֏|Armenian Dram
Australia|ऑस्ट्रेलिया|AU|AUD|$|Australian Dollar
Austria|ऑस्ट्रिया|AT|EUR|€|Euro
Azerbaijan|अज़रबैजान|AZ|AZN|₼|Azerbaijani Manat
Bahamas|बहामास|BS|BSD|$|Bahamian Dollar
Bahrain|बहरीन|BH|BHD|د.ب|Bahraini Dinar
Bangladesh|बांग्लादेश|BD|BDT|৳|Bangladeshi Taka
Barbados|बारबाडोस|BB|BBD|$|Barbadian Dollar
Belarus|बेलारूस|BY|BYN|Br|Belarusian Ruble
Belgium|बेल्जियम|BE|EUR|€|Euro
Belize|बेलीज़|BZ|BZD|$|Belize Dollar
Benin|बेनिन|BJ|XOF|CFA|West African CFA Franc
Bhutan|भूटान|BT|BTN|Nu.|Bhutanese Ngultrum
Bolivia|बोलीविया|BO|BOB|Bs.|Bolivian Boliviano
Bosnia and Herzegovina|बोस्निया और हर्जेगोविना|BA|BAM|KM|Convertible Mark
Botswana|बोत्सवाना|BW|BWP|P|Botswana Pula
Brazil|ब्राज़ील|BR|BRL|R$|Brazilian Real
Brunei|ब्रुनेई|BN|BND|$|Brunei Dollar
Bulgaria|बुल्गारिया|BG|EUR|€|Euro
Burkina Faso|बुर्किना फासो|BF|XOF|CFA|West African CFA Franc
Burundi|बुरुंडी|BI|BIF|FBu|Burundian Franc
Cabo Verde|केप वर्डे|CV|CVE|$|Cape Verdean Escudo
Cambodia|कंबोडिया|KH|KHR|៛|Cambodian Riel
Cameroon|कैमरून|CM|XAF|FCFA|Central African CFA Franc
Canada|कनाडा|CA|CAD|$|Canadian Dollar
Central African Republic|मध्य अफ्रीकी गणराज्य|CF|XAF|FCFA|Central African CFA Franc
Chad|चाड|TD|XAF|FCFA|Central African CFA Franc
Chile|चिली|CL|CLP|$|Chilean Peso
China|चीन|CN|CNY|¥|Chinese Yuan
Colombia|कोलंबिया|CO|COP|$|Colombian Peso
Comoros|कोमोरोस|KM|KMF|CF|Comorian Franc
Congo|कांगो गणराज्य|CG|XAF|FCFA|Central African CFA Franc
Costa Rica|कोस्टा रिका|CR|CRC|₡|Costa Rican Colón
Croatia|क्रोएशिया|HR|EUR|€|Euro
Cuba|क्यूबा|CU|CUP|$|Cuban Peso
Cyprus|साइप्रस|CY|EUR|€|Euro
Czechia|चेकिया|CZ|CZK|Kč|Czech Koruna
Democratic Republic of the Congo|कांगो लोकतांत्रिक गणराज्य|CD|CDF|FC|Congolese Franc
Denmark|डेनमार्क|DK|DKK|kr|Danish Krone
Djibouti|जिबूती|DJ|DJF|Fdj|Djiboutian Franc
Dominica|डोमिनिका|DM|XCD|$|East Caribbean Dollar
Dominican Republic|डोमिनिकन गणराज्य|DO|DOP|$|Dominican Peso
Ecuador|इक्वाडोर|EC|USD|$|United States Dollar
Egypt|मिस्र|EG|EGP|£|Egyptian Pound
El Salvador|अल सल्वाडोर|SV|USD|$|United States Dollar
Equatorial Guinea|इक्वेटोरियल गिनी|GQ|XAF|FCFA|Central African CFA Franc
Eritrea|इरिट्रिया|ER|ERN|Nfk|Eritrean Nakfa
Estonia|एस्टोनिया|EE|EUR|€|Euro
Eswatini|एस्वातिनी|SZ|SZL|E|Swazi Lilangeni
Ethiopia|इथियोपिया|ET|ETB|Br|Ethiopian Birr
Fiji|फ़िजी|FJ|FJD|$|Fijian Dollar
Finland|फ़िनलैंड|FI|EUR|€|Euro
France|फ़्रांस|FR|EUR|€|Euro
Gabon|गैबॉन|GA|XAF|FCFA|Central African CFA Franc
Gambia|गाम्बिया|GM|GMD|D|Gambian Dalasi
Georgia|जॉर्जिया|GE|GEL|₾|Georgian Lari
Germany|जर्मनी|DE|EUR|€|Euro
Ghana|घाना|GH|GHS|₵|Ghanaian Cedi
Greece|ग्रीस|GR|EUR|€|Euro
Grenada|ग्रेनाडा|GD|XCD|$|East Caribbean Dollar
Guatemala|ग्वाटेमाला|GT|GTQ|Q|Guatemalan Quetzal
Guinea|गिनी|GN|GNF|FG|Guinean Franc
Guinea-Bissau|गिनी-बिसाऊ|GW|XOF|CFA|West African CFA Franc
Guyana|गुयाना|GY|GYD|$|Guyanese Dollar
Haiti|हैती|HT|HTG|G|Haitian Gourde
Honduras|होंडुरास|HN|HNL|L|Honduran Lempira
Hungary|हंगरी|HU|HUF|Ft|Hungarian Forint
Iceland|आइसलैंड|IS|ISK|kr|Icelandic Króna
India|भारत|IN|INR|₹|Indian Rupee
Indonesia|इंडोनेशिया|ID|IDR|Rp|Indonesian Rupiah
Iran|ईरान|IR|IRR|﷼|Iranian Rial
Iraq|इराक|IQ|IQD|ع.د|Iraqi Dinar
Ireland|आयरलैंड|IE|EUR|€|Euro
Israel|इज़राइल|IL|ILS|₪|Israeli New Shekel
Italy|इटली|IT|EUR|€|Euro
Jamaica|जमैका|JM|JMD|$|Jamaican Dollar
Japan|जापान|JP|JPY|¥|Japanese Yen
Jordan|जॉर्डन|JO|JOD|د.ا|Jordanian Dinar
Kazakhstan|कज़ाख़स्तान|KZ|KZT|₸|Kazakhstani Tenge
Kenya|केन्या|KE|KES|KSh|Kenyan Shilling
Kiribati|किरिबाती|KI|AUD|$|Australian Dollar
Kuwait|कुवैत|KW|KWD|د.ك|Kuwaiti Dinar
Kyrgyzstan|किर्गिस्तान|KG|KGS|с|Kyrgyzstani Som
Laos|लाओस|LA|LAK|₭|Lao Kip
Latvia|लातविया|LV|EUR|€|Euro
Lebanon|लेबनान|LB|LBP|ل.ل|Lebanese Pound
Lesotho|लेसोथो|LS|LSL|L|Lesotho Loti
Liberia|लाइबेरिया|LR|LRD|$|Liberian Dollar
Libya|लीबिया|LY|LYD|ل.د|Libyan Dinar
Liechtenstein|लिकटेंस्टाइन|LI|CHF|Fr|Swiss Franc
Lithuania|लिथुआनिया|LT|EUR|€|Euro
Luxembourg|लक्ज़मबर्ग|LU|EUR|€|Euro
Madagascar|मेडागास्कर|MG|MGA|Ar|Malagasy Ariary
Malawi|मलावी|MW|MWK|MK|Malawian Kwacha
Malaysia|मलेशिया|MY|MYR|RM|Malaysian Ringgit
Maldives|मालदीव|MV|MVR|Rf|Maldivian Rufiyaa
Mali|माली|ML|XOF|CFA|West African CFA Franc
Malta|माल्टा|MT|EUR|€|Euro
Marshall Islands|मार्शल द्वीपसमूह|MH|USD|$|United States Dollar
Mauritania|मॉरिटानिया|MR|MRU|UM|Mauritanian Ouguiya
Mauritius|मॉरीशस|MU|MUR|₨|Mauritian Rupee
Mexico|मेक्सिको|MX|MXN|$|Mexican Peso
Micronesia|माइक्रोनेशिया|FM|USD|$|United States Dollar
Moldova|मोल्दोवा|MD|MDL|L|Moldovan Leu
Monaco|मोनाको|MC|EUR|€|Euro
Mongolia|मंगोलिया|MN|MNT|₮|Mongolian Tögrög
Montenegro|मोंटेनेग्रो|ME|EUR|€|Euro
Morocco|मोरक्को|MA|MAD|د.م.|Moroccan Dirham
Mozambique|मोज़ाम्बिक|MZ|MZN|MT|Mozambican Metical
Myanmar|म्यांमार|MM|MMK|K|Myanmar Kyat
Namibia|नामीबिया|NA|NAD|$|Namibian Dollar
Nauru|नाउरू|NR|AUD|$|Australian Dollar
Nepal|नेपाल|NP|NPR|₨|Nepalese Rupee
Netherlands|नीदरलैंड|NL|EUR|€|Euro
New Zealand|न्यूज़ीलैंड|NZ|NZD|$|New Zealand Dollar
Nicaragua|निकारागुआ|NI|NIO|C$|Nicaraguan Córdoba
Niger|नाइजर|NE|XOF|CFA|West African CFA Franc
Nigeria|नाइजीरिया|NG|NGN|₦|Nigerian Naira
North Korea|उत्तर कोरिया|KP|KPW|₩|North Korean Won
North Macedonia|उत्तर मैसेडोनिया|MK|MKD|ден|Macedonian Denar
Norway|नॉर्वे|NO|NOK|kr|Norwegian Krone
Oman|ओमान|OM|OMR|ر.ع.|Omani Rial
Pakistan|पाकिस्तान|PK|PKR|₨|Pakistani Rupee
Palau|पलाऊ|PW|USD|$|United States Dollar
Palestine|फ़िलिस्तीन|PS|ILS|₪|Israeli New Shekel
Panama|पनामा|PA|PAB|B/.|Panamanian Balboa
Papua New Guinea|पापुआ न्यू गिनी|PG|PGK|K|Papua New Guinean Kina
Paraguay|पराग्वे|PY|PYG|₲|Paraguayan Guaraní
Peru|पेरू|PE|PEN|S/|Peruvian Sol
Philippines|फ़िलीपींस|PH|PHP|₱|Philippine Peso
Poland|पोलैंड|PL|PLN|zł|Polish Złoty
Portugal|पुर्तगाल|PT|EUR|€|Euro
Qatar|कतर|QA|QAR|ر.ق|Qatari Riyal
Romania|रोमानिया|RO|RON|lei|Romanian Leu
Russia|रूस|RU|RUB|₽|Russian Ruble
Rwanda|रवांडा|RW|RWF|FRw|Rwandan Franc
Saint Kitts and Nevis|सेंट किट्स और नेविस|KN|XCD|$|East Caribbean Dollar
Saint Lucia|सेंट लूसिया|LC|XCD|$|East Caribbean Dollar
Saint Vincent and the Grenadines|सेंट विंसेंट और ग्रेनेडाइंस|VC|XCD|$|East Caribbean Dollar
Samoa|समोआ|WS|WST|T|Samoan Tālā
San Marino|सैन मैरिनो|SM|EUR|€|Euro
Sao Tome and Principe|साओ टोमे और प्रिंसिपे|ST|STN|Db|São Tomé and Príncipe Dobra
Saudi Arabia|सऊदी अरब|SA|SAR|﷼|Saudi Riyal
Senegal|सेनेगल|SN|XOF|CFA|West African CFA Franc
Serbia|सर्बिया|RS|RSD|дин|Serbian Dinar
Seychelles|सेशेल्स|SC|SCR|₨|Seychellois Rupee
Sierra Leone|सिएरा लियोन|SL|SLE|Le|Sierra Leonean Leone
Singapore|सिंगापुर|SG|SGD|$|Singapore Dollar
Slovakia|स्लोवाकिया|SK|EUR|€|Euro
Slovenia|स्लोवेनिया|SI|EUR|€|Euro
Solomon Islands|सोलोमन द्वीपसमूह|SB|SBD|$|Solomon Islands Dollar
Somalia|सोमालिया|SO|SOS|Sh|Somali Shilling
South Africa|दक्षिण अफ्रीका|ZA|ZAR|R|South African Rand
South Korea|दक्षिण कोरिया|KR|KRW|₩|South Korean Won
South Sudan|दक्षिण सूडान|SS|SSP|£|South Sudanese Pound
Spain|स्पेन|ES|EUR|€|Euro
Sri Lanka|श्रीलंका|LK|LKR|₨|Sri Lankan Rupee
Sudan|सूडान|SD|SDG|ج.س.|Sudanese Pound
Suriname|सूरीनाम|SR|SRD|$|Surinamese Dollar
Sweden|स्वीडन|SE|SEK|kr|Swedish Krona
Switzerland|स्विट्ज़रलैंड|CH|CHF|Fr|Swiss Franc
Syria|सीरिया|SY|SYP|£|Syrian Pound
Tajikistan|ताजिकिस्तान|TJ|TJS|ЅМ|Tajikistani Somoni
Tanzania|तंज़ानिया|TZ|TZS|Sh|Tanzanian Shilling
Thailand|थाईलैंड|TH|THB|฿|Thai Baht
Timor-Leste|तिमोर-लेस्ते|TL|USD|$|United States Dollar
Togo|टोगो|TG|XOF|CFA|West African CFA Franc
Tonga|टोंगा|TO|TOP|T$|Tongan Paʻanga
Trinidad and Tobago|त्रिनिदाद और टोबैगो|TT|TTD|$|Trinidad and Tobago Dollar
Tunisia|ट्यूनीशिया|TN|TND|د.ت|Tunisian Dinar
Türkiye|तुर्की|TR|TRY|₺|Turkish Lira
Turkmenistan|तुर्कमेनिस्तान|TM|TMT|m|Turkmenistan Manat
Tuvalu|तुवालु|TV|AUD|$|Australian Dollar
Uganda|युगांडा|UG|UGX|USh|Ugandan Shilling
Ukraine|यूक्रेन|UA|UAH|₴|Ukrainian Hryvnia
United Arab Emirates|संयुक्त अरब अमीरात|AE|AED|د.إ|UAE Dirham
United Kingdom|यूनाइटेड किंगडम|GB|GBP|£|British Pound
United States|संयुक्त राज्य अमेरिका|US|USD|$|United States Dollar
Uruguay|उरुग्वे|UY|UYU|$|Uruguayan Peso
Uzbekistan|उज़्बेकिस्तान|UZ|UZS|soʻm|Uzbekistani Soʻm
Vanuatu|वानुआतु|VU|VUV|VT|Vanuatu Vatu
Vatican City|वेटिकन सिटी|VA|EUR|€|Euro
Venezuela|वेनेज़ुएला|VE|VES|Bs.|Venezuelan Bolívar
Vietnam|वियतनाम|VN|VND|₫|Vietnamese Đồng
Yemen|यमन|YE|YER|﷼|Yemeni Rial
Zambia|ज़ाम्बिया|ZM|ZMW|ZK|Zambian Kwacha
Zimbabwe|ज़िम्बाब्वे|ZW|ZWG|ZiG|Zimbabwe Gold

`.trim();


const COUNTRIES = COUNTRY_DATABASE
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {

        const parts = line.split("|");

        return {
            nameEn: parts[0],
            nameHi: parts[1],
            iso: parts[2],
            currencyCode: parts[3],
            symbol: parts[4],
            currencyName: parts[5]
        };

    });


/* =========================================================
   FLAG URL
   ========================================================= */

function getFlagURL(code) {

    return `https://flagcdn.com/w640/${String(code).toLowerCase()}.png`;

}


/* =========================================================
   NUMBER WORDS
   ========================================================= */

const NUMBER_WORDS_EN = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
    "Twenty-One",
    "Twenty-Two",
    "Twenty-Three",
    "Twenty-Four",
    "Twenty-Five",
    "Twenty-Six",
    "Twenty-Seven",
    "Twenty-Eight",
    "Twenty-Nine",
    "Thirty",
    "Thirty-One",
    "Thirty-Two",
    "Thirty-Three",
    "Thirty-Four",
    "Thirty-Five",
    "Thirty-Six",
    "Thirty-Seven",
    "Thirty-Eight",
    "Thirty-Nine",
    "Forty",
    "Forty-One",
    "Forty-Two",
    "Forty-Three",
    "Forty-Four",
    "Forty-Five",
    "Forty-Six",
    "Forty-Seven",
    "Forty-Eight",
    "Forty-Nine",
    "Fifty",
    "Fifty-One",
    "Fifty-Two",
    "Fifty-Three",
    "Fifty-Four",
    "Fifty-Five",
    "Fifty-Six",
    "Fifty-Seven",
    "Fifty-Eight",
    "Fifty-Nine",
    "Sixty",
    "Sixty-One",
    "Sixty-Two",
    "Sixty-Three",
    "Sixty-Four",
    "Sixty-Five",
    "Sixty-Six",
    "Sixty-Seven",
    "Sixty-Eight",
    "Sixty-Nine",
    "Seventy",
    "Seventy-One",
    "Seventy-Two",
    "Seventy-Three",
    "Seventy-Four",
    "Seventy-Five",
    "Seventy-Six",
    "Seventy-Seven",
    "Seventy-Eight",
    "Seventy-Nine",
    "Eighty",
    "Eighty-One",
    "Eighty-Two",
    "Eighty-Three",
    "Eighty-Four",
    "Eighty-Five",
    "Eighty-Six",
    "Eighty-Seven",
    "Eighty-Eight",
    "Eighty-Nine",
    "Ninety",
    "Ninety-One",
    "Ninety-Two",
    "Ninety-Three",
    "Ninety-Four",
    "Ninety-Five",
    "Ninety-Six",
    "Ninety-Seven",
    "Ninety-Eight",
    "Ninety-Nine",
    "One Hundred"
];


const NUMBER_WORDS_HI = [
    "",
    "एक",
    "दो",
    "तीन",
    "चार",
    "पाँच",
    "छह",
    "सात",
    "आठ",
    "नौ",
    "दस",
    "ग्यारह",
    "बारह",
    "तेरह",
    "चौदह",
    "पंद्रह",
    "सोलह",
    "सत्रह",
    "अठारह",
    "उन्नीस",
    "बीस",
    "इक्कीस",
    "बाईस",
    "तेईस",
    "चौबीस",
    "पच्चीस",
    "छब्बीस",
    "सत्ताईस",
    "अट्ठाईस",
    "उनतीस",
    "तीस",
    "इकतीस",
    "बत्तीस",
    "तैंतीस",
    "चौंतीस",
    "पैंतीस",
    "छत्तीस",
    "सैंतीस",
    "अड़तीस",
    "उनतालीस",
    "चालीस",
    "इकतालीस",
    "बयालीस",
    "तैंतालीस",
    "चवालीस",
    "पैंतालीस",
    "छियालीस",
    "सैंतालीस",
    "अड़तालीस",
    "उनचास",
    "पचास",
    "इक्यावन",
    "बावन",
    "तिरेपन",
    "चौवन",
    "पचपन",
    "छप्पन",
    "सत्तावन",
    "अट्ठावन",
    "उनसठ",
    "साठ",
    "इकसठ",
    "बासठ",
    "तिरसठ",
    "चौंसठ",
    "पैंसठ",
    "छियासठ",
    "सड़सठ",
    "अड़सठ",
    "उनहत्तर",
    "सत्तर",
    "इकहत्तर",
    "बहत्तर",
    "तिहत्तर",
    "चौहत्तर",
    "पचहत्तर",
    "छिहत्तर",
    "सतहत्तर",
    "अठहत्तर",
    "उन्यासी",
    "अस्सी",
    "इक्यासी",
    "बयासी",
    "तिरासी",
    "चौरासी",
    "पचासी",
    "छियासी",
    "सत्तासी",
    "अट्ठासी",
    "नवासी",
    "नब्बे",
    "इक्यानवे",
    "बानवे",
    "तिरानवे",
    "चौरानवे",
    "पंचानवे",
    "छियानवे",
    "सत्तानवे",
    "अट्ठानवे",
    "निन्यानवे",
    "एक सौ"
];


/* =========================================================
   NUMBERS
   ========================================================= */

function buildNumbers() {

    const numbers = [];

    for (let i = 1; i <= 100; i++) {

        numbers.push({

            nameEn: String(i),

            nameHi: String(i),

            infoEn:
                `${NUMBER_WORDS_EN[i]} is the number ${i}.`,

            infoHi:
                `${NUMBER_WORDS_HI[i]} संख्या ${i} है।`,

            icon: "🔢"

        });

    }

    /* TABLES 2 TO 10 */

    for (let table = 2; table <= 10; table++) {

        for (let i = 1; i <= 10; i++) {

            const answer = table * i;

            numbers.push({

                nameEn:
                    `${table} × ${i} = ${answer}`,

                nameHi:
                    `${table} × ${i} = ${answer}`,

                infoEn:
                    `${table} times ${i} equals ${answer}.`,

                infoHi:
                    `${table} गुणा ${i} बराबर ${answer}।`,

                icon: "✖️"

            });

        }

    }

    return numbers;

}


/* =========================================================
   HUMAN BODY
   ========================================================= */

const HUMAN_BODY = [

    {
        nameEn: "Head",
        nameHi: "सिर",
        infoEn: "The head contains the brain, eyes, ears, nose and mouth.",
        infoHi: "सिर में मस्तिष्क, आँखें, कान, नाक और मुँह होते हैं।",
        icon: "🧑‍🦱"
    },

    {
        nameEn: "Brain",
        nameHi: "मस्तिष्क",
        infoEn: "The brain controls many important functions of the body.",
        infoHi: "मस्तिष्क शरीर के कई महत्वपूर्ण कार्यों को नियंत्रित करता है।",
        icon: "🧠"
    },

    {
        nameEn: "Eye",
        nameHi: "आँख",
        infoEn: "The eye helps us see the world around us.",
        infoHi: "आँख हमें अपने आसपास की दुनिया देखने में मदद करती है।",
        icon: "👁️"
    },

    {
        nameEn: "Ear",
        nameHi: "कान",
        infoEn: "The ear helps us hear sounds and maintain balance.",
        infoHi: "कान हमें आवाज़ सुनने और संतुलन बनाए रखने में मदद करता है।",
        icon: "👂"
    },

    {
        nameEn: "Nose",
        nameHi: "नाक",
        infoEn: "The nose helps us smell and also helps with breathing.",
        infoHi: "नाक हमें गंध पहचानने और साँस लेने में मदद करती है।",
        icon: "👃"
    },

    {
        nameEn: "Mouth",
        nameHi: "मुँह",
        infoEn: "The mouth is used for eating, drinking and speaking.",
        infoHi: "मुँह का उपयोग खाने, पीने और बोलने के लिए किया जाता है।",
        icon: "👄"
    },

    {
        nameEn: "Teeth",
        nameHi: "दाँत",
        infoEn: "Teeth help us bite and chew food.",
        infoHi: "दाँत भोजन को काटने और चबाने में मदद करते हैं।",
        icon: "🦷"
    },

    {
        nameEn: "Tongue",
        nameHi: "जीभ",
        infoEn: "The tongue helps with taste, speaking and moving food.",
        infoHi: "जीभ स्वाद, बोलने और भोजन को हिलाने में मदद करती है।",
        icon: "👅"
    },

    {
        nameEn: "Neck",
        nameHi: "गर्दन",
        infoEn: "The neck connects the head with the rest of the body.",
        infoHi: "गर्दन सिर को शरीर के बाकी हिस्से से जोड़ती है।",
        icon: "🧍"
    },

    {
        nameEn: "Shoulder",
        nameHi: "कंधा",
        infoEn: "The shoulder connects the arm to the upper body.",
        infoHi: "कंधा हाथ को शरीर के ऊपरी हिस्से से जोड़ता है।",
        icon: "💪"
    },

    {
        nameEn: "Arm",
        nameHi: "बाँह",
        infoEn: "The arm helps us move and use our hands.",
        infoHi: "बाँह हमें हाथों को चलाने और उपयोग करने में मदद करती है।",
        icon: "💪"
    },

    {
        nameEn: "Hand",
        nameHi: "हाथ",
        infoEn: "The hand helps us hold, touch and move objects.",
        infoHi: "हाथ वस्तुओं को पकड़ने, छूने और हिलाने में मदद करता है।",
        icon: "🖐️"
    },

    {
        nameEn: "Finger",
        nameHi: "उंगली",
        infoEn: "Fingers help us grip and handle objects.",
        infoHi: "उंगलियाँ वस्तुओं को पकड़ने और संभालने में मदद करती हैं।",
        icon: "☝️"
    },

    {
        nameEn: "Heart",
        nameHi: "हृदय",
        infoEn: "The heart pumps blood throughout the body.",
        infoHi: "हृदय पूरे शरीर में रक्त पंप करता है।",
        icon: "❤️"
    },

    {
        nameEn: "Lungs",
        nameHi: "फेफड़े",
        infoEn: "The lungs help us breathe and exchange oxygen and carbon dioxide.",
        infoHi: "फेफड़े साँस लेने तथा ऑक्सीजन और कार्बन डाइऑक्साइड के आदान-प्रदान में मदद करते हैं।",
        icon: "🫁"
    },

    {
        nameEn: "Stomach",
        nameHi: "पेट",
        infoEn: "The stomach helps digest food.",
        infoHi: "पेट भोजन को पचाने में मदद करता है।",
        icon: "🫃"
    },

    {
        nameEn: "Kidney",
        nameHi: "गुर्दा",
        infoEn: "The kidneys help filter waste from the blood.",
        infoHi: "गुर्दे रक्त से अपशिष्ट पदार्थों को छानने में मदद करते हैं।",
        icon: "🫘"
    },

    {
        nameEn: "Leg",
        nameHi: "पैर",
        infoEn: "The legs help us stand, walk and run.",
        infoHi: "पैर हमें खड़े होने, चलने और दौड़ने में मदद करते हैं।",
        icon: "🦵"
    },

    {
        nameEn: "Knee",
        nameHi: "घुटना",
        infoEn: "The knee is a joint between the thigh and lower leg.",
        infoHi: "घुटना जांघ और निचले पैर के बीच का जोड़ है।",
        icon: "🦵"
    },

    {
        nameEn: "Foot",
        nameHi: "पैर का पंजा",
        infoEn: "The foot supports the body and helps us walk.",
        infoHi: "पैर का पंजा शरीर को सहारा देता है और चलने में मदद करता है।",
        icon: "🦶"
    },

    {
        nameEn: "Bone",
        nameHi: "हड्डी",
        infoEn: "Bones support the body and help protect internal organs.",
        infoHi: "हड्डियाँ शरीर को सहारा देती हैं और आंतरिक अंगों की रक्षा करती हैं।",
        icon: "🦴"
    }

];


/* =========================================================
   ANIMALS
   ========================================================= */

const ANIMALS = [

    ["Lion", "शेर", "The lion is a large wild cat.", "शेर एक बड़ा जंगली बिल्ली प्रजाति का जानवर है।", "🦁"],
    ["Tiger", "बाघ", "The tiger is a powerful striped wild cat.", "बाघ धारियों वाला शक्तिशाली जंगली जानवर है।", "🐅"],
    ["Elephant", "हाथी", "The elephant is a large land mammal with a trunk.", "हाथी सूंड वाला बड़ा स्थलीय स्तनपायी है।", "🐘"],
    ["Dog", "कुत्ता", "The dog is a common domestic animal.", "कुत्ता एक सामान्य पालतू जानवर है।", "🐕"],
    ["Cat", "बिल्ली", "The cat is a small domestic animal.", "बिल्ली एक छोटा पालतू जानवर है।", "🐈"],
    ["Cow", "गाय", "The cow is a domesticated farm animal.", "गाय एक पालतू कृषि पशु है।", "🐄"],
    ["Horse", "घोड़ा", "The horse is a strong animal used for riding and work.", "घोड़ा एक मजबूत जानवर है जिसका उपयोग सवारी और काम में होता है।", "🐎"],
    ["Goat", "बकरी", "The goat is a domesticated farm animal.", "बकरी एक पालतू कृषि पशु है।", "🐐"],
    ["Deer", "हिरण", "The deer is a hoofed wild animal.", "हिरण खुर वाला जंगली जानवर है।", "🦌"],
    ["Monkey", "बंदर", "Monkeys are intelligent and agile animals.", "बंदर बुद्धिमान और फुर्तीले जानवर होते हैं।", "🐒"],
    ["Bear", "भालू", "The bear is a large mammal found in many habitats.", "भालू कई प्रकार के आवासों में पाया जाने वाला बड़ा स्तनपायी है।", "🐻"],
    ["Panda", "पांडा", "The giant panda is famous for eating bamboo.", "विशाल पांडा बाँस खाने के लिए प्रसिद्ध है।", "🐼"],
    ["Giraffe", "जिराफ़", "The giraffe is known for its very long neck.", "जिराफ़ अपनी बहुत लंबी गर्दन के लिए प्रसिद्ध है।", "🦒"],
    ["Zebra", "ज़ेब्रा", "The zebra has distinctive black and white stripes.", "ज़ेब्रा के शरीर पर काली और सफेद धारियाँ होती हैं।", "🦓"],
    ["Rabbit", "खरगोश", "The rabbit is a small mammal with long ears.", "खरगोश लंबे कानों वाला छोटा स्तनपायी है।", "🐇"]

].map(item => ({

    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]

}));


/* =========================================================
   BIRDS
   ========================================================= */

const BIRDS = [

    ["Peacock", "मोर", "The peacock is India's national bird.", "मोर भारत का राष्ट्रीय पक्षी है।", "🦚"],
    ["Parrot", "तोता", "Parrots are colorful birds known for their ability to mimic sounds.", "तोते रंगीन पक्षी होते हैं जो आवाज़ों की नकल कर सकते हैं।", "🦜"],
    ["Eagle", "गरुड़", "Eagles are powerful birds of prey.", "गरुड़ शक्तिशाली शिकारी पक्षी होते हैं।", "🦅"],
    ["Sparrow", "गौरैया", "The sparrow is a small common bird.", "गौरैया एक छोटी सामान्य पक्षी है।", "🐦"],
    ["Owl", "उल्लू", "Owls are birds known for their excellent night vision.", "उल्लू रात में अच्छी दृष्टि के लिए प्रसिद्ध पक्षी हैं।", "🦉"],
    ["Penguin", "पेंगुइन", "Penguins are flightless birds adapted to swimming.", "पेंगुइन उड़ नहीं सकते और तैरने के लिए अनुकूलित पक्षी हैं।", "🐧"],
    ["Flamingo", "राजहंस", "Flamingos are famous for their pink color and long legs.", "राजहंस अपने गुलाबी रंग और लंबे पैरों के लिए प्रसिद्ध हैं।", "🦩"],
    ["Duck", "बतख", "Ducks are water birds with broad bills.", "बतख चौड़ी चोंच वाले जल पक्षी हैं।", "🦆"],
    ["Swan", "हंस", "Swans are large water birds with long necks.", "हंस लंबी गर्दन वाले बड़े जल पक्षी हैं।", "🦢"],
    ["Crow", "कौआ", "Crows are intelligent birds commonly found near human settlements.", "कौए बुद्धिमान पक्षी हैं जो अक्सर मानव बस्तियों के पास पाए जाते हैं।", "🐦‍⬛"]

].map(item => ({

    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]

}));


/* =========================================================
   STATES
   ========================================================= */

const STATES = [

    ["Gujarat", "गुजरात", "A state in western India known for its rich culture and coastline.", "पश्चिमी भारत का एक राज्य जो अपनी संस्कृति और समुद्र तट के लिए प्रसिद्ध है।", "🏛️"],
    ["Rajasthan", "राजस्थान", "Rajasthan is known for deserts, forts and royal heritage.", "राजस्थान रेगिस्तान, किलों और राजसी विरासत के लिए प्रसिद्ध है।", "🏰"],
    ["Maharashtra", "महाराष्ट्र", "Maharashtra is a major state in western India.", "महाराष्ट्र पश्चिमी भारत का एक प्रमुख राज्य है।", "🌆"],
    ["Punjab", "पंजाब", "Punjab is known for agriculture and vibrant culture.", "पंजाब कृषि और जीवंत संस्कृति के लिए प्रसिद्ध है।", "🌾"],
    ["Kerala", "केरल", "Kerala is known for its backwaters, greenery and coastline.", "केरल अपने बैकवाटर, हरियाली और समुद्र तट के लिए प्रसिद्ध है।", "🌴"],
    ["Tamil Nadu", "तमिलनाडु", "Tamil Nadu is known for its temples and classical culture.", "तमिलनाडु अपने मंदिरों और शास्त्रीय संस्कृति के लिए प्रसिद्ध है।", "🛕"],
    ["West Bengal", "पश्चिम बंगाल", "West Bengal is known for literature, culture and diverse landscapes.", "पश्चिम बंगाल साहित्य, संस्कृति और विविध भौगोलिक क्षेत्रों के लिए प्रसिद्ध है।", "🎭"],
    ["Assam", "असम", "Assam is known for tea gardens and wildlife.", "असम चाय के बागानों और वन्यजीवों के लिए प्रसिद्ध है।", "🍃"]

].map(item => ({

    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]

}));


/* =========================================================
   STATE FOODS
   ========================================================= */

const STATE_FOODS = [

    ["Gujarat Food", "गुजरात का भोजन", "Dhokla is a popular Gujarati steamed snack.", "ढोकला गुजरात का प्रसिद्ध भाप में पकाया जाने वाला नाश्ता है।", "🍽️"],
    ["Rajasthan Food", "राजस्थान का भोजन", "Dal Baati Churma is a famous traditional food of Rajasthan.", "दाल बाटी चूरमा राजस्थान का प्रसिद्ध पारंपरिक भोजन है।", "🥘"],
    ["Punjab Food", "पंजाब का भोजन", "Makki di roti and sarson da saag are famous Punjabi foods.", "मक्की की रोटी और सरसों का साग प्रसिद्ध पंजाबी भोजन हैं।", "🌽"],
    ["Maharashtra Food", "महाराष्ट्र का भोजन", "Vada Pav is a popular street food associated with Maharashtra.", "वड़ा पाव महाराष्ट्र से जुड़ा लोकप्रिय स्ट्रीट फूड है।", "🍔"],
    ["Kerala Food", "केरल का भोजन", "Appam is a traditional Kerala food.", "अप्पम केरल का पारंपरिक भोजन है।", "🥞"],
    ["Tamil Nadu Food", "तमिलनाडु का भोजन", "Idli and dosa are popular South Indian foods.", "इडली और डोसा लोकप्रिय दक्षिण भारतीय भोजन हैं।", "🥞"],
    ["West Bengal Food", "पश्चिम बंगाल का भोजन", "Fish and rice are important parts of Bengali cuisine.", "मछली और चावल बंगाली भोजन के महत्वपूर्ण हिस्से हैं।", "🍚"],
    ["Assam Food", "असम का भोजन", "Assamese cuisine includes rice and many regional dishes.", "असमिया भोजन में चावल और कई क्षेत्रीय व्यंजन शामिल हैं।", "🍚"]

].map(item => ({

    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]

}));


/* =========================================================
   FOOD & VEGETABLES
   ========================================================= */

const FOOD_VEGETABLES = [

    /* FRUITS */

    ["Apple", "सेब", "Apple is a sweet and nutritious fruit.", "सेब एक मीठा और पौष्टिक फल है।", "🍎"],
    ["Banana", "केला", "Banana is a soft and nutritious fruit.", "केला नरम और पौष्टिक फल है।", "🍌"],
    ["Mango", "आम", "Mango is a sweet tropical fruit.", "आम एक मीठा उष्णकटिबंधीय फल है।", "🥭"],
    ["Orange", "संतरा", "Orange is a citrus fruit rich in vitamin C.", "संतरा विटामिन C से भरपूर फल है।", "🍊"],
    ["Watermelon", "तरबूज", "Watermelon is a juicy fruit commonly enjoyed in summer.", "तरबूज गर्मियों में खाया जाने वाला रसदार फल है।", "🍉"],
    ["Grapes", "अंगूर", "Grapes are small juicy fruits that grow in bunches.", "अंगूर छोटे रसदार फल हैं जो गुच्छों में उगते हैं।", "🍇"],
    ["Pineapple", "अनानास", "Pineapple is a tropical fruit with a rough outer skin.", "अनानास खुरदरी बाहरी त्वचा वाला उष्णकटिबंधीय फल है।", "🍍"],
    ["Strawberry", "स्ट्रॉबेरी", "Strawberry is a red fruit with small seeds on its surface.", "स्ट्रॉबेरी एक लाल फल है जिसकी सतह पर छोटे बीज होते हैं।", "🍓"],
    ["Coconut", "नारियल", "Coconut is a tropical fruit with a hard shell.", "नारियल कठोर खोल वाला उष्णकटिबंधीय फल है।", "🥥"],
    ["Papaya", "पपीता", "Papaya is a soft tropical fruit.", "पपीता एक नरम उष्णकटिबंधीय फल है।", "🍈"],
    ["Guava", "अमरूद", "Guava is a fruit that can be green or yellow when ripe.", "अमरूद पकने पर हरा या पीला हो सकता है।", "🍐"],
    ["Pomegranate", "अनार", "Pomegranate contains many juicy edible seeds.", "अनार में कई रसदार खाने योग्य दाने होते हैं।", "🔴"],

    /* VEGETABLES */

    ["Carrot", "गाजर", "Carrot is a root vegetable.", "गाजर एक जड़ वाली सब्जी है।", "🥕"],
    ["Potato", "आलू", "Potato is an edible tuber used in many dishes.", "आलू एक खाद्य कंद है जिसका उपयोग कई व्यंजनों में होता है।", "🥔"],
    ["Tomato", "टमाटर", "Tomato is commonly used as a vegetable in cooking.", "टमाटर का उपयोग खाना बनाने में आमतौर पर सब्जी की तरह किया जाता है।", "🍅"],
    ["Onion", "प्याज", "Onion is widely used in cooking.", "प्याज का उपयोग खाना बनाने में व्यापक रूप से किया जाता है।", "🧅"],
    ["Brinjal", "बैंगन", "Brinjal is a common edible vegetable.", "बैंगन एक सामान्य खाद्य सब्जी है।", "🍆"],
    ["Broccoli", "ब्रोकोली", "Broccoli is a green vegetable.", "ब्रोकोली एक हरी सब्जी है।", "🥦"],
    ["Corn", "मक्का", "Corn is an important food crop.", "मक्का एक महत्वपूर्ण खाद्य फसल है।", "🌽"],
    ["Cucumber", "खीरा", "Cucumber is a refreshing vegetable with high water content.", "खीरा अधिक पानी वाली ताज़गी देने वाली सब्जी है।", "🥒"],
    ["Peas", "मटर", "Peas are small green seeds commonly eaten as a vegetable.", "मटर छोटे हरे दाने हैं जिन्हें सब्जी के रूप में खाया जाता है।", "🫛"],
    ["Chilli", "मिर्च", "Chilli is used to add flavor and heat to food.", "मिर्च भोजन में स्वाद और तीखापन जोड़ने के लिए उपयोग की जाती है।", "🌶️"],
    ["Garlic", "लहसुन", "Garlic is widely used as a flavoring ingredient.", "लहसुन का उपयोग स्वाद बढ़ाने वाले पदार्थ के रूप में किया जाता है।", "🧄"],
    ["Spinach", "पालक", "Spinach is a leafy green vegetable.", "पालक एक हरी पत्तेदार सब्जी है।", "🥬"],
    ["Mushroom", "मशरूम", "Edible mushrooms are used in many cuisines.", "खाने योग्य मशरूम कई प्रकार के भोजन में उपयोग किए जाते हैं।", "🍄"],
    ["Pumpkin", "कद्दू", "Pumpkin is a large edible vegetable.", "कद्दू एक बड़ी खाद्य सब्जी है।", "🎃"],
    ["Cauliflower", "फूलगोभी", "Cauliflower is a vegetable with a white edible head.", "फूलगोभी सफेद खाने योग्य भाग वाली सब्जी है।", "🥦"],
    ["Radish", "मूली", "Radish is a root vegetable.", "मूली एक जड़ वाली सब्जी है।", "🥕"],

    /* COMMON FOOD */

    ["Rice", "चावल", "Rice is one of the world's major staple foods.", "चावल दुनिया के प्रमुख खाद्य पदार्थों में से एक है।", "🍚"],
    ["Bread", "ब्रेड", "Bread is commonly made from flour and water.", "ब्रेड आमतौर पर आटे और पानी से बनाई जाती है।", "🍞"],
    ["Milk", "दूध", "Milk is a nutritious drink.", "दूध एक पौष्टिक पेय है।", "🥛"],
    ["Egg", "अंडा", "Eggs are a common food and provide several nutrients.", "अंडा एक सामान्य खाद्य पदार्थ है और कई पोषक तत्व प्रदान करता है।", "🥚"],
    ["Cheese", "पनीर / चीज़", "Cheese is a dairy food made from milk.", "चीज़ दूध से बनाया जाने वाला डेयरी खाद्य पदार्थ है।", "🧀"],
    ["Butter", "मक्खन", "Butter is a dairy product commonly used in cooking and baking.", "मक्खन एक डेयरी उत्पाद है जिसका उपयोग खाना बनाने और बेकिंग में होता है।", "🧈"],
    ["Pizza", "पिज़्ज़ा", "Pizza is a popular baked food with various toppings.", "पिज़्ज़ा विभिन्न टॉपिंग वाला लोकप्रिय बेक किया हुआ भोजन है।", "🍕"],
    ["Burger", "बर्गर", "A burger is a popular food made with a bun and filling.", "बर्गर बन और भरावन से बना लोकप्रिय भोजन है।", "🍔"],
    ["Noodles", "नूडल्स", "Noodles are made from dough and prepared in many ways.", "नूडल्स आटे से बनाए जाते हैं और कई तरीकों से पकाए जाते हैं।", "🍜"],
    ["Soup", "सूप", "Soup is a liquid food prepared with various ingredients.", "सूप विभिन्न सामग्री से बनाया जाने वाला तरल भोजन है।", "🍲"],
    ["Cake", "केक", "Cake is a baked food commonly eaten on celebrations.", "केक एक बेक किया हुआ खाद्य पदार्थ है जिसे अक्सर समारोहों में खाया जाता है।", "🍰"],
    ["Chocolate", "चॉकलेट", "Chocolate is made from cocoa and is enjoyed as a sweet food.", "चॉकलेट कोको से बनाई जाती है और मीठे खाद्य पदार्थ के रूप में खाई जाती है।", "🍫"],
    ["Ice Cream", "आइसक्रीम", "Ice cream is a frozen sweet dessert.", "आइसक्रीम एक जमी हुई मीठी मिठाई है।", "🍦"]

].map(item => ({

    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]

}));


/* =========================================================
   OTHER TOPICS
   ========================================================= */

const FESTIVALS = [

    ["Diwali", "दीवाली", "Diwali is known as the festival of lights.", "दीवाली को रोशनी का त्योहार कहा जाता है।", "🪔"],
    ["Holi", "होली", "Holi is known as the festival of colors.", "होली रंगों के त्योहार के रूप में जानी जाती है।", "🎨"],
    ["Christmas", "क्रिसमस", "Christmas is celebrated on December 25 by Christians around the world.", "क्रिसमस 25 दिसंबर को दुनिया भर में ईसाइयों द्वारा मनाया जाता है।", "🎄"],
    ["Eid", "ईद", "Eid is an important Islamic festival.", "ईद एक महत्वपूर्ण इस्लामी त्योहार है।", "🌙"],
    ["Navratri", "नवरात्रि", "Navratri is a Hindu festival traditionally celebrated over nine nights.", "नवरात्रि हिंदू त्योहार है जिसे परंपरागत रूप से नौ रातों तक मनाया जाता है।", "🙏"],
    ["Ganesh Chaturthi", "गणेश चतुर्थी", "Ganesh Chaturthi celebrates Lord Ganesha.", "गणेश चतुर्थी भगवान गणेश को समर्पित त्योहार है।", "🐘"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const NATIONAL_SYMBOLS = [

    ["National Animal of India", "भारत का राष्ट्रीय पशु", "The Bengal tiger is India's national animal.", "बंगाल टाइगर भारत का राष्ट्रीय पशु है।", "🐅"],
    ["National Bird of India", "भारत का राष्ट्रीय पक्षी", "The Indian peafowl is India's national bird.", "भारतीय मोर भारत का राष्ट्रीय पक्षी है।", "🦚"],
    ["National Flower of India", "भारत का राष्ट्रीय फूल", "The lotus is India's national flower.", "कमल भारत का राष्ट्रीय फूल है।", "🪷"],
    ["National Fruit of India", "भारत का राष्ट्रीय फल", "Mango is commonly recognized as India's national fruit.", "आम को सामान्यतः भारत के राष्ट्रीय फल के रूप में जाना जाता है।", "🥭"],
    ["National Tree of India", "भारत का राष्ट्रीय वृक्ष", "The banyan is India's national tree.", "बरगद भारत का राष्ट्रीय वृक्ष है।", "🌳"],
    ["National River of India", "भारत की राष्ट्रीय नदी", "The Ganga is recognized as India's national river.", "गंगा को भारत की राष्ट्रीय नदी के रूप में मान्यता प्राप्त है।", "🌊"],
    ["National Aquatic Animal", "भारत का राष्ट्रीय जलीय जीव", "The Ganges river dolphin is India's national aquatic animal.", "गंगा नदी डॉल्फिन भारत का राष्ट्रीय जलीय जीव है।", "🐬"],
    ["National Emblem", "राष्ट्रीय प्रतीक", "The Lion Capital of Ashoka is India's state emblem.", "अशोक का सिंह स्तंभ भारत का राजकीय प्रतीक है।", "🦁"],
    ["National Flag", "राष्ट्रीय ध्वज", "India's national flag is the Tiranga.", "भारत का राष्ट्रीय ध्वज तिरंगा है।", "🇮🇳"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const SEASONS = [

    ["Spring", "वसंत", "Spring is a season associated with new plant growth and mild weather.", "वसंत ऋतु नई वनस्पति वृद्धि और सुहावने मौसम से जुड़ी है।", "🌸"],
    ["Summer", "ग्रीष्म", "Summer is generally the warmest season of the year.", "ग्रीष्म सामान्यतः वर्ष का सबसे गर्म मौसम होता है।", "☀️"],
    ["Autumn", "शरद", "Autumn is a season when many trees shed their leaves.", "शरद ऋतु में कई पेड़ अपने पत्ते गिराते हैं।", "🍂"],
    ["Winter", "शीत", "Winter is generally the coldest season of the year.", "शीत ऋतु सामान्यतः वर्ष की सबसे ठंडी ऋतु होती है।", "❄️"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const MONTHS = [

    ["January", "जनवरी", "January is the first month of the year.", "जनवरी वर्ष का पहला महीना है।", "📅"],
    ["February", "फ़रवरी", "February is the second month of the year.", "फ़रवरी वर्ष का दूसरा महीना है।", "📅"],
    ["March", "मार्च", "March is the third month of the year.", "मार्च वर्ष का तीसरा महीना है।", "📅"],
    ["April", "अप्रैल", "April is the fourth month of the year.", "अप्रैल वर्ष का चौथा महीना है।", "📅"],
    ["May", "मई", "May is the fifth month of the year.", "मई वर्ष का पाँचवाँ महीना है।", "📅"],
    ["June", "जून", "June is the sixth month of the year.", "जून वर्ष का छठा महीना है।", "📅"],
    ["July", "जुलाई", "July is the seventh month of the year.", "जुलाई वर्ष का सातवाँ महीना है।", "📅"],
    ["August", "अगस्त", "August is the eighth month of the year.", "अगस्त वर्ष का आठवाँ महीना है।", "📅"],
    ["September", "सितंबर", "September is the ninth month of the year.", "सितंबर वर्ष का नौवाँ महीना है।", "📅"],
    ["October", "अक्टूबर", "October is the tenth month of the year.", "अक्टूबर वर्ष का दसवाँ महीना है।", "📅"],
    ["November", "नवंबर", "November is the eleventh month of the year.", "नवंबर वर्ष का ग्यारहवाँ महीना है।", "📅"],
    ["December", "दिसंबर", "December is the twelfth month of the year.", "दिसंबर वर्ष का बारहवाँ महीना है।", "📅"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const DAYS = [

    ["Monday", "सोमवार", "Monday is the first day of the standard working week in many countries.", "सोमवार कई देशों में सामान्य कार्य सप्ताह का पहला दिन होता है।", "📅"],
    ["Tuesday", "मंगलवार", "Tuesday comes after Monday.", "मंगलवार सोमवार के बाद आता है।", "📅"],
    ["Wednesday", "बुधवार", "Wednesday is the middle weekday.", "बुधवार सप्ताह के बीच का कार्यदिवस है।", "📅"],
    ["Thursday", "गुरुवार", "Thursday comes after Wednesday.", "गुरुवार बुधवार के बाद आता है।", "📅"],
    ["Friday", "शुक्रवार", "Friday comes before the weekend.", "शुक्रवार सप्ताहांत से पहले आता है।", "📅"],
    ["Saturday", "शनिवार", "Saturday is commonly part of the weekend.", "शनिवार आमतौर पर सप्ताहांत का हिस्सा होता है।", "📅"],
    ["Sunday", "रविवार", "Sunday is commonly part of the weekend.", "रविवार आमतौर पर सप्ताहांत का हिस्सा होता है।", "📅"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const LANGUAGES = [

    ["Hindi", "हिंदी", "Hindi is widely spoken in India.", "हिंदी भारत में व्यापक रूप से बोली जाने वाली भाषा है।", "🗣️"],
    ["English", "अंग्रेज़ी", "English is a widely used international language.", "अंग्रेज़ी व्यापक रूप से उपयोग की जाने वाली अंतरराष्ट्रीय भाषा है।", "🗣️"],
    ["Gujarati", "गुजराती", "Gujarati is an Indo-Aryan language spoken mainly in Gujarat.", "गुजराती मुख्य रूप से गुजरात में बोली जाने वाली इंडो-आर्यन भाषा है।", "🗣️"],
    ["Spanish", "स्पेनिश", "Spanish is widely spoken in Spain and many countries of the Americas.", "स्पेनिश स्पेन और अमेरिका के कई देशों में व्यापक रूप से बोली जाती है।", "🗣️"],
    ["French", "फ़्रेंच", "French is spoken in France and many other countries.", "फ़्रेंच फ्रांस और कई अन्य देशों में बोली जाती है।", "🗣️"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const CALENDAR = [

    ["Day", "दिन", "A day is a basic unit of time.", "दिन समय की एक मूल इकाई है।", "📅"],
    ["Week", "सप्ताह", "A week consists of seven days.", "एक सप्ताह में सात दिन होते हैं।", "📅"],
    ["Month", "महीना", "A month is a division of a year.", "महीना वर्ष का एक भाग होता है।", "📅"],
    ["Year", "वर्ष", "A year is the time Earth takes to orbit the Sun once.", "एक वर्ष वह समय है जिसमें पृथ्वी सूर्य की एक परिक्रमा पूरी करती है।", "🌍"],
    ["Leap Year", "लीप वर्ष", "A leap year has an extra day in February.", "लीप वर्ष में फरवरी में एक अतिरिक्त दिन होता है।", "📅"],
    ["Calendar", "कैलेंडर", "A calendar organizes days, weeks and months.", "कैलेंडर दिनों, सप्ताहों और महीनों को व्यवस्थित करता है।", "📅"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


const GENERAL_KNOWLEDGE = [

    ["Earth", "पृथ्वी", "Earth is the planet on which we live.", "पृथ्वी वह ग्रह है जिस पर हम रहते हैं।", "🌍"],
    ["Sun", "सूर्य", "The Sun is the star at the center of our solar system.", "सूर्य हमारे सौर मंडल के केंद्र में स्थित तारा है।", "☀️"],
    ["Moon", "चंद्रमा", "The Moon is Earth's natural satellite.", "चंद्रमा पृथ्वी का प्राकृतिक उपग्रह है।", "🌙"],
    ["Water", "पानी", "Water is essential for life.", "पानी जीवन के लिए आवश्यक है।", "💧"],
    ["Science", "विज्ञान", "Science is the systematic study of the natural world.", "विज्ञान प्राकृतिक दुनिया का व्यवस्थित अध्ययन है।", "🔬"]

].map(item => ({
    nameEn: item[0],
    nameHi: item[1],
    infoEn: item[2],
    infoHi: item[3],
    icon: item[4]
}));


/* =========================================================
   LEARNING DATA
   ========================================================= */

const LEARNING_DATA = {

    humanBody: HUMAN_BODY,

    animals: ANIMALS,

    birds: BIRDS,

    countries: [],

    flags: [],

    states: STATES,

    stateFoods: STATE_FOODS,

    festivals: FESTIVALS,

    nationalSymbols: NATIONAL_SYMBOLS,

    seasons: SEASONS,

    months: MONTHS,

    days: DAYS,

    calendar: CALENDAR,

    languages: LANGUAGES,

    numbers: buildNumbers(),

    foodVegetables: FOOD_VEGETABLES,

    generalKnowledge: GENERAL_KNOWLEDGE

};


/* =========================================================
   TOPIC INFORMATION
   ========================================================= */

const TOPIC_INFO = {

    humanBody: {
        icon: "🧠",
        en: "Human Body",
        hi: "मानव शरीर",
        subtitleEn: "Learn about different parts of the human body",
        subtitleHi: "मानव शरीर के अलग-अलग अंगों के बारे में सीखें"
    },

    animals: {
        icon: "🦁",
        en: "Animals",
        hi: "जानवर",
        subtitleEn: "Learn about animals",
        subtitleHi: "जानवरों के बारे में सीखें"
    },

    birds: {
        icon: "🦜",
        en: "Birds",
        hi: "पक्षी",
        subtitleEn: "Learn about birds",
        subtitleHi: "पक्षियों के बारे में सीखें"
    },

    countries: {
        icon: "🌍",
        en: "Countries",
        hi: "देश",
        subtitleEn: "Explore countries and their currencies",
        subtitleHi: "देशों और उनकी मुद्राओं के बारे में जानें"
    },

    flags: {
        icon: "🚩",
        en: "Country Flags",
        hi: "देशों के झंडे",
        subtitleEn: "Explore country flags and currencies",
        subtitleHi: "देशों के झंडे और मुद्राएँ देखें"
    },

    states: {
        icon: "🇮🇳",
        en: "Indian States",
        hi: "भारत के राज्य",
        subtitleEn: "Learn about Indian states",
        subtitleHi: "भारत के राज्यों के बारे में सीखें"
    },

    stateFoods: {
        icon: "🍛",
        en: "State Foods",
        hi: "राज्यों के प्रसिद्ध भोजन",
        subtitleEn: "Learn about famous foods from Indian states",
        subtitleHi: "भारतीय राज्यों के प्रसिद्ध भोजन के बारे में सीखें"
    },

    festivals: {
        icon: "🎉",
        en: "Festivals",
        hi: "त्योहार",
        subtitleEn: "Learn about important festivals",
        subtitleHi: "महत्वपूर्ण त्योहारों के बारे में सीखें"
    },

    nationalSymbols: {
        icon: "🇮🇳",
        en: "National Symbols",
        hi: "राष्ट्रीय प्रतीक",
        subtitleEn: "Learn about India's national symbols",
        subtitleHi: "भारत के राष्ट्रीय प्रतीकों के बारे में सीखें"
    },

    seasons: {
        icon: "🌦️",
        en: "Seasons",
        hi: "ऋतुएँ",
        subtitleEn: "Learn about seasons",
        subtitleHi: "ऋतुओं के बारे में सीखें"
    },

    months: {
        icon: "📅",
        en: "Months",
        hi: "महीने",
        subtitleEn: "Learn all twelve months",
        subtitleHi: "सभी बारह महीनों के बारे में सीखें"
    },

    days: {
        icon: "📆",
        en: "Days",
        hi: "दिन",
        subtitleEn: "Learn the seven days of the week",
        subtitleHi: "सप्ताह के सात दिनों के बारे में सीखें"
    },

    calendar: {
        icon: "🗓️",
        en: "Calendar",
        hi: "कैलेंडर",
        subtitleEn: "Learn basic calendar concepts",
        subtitleHi: "कैलेंडर की मूल जानकारी सीखें"
    },

    languages: {
        icon: "🗣️",
        en: "Languages",
        hi: "भाषाएँ",
        subtitleEn: "Explore different languages",
        subtitleHi: "अलग-अलग भाषाओं के बारे में जानें"
    },

    numbers: {
        icon: "🔢",
        en: "Numbers",
        hi: "संख्याएँ",
        subtitleEn: "Numbers 1 to 100 and multiplication tables",
        subtitleHi: "1 से 100 तक संख्याएँ और पहाड़े"
    },

    foodVegetables: {
        icon: "🥗",
        en: "Food & Vegetables",
        hi: "खाने और सब्जियाँ",
        subtitleEn: "Learn about fruits, vegetables and common foods",
        subtitleHi: "फलों, सब्जियों और सामान्य खाद्य पदार्थों के बारे में सीखें"
    },

    generalKnowledge: {
        icon: "💡",
        en: "General Knowledge",
        hi: "सामान्य ज्ञान",
        subtitleEn: "Learn useful general knowledge",
        subtitleHi: "उपयोगी सामान्य ज्ञान सीखें"
    }

};


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   OPEN TOPIC
   ========================================================= */

function openTopic(topicName) {

    if (!LEARNING_DATA.hasOwnProperty(topicName) &&
        topicName !== "countries" &&
        topicName !== "flags") {

        return;

    }

    currentTopic = topicName;

    if (homePage) {
        homePage.hidden = true;
    }

    if (learningPage) {
        learningPage.hidden = false;
    }

    const info = TOPIC_INFO[topicName];

    if (info) {

        if (topicIcon) {
            topicIcon.textContent = info.icon;
        }

        if (topicTitle) {

            topicTitle.textContent =
                currentLanguage === "hi"
                    ? info.hi
                    : info.en;

        }

        if (topicSubtitle) {

            topicSubtitle.textContent =
                currentLanguage === "hi"
                    ? info.subtitleHi
                    : info.subtitleEn;

        }

    }

    if (topicSearch) {
        topicSearch.value = "";
    }

    if (topicName === "countries" ||
        topicName === "flags") {

        renderCountries(COUNTRIES);

    } else {

        renderTopic(
            LEARNING_DATA[topicName] || []
        );

    }

    updateNavigation();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RENDER NORMAL TOPIC
   ========================================================= */

function renderTopic(items) {

    if (!topicContent) return;

    if (!items || !items.length) {

        topicContent.innerHTML = `
            <div class="info-card">
                <div class="visual-icon">📚</div>
                <h3>No information found</h3>
            </div>
        `;

        return;

    }

    topicContent.innerHTML = items.map((item, index) => {

        const icon =
            item.icon ||
            VISUAL_ICONS[item.nameEn] ||
            "📚";

        return `

        <article
            class="info-card learning-info-card"
            data-index="${index}"
        >

            <div class="visual-icon">
                ${escapeHTML(icon)}
            </div>

            <div class="info-card-body">

                <h3>
                    ${escapeHTML(item.nameEn)}
                </h3>

                <h4>
                    ${escapeHTML(item.nameHi)}
                </h4>

                <p>
                    <strong>English:</strong>
                    ${escapeHTML(item.infoEn)}
                </p>

                <p>
                    <strong>हिंदी:</strong>
                    ${escapeHTML(item.infoHi)}
                </p>

                <button
                    class="speak-btn"
                    type="button"
                    data-action="listen"
                    data-en-name="${escapeHTML(item.nameEn)}"
                    data-hi-name="${escapeHTML(item.nameHi)}"
                    data-en-info="${escapeHTML(item.infoEn)}"
                    data-hi-info="${escapeHTML(item.infoHi)}"
                >
                    🔊 Listen / सुनें
                </button>

            </div>

        </article>

        `;

    }).join("");

}


/* =========================================================
   RENDER COUNTRIES
   ========================================================= */

function renderCountries(countries = COUNTRIES) {

    if (!topicContent) return;

    if (!countries.length) {

        topicContent.innerHTML = `
            <div class="info-card">
                <div class="visual-icon">🌍</div>
                <h3>No country found</h3>
            </div>
        `;

        return;

    }

    topicContent.innerHTML = countries.map((country, index) => {

        const flagURL =
            getFlagURL(country.iso);

        return `

        <article
            class="info-card country-card"
            data-country-index="${index}"
        >

            <div class="country-visual">

                <img
                    src="${flagURL}"
                    alt="${escapeHTML(country.nameEn)} flag"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    style="
                        width:100%;
                        height:170px;
                        object-fit:contain;
                        object-position:center;
                        display:block;
                        background:rgba(255,255,255,0.04);
                    "
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="flag-fallback"
                    style="
                        display:none;
                        width:100%;
                        height:170px;
                        align-items:center;
                        justify-content:center;
                        font-size:60px;
                    "
                >
                    🌍
                </div>

                <div class="currency-badge">

                    <div>
                        ${escapeHTML(country.symbol)}
                    </div>

                    <div>
                        ${escapeHTML(country.currencyCode)}
                    </div>

                </div>

            </div>


            <div class="country-information">

                <div
                    class="visual-icon"
                    aria-hidden="true"
                >
                    🌍
                </div>

                <h3>
                    ${escapeHTML(country.nameEn)}
                </h3>

                <h4>
                    ${escapeHTML(country.nameHi)}
                </h4>

                <p>
                    <strong>Currency:</strong>
                    ${escapeHTML(country.currencyName)}
                </p>

                <p>
                    <strong>Code:</strong>
                    ${escapeHTML(country.currencyCode)}
                    &nbsp;&nbsp;
                    <strong>Symbol:</strong>
                    ${escapeHTML(country.symbol)}
                </p>

                <button
                    class="speak-btn"
                    type="button"
                    data-action="country-listen"
                    data-country-en="${escapeHTML(country.nameEn)}"
                    data-country-hi="${escapeHTML(country.nameHi)}"
                    data-currency="${escapeHTML(country.currencyName)}"
                    data-code="${escapeHTML(country.currencyCode)}"
                    data-symbol="${escapeHTML(country.symbol)}"
                >
                    🔊 Listen / सुनें
                </button>

            </div>

        </article>

        `;

    }).join("");

}


/* =========================================================
   SPEECH
   ========================================================= */

function speakText(text, lang) {

    if (!("speechSynthesis" in window)) {

        alert(
            currentLanguage === "hi"
                ? "आपके ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।"
                : "Speech is not supported in this browser."
        );

        return;

    }

    return new Promise(resolve => {

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = resolve;
        utterance.onerror = resolve;

        window.speechSynthesis.speak(
            utterance
        );

    });

}


async function speakFullInformation(
    englishName,
    hindiName,
    englishInfo,
    hindiInfo
) {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    await speakText(
        `${englishName}. ${englishInfo}`,
        "en-US"
    );

    await speakText(
        `${hindiName}. ${hindiInfo}`,
        "hi-IN"
    );

}


/* =========================================================
   COUNTRY SPEECH
   ========================================================= */

async function speakCountryInformation(
    nameEn,
    nameHi,
    currency,
    code,
    symbol
) {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    await speakText(
        `${nameEn}. Currency is ${currency}. Currency code ${code}. Symbol ${symbol}.`,
        "en-US"
    );

    await speakText(
        `${nameHi}. मुद्रा ${currency} है। मुद्रा कोड ${code} है। मुद्रा चिन्ह ${symbol} है।`,
        "hi-IN"
    );

}


/* =========================================================
   EVENT DELEGATION
   ========================================================= */

document.addEventListener("click", event => {

    const button =
        event.target.closest(
            ".speak-btn"
        );

    if (!button) return;


    const action =
        button.dataset.action;


    if (action === "listen") {

        speakFullInformation(

            button.dataset.enName || "",

            button.dataset.hiName || "",

            button.dataset.enInfo || "",

            button.dataset.hiInfo || ""

        );

    }


    if (action === "country-listen") {

        speakCountryInformation(

            button.dataset.countryEn || "",

            button.dataset.countryHi || "",

            button.dataset.currency || "",

            button.dataset.code || "",

            button.dataset.symbol || ""

        );

    }

});


/* =========================================================
   TOPIC SEARCH
   ========================================================= */

function searchCurrentTopic(value) {

    const query =
        String(value || "")
            .trim()
            .toLowerCase();

    if (!currentTopic) return;


    if (
        currentTopic === "countries" ||
        currentTopic === "flags"
    ) {

        if (!query) {

            renderCountries(COUNTRIES);

            return;

        }

        const filtered =
            COUNTRIES.filter(country => {

                return (

                    country.nameEn
                        .toLowerCase()
                        .includes(query)

                    ||

                    country.nameHi
                        .toLowerCase()
                        .includes(query)

                    ||

                    country.iso
                        .toLowerCase()
                        .includes(query)

                    ||

                    country.currencyCode
                        .toLowerCase()
                        .includes(query)

                    ||

                    country.currencyName
                        .toLowerCase()
                        .includes(query)

                    ||

                    country.symbol
                        .toLowerCase()
                        .includes(query)

                );

            });

        renderCountries(filtered);

        return;

    }


    const items =
        LEARNING_DATA[currentTopic] || [];


    if (!query) {

        renderTopic(items);

        return;

    }


    const filtered =
        items.filter(item => {

            return (

                String(item.nameEn)
                    .toLowerCase()
                    .includes(query)

                ||

                String(item.nameHi)
                    .toLowerCase()
                    .includes(query)

                ||

                String(item.infoEn)
                    .toLowerCase()
                    .includes(query)

                ||

                String(item.infoHi)
                    .toLowerCase()
                    .includes(query)

            );

        });


    renderTopic(filtered);

}


if (topicSearch) {

    topicSearch.addEventListener(
        "input",
        event => {

            searchCurrentTopic(
                event.target.value
            );

        }
    );

}


/* =========================================================
   HOME SEARCH
   ========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            const query =
                String(event.target.value)
                    .trim()
                    .toLowerCase();

            const cards =
                document.querySelectorAll(
                    "[data-topic]"
                );

            cards.forEach(card => {

                const topic =
                    card.dataset.topic || "";

                const info =
                    TOPIC_INFO[topic];

                if (!info) return;

                const searchable =
                    `${info.en} ${info.hi}`
                        .toLowerCase();

                card.style.display =
                    !query ||
                    searchable.includes(query)
                        ? ""
                        : "none";

            });

        }
    );

}


/* =========================================================
   HOME CARD CLICK
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                "[data-topic]"
            );

        if (!card) return;

        const topic =
            card.dataset.topic;

        if (topic) {
            openTopic(topic);
        }

    }
);


/* =========================================================
   BACK BUTTON
   ========================================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            currentTopic = null;

            if (learningPage) {
                learningPage.hidden = true;
            }

            if (homePage) {
                homePage.hidden = false;
            }

            if (topicSearch) {
                topicSearch.value = "";
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   LANGUAGE TOGGLE
   ========================================================= */

function updateLanguageUI() {

    const info =
        currentTopic
            ? TOPIC_INFO[currentTopic]
            : null;


    if (info) {

        if (topicTitle) {

            topicTitle.textContent =
                currentLanguage === "hi"
                    ? info.hi
                    : info.en;

        }

        if (topicSubtitle) {

            topicSubtitle.textContent =
                currentLanguage === "hi"
                    ? info.subtitleHi
                    : info.subtitleEn;

        }

    }


    if (languageBtn) {

        languageBtn.textContent =
            currentLanguage === "en"
                ? "हिंदी"
                : "English";

    }

}


if (languageBtn) {

    languageBtn.addEventListener(
        "click",
        () => {

            currentLanguage =
                currentLanguage === "en"
                    ? "hi"
                    : "en";

            updateLanguageUI();

        }
    );

}


/* =========================================================
   PREVIOUS / NEXT
   ========================================================= */

function updateNavigation() {

    if (!currentTopic) return;

    const index =
        topicOrder.indexOf(
            currentTopic
        );

    if (previousBtn) {

        previousBtn.disabled =
            index <= 0;

    }

    if (nextBtn) {

        nextBtn.disabled =
            index === -1 ||
            index >= topicOrder.length - 1;

    }

}


function openPreviousTopic() {

    const index =
        topicOrder.indexOf(
            currentTopic
        );

    if (index > 0) {

        openTopic(
            topicOrder[index - 1]
        );

    }

}


function openNextTopic() {

    const index =
        topicOrder.indexOf(
            currentTopic
        );

    if (
        index >= 0 &&
        index < topicOrder.length - 1
    ) {

        openTopic(
            topicOrder[index + 1]
        );

    }

}


if (previousBtn) {

    previousBtn.addEventListener(
        "click",
        openPreviousTopic
    );

}


if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        openNextTopic
    );

}


/* =========================================================
   ADD FOOD CARD AUTOMATICALLY
   =========================================================

   अगर पुराने HTML में Food & Vegetables card नहीं है,
   तो JS उसे learning grid में automatically add करेगा.
   ========================================================= */

function addFoodTopicCard() {

    if (
        document.querySelector(
            '[data-topic="foodVegetables"]'
        )
    ) {
        return;
    }


    const possibleGrids = [

        ".learning-grid",

        "#learningGrid",

        ".cards-grid",

        ".learning-cards",

        ".topics-grid",

        ".grid"

    ];


    let grid = null;


    for (
        const selector of possibleGrids
    ) {

        const found =
            document.querySelector(
                selector
            );

        if (found) {

            grid = found;

            break;

        }

    }


    if (!grid) return;


    const card =
        document.createElement("div");

    card.className =
        "learning-card";

    card.dataset.topic =
        "foodVegetables";


    card.innerHTML = `

        <div class="card-icon">
            🥗
        </div>

        <h3>
            Food & Vegetables
        </h3>

        <p>
            खाने और सब्जियों के बारे में सीखें
        </p>

    `;


    grid.appendChild(card);

}


/* =========================================================
   CREATE MISSING VISUAL ICON
   ========================================================= */

function improveVisualIcons() {

    const cards =
        document.querySelectorAll(
            "[data-topic]"
        );

    cards.forEach(card => {

        const topic =
            card.dataset.topic;

        if (!card.querySelector(".card-icon")) {

            const icon =
                TOPIC_INFO[topic]?.icon;

            if (!icon) return;

            const iconElement =
                document.createElement("div");

            iconElement.className =
                "card-icon";

            iconElement.textContent =
                icon;

            card.prepend(
                iconElement
            );

        }

    });

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            learningPage &&
            !learningPage.hidden
        ) {

            if (backBtn) {
                backBtn.click();
            }

        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeLearningHub() {

    if (learningPage) {
        learningPage.hidden = true;
    }

    if (homePage) {
        homePage.hidden = false;
    }

    addFoodTopicCard();

    improveVisualIcons();

    updateLanguageUI();


    console.log(
        "ALL LEARNING HUB READY"
    );

    console.log(
        "Countries:",
        COUNTRIES.length
    );

    console.log(
        "Food & Vegetables:",
        FOOD_VEGETABLES.length
    );

    console.log(
        "Human Body:",
        HUMAN_BODY.length
    );

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLearningHub
    );

} else {

    initializeLearningHub();

}
