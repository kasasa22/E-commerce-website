import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Global Error Handler for debugging mobile white screens
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global Error:', message, source, lineno, colno, error);
    // Only show in development or if explicitly enabled, but for this user issue, we want to see it.
    // We'll add a small unobtrusive indicator or just log it. 
    // Since the user sees a WHITE SCREEN, we should probably show it.
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.height = '100%';
    errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '99999';
    errorDiv.style.padding = '20px';
    errorDiv.style.overflow = 'auto';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.innerHTML = `<h3>Application Error</h3><pre>${message}\n\n${source}:${lineno}:${colno}\n\n${error?.stack || ''}</pre><button onclick="window.location.reload()" style="padding: 10px; background: white; color: black; border: none; margin-top: 20px;">Reload App</button>`;
    document.body.appendChild(errorDiv);
};

window.onunhandledrejection = function (event) {
    console.error('Unhandled Rejection:', event.reason);
    // Optional: also show these
};

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
