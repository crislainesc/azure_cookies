import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as signature from 'cookie-signature';
import { SECRET, USERS } from "../../mocks";

export async function listUsersHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieHeader ? Object.fromEntries(cookieHeader?.split('; ')?.map(c => c.split('='))) : {};
  const sessionCookie = cookies.session;

  if (!sessionCookie) {
    return { status: 401, body: 'Unauthorized: no session cookie' };
  }

  const unsigned = signature.unsign(sessionCookie, SECRET);
  if (!unsigned) {
    return { status: 401, body: 'Unauthorized: invalid session cookie' };
  }

  let sessionData
  try {
    sessionData = JSON.parse(sessionCookie);

  } catch {
    return { status: 500, body: 'Internal Error: malformed session data' };
  }

  if (!sessionData.roles.includes('listUsers')) {
    return { status: 403, body: 'Forbidden: insufficient permissions' };
  }

  return { status: 200, jsonBody: USERS };
}