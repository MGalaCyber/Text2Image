/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// list domain for failover
const API_DOMAINS = [
    "https://api-backup1.galaxd.com",
    "https://api-backup2.galaxd.com",
    "https://api-backup3.galaxd.com",
]

async function callExternalAPI(path: string, method: string = "GET", body?: any) {
    let lastError: any = null;

    for (const domain of API_DOMAINS) {
        try {
            const endpoint = `${domain}${path}`
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "X-Universe-KEY": `${process.env.UNIVERSE_API_KEY}`, // get api key from https://api.galaxd.com/dashboard
                },
                body: method === "POST" ? JSON.stringify(body) : undefined,
            })
        
            if (res.ok) {
                const data = await res.json()
                return { data, status: res.status }
            } else {
                lastError = new Error(`API ${domain} failed with status ${res.status}`)
            }

        } catch (err) {
            lastError = err
        }
    }
    throw lastError || new Error("All backup APIs failed")
}

export async function POST(req: Request) {
    try {
        const { prompt, model, v } = await req.json()

        if (!prompt || !model) {
            return NextResponse.json({ error: "Missing prompt or model" }, { status: 400 })
        }

        // mapping model -> endpoint
        const endpoints: Record<string, string> = {
            "flux-1.dev": `/v2/ai/flux/1-dev?prompt=${prompt}`,
            "flux-schell": `/v2/ai/flux/1-schell?prompt=${prompt}`,
            "stable-diffusion": `/v1/ai/stable-diffusion?prompt=${prompt}`,
            "pollinations-flux": `/v1/ai/pollinations/flux?prompt=${prompt}`,
            "pollinations-turbo": `/v1/ai/pollinations/turbo?prompt=${prompt}`,
            "realistic": `/v1/ai/realistic?prompt=${prompt}&resolution=1920x1080&style=cinematic`,
            "text2img": `/v1/ai/text2img?prompt=${prompt}&v=${v || "1"}`,
        }

        const path = endpoints[model]
        if (!path) {
            return NextResponse.json({ error: "Invalid model" }, { status: 400 })
        }

        const { data, status } = await callExternalAPI(path, "GET")

        return NextResponse.json(data, { status })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}