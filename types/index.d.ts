/**
 * EliteUI Type Definitions
 * TypeScript support for EliteUI Framework
 *
 * Usage in TypeScript projects:
 * import type { EliteComponent, EliteForm, EliteValidator } from '@exonoor/eliteui'
 */

declare global {
    interface Window {
        SimpleComponent: typeof SimpleComponent
        SimpleStore: typeof SimpleStore
        Router: typeof Router
        HttpClient: typeof HttpClient
        UseForm: typeof UseForm
        Validators: typeof Validators
        MetaManager: typeof MetaManager
        Analytics: typeof Analytics
        sanitize: (html: string) => string
        createMask: (pattern: string) => (value: string) => string
        Masks: Record<string, (value: string) => string>
        withViewTransition: (callback: () => void) => Promise<void>
        debounce: (func: Function, delay: number) => Function
        throttle: (func: Function, limit: number) => Function
        $exonoor: any
        http: HttpClient
    }
}

// ==================== SimpleComponent ====================

interface ComponentState {
    [key: string]: any
}

interface ComponentLifecycle {
    onMount?(): void
    onUnmount?(): void
    onStateChange?(prevState: ComponentState, newState: ComponentState): void
}

declare class SimpleComponent {
    constructor(selector: string, initialState?: ComponentState)
    el: HTMLElement | null
    state: ComponentState
    _mounted: boolean
    _subscribers: Array<(state: ComponentState) => void>

    setState(updates: Partial<ComponentState>, callback?: () => void): void
    subscribe(callback: (state: ComponentState) => void): () => void
    on(event: string, selector: string, handler: (e: Event) => void): void
    mount(): void
    unmount(): void
    render(): void
    lazyLoad(key: string, loader: () => Promise<any>): Promise<any>
    useForm(schema: FormSchema, options?: FormOptions): UseForm
    useEffect(callback: () => void | (() => void), deps?: any[]): void
    debug(): void
    html(strings: TemplateStringsArray, ...values: any[]): string
}

// ==================== SimpleStore ====================

interface StoreSubscriber {
    (state: any): void
}

declare class SimpleStore {
    constructor(initialState?: any, options?: { persist?: string })
    _state: any
    _subscribers: Map<string, Set<StoreSubscriber>>
    _computed: Map<string, () => any>
    _history: any[]

    getState(): any
    setState(updates: any, callback?: () => void): void
    getValue(path: string): any
    subscribe(path: string, callback: StoreSubscriber): () => void
    defineComputed(key: string, computer: () => any): void
    batch(updates: any): void
    undo(): void
    debug(): void
}

// ==================== Router ====================

interface RouteParams {
    [key: string]: string
}

interface RouteHandler {
    (params: RouteParams): void
}

interface NavigationGuard {
    (to: string, from: string, state: any): Promise<boolean> | boolean
}

declare class Router {
    constructor(options?: { basePath?: string; useHash?: boolean })
    on(path: string, handler: RouteHandler): Router
    navigate(path: string, state?: any): Promise<boolean>
    beforeEach(guard: NavigationGuard): () => void
    use(middleware: (path: string, state: any) => void): () => void
    subscribe(callback: (route: any) => void): () => void
    getCurrentRoute(): any
    getHistory(): any[]
    getQueryParams(): Record<string, string>
    setQueryParams(params: Record<string, any>): void
    updateQueryParam(key: string | Record<string, any>, value?: any): void
    removeQueryParam(key: string): void
    back(): void
    forward(): void
    debug(): void
}

// ==================== HttpClient ====================

interface HttpClientOptions {
    baseUrl?: string
    timeout?: number
    headers?: Record<string, string>
}

interface HttpResponse<T = any> {
    ok: boolean
    status: number
    statusText: string
    data: T
    headers: Headers
}

interface RequestInterceptor {
    (request: RequestInit): Promise<RequestInit> | RequestInit
}

interface ResponseInterceptor {
    (response: HttpResponse): Promise<HttpResponse> | HttpResponse
}

interface ErrorInterceptor {
    (error: HttpError): Promise<void> | void
}

declare class HttpClient {
    constructor(options?: HttpClientOptions)
    baseUrl: string
    timeout: number

    get<T = any>(url: string, options?: RequestInit): Promise<HttpResponse<T>>
    post<T = any>(url: string, data?: any, options?: RequestInit): Promise<HttpResponse<T>>
    patch<T = any>(url: string, data?: any, options?: RequestInit): Promise<HttpResponse<T>>
    put<T = any>(url: string, data?: any, options?: RequestInit): Promise<HttpResponse<T>>
    delete<T = any>(url: string, options?: RequestInit): Promise<HttpResponse<T>>
    request<T = any>(url: string, options?: RequestInit): Promise<HttpResponse<T>>

    interceptRequest(handler: RequestInterceptor): () => void
    interceptResponse(handler: ResponseInterceptor): () => void
    interceptError(handler: ErrorInterceptor): () => void
    setHeaders(headers: Record<string, string>): void
    setAuthToken(token: string | null): void
    debug(): void
}

