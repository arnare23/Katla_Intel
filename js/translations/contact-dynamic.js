(function () {
  'use strict';

  window.KatlaI18n.registerTranslations('en', {
    // Contact page - Header
    'contact.header.breadcrumbHome': 'Home',
    'contact.header.breadcrumbContact': 'Contact',
    'contact.header.title': 'Get in Touch',
    'contact.header.description': "Tell us about your project and we'll explore what's possible",

    // Contact page - Form
    'contact.form.nameLabel': 'Full Name',
    'contact.form.namePlaceholder': 'Your name',
    'contact.form.emailLabel': 'Email Address',
    'contact.form.emailPlaceholder': 'you@company.com',
    'contact.form.companyLabel': 'Company',
    'contact.form.companyPlaceholder': 'Your company (optional)',
    'contact.form.serviceLabel': 'Service Interest',
    'contact.form.messageLabel': 'Message',
    'contact.form.messagePlaceholder': 'Describe your project, challenges, or questions...',
    'contact.form.submit': 'Send Message',
    'contact.form.successMessage': "Thank you! We've received your message and will get back to you within 24 hours.",

    // Contact page - Form options
    'contact.form.opt.default': 'Select a service...',
    'contact.form.opt.forecasting': 'Forecasting Models',
    'contact.form.opt.clustering': 'Clustering & Classification Models',
    'contact.form.opt.computerVision': 'Computer Vision',
    'contact.form.opt.control': 'Control Models',
    'contact.form.opt.mixedModels': 'Mixed Models',
    'contact.form.opt.automation': 'Workflow Automation',
    'contact.form.opt.fileManagement': 'File Management',
    'contact.form.opt.consulting': 'Consulting',
    'contact.form.opt.chatbot': 'AI Chatbot Creation',
    'contact.form.opt.other': 'Other / Not Sure',

    // Contact page - Info
    'contact.info.emailLabel': 'Email',
    'contact.info.locationLabel': 'Location',
    'contact.info.locationValue': 'Reykjavik, Iceland',
    'contact.info.responseLabel': 'Response Time',
    'contact.info.responseValue': 'Expect a reply within one business day',
    'contact.info.followUs': 'Follow Us',

    // Contact page - FAQ
    'contact.faq.title': 'Frequently Asked Questions',
    'contact.faq.q1': 'What industries do you work with?',
    'contact.faq.a1': "We have delivered solutions across marine and fishing, finance, manufacturing, legal, and technology sectors. That said, our neural network systems are built around your data and processes, not a fixed industry template. If your business generates data and makes decisions based on it, we can likely help \u2014 whether that means forecasting demand, automating document workflows, or building computer vision systems for quality inspection. Reach out and we'll quickly assess whether there's a fit.",
    'contact.faq.q2': 'How long does a typical project take?',
    'contact.faq.a2': "It depends on scope, but as a guide: a focused proof-of-concept typically takes 4\u20136 weeks, while a full production-ready system lands in the 3\u20136 month range. Every engagement follows our four-step process \u2014 Discover, Design, Develop, Deploy \u2014 so we set clear milestones from day one. During the initial discovery call we'll map out a realistic timeline based on your data readiness, integration needs, and desired outcomes.",
    'contact.faq.q3': 'Do we need to have our data ready?',
    'contact.faq.a3': "Not at all \u2014 that's what our Discover phase is for. We start by auditing the data you already have, identifying gaps, and working with your team to clean and structure everything before any modelling begins. Many of our clients come to us knowing they're sitting on valuable data but unsure how to use it. We'll guide you through the entire process, from raw data to a trained, deployed model.",
    'contact.faq.q4': "What's your pricing model?",
    'contact.faq.a4': "We keep pricing straightforward. Development projects are scoped with fixed-price milestones so you always know what you're paying for before work begins. For ongoing advisory and optimisation work we offer retainer arrangements, and standalone consulting is billed at a day rate. We'll recommend the model that makes the most sense for your situation during our first conversation \u2014 no surprises.",
    'contact.faq.q5': 'Can you work with our existing tech stack?',
    'contact.faq.a5': "Absolutely. We design every solution to slot into your current infrastructure, not the other way around. Whether you run on AWS, GCP, Azure, on-premise servers, or a hybrid setup, we'll architect the system to integrate cleanly with your existing tools and pipelines. During the Design phase we map out exactly how the new system connects to what you already have, so deployment is smooth and your team isn't forced to learn an entirely new stack.",

    // Shared JS strings - Form
    'js.sendMessage': 'Send Message',
    'js.sending': 'Sending...',
    'js.validation.name': 'Please enter your name (at least 2 characters)',
    'js.validation.email': 'Please enter a valid email address',
    'js.validation.service': 'Please select a service',
    'js.validation.message': 'Please describe your project (at least 10 characters)',
    'js.formSuccess': "Thank you! We've received your message and will get back to you within 24 hours.",
    'js.formError': 'Something went wrong. Please try again or email us directly at hello@katlagroup.com',

    // Blog
    'js.readArticle': 'Read Article',
    'js.readMore': 'Read More',
    'js.loadMore': 'Load More Articles',
    'js.loading': 'Loading...',
    'js.noPostsFound': 'No posts found in this category.',
    'js.minRead': 'min read',
    'js.by': 'By',
    'js.subscribe': 'Subscribe',
    'js.subscribing': 'Subscribing...',
    'js.subscribed': 'Subscribed!',
    'js.pleaseWait': 'Please wait...',
    'js.errorTryAgain': 'Error - Try Again',
    'js.relatedArticles': 'Related Articles',
    'js.relatedSubtitle': 'More posts you might find interesting',

    // Blog post errors
    'js.postNotFound': 'Post Not Found',
    'js.postNotFoundDesc': 'The blog post you are looking for does not exist or has been removed.',
    'js.backToBlog': 'Back to Blog',

    // Careers
    'js.noPositions': 'No open positions at the moment. Check back soon!',
    'js.unableToLoadPositions': 'Unable to load positions. Please try again later.',
    'js.requirements': 'Requirements',
    'js.applyNow': 'Apply Now',
    'js.fullTime': 'Full-time',

    // Case studies
    'js.noCaseStudies': 'No case studies found in this category.',
    'js.caseStudyNotFound': 'Case Study Not Found',
    'js.caseStudyNotFoundDesc': 'The case study you are looking for does not exist or has been removed.',
    'js.backToCaseStudies': 'Back to Case Studies',
    'js.technologiesUsed': 'Technologies Used',

    // Research
    'js.noResearch': 'No research found for this category.',
    'js.researchNotFound': 'Research Not Found',
    'js.researchNotFoundDesc': 'The research post you are looking for does not exist or has been removed.',
    'js.backToResearch': 'Back to Research',
    'js.downloadPdf': 'Download PDF',
    'js.pdf': 'PDF',
    'js.errorLoadingPost': 'Error Loading Post',
    'js.errorLoadingPostDesc': 'Something went wrong. Please try again later.',
    'js.all': 'All',

    // Breadcrumbs
    'js.breadcrumb.home': 'Home',
    'js.breadcrumb.blog': 'Blog',
    'js.breadcrumb.caseStudies': 'Case Studies',
    'js.breadcrumb.research': 'Research'
  });

  window.KatlaI18n.registerTranslations('is', {
    // Contact page - Header
    'contact.header.breadcrumbHome': 'Heim',
    'contact.header.breadcrumbContact': 'Hafa samband',
    'contact.header.title': 'Haf\u00F0u samband',
    'contact.header.description': 'Seg\u00F0u okkur fr\u00E1 verkefninu \u00FE\u00EDnu og vi\u00F0 k\u00F6nnum hva\u00F0 er m\u00F6gulegt',

    // Contact page - Form
    'contact.form.nameLabel': 'Fullt nafn',
    'contact.form.namePlaceholder': 'Nafni\u00F0 \u00FEitt',
    'contact.form.emailLabel': 'Netfang',
    'contact.form.emailPlaceholder': '\u00FE\u00FA@fyrirt\u00E6ki.is',
    'contact.form.companyLabel': 'Fyrirt\u00E6ki',
    'contact.form.companyPlaceholder': 'Fyrirt\u00E6ki\u00F0 \u00FEitt (valfr\u00ED\u00E1lst)',
    'contact.form.serviceLabel': '\u00DEj\u00F3nusta',
    'contact.form.messageLabel': 'Skilabo\u00F0',
    'contact.form.messagePlaceholder': 'L\u00FDstu verkefninu, \u00E1skorunum e\u00F0a spurningum...',
    'contact.form.submit': 'Senda skilabo\u00F0',
    'contact.form.successMessage': 'Takk fyrir! Vi\u00F0 h\u00F6fum m\u00F3tteki\u00F0 skilabo\u00F0in \u00FE\u00EDn og munum svara innan s\u00F3larhrings.',

    // Contact page - Form options
    'contact.form.opt.default': 'Veldu \u00FEj\u00F3nustu...',
    'contact.form.opt.forecasting': 'Sp\u00E1l\u00EDk\u00F6n',
    'contact.form.opt.clustering': 'Flokkun og a\u00F0greining',
    'contact.form.opt.computerVision': 'T\u00F6lvusj\u00F3n',
    'contact.form.opt.control': 'Stj\u00F3rnl\u00EDk\u00F6n',
    'contact.form.opt.mixedModels': 'Bl\u00F6ndu\u00F0 l\u00EDk\u00F6n',
    'contact.form.opt.automation': 'Sj\u00E1lfvirkni verkferla',
    'contact.form.opt.fileManagement': 'Skjalastj\u00F3rnun',
    'contact.form.opt.consulting': 'R\u00E1\u00F0gj\u00F6f',
    'contact.form.opt.chatbot': 'Gervigreindarspjallmenni',
    'contact.form.opt.other': 'Anna\u00F0 / \u00D3visst',

    // Contact page - Info
    'contact.info.emailLabel': 'Netfang',
    'contact.info.locationLabel': 'Sta\u00F0setning',
    'contact.info.locationValue': 'Reykjav\u00EDk, \u00CDsland',
    'contact.info.responseLabel': 'Svart\u00EDmi',
    'contact.info.responseValue': 'B\u00FA\u00F0st vi\u00F0 svari innan eins virkra dags',
    'contact.info.followUs': 'Fylgdu okkur',

    // Contact page - FAQ
    'contact.faq.title': 'Algengar spurningar',
    'contact.faq.q1': 'Hva\u00F0a atvinnugreinar starfa \u00FEi\u00F0 me\u00F0?',
    'contact.faq.a1': 'Vi\u00F0 h\u00F6fum afhent lausnir \u00ED sj\u00E1var\u00FAtvegi, fj\u00E1rm\u00E1lum, framlei\u00F0slu, l\u00F6gfr\u00E6\u00F0i og t\u00E6knigreinum. Tauganetakerfi okkar eru bygg\u00F0 umhverfis g\u00F6gn \u00FE\u00EDn og ferla, ekki fast sni\u00F0m\u00E1t. Ef fyrirt\u00E6ki\u00F0 \u00FEitt b\u00FDr til g\u00F6gn og tekur \u00E1kvar\u00F0anir \u00FAt fr\u00E1 \u00FEeim, getum vi\u00F0 l\u00EDklega hj\u00E1lpa\u00F0 \u2014 hvort sem \u00FEa\u00F0 er a\u00F0 sp\u00E1 eftirspurn, sj\u00E1lfvirkja skjalavinnslu, e\u00F0a byggja t\u00F6lvusj\u00F3narkerfi til g\u00E6\u00F0aeftirlits. Haf\u00F0u samband og vi\u00F0 metum fljott hvort \u00FEa\u00F0 er samr\u00E6\u00F0i.',
    'contact.faq.q2': 'Hversu langt tekur d\u00E6milegt verkefni?',
    'contact.faq.a2': '\u00DEa\u00F0 fer eftir umfangi, en sem lei\u00F0beining: einblitt pr\u00F3funarverkefni tekur venjulega 4\u20136 vikur, en fullt framlei\u00F0slukerfi lendir \u00E1 3\u20136 m\u00E1nu\u00F0um. Hvert verkefni fylgir fj\u00F6gurra skrefa ferli okkar \u2014 Uppg\u00F6tvun, H\u00F6nnun, \u00DEr\u00F3un, Innlei\u00F0ing \u2014 svo vi\u00F0 setjum sk\u00FDr \u00E1fangarmark fr\u00E1 fyrsta degi.',
    'contact.faq.q3': '\u00DEurfum vi\u00F0 a\u00F0 hafa g\u00F6gnin tilb\u00FAin?',
    'contact.faq.a3': 'Alls ekki \u2014 \u00FEa\u00F0 er tilgangur Uppg\u00F6tvunarfasans. Vi\u00F0 byrjum \u00E1 a\u00F0 yfirfara g\u00F6gnin sem \u00FE\u00FA ert n\u00FA \u00FEegar me\u00F0, greinum ey\u00F0ur og vinnum me\u00F0 teyminu \u00FE\u00EDnu vi\u00F0 a\u00F0 hreinsa og skipuleggja allt \u00E1\u00F0ur en nokkur l\u00EDkanager\u00F0 hefst. Margir vi\u00F0skiptavinir okkar koma til okkar me\u00F0 ver\u00F0m\u00E6t g\u00F6gn en \u00F3vissir um hvernig eigi a\u00F0 n\u00FDta \u00FEau.',
    'contact.faq.q4': 'Hvert er ver\u00F0lagningarlikan ykkar?',
    'contact.faq.a4': 'Vi\u00F0 h\u00F6ldum ver\u00F0lagningunni einfaldri. \u00DEr\u00F3unarverkefni eru afm\u00F6rku\u00F0 me\u00F0 f\u00F6stu ver\u00F0i \u00E1 \u00E1fangarmark svo \u00FE\u00FA veist alltaf hva\u00F0 \u00FE\u00FA borgar fyrir \u00E1\u00F0ur en vinna hefst. Fyrir \u00E1framhaldandi r\u00E1\u00F0gj\u00F6f og finstillingu bj\u00F3\u00F0um vi\u00F0 upp \u00E1 retainersamninga, og sj\u00E1lfst\u00E6\u00F0 r\u00E1\u00F0gj\u00F6f er rukkuu\u00F0 \u00E1 daggjaldi.',
    'contact.faq.q5': 'Geti\u00F0 \u00FEi\u00F0 unni\u00F0 me\u00F0 n\u00FAverandi t\u00E6knikerfum okkar?',
    'contact.faq.a5': 'Algjerlega. Vi\u00F0 h\u00F6nnum hverja lausn \u00FEannig a\u00F0 h\u00FAn falli inn \u00ED n\u00FAverandi innvi\u00F0i \u00FE\u00EDn. Hvort sem \u00FE\u00FA keyrir \u00E1 AWS, GCP, Azure, eigin \u00FEj\u00F3num e\u00F0a bl\u00F6ndu\u00F0ri uppsetningu, munum vi\u00F0 hanna kerfi\u00F0 \u00FEannig a\u00F0 \u00FEa\u00F0 tengist sn\u00FA\u00F0lega vi\u00F0 n\u00FAverandi verkf\u00E6rin og leidir \u00FE\u00EDnar.',

    // Shared JS strings - Form
    'js.sendMessage': 'Senda skilabo\u00F0',
    'js.sending': 'Sendir...',
    'js.validation.name': 'Vinsamlegast sl\u00E1\u00F0u inn nafn (a\u00F0 minnsta kosti 2 stafir)',
    'js.validation.email': 'Vinsamlegast sl\u00E1\u00F0u inn gilt netfang',
    'js.validation.service': 'Vinsamlegast veldu \u00FEj\u00F3nustu',
    'js.validation.message': 'Vinsamlegast l\u00FDstu verkefninu \u00FE\u00EDnu (a\u00F0 minnsta kosti 10 stafir)',
    'js.formSuccess': 'Takk fyrir! Vi\u00F0 h\u00F6fum m\u00F3tteki\u00F0 skilabo\u00F0in \u00FE\u00EDn og munum svara innan s\u00F3larhrings.',
    'js.formError': 'Eitthva\u00F0 f\u00F3r \u00FArskei\u00F0is. Vinsamlegast reyndu aftur e\u00F0a sendu okkur t\u00F6lvup\u00F3st \u00E1 hello@katlagroup.com',

    // Blog
    'js.readArticle': 'Lesa grein',
    'js.readMore': 'Lesa meira',
    'js.loadMore': 'Hla\u00F0a fleiri greinum',
    'js.loading': 'Hle\u00F0ur...',
    'js.noPostsFound': 'Engar greinar fundust \u00ED \u00FEessum flokki.',
    'js.minRead': 'm\u00EDn lestur',
    'js.by': 'Eftir',
    'js.subscribe': 'Gerast \u00E1skrifandi',
    'js.subscribing': 'Skr\u00E1ir...',
    'js.subscribed': 'Skr\u00E1\u00F0ur!',
    'js.pleaseWait': 'Vinsamlegast b\u00ED\u00F0i\u00F0...',
    'js.errorTryAgain': 'Villa \u2013 Reyndu aftur',
    'js.relatedArticles': 'Tengdar greinar',
    'js.relatedSubtitle': 'Fleiri greinar sem g\u00E6tu vakki\u00F0 \u00E1huga \u00FEinn',

    // Blog post errors
    'js.postNotFound': 'Grein fannst ekki',
    'js.postNotFoundDesc': 'Blogggreinin sem \u00FE\u00FA leitar a\u00F0 er ekki til e\u00F0a hefur veri\u00F0 fjarl\u00E6g\u00F0.',
    'js.backToBlog': 'Til baka \u00ED blogg',

    // Careers
    'js.noPositions': 'Engar opnar st\u00F6\u00F0ur \u00ED augnablikinu. K\u00EDktu aftur flj\u00F3tlega!',
    'js.unableToLoadPositions': 'Ekki t\u00F3kst a\u00F0 hla\u00F0a st\u00F6\u00F0um. Vinsamlegast reyndu aftur s\u00ED\u00F0ar.',
    'js.requirements': 'Kr\u00F6fur',
    'js.applyNow': 'S\u00E6kja um',
    'js.fullTime': 'Fullt starf',

    // Case studies
    'js.noCaseStudies': 'Engin verkefni fundust \u00ED \u00FEessum flokki.',
    'js.caseStudyNotFound': 'Verkefni fannst ekki',
    'js.caseStudyNotFoundDesc': 'Verkefni\u00F0 sem \u00FE\u00FA leitar a\u00F0 er ekki til e\u00F0a hefur veri\u00F0 fjarl\u00E6gt.',
    'js.backToCaseStudies': 'Til baka \u00ED verkefni',
    'js.technologiesUsed': 'T\u00E6kni sem notu\u00F0 var',

    // Research
    'js.noResearch': 'Engar ranns\u00F3knir fundust \u00ED \u00FEessum flokki.',
    'js.researchNotFound': 'Ranns\u00F3kn fannst ekki',
    'js.researchNotFoundDesc': 'Ranns\u00F3knargreinin sem \u00FE\u00FA leitar a\u00F0 er ekki til e\u00F0a hefur veri\u00F0 fjarl\u00E6g\u00F0.',
    'js.backToResearch': 'Til baka \u00ED ranns\u00F3knir',
    'js.downloadPdf': 'Hla\u00F0a ni\u00F0ur PDF',
    'js.pdf': 'PDF',
    'js.errorLoadingPost': 'Villa vi\u00F0 hle\u00F0slu',
    'js.errorLoadingPostDesc': 'Eitthva\u00F0 f\u00F3r \u00FArskei\u00F0is. Vinsamlegast reyndu aftur s\u00ED\u00F0ar.',
    'js.all': 'Allt',

    // Breadcrumbs
    'js.breadcrumb.home': 'Heim',
    'js.breadcrumb.blog': 'Blogg',
    'js.breadcrumb.caseStudies': 'Verkefni',
    'js.breadcrumb.research': 'Ranns\u00F3knir'
  });
})();
