function getBaseUrl() {
    const currentScript = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('bundle.js'));
    
    if (currentScript) {
        const urlParams = new URL(currentScript.src).searchParams;
        return urlParams.get('url');
    }
    
    return '/';
}

const baseUrl = getBaseUrl();
const BASE_URL = baseUrl ? baseUrl.replace(/\/+$/, '') : '';

export {BASE_URL}