declare class HttpError extends Error {
    status: number
    data: any
    response: Response | null

    isClientError(): boolean
    isServerError(): boolean
    isNetworkError(): boolean
    isTimeout(): boolean
}

// ==================== UseForm ====================

interface FormField {
    value: any
    validate?: Array<(value: any) => string | null>
    secure?: boolean
}

interface FormSchema {
    [fieldName: string]: FormField
}

interface FormOptions {
    csrfToken?: string
    rateLimitMs?: number
}

interface FormState {
    values: Record<string, any>
    errors: Record<string, string | null>
    touched: Record<string, boolean>
    dirty: Record<string, boolean>
    passwordStrength: Record<string, number>
}

declare class UseForm {
    constructor(schema: FormSchema, component?: SimpleComponent, options?: FormOptions)
    values: Record<string, any>
    errors: Record<string, string | null>
    touched: Record<string, boolean>
    dirty: Record<string, boolean>
    passwordStrength: Record<string, number>
    isSubmitting: boolean

    setValue(name: string, value: any): void
    setTouched(name: string): void
    validateField(name: string, value?: any): string | null
    validate(): { isValid: boolean; errors: Record<string, string> }
    bind(fieldName: string, selector: string, options?: { mask?: (value: string) => string; sanitize?: boolean }): void
    reset(): void
    getError(name: string): string | null
    hasError(name: string): boolean
    isTouched(name: string): boolean
    isDirty(name: string): boolean
    getValues(): Record<string, any>
    isValid(): boolean
    isDirty(): boolean
    onSubmit(handler: (values: Record<string, any>) => Promise<any>): UseForm
    submit(e?: Event): Promise<any>
    getPasswordStrengthLabel(fieldName: string): string
    setCsrfToken(token: string): UseForm
    getCsrfToken(): string | null
    debug(): void
}

// ==================== Validators ====================

type ValidatorFunction = (value: any, message?: string) => string | null

interface ValidatorOptions {
    min?: number
    max?: number
    requireUppercase?: boolean
    requireNumbers?: boolean
    requireSpecial?: boolean
}

interface Validators {
    required(message?: string): ValidatorFunction
    email(value: any, message?: string): string | null
    url(value: any, message?: string): string | null
    phone(value: any, message?: string): string | null
    creditCard(value: any, message?: string): string | null
    password(value: any, options?: ValidatorOptions): string | null
    minLength(min: number, message?: string): ValidatorFunction
    maxLength(max: number, message?: string): ValidatorFunction
    pattern(regex: RegExp, message?: string): ValidatorFunction
    custom(validatorFn: (value: any) => boolean, message?: string): ValidatorFunction
    noXSS(value: any, message?: string): string | null
    noSQLi(value: any, message?: string): string | null
    matches(otherValue: any, message?: string): ValidatorFunction
    ssn(value: any, message?: string): string | null
    zipcode(value: any, message?: string): string | null
    numeric(value: any, message?: string): string | null
    alphanumeric(value: any, message?: string): string | null
}

declare const Validators: Validators

function combineValidators(...validators: ValidatorFunction[]): ValidatorFunction

// ==================== MetaManager ====================

interface OGData {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: string
    locale?: string
}

interface StructuredData {
    '@context': string
    '@type': string
    [key: string]: any
}

declare class MetaManager {
    constructor(options?: { default?: Record<string, any> })

    setTitle(title: string): MetaManager
    setDescription(description: string): MetaManager
    setCanonical(url: string): MetaManager
    setOG(data: OGData): MetaManager
    setStructuredData(data: StructuredData): MetaManager
    setBreadcrumb(items: Array<{ name: string; url: string }>): MetaManager
    setProduct(data: any): MetaManager
    setArticle(data: any): MetaManager
    generateShareUrl(platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'email', options?: Record<string, any>): string | null
    copyShareLink(platform: string): Promise<boolean>
    getState(): Record<string, any>
    reset(): MetaManager
    debug(): void
}

// ==================== Analytics ====================

type AnalyticsProvider = 'ga4' | 'gtm' | 'mixpanel' | 'segment' | 'custom'

interface AnalyticsOptions {
    provider?: AnalyticsProvider
    id?: string
    enabled?: boolean
    userId?: string
}

declare class Analytics {
    constructor(options?: AnalyticsOptions)
    provider: AnalyticsProvider
    id: string | null
    enabled: boolean
    userId: string | null
    sessionId: string
    events: any[]

    trackEvent(eventName: string, eventData?: Record<string, any>): Analytics
    trackPageView(path?: string, title?: string): Analytics
    identifyUser(userId: string, traits?: Record<string, any>): Analytics
    trackFormSubmit(formName: string, formData?: Record<string, any>): Analytics
    trackButtonClick(buttonName: string, context?: Record<string, any>): Analytics
    trackError(errorName: string, errorData?: Record<string, any>): Analytics
    trackMetric(metricName: string, value: any): Analytics
    getEventHistory(): any[]
    clearEventHistory(): Analytics
    debug(): void
}

// ==================== DomUtils ====================

