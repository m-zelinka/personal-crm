import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import type { ReactNode } from 'react'
import { TooltipProvider } from './components/ui/tooltip'
import fontStyleSheetUrl from './styles/font.css?url'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUser } from './utils/auth.server'

export const links: LinksFunction = () => {
  return [
    // Preload CSS as a resource to avoid render blocking
    { rel: 'preload', href: fontStyleSheetUrl, as: 'style' },
    { rel: 'preload', href: tailwindStyleSheetUrl, as: 'style' },
    // Matching the css preloads above to avoid css as render blocking resource
    { rel: 'stylesheet', href: fontStyleSheetUrl, as: 'style' },
    { rel: 'stylesheet', href: tailwindStyleSheetUrl, as: 'style' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)

  return json({ user })
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
