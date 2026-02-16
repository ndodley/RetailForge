export const DEFAULT_AVATAR_PATH = '/images/other_images/default_avatar.jpg';

export function backendImageUrl(pathOrUrl) {
    if (!pathOrUrl || typeof pathOrUrl !== 'string' || pathOrUrl.trim() === '') {
        return `http://localhost:5000${DEFAULT_AVATAR_PATH}`;
    }

    const trimmed = pathOrUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    return `http://localhost:5000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
