/**
 * Window.fetch wrapper, which adds CSRFToken to headers
 * @param url Url of request
 * @param options Fetch options
 * @return Promise<Response>
 */
export function fetch(url: string, options?: Parameters<typeof window.fetch>[1]) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['X-CSRFToken'] = csrfToken();
    return window.fetch(url, options);
}

export function csrfToken() {
    return document.querySelector('meta[name=csrf-token]').getAttribute('content');
}
