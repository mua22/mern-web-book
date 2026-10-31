// Guru, the cuinotes.com study assistant. Loaded BEFORE chat.js (see HANDOVER.md).
// The key is a public embed key: it is safe in page source and is locked to the origins allowed in Studio.
window.AlphanetixChatConfig = {
  key: 'ak_31ea5ytl8jkw9u9tu3h1f8pzp4lp8hph',
  agentName: 'Guru',
  subtitle: 'Your CS course guide',
  greeting: 'Hi, I’m Guru. Ask me about Algorithms, Web Technologies, Advanced Web, Databases or Operating Systems.',
  suggestions: [
    'Explain Big-O with an example',
    'What does CSC336 cover?',
    'Where are the CSC270 lab manuals?',
  ],
  disclaimer: 'AI can make mistakes. Check important info.',
  sourcesBaseUrl: 'https://cuinotes.com',
  showSources: true,
  position: 'bottom-right',
  persist: 'session',
  voice: false, // text only until the voice service is live
  // MkDocs Material palette: --md-primary-fg-color #4051b5, font Sora
  theme: { mode: 'auto', primary: '#4051b5', radius: 14, fontFamily: 'Sora, system-ui, sans-serif' },
  launcher: { shape: 'pill', label: 'Ask Guru', badge: false, pulse: false },
};
