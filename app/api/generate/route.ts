/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

async function callExternalAPI(endpoint: string, method: string = "GET", body?: any) {
    const res = await fetch(endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
            "X-Universe-KEY": `${process.env.UNIVERSE_API_KEY}`, // get api key from https://api.galaxd.com/dashboard
        },
        body: method === "POST" ? JSON.stringify(body) : undefined,
    })

    const data = await res.json()
    return { data, status: res.status }
}

export async function POST(req: Request) {
    try {
        const { prompt, model, v } = await req.json()

        if (!prompt || !model) {
            return NextResponse.json({ error: "Missing prompt or model" }, { status: 400 })
        }

        // mapping model -> endpoint
        const endpoints: Record<string, string> = {
            "flux-1.dev": `https://api-backup1.galaxd.com/v2/ai/flux/1-dev?prompt=${prompt}`,
            "flux-schell": `https://api-backup1.galaxd.com/v2/ai/flux/1-schell?prompt=${prompt}`,
            "stable-diffusion": `https://api-backup1.galaxd.com/v1/ai/stable-diffusion?prompt=${prompt}`,
            "pollinations-flux": `https://api-backup1.galaxd.com/v1/ai/pollinations/flux?prompt=${prompt}`,
            "pollinations-turbo": `https://api-backup1.galaxd.com/v1/ai/pollinations/turbo?prompt=${prompt}`,
            "realistic": `https://api-backup1.galaxd.com/v1/ai/realistic?prompt=${prompt}&resolution=1920x1080&style=cinematic`,
            "text2img": `https://api-backup1.galaxd.com/v1/ai/text2img?prompt=${prompt}&v=${v || "1"}`,
        }

        const endpoint = endpoints[model]
        if (!endpoint) {
            return NextResponse.json({ error: "Invalid model" }, { status: 400 })
        }

        const { data, status } = await callExternalAPI(endpoint, "GET")

        return NextResponse.json(data, { status })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}