interface Mask {
    (value: string): string
}

interface MaskCollection {
    phone: Mask
    phoneSimple: Mask
    creditCard: Mask
    date: Mask
    ssn: Mask
    zipcode: Mask
    currency: Mask
}

declare function sanitize(html: string): string
declare function createMask(pattern: string): Mask
declare const Masks: MaskCollection
declare function withViewTransition(callback: () => void): Promise<void>
declare function debounce(func: Function, delay?: number): Function
declare function throttle(func: Function, limit?: number): Function

// ==================== Context ====================

declare class Context {
    constructor(initialValue?: any)
    provide(value: any): void
    subscribe(callback: (value: any) => void): () => void
    watch(key: string, callback: (value: any) => void): () => void
    use(): any
    getHistory(): any[]
    debug(): void
}

declare class ContextProvider {
    constructor()
    create(name: string, initialValue?: any): Context
    get(name: string): Context | null
    has(name: string): boolean
    delete(name: string): boolean
    debug(): void
}

// ==================== ErrorBoundary ====================

interface ErrorHandler {
    (error: Error, context: string): void
}

interface RecoveryHandler {
    (): void
}

declare class ErrorBoundary {
    constructor(fallbackUI?: string)
    catch(error: Error, context: string): void
    onError(handler: ErrorHandler): void
    onRecover(handler: RecoveryHandler): void
    recover(): void
    getErrors(): Error[]
    debug(): void
}

declare class GlobalErrorBoundary {
    constructor()
    handleUncaughtError(error: Error): void
    handleUnhandledRejection(reason: any): void
    debug(): void
}

// ==================== LazyLoader ====================

interface LoaderOptions {
    timeout?: number
    retries?: number
    cacheTTL?: number
}

declare class LazyLoader {
    constructor(options?: LoaderOptions)
    loadScript(url: string, options?: LoaderOptions): Promise<any>
    loadCSS(url: string): Promise<void>
    loadData(url: string, options?: LoaderOptions): Promise<any>
    loadComponent(url: string, className: string, options?: LoaderOptions): Promise<any>
    preload(resources: Array<{ type: 'script' | 'css' | 'data'; url: string }>): Promise<void>
    getCache(): Map<string, any>
    clearCache(): void
    debug(): void
}

// ==================== Framework Registry ====================

interface EliteUI {
    version: string
    components: Map<string, typeof SimpleComponent>
    stores: Map<string, SimpleStore>
    contexts: Map<string, Context>

    registerComponent(name: string, ComponentClass: typeof SimpleComponent): typeof SimpleComponent
    getComponent(name: string): typeof SimpleComponent | undefined
    registerStore(name: string, store: SimpleStore): SimpleStore
    getStore(name: string): SimpleStore | undefined
    registerContext(name: string, context: Context): Context
    getContext(name: string): Context | undefined
    debug(): void
    createApp(options: any): App
}

declare const EliteUI: EliteUI

interface AppOptions {
    name?: string
    root?: string
    store?: SimpleStore
    router?: Router
    errorBoundary?: ErrorBoundary
}

declare class App {
    constructor(options?: AppOptions)
    name: string
    rootSelector: string
    store?: SimpleStore
    router?: Router
    errorBoundary: ErrorBoundary
    components: Map<string, SimpleComponent>

    mount(): void
    registerComponent(name: string, instance: SimpleComponent): SimpleComponent
    unmount(): void
    navigate(path: string, state?: any): void
    getState(path?: string): any
    setState(updates: any): void
    debug(): void
    onMounted?(): void
    onUnmounted?(): void
    onRouteChange?(route: any): void
}

// ==================== DevTools ====================

interface DevToolsStats {
    stores: number
    components: number
    timelineLength: number
    enabled: boolean
}

declare class DevTools {
    timeline: Array<{ timestamp: Date; message: string; data?: any }>
    enabled: boolean

    registerStore(name: string, store: SimpleStore): void
    registerComponent(name: string, component: SimpleComponent): void
    logStateChange(name: string, type: string, prevState: any, newState: any): void
    logAction(name: string, action: string, payload: any): void
    logPerformance(name: string, duration: number): void
    printTimeline(limit?: number): void
    exportTimeline(): any[]
    clearTimeline(): void
    getStats(): DevToolsStats
    printStats(): void
    inspectStores(): void
    inspectComponents(): void
    debug(): void
    help(): void
}

declare const devTools: DevTools

declare global {
    interface Window {
        $exonoor: {
            stores: Map<string, SimpleStore>
            components: Map<string, SimpleComponent>
            devtools: DevTools
        }
    }
}

export {
    SimpleComponent,
    SimpleStore,
    Router,
    HttpClient,
    HttpError,
    UseForm,
    Validators,
    MetaManager,
    Analytics,
    Context,
    ContextProvider,
    ErrorBoundary,
    GlobalErrorBoundary,
    LazyLoader,
    App,
    EliteUI,
    DevTools,
    sanitize,
    createMask,
    Masks,
    withViewTransition,
    debounce,
    throttle,
    combineValidators,
}
