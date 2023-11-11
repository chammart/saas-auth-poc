import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CookieMap, parseCookies, verifyToken } from '/opt/utils';

exports.handler = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	console.log('[EVENT]', event);

	const cookies: CookieMap = parseCookies(event);

	if (!cookies) {
		return {
			statusCode: 200,
			body: JSON.stringify({
				sub: null,
				email: null,
			}),
		};
	}

	const verifiedJwt = await verifyToken(cookies.token, process.env.USER_POOL_ID!);
	const sub = verifiedJwt ? verifiedJwt.sub : null;
	const email = verifiedJwt ? verifiedJwt.email : null;

	return {
		statusCode: 200,
		body: JSON.stringify({ sub, email }),
	};
};
