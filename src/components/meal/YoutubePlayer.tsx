'use client'

import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import Image from 'next/image'

interface YoutubePlayerProps {
    url: string
    thumbnail: string
    title: string
}

// Extrai o ID do vídeo de qualquer formato de URL do YouTube
function extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
}

export function YoutubePlayer({ url, thumbnail, title }: YoutubePlayerProps) {
    const [playing, setPlaying] = useState(false)
    const videoId = extractVideoId(url)

    if (!videoId) return null

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    const ytThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
                Vídeo da receita
            </h2>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                {playing ? (
                    <iframe
                        src={embedUrl}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                ) : (
                    /* Thumbnail clicável — só carrega o iframe ao clicar */
                    <button
                        onClick={() => setPlaying(true)}
                        className="absolute inset-0 w-full h-full group"
                        aria-label="Reproduzir vídeo da receita"
                    >
                        <Image
                            src={ytThumbnail}
                            alt={`Vídeo de ${title}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        {/* Overlay escuro */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                        {/* Botão play */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-xl transition-transform duration-200 group-hover:scale-110">
                                <PlayCircle className="h-8 w-8 text-white fill-white" />
                            </div>
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white text-xs font-medium truncate drop-shadow">
                                {title}
                            </p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    )
}