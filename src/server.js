import { serve } from 'std/http/server.ts'
import { graphql, org } from './api.js'

serve(req => {
  const routes = {
    '/': serveStatic('./app/public/index.html', 'text/html'),
    '/build/bundle.css': serveStatic('./app/public/build/bundle.css', 'text/css'),
    '/build/bundle.js': serveStatic('./app/public/build/bundle.js', 'text/javascript'),
    '/graphql': graphql,
    '/:code': async (_, params) => params
      ? Response.redirect(await org(params.code))
      : new Response('Not Found!')
  }
  const { pathname} = new URL(req.url)
  console.log(`${req.method} ${pathname}`)
  return routes[pathname](req)
})

/**
 * @param {string} file
 * @param {string} type
 */
function serveStatic(file, type) {
  return async () => new Response(
    await Deno.readTextFile(file), {
    headers: { 'content-type': type }
  })
}