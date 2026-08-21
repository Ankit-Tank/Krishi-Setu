import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Krishi Setu',
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
        offlineCache: 'Offline Cache Active',
        irrigation: 'Irrigation',
        experience: 'Experience',
        season: 'Preferred Season'
      },
      onboarding: {
        title: '🌱 Welcome to Krishi Setu',
        subtitle: 'Register your farmer profile & farm plot details to get personalized AI agronomic advisories.',
        farmerSection: '👨‍🌾 1. Farmer Identity',
        fullName: 'Full Name *',
        phone: 'Mobile Phone Number *',
        region: 'Village / Tehsil / Region Name *',
        experience: 'Farming Experience (in Years) *',
        farmSection: '🌾 2. Farm Plot Details',
        farmName: 'Farm / Plot Name *',
        cropType: 'Select Primary Crop Type *',
        area: 'Plot Area in Acres *',
        irrigationSource: 'Irrigation Source *',
        irrigationBorewell: 'Borewell',
        irrigationCanal: 'Canal',
        irrigationRainfed: 'Rainfed',
        irrigationOther: 'Other',
        preferredSeason: 'Preferred Crop Season *',
        seasonKharif: 'Kharif',
        seasonRabi: 'Rabi',
        seasonBoth: 'Both',
        submitButton: 'Create Profile & Start Dashboard',
        networkError: "Couldn't connect - check your WiFi and try again"
      }
    }
  },
  hi: {
    translation: {
      appName: 'कृषि सेतु',
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
        offlineCache: 'ऑफलाइन डेटा सक्रिय',
        irrigation: 'सिंचाई साधन',
        experience: 'खेती का अनुभव',
        season: 'पसंदीदा फसल चक्र'
      },
      onboarding: {
        title: '🌱 कृषि सेतु में आपका स्वागत है',
        subtitle: 'व्यक्तिगत एआई कृषि सलाह पाने के लिए अपना प्रोफाइल और खेत विवरण दर्ज करें।',
        farmerSection: '👨‍🌾 1. किसान विवरण',
        fullName: 'पूरा नाम *',
        phone: 'मोबाइल नंबर *',
        region: 'गांव / तहसील / क्षेत्र *',
        experience: 'खेती का अनुभव (वर्ष) *',
        farmSection: '🌾 2. खेत का विवरण',
        farmName: 'खेत / प्लॉट का नाम *',
        cropType: 'मुख्य फसल चुनें *',
        area: 'खेत का क्षेत्रफल (एकड़) *',
        irrigationSource: 'सिंचाई साधन *',
        irrigationBorewell: 'बोरवेल',
        irrigationCanal: 'नहर',
        irrigationRainfed: 'वर्षा आधारित',
        irrigationOther: 'अन्य',
        preferredSeason: 'पसंदीदा फसल मौसम *',
        seasonKharif: 'खरीफ',
        seasonRabi: 'रबी',
        seasonBoth: 'दोनों',
        submitButton: 'प्रोफाइल बनाएं और शुरू करें',
        networkError: 'सर्वर से कनेक्ट नहीं हो सका - कृपया अपना वाईफाई जांचें और पुनः प्रयास करें'
      }
    }
  },
  te: {
    translation: {
      appName: 'కృషి సేతు',
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
        offlineCache: 'ఆఫ్‌లైన్ క్యాష్ అందుబాటులో ఉంది',
        irrigation: 'నీటి వనరు',
        experience: 'అనుభవం',
        season: 'పంట సీజన్'
      },
      onboarding: {
        title: '🌱 కృషి సేతుకి స్వాగతం',
        subtitle: 'వ్యక్తిగత AI వ్యవసాయ సలహాల కోసం మీ వివరాలను నమోదు చేయండి.',
        farmerSection: '👨‍🌾 1. రైతు వివరాలు',
        fullName: 'పూర్తి పేరు *',
        phone: 'మొబైల్ సంఖ్య *',
        region: 'గ్రామం / ప్రాంతం *',
        experience: 'వ్యవసాయ అనుభవం (సంవత్సరాలు) *',
        farmSection: '🌾 2. పొలం వివరాలు',
        farmName: 'పొలం పేరు *',
        cropType: 'ప్రధాన పంట *',
        area: 'విస్తీర్ణం (ఎకరాలు) *',
        irrigationSource: 'నీటి వనరు *',
        irrigationBorewell: 'బోరుబావి',
        irrigationCanal: 'కాలువ',
        irrigationRainfed: 'వర్షాధారం',
        irrigationOther: 'ఇతర',
        preferredSeason: 'పంట కాలం *',
        seasonKharif: 'ఖరీఫ్',
        seasonRabi: 'రబీ',
        seasonBoth: 'రెండూ',
        submitButton: 'ప్రొఫైల్ సృష్టించండి',
        networkError: 'కనెక్ట్ చేయడం సాధ్యం కాలేదు - మీ వైఫైని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి'
      }
    }
  },
  mr: {
    translation: {
      appName: 'कृषी सेतू',
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
        offlineCache: 'ऑफलाइन डेटा सक्रिय',
        irrigation: 'सिंचन स्रोत',
        experience: 'शेतीचा अनुभव',
        season: 'हंगाम'
      },
      onboarding: {
        title: '🌱 कृषी सेतू मध्ये आपले स्वागत आहे',
        subtitle: 'वैयक्तिकृत कृषी सल्ल्यासाठी तुमची माहिती नोंदवा.',
        farmerSection: '👨‍🌾 1. शेतकरी माहिती',
        fullName: 'पूर्ण नाव *',
        phone: 'मोबाईल नंबर *',
        region: 'गाव / तालुका / जिल्हा *',
        experience: 'शेतीचा अनुभव (वर्षे) *',
        farmSection: '🌾 2. शेत तपशील',
        farmName: 'शेताचे नाव *',
        cropType: 'मुख्य पीक निवडा *',
        area: 'क्षेत्रफळ (एकर) *',
        irrigationSource: 'सिंचन साधन *',
        irrigationBorewell: 'बोअरवेल',
        irrigationCanal: 'कालवा',
        irrigationRainfed: 'पावसावर आधारित',
        irrigationOther: 'इतर',
        preferredSeason: 'पिकाचा हंगाम *',
        seasonKharif: 'खरीप',
        seasonRabi: 'रब्बी',
        seasonBoth: 'दोन्ही',
        submitButton: 'प्रोफाइल तयार करा',
        networkError: 'सर्व्हरशी संपर्क होऊ शकला नाही - कृपया वायफाय तपासा आणि पुन्हा प्रयत्न करा'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
