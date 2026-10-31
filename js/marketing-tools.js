/* DEMO ONLY — no analytics, no pixel, no Clarity in the demo. Same API, all no-ops. */
(function(){
  var noop = function(){};
  window.dataLayer = []; window.gtag = noop; window.clarity = noop; window.__trackingStarted = true;
  ['trackEvent','trackButtonClick','trackFormSubmission','trackSignup','sendEventToCAPI','saveCapiBrowserData','saveFullAttribution','clearReferrerId']
    .forEach(function(n){ window[n] = noop; });
  window.getReferrerId = function(){ return null; };
  window.getUtmData = function(){ return {}; };
  window.getFullAttribution = function(){ return {}; };
  window.newCapiEventId = function(){ return 'demo'; };
  window.initializeTracking = noop; window.ensureTrackingStarted = noop;
  window.hasUserConsented = function(){ return true; };
  window.getConsentLevel = function(){ return 'essential'; };
})();
