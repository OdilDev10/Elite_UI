/**
 * Example Page
 * Demonstrates component-based architecture with loadTemplate()
 */

import { moduleLoader } from '../../core/ModuleLoader.js'

// Mount page components
function mountPageComponents() {
    const grid = document.getElementById('example-grid');

    // Helper to create and mount component
    const mountComponent = (ComponentClass, props) => {
        const wrapper = document.createElement('div');
        grid.appendChild(wrapper);
        new ComponentClass(wrapper, props).mount();
    };

    // Feature Cards
    mountComponent(FeatureCard, {
        title: 'Installation',
        description: 'Install via NPM or use the CDN link for quick prototyping.',
        code: 'npm install @odineck/elite-ui'
    });

    mountComponent(FeatureCard, {
        title: 'CDN',
        description: 'Add this to your HTML head.',
        code: '&lt;script src="..."&gt;&lt;/script&gt;'
    });

    // Contact Form
    mountComponent(FormCard, {
        title: 'Contact Form',
        subtitle: 'Experience the built-in validation and sanitization.',
        onSubmit: (data) => {
            console.log('Form submitted:', data);
        }
    });

    // Validators Card
    mountComponent(FeatureCard, {
        title: 'Validators',
        description: 'Email, password, credit card, phone, XSS, and SQLi detection.',
        icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
        code: 'Validators.email(val)'
    });

    // Components Card
    mountComponent(FeatureCard, {
        title: 'Components',
        description: 'Reactive with SimpleComponent base class.',
        icon: '<path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>',
        code: 'class MyComp extends...'
    });

    // State Management Card
    mountComponent(FeatureCard, {
        title: 'State',
        description: 'Global SimpleStore with subscriptions.',
        icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
        code: 'store.setState({...})'
    });

    // Code Example Card
    const codeContent = `<span style="color: #c678dd;">const</span> store = <span style="color: #c678dd;">new</span> SimpleStore({<br>
&nbsp;&nbsp;theme: <span style="color: #98c379;">'dark'</span>,<br>
&nbsp;&nbsp;user: <span style="color: #d19a66;">null</span><br>
});<br><br>
<span style="color: #c678dd;">class</span> App <span style="color: #c678dd;">extends</span> SimpleComponent {<br>
&nbsp;&nbsp;render() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #c678dd;">this</span>.el.innerHTML = <span style="color: #98c379;">\`<h1>EliteUI</h1>\`</span>;<br>
&nbsp;&nbsp;}<br>
}`;

    mountComponent(CodeCard, {
        filename: 'app.js',
        code: codeContent
    });

    // Security First Card (wide)
    mountComponent(FeatureCard, {
        title: 'Security First',
        description: 'EliteUI was built with security as a priority. All inputs are sanitized by default, and we provide built-in protection against common web vulnerabilities.',
        wide: true
    });
}

// Mount ThemeToggle
function mountThemeToggle() {
    const container = document.getElementById('theme-toggle-container');
    if (container && window.ThemeToggle) {
        new ThemeToggle(container).mount();
    }
}

// Initialize
async function init() {
    // Load all components
    await moduleLoader.loadComponents()
    
    // Mount ThemeToggle
    mountThemeToggle()
    
    // Mount page components
    mountPageComponents()
}

init()
