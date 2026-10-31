export type Language = "en" | "sw"

export interface TranslationSchema {
  common: {
    tagline: string
    back: string
    loading: string
    copy: string
    copied: string
    copyright: string
    support: string
  }
  portal: {
    title: string
    subtitle: string
    instruction: string
    contact: {
      title: string
      subtitle: string
      callButton: string
      whatsappButton: string
      phoneLabel: string
      badge: string
      defaultMessage: string
    }
  }
  bundle: {
    title: string
    subtitle: string
    price: string
    duration: string
    dataLimit: string
    unlimited: string
    selectPackage: string
    noBundles: string
    retry: string
    hours: string
    days: string
  }
  pay: {
    title: string
    subtitle: string
    clientNameLabel: string
    clientNamePlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    phoneHint: string
    pushNotice: string
    payButton: string
    processingButton: string
    errorGeneric: string
  }
  success: {
    title: string
    activatingTitle: string
    activatingNotice: string
    voucherHeader: string
    connectInstruction: string
    connectButton: string
    rateButton: string
  }
  rate: {
    title: string
    subtitle: string
    commentLabel: string
    commentPlaceholder: string
    submitButton: string
    thankYouTitle: string
    thankYouMessage: string
  }
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    common: {
      tagline: "We're here for you, daily",
      back: "Back",
      loading: "Loading...",
      copy: "Copy Code",
      copied: "Copied!",
      copyright: "© 2024 SmartLink Digital — We're here for you, daily",
      support: "Support",
    },
    portal: {
      title: "Connect to WiFi",
      subtitle: "Select Your Mobile Money Provider",
      instruction: "Tap your mobile money provider to continue",
      contact: {
        title: "Need Help? Contact Admin Directly",
        subtitle: "Trouble paying or getting connected? Contact our administrator directly for instant support.",
        callButton: "Call Admin",
        whatsappButton: "WhatsApp",
        phoneLabel: "Support Hotline",
        badge: "Admin Available",
        defaultMessage: "Hello Admin, I need assistance connecting to SmartLink WiFi.",
      },
    },
    bundle: {
      title: "Select Your Package",
      subtitle: "Choose the package that suits your browsing needs",
      price: "Price",
      duration: "Duration",
      dataLimit: "Data Limit",
      unlimited: "Unlimited Data",
      selectPackage: "Select Package",
      noBundles: "No packages available at this time.",
      retry: "Try Again",
      hours: "Hours",
      days: "Days",
    },
    pay: {
      title: "Confirm & Pay",
      subtitle: "Selected Package",
      clientNameLabel: "Your Full Name (Optional)",
      clientNamePlaceholder: "e.g. John Doe",
      phoneLabel: "Mobile Money Number",
      phonePlaceholder: "e.g. 07XXXXXXXX or 06XXXXXXXX",
      phoneHint: "Enter the number you want to pay with",
      pushNotice: "After pressing pay, please check your phone screen for the USSD prompt and enter your PIN to approve.",
      payButton: "Pay Now",
      processingButton: "Sending payment prompt...",
      errorGeneric: "Payment initiation failed. Please try again or contact Admin.",
    },
    success: {
      title: "Payment Received!",
      activatingTitle: "Activating Your Internet...",
      activatingNotice: "Please wait while we generate and verify your voucher code.",
      voucherHeader: "Your WiFi Voucher Code",
      connectInstruction: "Copy this code or click connect to start browsing immediately.",
      connectButton: "Connect to Internet",
      rateButton: "Rate Our Service",
    },
    rate: {
      title: "Rate Your WiFi Experience",
      subtitle: "How satisfied are you with SmartLink Digital WiFi?",
      commentLabel: "Feedback / Suggestions (Optional)",
      commentPlaceholder: "Tell us how we can improve...",
      submitButton: "Submit Rating",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your feedback helps us deliver faster, more reliable internet.",
    },
  },
  sw: {
    common: {
      tagline: "Tupo kwa ajili yako, kila siku",
      back: "Rudi Nyuma",
      loading: "Inapakia...",
      copy: "Nakili Vocha",
      copied: "Imenakiliwa!",
      copyright: "© 2024 SmartLink Digital — Tupo kwa ajili yako, kila siku",
      support: "Msaada",
    },
    portal: {
      title: "Unganisha na WiFi",
      subtitle: "Chagua Mtandao wa Malipo ya Simu",
      instruction: "Bonyeza mtandao wako wa malipo kuendelea",
      contact: {
        title: "Unahitaji Msaada? Wasiliana na Admin Moja kwa Moja",
        subtitle: "Unapata shida kulipia au kuunganisha? Wasiliana na msimamizi wetu sasa kwa msaada wa haraka.",
        callButton: "Piga Simu",
        whatsappButton: "Tuma WhatsApp",
        phoneLabel: "Namba ya Msaada",
        badge: "Admin Yupo Hewani",
        defaultMessage: "Habari Admin, nahitaji msaada wa kujiunga na SmartLink WiFi.",
      },
    },
    bundle: {
      title: "Chagua Kifurushi Chako",
      subtitle: "Chagua kifurushi kinachokufaa kulingana na mahitaji yako",
      price: "Bei",
      duration: "Muda",
      dataLimit: "Kiwango cha Data",
      unlimited: "Bila Kikomo",
      selectPackage: "Chagua Kifurushi",
      noBundles: "Hakuna vifurushi vinavyopatikana kwa sasa.",
      retry: "Jaribu Tena",
      hours: "Masaa",
      days: "Siku",
    },
    pay: {
      title: "Thibitisha & Lipa",
      subtitle: "Kifurushi Ulichochagua",
      clientNameLabel: "Jina Lako Kamili (Sio lazima)",
      clientNamePlaceholder: "mfano: Juma Rashid",
      phoneLabel: "Namba ya Simu ya Malipo",
      phonePlaceholder: "mfano: 07XXXXXXXX au 06XXXXXXXX",
      phoneHint: "Weka namba unayotaka itoe fedha",
      pushNotice: "Baada ya kubonyeza lipa, angalia skrini ya simu yako kuweka namba ya siri (PIN) ili kukamilisha malipo.",
      payButton: "Lipa Sasa",
      processingButton: "Inatuma ombi kwenye simu...",
      errorGeneric: "Ombi la malipo limeshindwa. Tafadhali jaribu tena au wasiliana na Admin.",
    },
    success: {
      title: "Malipo Yamepokelewa!",
      activatingTitle: "Inawasha Intaneti Yako...",
      activatingNotice: "Tafadhali subiri kidogo tunapothibitisha na kutengeneza vocha yako.",
      voucherHeader: "Namba Yako ya Vocha ya WiFi",
      connectInstruction: "Nakili namba hii ya vocha au bonyeza unganisha kuanza kutumia intaneti.",
      connectButton: "Unganisha na Intaneti",
      rateButton: "Toa Maoni ya Huduma",
    },
    rate: {
      title: "Toa Maoni Kuhusu WiFi",
      subtitle: "Umeridhika kiasi gani na huduma ya intaneti ya SmartLink Digital?",
      commentLabel: "Maoni / Ushauri (Sio lazima)",
      commentPlaceholder: "Tuambie jinsi tunavyoweza kuboresha zaidi...",
      submitButton: "Tuma Maoni",
      thankYouTitle: "Asante Sana!",
      thankYouMessage: "Maoni yako yanatusaidia kukupa huduma bora na intaneti yenye kasi zaidi.",
    },
  },
}
