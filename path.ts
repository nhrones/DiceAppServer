
////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//                 Mime / Content-Type lookup                   \\ 
///////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const ContentType: Record<string, string> = {
    ".md": "text/markdown",
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".json": "application/json",
    ".map": "application/json",
    ".txt": "text/plain",
    ".ts": "text/typescript",
    ".tsx": "text/tsx",
    ".js": "application/javascript",
    ".jsx": "text/jsx",
    ".gz": "application/gzip",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml"
}

export const contentType = (path: string): string => {
    const ext = path.substring(path.lastIndexOf('.'), path.length);
    return ContentType[ext.toLowerCase()] || "application/octet-stream"
}
