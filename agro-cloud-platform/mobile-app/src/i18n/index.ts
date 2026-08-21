import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Agro-Cloud',
      tagline: 'Precision Advisory & Mandi Linkage',
      tabs: {
        dashboard: 'Dashboard',
        disease: 'Crop Doctor',
        advisory: 'Advisory',
        mandi: 'Mandi Rates',
        profile: 'Profile'
      },
      dashboard: {
        title: 'Field Telemetry & Health',
        welcome: 'Welcome, Farmer',
        moisture: 'Soil Moisture',
        temperature: 'Soil Temp',
        nitrogen: 'Nitrogen (N)',
        phosphorus: 'Phosphorus (P)',
        potassium: 'Potassium (K)',
        ph: 'Soil pH',
        statusOptimal: 'Optimal Condition',
        statusIrrigation: 'Irrigation Needed'
      },
      disease: {
        title: 'AI Crop Disease Diagnosis',
        instruction: 'Take or upload a leaf photo to diagnose plant diseases instantly.',
        scanButton: 'Diagnose Crop Leaf',
        analyzing: 'AI Engine Analyzing Image...',
        organicCure: 'Organic Treatment',
        chemicalCure: 'Chemical Remedy'
      },
      advisory: {
        title: 'Precision NPK & Water Advisor',
        growthStage: 'Crop Growth Stage',
        calculate: 'Calculate Advisory',
        irrigationUrgency: 'Irrigation Urgency',
        recommendation: 'Fertilizer Recommendation'
      },
      mandi: {
        title: 'Regional Mandi Spot Rates',
        searchPlaceholder: 'Search crop or market...',
        modalPrice: 'Modal Price (₹/Quintal)',
        trend: 'Market Trend',
        harvestWindow: 'Optimal Harvest Window'
      },
      profile: {
        title: 'Farmer Profile & Settings',
        selectLanguage: 'Select Preferred Language',
        offlineCache: 'Offline Cache Active'
      }
    }
  },
  hi: {
    translation: {
      appName: 'एग्रो-क्लाउड',
      tagline: 'सटीक कृषि सलाह और मंडी बाजार',
      tabs: {
        dashboard: 'डैशबोर्ड',
        disease: 'फसल डॉक्टर',
        advisory: 'कृषि सलाह',
        mandi: 'मंडी भाव',
        profile: 'प्रोफाइल'
      },
      dashboard: {
        title: 'खेत सेंसर और स्थिति',
        welcome: 'नमस्ते, किसान भाई',
        moisture: 'मृदा नमी',
        temperature: 'मिट्टी तापमान',
        nitrogen: 'नाइट्रोजन (N)',
        phosphorus: 'फास्फोरस (P)',
        potassium: 'पोटेशियम (K)',
        ph: 'मिट्टी pH',
        statusOptimal: 'उत्तम स्थिति',
        statusIrrigation: 'सिंचाई आवश्यक'
      },
      disease: {
        title: 'एआई फसल रोग निदान',
        instruction: 'पत्ती का फोटो लें या अपलोड करें और तुरंत रोग का पता लगाएं।',
        scanButton: 'पत्ती की जांच करें',
        analyzing: 'एआई इंजन जांच कर रहा है...',
        organicCure: 'जैविक उपचार',
        chemicalCure: 'रासायनिक उपचार'
      },
      advisory: {
        title: 'एनपीके और जल सलाहकार',
        growthStage: 'फसल विकास चरण',
        calculate: 'सलाह प्राप्त करें',
        irrigationUrgency: 'सिंचाई की आवश्यकता',
        recommendation: 'खाद की सिफारिश'
      },
      mandi: {
        title: 'क्षेत्रीय मंडी भाव',
        searchPlaceholder: 'फसल या मंडी खोजें...',
        modalPrice: 'मॉडल भाव (₹/क्विंटल)',
        trend: 'बाजार रुझान',
        harvestWindow: 'उपयुक्त कटाई का समय'
      },
      profile: {
        title: 'किसान प्रोफाइल और भाषा',
        selectLanguage: 'अपनी भाषा चुनें',
        offlineCache: 'ऑफलाइन डेटा सक्रिय'
      }
    }
  },
  te: {
    translation: {
      appName: 'ఆగ్రో-క్లౌడ్',
      tagline: 'వ్యవసాయ సలహాలు మరియు మార్కెట్ ధరలు',
      tabs: {
        dashboard: 'డాష్‌బోర్డ్',
        disease: 'పంట డాక్టర్',
        advisory: 'సలహాలు',
        mandi: 'మార్కెట్ ధరలు',
        profile: 'ప్రొఫైల్'
      },
      dashboard: {
        title: 'చేను సమాచారం & పరిస్థితి',
        welcome: 'స్వాగతం, రైతు సోదరా',
        moisture: 'నేల తేమ',
        temperature: 'నేల ఉష్ణోగ్రత',
        nitrogen: 'నత్రజని (N)',
        phosphorus: 'భాస్వరం (P)',
        potassium: 'పొటాషియం (K)',
        ph: 'నేల పి.హెచ్ (pH)',
        statusOptimal: 'అనుకూల పరిస్థితి',
        statusIrrigation: 'నీటి తడి అవసరం'
      },
      disease: {
        title: 'AI పంట వ్యాధి నిర్ధారణ',
        instruction: 'ఆకు ఫోటో తీసి వ్యాధిని వెంటనే గుర్తించండి.',
        scanButton: 'ఆకును పరీక్షించండి',
        analyzing: 'విశ్లేషిస్తోంది...',
        organicCure: 'సేంద్రీయ నివారణ',
        chemicalCure: 'రసాయన నివారణ'
      },
      advisory: {
        title: 'NPK & నీటి సలహాదారు',
        growthStage: 'పంట పెరుగుదల దశ',
        calculate: 'సలహా పొందండి',
        irrigationUrgency: 'నీటి అవసరం',
        recommendation: 'ఎరువుల సలహా'
      },
      mandi: {
        title: 'మండీ మార్కెట్ ధరలు',
        searchPlaceholder: 'పంట లేదా మార్కెట్ వెతకండి...',
        modalPrice: 'ధర (₹/క్వింటాల్)',
        trend: 'మార్కెట్ సరళి',
        harvestWindow: 'కోతకు సరైన సమయం'
      },
      profile: {
        title: 'రైతు ప్రొఫైల్',
        selectLanguage: 'భాషను ఎంచుకోండి',
        offlineCache: 'ఆఫ్‌లైన్ క్యాష్ అందుబాటులో ఉంది'
      }
    }
  },
  mr: {
    translation: {
      appName: 'ॲग्रो-क्लाउड',
      tagline: 'कृषी सल्ला आणि बाजार भाव',
      tabs: {
        dashboard: 'डॅशबोर्ड',
        disease: 'पिक डॉक्टर',
        advisory: 'सल्ला',
        mandi: 'बाजार भाव',
        profile: 'प्रोफाइल'
      },
      dashboard: {
        title: 'शेत सेन्सर आणि हवामान',
        welcome: 'नमस्कार, बळीराजा',
        moisture: 'मातीतील ओलावा',
        temperature: 'मातीचे तापमान',
        nitrogen: 'नत्र (N)',
        phosphorus: 'स्फुरद (P)',
        potassium: 'पालश (K)',
        ph: 'मातीचा सामू (pH)',
        statusOptimal: 'उत्कृष्ट स्थिती',
        statusIrrigation: 'पाण्याची गरज'
      },
      disease: {
        title: 'AI पीक रोग निदान',
        instruction: 'पानाचा फोटो काढून रोगाचे तत्काळ निदान करा.',
        scanButton: 'पानाची तपासणी करा',
        analyzing: 'तपासणी सुरू आहे...',
        organicCure: 'जैविक उपाय',
        chemicalCure: 'रासायनिक उपाय'
      },
      advisory: {
        title: 'NPK आणि पाणी सल्लागार',
        growthStage: 'पिकाची वाढीची अवस्था',
        calculate: 'सल्ला मिळवा',
        irrigationUrgency: 'सिंचनाची गरज',
        recommendation: 'खत व्यवस्थापन'
      },
      mandi: {
        title: 'बाजार समिती भाव',
        searchPlaceholder: 'पीक किंवा बाजार शोधा...',
        modalPrice: 'दर (₹/क्विंटल)',
        trend: 'बाजार कल',
        harvestWindow: 'काढणीची योग्य वेळ'
      },
      profile: {
        title: 'शेतकरी प्रोफाइल',
        selectLanguage: 'भाषा निवडा',
        offlineCache: 'ऑफलाइन डेटा सक्रिय'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
