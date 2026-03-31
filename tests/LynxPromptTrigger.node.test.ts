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

	it('has polling: true', () => {
		expect(trigger.description.polling).toBe(true);
	});

	it('has a poll method', () => {
		expect(typeof trigger.poll).toBe('function');
	});

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

			// Should have stored IDs from the parsed blueprints array
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
	});

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
	});
});
