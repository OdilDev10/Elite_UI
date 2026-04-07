/**
 * MetaManager
 * SEO & Social Media meta tags manager para SPAs
 *
 * Uso:
 * const meta = new MetaManager()
 * meta.setTitle('Página de Productos')
 * meta.setOG({ title, image, description, url })
 * meta.setStructuredData({ '@type': 'Product', ... })
 * meta.generateShareUrl('twitter')
 */

class MetaManager {
  constructor(options = {}) {
    this.defaults = options.default || {}
    this.current = { ...this.defaults }
    this.history = []
  }

  /**
   * Set page title
   */
  setTitle(title) {
    this.current.title = title
    document.title = title
    this._updateMeta('og:title', title)
    this._updateMeta('twitter:title', title)
    return this
  }

  /**
   * Set page description
   */
  setDescription(description) {
    this.current.description = description
    this._updateMeta('description', description)
    this._updateMeta('og:description', description)
    this._updateMeta('twitter:description', description)
    return this
  }

  /**
   * Check if URL is safe (relative or https/http)
   */
  _isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false
    try {
      const parsed = new URL(url, window.location.origin)
      return ['https:', 'http:'].includes(parsed.protocol)
    } catch (e) {
      // If it fails to parse as absolute URL, check if it's a relative URL
      return /^\/[^/]/.test(url) || /^\.\//.test(url) || /^\.\.\//.test(url)
    }
  }

  /**
   * Set canonical URL (important for SEO)
   * Security: validates that URL is relative or https/http
   */
  setCanonical(url) {
    // Validate URL for security
    if (!this._isSafeUrl(url)) {
      console.warn('[MetaManager] Unsafe canonical URL rejected:', url)
      return this
    }

    this.current.canonical = url
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
    this._updateMeta('og:url', url)
    return this
  }

  /**
   * Set multiple Open Graph tags at once
   */
  setOG(data) {
    const {
      title,
      description,
      image,
      url,
      type = 'website',
      locale = 'es_ES'
    } = data

    if (title) this._updateMeta('og:title', title)
    if (description) this._updateMeta('og:description', description)
    if (image) this._updateMeta('og:image', image)
    if (url) this._updateMeta('og:url', url)
    this._updateMeta('og:type', type)
    this._updateMeta('og:locale', locale)

    // Twitter specific
    this._updateMeta('twitter:card', 'summary_large_image')
    if (title) this._updateMeta('twitter:title', title)
    if (description) this._updateMeta('twitter:description', description)
    if (image) this._updateMeta('twitter:image', image)

    this.current.og = { ...this.current.og, ...data }
    return this
  }

  /**
   * Set structured data (JSON-LD)
   */
  setStructuredData(data) {
    this.current.structuredData = data

    let script = document.querySelector('script[type="application/ld+json"]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(data)
    return this
  }

  /**
   * Set breadcrumb structured data
   */
  setBreadcrumb(items) {
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }

    this.setStructuredData(breadcrumb)
    return this
  }

  /**
   * Set product structured data
   */
  setProduct(data) {
    const {
      name,
      description,
      image,
      price,
      currency = 'USD',
      rating,
      reviews,
      availability = 'InStock',
      url
    } = data

    const product = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: Array.isArray(image) ? image : [image],
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`
      }
    }

    if (rating) {
      product.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        ratingCount: rating.count
      }
    }

    if (url) {
      product.url = url
    }

    this.setStructuredData(product)
    return this
  }

  /**
   * Set article structured data
   */
  setArticle(data) {
    const {
      headline,
      description,
      image,
      datePublished,
      dateModified,
      author,
      url
    } = data

    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline,
      description,
      image: Array.isArray(image) ? image : [image],
      datePublished,
      dateModified,
      author: {
        '@type': 'Person',
        name: author
      },
      url
    }

    this.setStructuredData(article)
    return this
  }

  /**
   * Internal: update or create meta tag
   */
  _updateMeta(name, content) {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)

    if (!meta) {
      meta = document.createElement('meta')
      const isProperty = name.includes(':')
      if (isProperty) {
        meta.setAttribute('property', name)
      } else {
        meta.setAttribute('name', name)
      }
      document.head.appendChild(meta)
    }

    meta.content = content
  }

  /**
   * Generate share URL for social platforms
   */
  generateShareUrl(platform, options = {}) {
    const {
      text = this.current.title || '',
      url = this.current.canonical || window.location.href,
      hashtags = [],
      via = 'EliteUI'
    } = options

    const encoded = {
      text: encodeURIComponent(text),
      url: encodeURIComponent(url),
      hashtags: encodeURIComponent(hashtags.join(','))
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}&hashtags=${encoded.hashtags}&via=${via}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,
      whatsapp: `https://wa.me/?text=${encoded.text}%20${encoded.url}`,
      telegram: `https://t.me/share/url?url=${encoded.url}&text=${encoded.text}`,
      email: `mailto:?subject=${encoded.text}&body=${encoded.url}`
    }

    return urls[platform.toLowerCase()] || null
  }

  /**
   * Copy share link to clipboard
   */
  async copyShareLink(platform) {
    const url = this.generateShareUrl(platform)
    if (!url) return false

    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.error('[MetaManager] copy error:', error)
      return false
    }
  }

  /**
   * Get current meta state
   */
  getState() {
    return { ...this.current }
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.current = { ...this.defaults }
    if (this.defaults.title) {
      document.title = this.defaults.title
    }
    return this
  }

  /**
   * Debug: print current meta state
   */
  debug() {
    console.group('[MetaManager]')
    console.log('Current state:', this.current)
    console.log('Document title:', document.title)
    console.log('Meta tags:', {
      description: document.querySelector('meta[name="description"]')?.content,
      og_title: document.querySelector('meta[property="og:title"]')?.content,
      og_image: document.querySelector('meta[property="og:image"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href
    })
    console.groupEnd()
  }
}

window.MetaManager = MetaManager
