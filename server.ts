import { serve } from "https://deno.land/std@0.124.0/http/server.ts";
const DEBUG = (Deno.env.get("DEBUG") === "true") || false
export const Region = Deno.env.get("DENO_REGION") || 'localhost'

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

const contentType = (path: string): string => {
    const ext = path.substring(path.lastIndexOf('.'), path.length);
    return ContentType[ext.toLowerCase()] || "application/octet-stream"
}

////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//                    Static File Server                        \\ 
///////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const host = "localhost" //"192.168.0.171" //"127.0.0.1"
const port = 80

serve(handleRequest, { hostname: host, port: port });
console.log(`Serving Client App from http://${host}:${port}`);

/** handle each new http request */
async function handleRequest(request: Request): Promise<Response> {
    let { pathname } = new URL(request.url);
    if (pathname.endsWith("/")) { pathname = "/index.html" }
    // serve a file
    try {
        const path = "." + pathname
        if (DEBUG) console.log(`Serving File ${path}`)
        const body = await Deno.readFile(path)
        const headers = new Headers()
        headers.set("content-type", contentType(path))
        return new Response(body, { status: 200, headers });
    } catch (e) {
        console.error(e.message)
        return await Promise.resolve(new Response(
            "Internal server error: " + e.message, { status: 500 }
        ))
    }
}