export default function debounce({fn, duration = 500} = {}) {
    var timeId = null;

    return function (...args) {
        clearTimeout(timeId);
        timeId = setTimeout(() => {
            fn(...args);
        }, duration);
    }
}