/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LoaderPinwheel,
  Download,
  Copy,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  prompt: z.string().min(1, { message: "Please input the prompt." }),
  model: z.string().min(1, { message: "Please select the model." }),
  v: z.string().min(1, { message: "Please select the version." }),
})

export default function Home() {
  const [isLoading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [visitor, setVisitor] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    fetch(`https://visitorcounter.galaxd.com/api/hit/${process.env.NEXT_PUBLIC_VISITOR_TRACKING_ID}`).then((response) => response.json()).then(data => {
      const count = `${data.data.today.toLocaleString()} • ${data.data.weekly.toLocaleString()} • ${data.data.monthly.toLocaleString()} • ${data.data.yearly.toLocaleString()} • ${data.data.total.toLocaleString()}`
      setVisitor(count)
      console.log(data)
    })
  }, [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      model: "flux-1.dev",
      prompt: "",
      v: "1",
    }
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true)
      setImageLoaded(false)

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        setLoading(false)
        setImageLoaded(true)
        const err = await res.json()
        throw new Error(err.error || "Something went wrong!")
      }

      const result = await res.json()

      if (!result.status) {
        setLoading(false)
        setImageLoaded(true)
        toast.error("Failed to generate image!")
        return;
      }
      const previewUrl = result?.data?.media?.previewUrl || result?.data?.previewUrl;
      setImageUrl(previewUrl)
      toast.success("Image generated successfully!")

    } catch (err: any) {
      toast.error(err.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-purple-900/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800/5 to-transparent" />
      </div>
      <div className="relative z-10">
        <Card className="w-96 lg:w-7xl mt-10 mb-10 rounded-none bg-white/5 backdrop-blur-md border border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">AI Image Generator</CardTitle>
            <CardDescription>A simple and powerful AI Text-to-Image Generator</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your prompt here..." className="w-full min-h-60 rounded-none border-white/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={`grid gap-4 ${form.watch("model") === "text2img" ? "grid-cols-2" : "grid-cols-1"}`}>
                  {/* Model Select */}
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mt-4">Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-none border-white/50">
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none border-white/50">
                            <SelectItem className="rounded-none" value="flux-1.dev">Flux 1.Dev</SelectItem>
                            <SelectItem className="rounded-none" value="flux-schell">Flux Schell</SelectItem>
                            <SelectItem className="rounded-none" value="stable-diffusion">Stable Diffusion</SelectItem>
                            <SelectItem className="rounded-none" value="pollinations-flux">Pollinations Flux</SelectItem>
                            <SelectItem className="rounded-none" value="pollinations-turbo">Pollinations Turbo</SelectItem>
                            <SelectItem className="rounded-none" value="realistic">Realistic</SelectItem>
                            <SelectItem className="rounded-none" value="text2img">Text To Image</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Conditional Version Select */}
                  {form.watch("model") === "text2img" && (
                    <FormField
                      control={form.control}
                      name="v"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mt-4">Version</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full rounded-none border-white/50">
                                <SelectValue placeholder="Select a version" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-white/50">
                              <SelectItem className="rounded-none" value="1">Version 1</SelectItem>
                              <SelectItem className="rounded-none" value="2">Version 2</SelectItem>
                              <SelectItem className="rounded-none" value="3">Version 3</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                {isLoading ? (
                  <Button className="mt-4 w-full rounded-none" disabled>
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </Button>
                ) : imageUrl && !imageLoaded ? (
                  <Button className="mt-4 w-full rounded-none" disabled>
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                    Load Image...
                  </Button>
                ) : (
                  <Button className="mt-4 w-full rounded-none" type="submit">Generate</Button>
                )}
              </form>
            </Form>
            <div className="relative rounded-none border border-white/50 bg-muted/50 flex items-center justify-center h-[400px] overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
                  <Skeleton className="h-full w-full rounded-none absolute" />
                </div>
              )}

              {imageUrl && (
                <>
                  <Image
                    src={imageUrl}
                    alt="Generated Result"
                    width={500}
                    height={500}
                    className={`w-full h-full object-cover rounded-none transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    unoptimized
                    loader={({ src }) => src}
                    onLoad={() => { setImageLoaded(true) }}
                    onError={() => { setImageLoaded(true) }}
                  />
                  {!imageLoaded && (
                    <Skeleton className="h-full w-full rounded-none absolute" />
                  )}
                  {!isLoading && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      {/* tombol download */}
                      <Button
                        size="icon"
                        className="rounded-none"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = imageUrl
                          link.download = "generated-image.png"
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* tombol copy */}
                      <Button
                        size="icon"
                        className="rounded-none"
                        onClick={() => {
                          navigator.clipboard.writeText(imageUrl)
                          toast.success("Image URL copied!")
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {!isLoading && !imageUrl && (<span className="text-muted-foreground">RESULT</span>)}
            </div>
          </CardContent>
          <CardFooter className="w-full flex flex-col lg:flex-row items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Powered by <a href="https://api.galaxd.com" target="_blank" rel="noopener noreferrer" className="underline">GalaXD API</a></p>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4"/>
              <p>{visitor}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
