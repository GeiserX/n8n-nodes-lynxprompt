import { describe, it, expect } from 'vitest';
import { LynxPrompt } from '../nodes/LynxPrompt/LynxPrompt.node';

describe('LynxPrompt Node', () => {
	const node = new LynxPrompt();
	const desc = node.description;

	it('has correct name and credentials', () => {
		expect(desc.name).toBe('lynxPrompt');
		expect(desc.credentials).toEqual([{ name: 'lynxPromptApi', required: true }]);
	});

	it('has 3 resources', () => {
		const resourceProp = desc.properties.find((p) => p.name === 'resource');
		expect(resourceProp).toBeDefined();
		const options = (resourceProp as any).options;
		expect(options).toHaveLength(3);
		const values = options.map((o: any) => o.value);
		expect(values).toEqual(['blueprint', 'hierarchy', 'user']);
	});

	describe('Blueprint CRUD', () => {
		const operationProp = desc.properties.find(
			(p) =>
				p.name === 'operation' &&
				(p.displayOptions?.show?.resource as string[] | undefined)?.includes('blueprint'),
		);
		const options = (operationProp as any).options;

		it('Create uses POST /api/v1/blueprints', () => {
			const create = options.find((o: any) => o.value === 'create');
			expect(create.routing.request.method).toBe('POST');
			expect(create.routing.request.url).toBe('/api/v1/blueprints');
		});

		it('Get uses GET /api/v1/blueprints/{blueprintId}', () => {
			const get = options.find((o: any) => o.value === 'get');
			expect(get.routing.request.method).toBe('GET');
			expect(get.routing.request.url).toContain('/api/v1/blueprints/');
			expect(get.routing.request.url).toContain('blueprintId');
		});

		it('Update uses PUT /api/v1/blueprints/{blueprintId}', () => {
			const update = options.find((o: any) => o.value === 'update');
			expect(update.routing.request.method).toBe('PUT');
			expect(update.routing.request.url).toContain('/api/v1/blueprints/');
			expect(update.routing.request.url).toContain('blueprintId');
		});

		it('Delete uses DELETE /api/v1/blueprints/{blueprintId}', () => {
			const del = options.find((o: any) => o.value === 'delete');
			expect(del.routing.request.method).toBe('DELETE');
			expect(del.routing.request.url).toContain('/api/v1/blueprints/');
			expect(del.routing.request.url).toContain('blueprintId');
		});

		it('List uses GET /api/v1/blueprints', () => {
			const list = options.find((o: any) => o.value === 'list');
			expect(list.routing.request.method).toBe('GET');
			expect(list.routing.request.url).toBe('/api/v1/blueprints');
		});
	});

	describe('Blueprint Create body params', () => {
		it('has name, content, description as body params', () => {
			const nameParam = desc.properties.find(
				(p) =>
					p.name === 'name' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('create') &&
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes('blueprint'),
			);
			expect(nameParam).toBeDefined();
			expect((nameParam as any).routing.send.type).toBe('body');
			expect((nameParam as any).routing.send.property).toBe('name');

			const contentParam = desc.properties.find(
				(p) =>
					p.name === 'content' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('create'),
			);
			expect(contentParam).toBeDefined();
			expect((contentParam as any).routing.send.type).toBe('body');
			expect((contentParam as any).routing.send.property).toBe('content');

			const descParam = desc.properties.find(
				(p) =>
					p.name === 'description' &&
					(p.displayOptions?.show?.operation as string[] | undefined)?.includes('create') &&
					(p.displayOptions?.show?.resource as string[] | undefined)?.includes('blueprint'),
			);
			expect(descParam).toBeDefined();
			expect((descParam as any).routing.send.type).toBe('body');
			expect((descParam as any).routing.send.property).toBe('description');
		});
	});

	describe('Authorization', () => {
		it('uses Bearer token from credentials via requestDefaults', () => {
			// Auth is configured at the credential level (LynxPromptApi.credentials.ts)
			// The node uses requestDefaults.baseURL referencing credentials
			expect(desc.requestDefaults?.baseURL).toBe('={{$credentials.url}}');
			// Credential name matches
			expect(desc.credentials![0].name).toBe('lynxPromptApi');
		});
	});
});
