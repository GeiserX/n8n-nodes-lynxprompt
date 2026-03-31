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

const PAGE_SIZE = 50;
const MAX_PAGES = 4;

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

		// Paginate to fetch all blueprints (up to PAGE_SIZE * MAX_PAGES)
		const allBlueprints: BlueprintItem[] = [];
		for (let page = 0; page < MAX_PAGES; page++) {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'lynxPromptApi',
				{
					method: 'GET',
					url: `${baseUrl}/api/v1/blueprints`,
					qs: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
					json: true,
				},
			);

			const items: BlueprintItem[] =
				((response as IDataObject).blueprints as BlueprintItem[]) ?? [];
			allBlueprints.push(...items);

			if (items.length < PAGE_SIZE) break;
		}

		if (allBlueprints.length === 0) {
			return null;
		}

		if (event === 'blueprintCreated') {
			const stateKey = 'lastKnownIds';
			const lastKnownIds = ((this.getWorkflowStaticData('node') as IDataObject)[
				stateKey
			] ?? []) as string[];

			const newBlueprints = lastKnownIds.length
				? allBlueprints.filter((bp) => !lastKnownIds.includes(bp.id))
				: [];

			(this.getWorkflowStaticData('node') as IDataObject)[stateKey] =
				allBlueprints.map((bp) => bp.id);

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
			? allBlueprints.filter((bp) => {
					const prevUpdated = lastUpdatedMap[bp.id];
					return prevUpdated !== undefined && bp.updated_at !== prevUpdated;
				})
			: [];

		const newMap: Record<string, string> = {};
		for (const bp of allBlueprints) {
			newMap[bp.id] = bp.updated_at ?? '';
		}
		(this.getWorkflowStaticData('node') as IDataObject)[stateKey] = newMap;

		if (updatedBlueprints.length === 0) {
			return null;
		}

		return [updatedBlueprints.map((bp) => ({ json: bp as unknown as IDataObject }))];
	}
}
