
import { serve } from "https://deno.land/std@0.129.0/http/server.ts";
import { DEBUG, host, port } from './constants.ts'
import { contentType } from './path.ts'

async function handleRequest(request: Request): Promise<Response> {
    let { pathname } = new URL(request.url);
    if (pathname.endsWith("/")) { pathname += "index.html" }
    try { // we expect all file requests to be from /public/
        const body = await Deno.readFile("./public" + pathname)
        const headers = new Headers()
        headers.set("content-type", contentType(pathname))
        return new Response(body, { status: 200, headers });
    } catch (e) {
        console.error(e.message)
        return await Promise.resolve(new Response(
            "Internal server error: " + e.message, { status: 500 }
        ))
    }
}

serve(handleRequest, { hostname: host, port: port });
console.log(`Serving http://${host}:${port}`);
