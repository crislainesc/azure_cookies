import { app, HttpResponseInit, InvocationContext, HttpRequest } from '@azure/functions'
import * as signature from 'cookie-signature'

const SECRET = 'AzureMockSecret'

export async function httpCookieFunction(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
  const sessionCookie = cookies?.session

  console.log({ cookies, sessionCookie })

  let message

  if (sessionCookie) {
    const decodedSessionCookie = decodeURIComponent(sessionCookie);
    const unsigned = signature.unsign(decodedSessionCookie, SECRET);
    console.log({ decodedSessionCookie, unsigned });

    if (unsigned) {
      message = `Welcome back! Your session is: ${unsigned}`
    } else {
      message = "Invalid cookie!"
    }
    return {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: message
    }

  } else {
    const sessionValue = { "userId": "uuid", accessToken: "JSON token" }

    const raw = JSON.stringify(sessionValue);

    const signed = signature.sign(raw, SECRET);
    console.log({ signed })

    return {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: "New session cookie created!",
      cookies: [{
        name: 'session',
        value: signed,
        maxAge: 35,
        httpOnly: true,
        sameSite: 'None',
        path: '/',
        secure: true,
        domain: '.example.com'
      }]
    }
  }
}

app.http('cookie', {
  methods: ['POST'],
  authLevel: 'function',
  handler: httpCookieFunction,
  route: "v1/cookie",
});
