import type {
	IPollFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

interface BlueprintItem {
	id: string;
	updated_at?: string;
	[key: string]: unknown;
}

export class LynxPromptTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LynxPrompt Trigger',
		name: 'lynxPromptTrigger',
		icon: 'file:lynxprompt.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when blueprints are created or updated in LynxPrompt',
		defaults: { name: 'LynxPrompt Trigger' },
		inputs: [],
		outputs: ['main'],
		polling: true,
		credentials: [
			{
				name: 'lynxPromptApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Blueprint Created',
						value: 'blueprintCreated',
					},
					{
						name: 'Blueprint Updated',
						value: 'blueprintUpdated',
					},
				],
				default: 'blueprintCreated',
				required: true,
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const credentials = await this.getCredentials('lynxPromptApi');
		const baseUrl = credentials.url as string;

		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'lynxPromptApi',
			{
				method: 'GET',
				url: `${baseUrl}/api/v1/blueprints`,
				qs: { limit: 10 },
				json: true,
			},
		);

		const blueprints: BlueprintItem[] = Array.isArray(response)
			? response
			: ((response as IDataObject).data as BlueprintItem[]) ?? [];

		if (blueprints.length === 0) {
			return null;
		}

		if (event === 'blueprintCreated') {
			const stateKey = 'lastKnownIds';
			const lastKnownIds = ((this.getWorkflowStaticData('node') as IDataObject)[
				stateKey
			] ?? []) as string[];

			const newBlueprints = lastKnownIds.length
				? blueprints.filter((bp) => !lastKnownIds.includes(bp.id))
				: [];

			// Store current IDs for next poll
			(this.getWorkflowStaticData('node') as IDataObject)[stateKey] = blueprints.map(
				(bp) => bp.id,
			);

			if (newBlueprints.length === 0) {
				return null;
			}

			return [newBlueprints.map((bp) => ({ json: bp as unknown as IDataObject }))];
		}

		// blueprintUpdated
		const stateKey = 'lastUpdatedMap';
		const lastUpdatedMap = ((this.getWorkflowStaticData('node') as IDataObject)[
			stateKey
		] ?? {}) as Record<string, string>;

		const updatedBlueprints = Object.keys(lastUpdatedMap).length
			? blueprints.filter((bp) => {
					const prevUpdated = lastUpdatedMap[bp.id];
					return prevUpdated !== undefined && bp.updated_at !== prevUpdated;
				})
			: [];

		// Store current timestamps for next poll
		const newMap: Record<string, string> = {};
		for (const bp of blueprints) {
			newMap[bp.id] = bp.updated_at ?? '';
		}
		(this.getWorkflowStaticData('node') as IDataObject)[stateKey] = newMap;

		if (updatedBlueprints.length === 0) {
			return null;
		}

		return [updatedBlueprints.map((bp) => ({ json: bp as unknown as IDataObject }))];
	}
}
