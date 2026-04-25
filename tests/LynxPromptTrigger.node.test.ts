import { describe, it, expect, vi } from 'vitest';
import { LynxPromptTrigger } from '../nodes/LynxPrompt/LynxPromptTrigger.node';

function createMockContext(
	params: Record<string, any>,
	staticData: Record<string, any>,
	httpResponse: any,
) {
	return {
		getNodeParameter: (name: string) => params[name],
		getWorkflowStaticData: () => staticData,
		helpers: {
			httpRequestWithAuthentication: vi.fn().mockResolvedValue(httpResponse),
		},
		getCredentials: vi.fn().mockResolvedValue({ url: 'http://localhost', apiToken: 'lp_test' }),
	};
}

describe('LynxPromptTrigger Node', () => {
	const trigger = new LynxPromptTrigger();

	it('has correct node name', () => {
		expect(trigger.description.name).toBe('lynxPromptTrigger');
	});

	it('has polling: true', () => {
		expect(trigger.description.polling).toBe(true);
	});

	it('has a poll method', () => {
		expect(typeof trigger.poll).toBe('function');
	});

	it('requires lynxPromptApi credentials', () => {
		expect(trigger.description.credentials).toEqual([
			{ name: 'lynxPromptApi', required: true },
		]);
	});

	it('has blueprintCreated and blueprintUpdated events', () => {
		const eventProp = trigger.description.properties.find((p) => p.name === 'event');
		expect(eventProp).toBeDefined();
		const options = (eventProp as any).options;
		expect(options).toHaveLength(2);
		expect(options.map((o: any) => o.value)).toEqual(['blueprintCreated', 'blueprintUpdated']);
	});

	// ── Empty response ──
	it('returns null when no blueprints exist', async () => {
		const staticData: Record<string, any> = {};
		const ctx = createMockContext(
			{ event: 'blueprintCreated' },
			staticData,
			{ blueprints: [] },
		);
		const result = await trigger.poll.call(ctx as any);
		expect(result).toBeNull();
	});

	it('returns null when response has no blueprints key', async () => {
		const staticData: Record<string, any> = {};
		const ctx = createMockContext(
			{ event: 'blueprintCreated' },
			staticData,
			{},
		);
		const result = await trigger.poll.call(ctx as any);
		expect(result).toBeNull();
	});

	// ── blueprintCreated ──
	describe('blueprintCreated event', () => {
		it('parses response.blueprints (not plain array)', async () => {
			const staticData: Record<string, any> = {};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintCreated' }, staticData, httpResponse);
			await trigger.poll.call(ctx as any);

			expect(staticData.lastKnownIds).toEqual(['bp_1']);
		});

		it('first poll seeds known IDs, returns null', async () => {
			const staticData: Record<string, any> = {};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
					{ id: 'bp_2', name: 'Test 2', updated_at: '2026-04-01T09:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintCreated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull();
			expect(staticData.lastKnownIds).toEqual(['bp_1', 'bp_2']);
		});

		it('second poll with new blueprint ID emits event', async () => {
			const staticData: Record<string, any> = {
				lastKnownIds: ['bp_1', 'bp_2'],
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_3', name: 'New Blueprint', updated_at: '2026-04-01T12:00:00Z' },
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
					{ id: 'bp_2', name: 'Test 2', updated_at: '2026-04-01T09:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintCreated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).not.toBeNull();
			expect(result).toHaveLength(1);
			expect(result![0]).toHaveLength(1);
			expect(result![0][0].json.id).toBe('bp_3');
			expect(result![0][0].json.name).toBe('New Blueprint');
		});

		it('returns null when no new blueprints appear', async () => {
			const staticData: Record<string, any> = {
				lastKnownIds: ['bp_1'],
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintCreated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull();
			expect(staticData.lastKnownIds).toEqual(['bp_1']);
		});
	});

	// ── blueprintUpdated ──
	describe('blueprintUpdated event', () => {
		it('first poll seeds updated map, returns null', async () => {
			const staticData: Record<string, any> = {};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintUpdated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull();
			expect(staticData.lastUpdatedMap).toEqual({ bp_1: '2026-04-01T10:00:00Z' });
		});

		it('second poll with changed updated_at emits event', async () => {
			const staticData: Record<string, any> = {
				lastUpdatedMap: { bp_1: '2026-04-01T10:00:00Z' },
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test Updated', updated_at: '2026-04-01T12:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintUpdated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).not.toBeNull();
			expect(result).toHaveLength(1);
			expect(result![0]).toHaveLength(1);
			expect(result![0][0].json.id).toBe('bp_1');
		});

		it('returns null when no blueprints changed', async () => {
			const staticData: Record<string, any> = {
				lastUpdatedMap: { bp_1: '2026-04-01T10:00:00Z' },
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintUpdated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull();
		});

		it('does not emit for new blueprints not in previous map', async () => {
			const staticData: Record<string, any> = {
				lastUpdatedMap: { bp_1: '2026-04-01T10:00:00Z' },
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'Test', updated_at: '2026-04-01T10:00:00Z' },
					{ id: 'bp_2', name: 'Brand New', updated_at: '2026-04-01T11:00:00Z' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintUpdated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull();
			// But the map should now include bp_2
			expect(staticData.lastUpdatedMap).toEqual({
				bp_1: '2026-04-01T10:00:00Z',
				bp_2: '2026-04-01T11:00:00Z',
			});
		});

		it('emits when blueprint loses updated_at (undefined vs stored empty string)', async () => {
			const staticData: Record<string, any> = {
				lastUpdatedMap: { bp_1: '' },
			};
			const httpResponse = {
				blueprints: [
					{ id: 'bp_1', name: 'No timestamp' },
				],
			};

			const ctx = createMockContext({ event: 'blueprintUpdated' }, staticData, httpResponse);
			const result = await trigger.poll.call(ctx as any);

			// bp.updated_at is undefined, prevUpdated is '' => undefined !== '' => emits
			expect(result).not.toBeNull();
			expect(result![0]).toHaveLength(1);
			expect(result![0][0].json.id).toBe('bp_1');
			expect(staticData.lastUpdatedMap).toEqual({ bp_1: '' });
		});
	});

	// ── Pagination ──
	describe('pagination', () => {
		it('fetches multiple pages until a short page is returned', async () => {
			const staticData: Record<string, any> = {};

			// Page 1: 50 items (full page), Page 2: 10 items (short page => stop)
			const page1Items = Array.from({ length: 50 }, (_, i) => ({
				id: `bp_${i}`,
				updated_at: '2026-04-01T10:00:00Z',
			}));
			const page2Items = Array.from({ length: 10 }, (_, i) => ({
				id: `bp_${50 + i}`,
				updated_at: '2026-04-01T10:00:00Z',
			}));

			const httpMock = vi.fn()
				.mockResolvedValueOnce({ blueprints: page1Items })
				.mockResolvedValueOnce({ blueprints: page2Items });

			const ctx = {
				getNodeParameter: (name: string) => ({ event: 'blueprintCreated' }[name]),
				getWorkflowStaticData: () => staticData,
				helpers: { httpRequestWithAuthentication: httpMock },
				getCredentials: vi.fn().mockResolvedValue({ url: 'http://localhost', apiToken: 'lp_test' }),
			};

			const result = await trigger.poll.call(ctx as any);

			expect(result).toBeNull(); // first poll seeds state
			expect(httpMock).toHaveBeenCalledTimes(2);
			expect(staticData.lastKnownIds).toHaveLength(60);

			// Verify offsets — httpRequestWithAuthentication.call(this, credType, options)
			// so mock receives (credType, options) at indices [0] and [1]
			expect(httpMock.mock.calls[0][1].qs.offset).toBe(0);
			expect(httpMock.mock.calls[1][1].qs.offset).toBe(50);
		});

		it('stops at MAX_PAGES (4)', async () => {
			const staticData: Record<string, any> = {};

			const fullPage = Array.from({ length: 50 }, (_, i) => ({
				id: `bp_page_${i}`,
				updated_at: '2026-04-01T10:00:00Z',
			}));

			const httpMock = vi.fn().mockResolvedValue({ blueprints: fullPage });

			const ctx = {
				getNodeParameter: (name: string) => ({ event: 'blueprintCreated' }[name]),
				getWorkflowStaticData: () => staticData,
				helpers: { httpRequestWithAuthentication: httpMock },
				getCredentials: vi.fn().mockResolvedValue({ url: 'http://localhost', apiToken: 'lp_test' }),
			};

			await trigger.poll.call(ctx as any);

			expect(httpMock).toHaveBeenCalledTimes(4);
		});
	});
});
