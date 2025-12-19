import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Global Error Handler for debugging mobile white screens
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global Error:', message, source, lineno, colno, error);

    // Don't show for minor errors that don't break the app
    if (message.includes('ResizeObserver') || message.includes('Script error')) return;

    const errorDiv = document.createElement('div');
    errorDiv.id = 'app-error-overlay';
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;color:#333;z-index:99999;padding:20px;overflow:auto;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;';

    errorDiv.innerHTML = `
        <div style="max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h2 style="margin-bottom: 10px;">Something went wrong</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 14px;">The application encountered an error and couldn't load. This usually happens due to a poor connection or old cached data.</p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="window.location.reload()" style="padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Try Again</button>
                <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" style="padding: 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Clear Cache & Reset</button>
            </div>
            <details style="margin-top: 40px; text-align: left; font-size: 10px; color: #999;">
                <summary>Error Details (Technical)</summary>
                <pre style="white-space: pre-wrap; margin-top: 10px;">${message}\n${source}:${lineno}</pre>
            </details>
        </div>
    `;

    if (!document.getElementById('app-error-overlay')) {
        document.body.appendChild(errorDiv);
    }
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
