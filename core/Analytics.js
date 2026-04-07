/**
 * Analytics
 * Wrapper agnóstico para GA4, Mixpanel, Segment, etc
 *
 * Uso:
 * const analytics = new Analytics({ provider: 'ga4', id: 'G-XXXXX' })
 * analytics.trackEvent('button_click', { button: 'submit' })
 * analytics.trackPageView('/dashboard')
 */

class Analytics {
  constructor(options = {}) {
    this.provider = options.provider || 'ga4' // 'ga4', 'gtm', 'mixpanel', 'segment', 'custom'
    this.id = options.id || null
    this.enabled = options.enabled !== false
    this.userId = options.userId || null
    this.sessionId = this._generateSessionId()
    this.events = []
    this.maxEvents = 100

    if (this.enabled) {
      this._initProvider()
    }
  }

  /**
   * Initialize analytics provider
   */
  _initProvider() {
    if (!this.id) {
      console.warn('[Analytics] No ID provided for provider:', this.provider)
      return
    }

    switch (this.provider) {
      case 'ga4':
        this._initGA4()
        break
      case 'gtm':
        this._initGTM()
        break
      case 'mixpanel':
        this._initMixpanel()
        break
      case 'segment':
        this._initSegment()
        break
      default:
        console.warn('[Analytics] Unknown provider:', this.provider)
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  _initGA4() {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.id}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', this.id)
  }

  /**
   * Initialize Google Tag Manager
   */
  _initGTM() {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.id}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })
  }

  /**
   * Initialize Mixpanel
   */
  _initMixpanel() {
    const script = document.createElement('script')
    script.textContent = `
      (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"undefined"!==typeof d&&"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_tracking_cookie clear_opt_out_tracking_cookie getEditorParams".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2}})(document,window.mixpanel||[]);
      mixpanel.init("${this.id}");
    `
    document.head.appendChild(script)
  }

  /**
   * Initialize Segment
   */
  _initSegment() {
    const script = document.createElement('script')
    script.textContent = `
      !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var t=analytics.methods[e];analytics[t]=analytics.factory(t)}analytics.load=function(e,t){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+e+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=t};analytics._writeKey="${this.id}";analytics.SNIPPET_VERSION="4.13.1";
      analytics.load("${this.id}");
      analytics.page();
    }}();
    `
    document.head.appendChild(script)
  }

  /**
   * Track event
   */
  trackEvent(eventName, eventData = {}) {
    if (!this.enabled) return

    const event = {
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    switch (this.provider) {
      case 'ga4':
        window.gtag?.('event', eventName, eventData)
        break
      case 'gtm':
        window.dataLayer?.push({ event: eventName, ...eventData })
        break
      case 'mixpanel':
        window.mixpanel?.track(eventName, eventData)
        break
      case 'segment':
        window.analytics?.track(eventName, eventData)
        break
    }

    console.debug('[Analytics] Event tracked:', eventName, eventData)
    return this
  }

  /**
   * Track page view
   */
  trackPageView(path, title) {
    if (!this.enabled) return

    const pageData = {
      path: path || window.location.pathname,
      title: title || document.title,
      url: window.location.href,
      referrer: document.referrer
    }

    switch (this.provider) {
      case 'ga4':
        window.gtag?.('event', 'page_view', pageData)
        break
      case 'gtm':
        window.dataLayer?.push({ event: 'pageview', ...pageData })
        break
      case 'mixpanel':
        window.mixpanel?.track('$pageview', pageData)
        break
      case 'segment':
        window.analytics?.page(title, pageData)
        break
    }

    return this
  }

  /**
   * Identify user
   */
  identifyUser(userId, traits = {}) {
    if (!this.enabled) return

    this.userId = userId

    const data = { id: userId, ...traits }

    switch (this.provider) {
      case 'ga4':
        window.gtag?.('event', 'login', { method: 'EliteUI' })
        window.gtag?.('config', this.id, { user_id: userId })
        break
      case 'gtm':
        window.dataLayer?.push({ event: 'identify', userId, ...traits })
        break
      case 'mixpanel':
        window.mixpanel?.identify(userId)
        window.mixpanel?.people.set(traits)
        break
      case 'segment':
        window.analytics?.identify(userId, traits)
        break
    }

    return this
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName, formData = {}) {
    return this.trackEvent('form_submit', {
      form_name: formName,
      form_fields: Object.keys(formData).length,
      timestamp: Date.now()
    })
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, context = {}) {
    return this.trackEvent('button_click', {
      button_name: buttonName,
      ...context
    })
  }

  /**
   * Track error
   */
  trackError(errorName, errorData = {}) {
    return this.trackEvent('error', {
      error_name: errorName,
      error_message: errorData.message,
      error_stack: errorData.stack,
      ...errorData
    })
  }

  /**
   * Track custom metric
   */
  trackMetric(metricName, value) {
    return this.trackEvent('custom_metric', {
      metric_name: metricName,
      metric_value: value
    })
  }

  /**
   * Generate session ID
   */
  _generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get event history
   */
  getEventHistory() {
    return [...this.events]
  }

  /**
   * Clear event history
   */
  clearEventHistory() {
    this.events = []
    return this
  }

  /**
   * Debug: print analytics state
   */
  debug() {
    console.group('[Analytics]')
    console.log('Provider:', this.provider)
    console.log('ID:', this.id)
    console.log('Enabled:', this.enabled)
    console.log('User ID:', this.userId)
    console.log('Session ID:', this.sessionId)
    console.log('Events:', this.events.length)
    console.table(this.events.slice(-10))
    console.groupEnd()
  }
}

window.Analytics = Analytics
