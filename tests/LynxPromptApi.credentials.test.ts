import { describe, it, expect } from 'vitest';
import { LynxPromptApi } from '../credentials/LynxPromptApi.credentials';

describe('LynxPromptApi Credentials', () => {
	const creds = new LynxPromptApi();

	it('has the correct name', () => {
		expect(creds.name).toBe('lynxPromptApi');
	});

	it('has the correct displayName', () => {
		expect(creds.displayName).toBe('LynxPrompt API');
	});

	it('has documentationUrl', () => {
		expect(creds.documentationUrl).toContain('lynxprompt');
	});

	it('has url property with correct default', () => {
		const urlProp = creds.properties.find((p) => p.name === 'url');
		expect(urlProp).toBeDefined();
		expect(urlProp!.type).toBe('string');
		expect(urlProp!.default).toBe('https://lynxprompt.com');
	});

	it('has apiToken property with password type', () => {
		const tokenProp = creds.properties.find((p) => p.name === 'apiToken');
		expect(tokenProp).toBeDefined();
		expect(tokenProp!.type).toBe('string');
		expect(tokenProp!.typeOptions).toEqual({ password: true });
	});

	it('uses Bearer token via generic authentication', () => {
		expect(creds.authenticate).toBeDefined();
		expect(creds.authenticate.type).toBe('generic');
		const headers = (creds.authenticate as any).properties.headers;
		expect(headers.Authorization).toContain('Bearer');
		expect(headers.Authorization).toContain('apiToken');
	});

	it('has credential test request to /api/v1/user', () => {
		expect(creds.test).toBeDefined();
		expect(creds.test.request.url).toBe('/api/v1/user');
		expect(creds.test.request.baseURL).toBe('={{$credentials.url}}');
		expect(creds.test.request.method).toBe('GET');
	});
});
