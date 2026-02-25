/**
 * Navigation Section Registry
 * Maps page paths to their navigable sections for dropdown menus.
 * Section names are derived from the <h2> headings in each section HTML file.
 */
window.NAV_SECTIONS = {
  '/pages/about/': [
    { id: 'mission', name: 'Our Mission' },
    { id: 'story', name: 'Our Story' },
    { id: 'team', name: 'Meet the Founders' },
    { id: 'values', name: 'Our Values' },
    { id: 'approach', name: 'How We Work' }
  ],
  '/pages/services/': [
    { id: 'services-overview', name: 'Our Services' },
    { id: 'service-forecasting', name: 'Forecasting Models' },
    { id: 'service-clustering', name: 'Clustering & Classification' },
    { id: 'service-computer-vision', name: 'Computer Vision' },
    { id: 'service-control', name: 'Control Models' },
    { id: 'service-mixed', name: 'Mixed Models' },
    { id: 'service-automation', name: 'Workflow Automation' },
    { id: 'service-file-management', name: 'File Management' },
    { id: 'service-consulting', name: 'Neural Network Consulting' },
    { id: 'service-chatbot', name: 'AI Chatbot Creation' }
  ],
  '/pages/contact/': [
    { id: 'contact', name: 'Send a Message' },
    { id: 'faq', name: 'FAQ' }
  ]
};
