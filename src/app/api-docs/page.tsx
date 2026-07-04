'use client'

import { useEffect, useRef } from 'react'

// Carrega o Swagger UI via CDN (arquivos estáticos, sem vínculo com React).
// Isso evita conflito de peer dependency: swagger-ui-react só declara suporte
// oficial a React 16/17/18, e este projeto usa React 19.

declare global {
    interface Window {
        SwaggerUIBundle: any
    }
}

export default function ApiDocsPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const alreadyLoaded = useRef(false)

    useEffect(() => {
        if (alreadyLoaded.current) return
        alreadyLoaded.current = true

        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'
        document.head.appendChild(css)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'
        script.onload = () => {
            if (window.SwaggerUIBundle && containerRef.current) {
                window.SwaggerUIBundle({
                    url: '/openapi.json',
                    domNode: containerRef.current,
                    presets: [window.SwaggerUIBundle.presets.apis],
                })
            }
        }
        document.body.appendChild(script)

        return () => {
            css.remove()
            script.remove()
        }
    }, [])

    return (
        <div
            ref={containerRef}
            id="swagger-ui"
            style={{ background: '#fff', minHeight: '100vh' }}
        />
    )
}