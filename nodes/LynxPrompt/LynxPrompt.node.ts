import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class LynxPrompt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LynxPrompt',
		name: 'lynxPrompt',
		icon: 'file:lynxprompt.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Manage AI configuration blueprints (AGENTS.md, CLAUDE.md) via LynxPrompt API',
		defaults: { name: 'LynxPrompt' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'lynxPromptApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ── Resource selector ──
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Blueprint', value: 'blueprint' },
					{ name: 'Hierarchy', value: 'hierarchy' },
					{ name: 'User', value: 'user' },
				],
				default: 'blueprint',
			},

			// ════════════════════════════════════════
			//         BLUEPRINT operations
			// ════════════════════════════════════════
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['blueprint'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a blueprint',
						routing: {
							request: {
								method: 'POST',
								url: '/api/v1/blueprints',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a blueprint',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/api/v1/blueprints/{{$parameter["blueprintId"]}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a blueprint',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/v1/blueprints/{{$parameter["blueprintId"]}}',
							},
						},
					},
					{
						name: 'List',
						value: 'list',
						action: 'List blueprints',
						routing: {
							request: {
								method: 'GET',
								url: '/api/v1/blueprints',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update a blueprint',
						routing: {
							request: {
								method: 'PUT',
								url: '=/api/v1/blueprints/{{$parameter["blueprintId"]}}',
							},
						},
					},
				],
				default: 'list',
			},

			// ── Blueprint fields ──

			// blueprintId — used by get, update, delete
			{
				displayName: 'Blueprint ID',
				name: 'blueprintId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'bp_...',
				description: 'ID of the blueprint (prefixed bp_)',
				displayOptions: {
					show: {
						resource: ['blueprint'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},

			// create — required fields
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the blueprint',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'name' },
				},
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 10 },
				required: true,
				default: '',
				description: 'Markdown content of the blueprint',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'content' },
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Short description of the blueprint',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'description' },
				},
			},

			// create — optional fields
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['create'] },
				},
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'string',
						default: '',
						description: 'Blueprint type (e.g. agents-md, claude-md, cursor-rules)',
						routing: {
							send: { type: 'body', property: 'type' },
						},
					},
					{
						displayName: 'Category',
						name: 'category',
						type: 'string',
						default: '',
						description: 'Category for the blueprint',
						routing: {
							send: { type: 'body', property: 'category' },
						},
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
						routing: {
							send: {
								type: 'body',
								property: 'tags',
								value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
							},
						},
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						options: [
							{ name: 'Public', value: 'public' },
							{ name: 'Private', value: 'private' },
							{ name: 'Unlisted', value: 'unlisted' },
						],
						default: 'private',
						description: 'Visibility of the blueprint',
						routing: {
							send: { type: 'body', property: 'visibility' },
						},
					},
					{
						displayName: 'Hierarchy ID',
						name: 'hierarchy_id',
						type: 'string',
						default: '',
						description: 'ID of the hierarchy this blueprint belongs to',
						routing: {
							send: { type: 'body', property: 'hierarchy_id' },
						},
					},
					{
						displayName: 'Parent ID',
						name: 'parent_id',
						type: 'string',
						default: '',
						description: 'ID of the parent blueprint',
						routing: {
							send: { type: 'body', property: 'parent_id' },
						},
					},
				],
			},

			// update — body fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['update'] },
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						routing: {
							send: { type: 'body', property: 'name' },
						},
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						typeOptions: { rows: 10 },
						default: '',
						routing: {
							send: { type: 'body', property: 'content' },
						},
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						routing: {
							send: { type: 'body', property: 'description' },
						},
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
						routing: {
							send: {
								type: 'body',
								property: 'tags',
								value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
							},
						},
					},
					{
						displayName: 'Visibility',
						name: 'visibility',
						type: 'options',
						options: [
							{ name: 'Public', value: 'public' },
							{ name: 'Private', value: 'private' },
							{ name: 'Unlisted', value: 'unlisted' },
						],
						default: 'private',
						routing: {
							send: { type: 'body', property: 'visibility' },
						},
					},
					{
						displayName: 'Expected Checksum',
						name: 'expected_checksum',
						type: 'string',
						default: '',
						description:
							'Checksum for optimistic locking — prevents overwriting concurrent changes',
						routing: {
							send: { type: 'body', property: 'expected_checksum' },
						},
					},
				],
			},

			// list — query params
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 20,
				description: 'Max number of results to return',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['list'] },
				},
				routing: {
					send: { type: 'query', property: 'limit' },
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Number of results to skip',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['list'] },
				},
				routing: {
					send: { type: 'query', property: 'offset' },
				},
			},
			{
				displayName: 'Visibility Filter',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Public', value: 'public' },
					{ name: 'Private', value: 'private' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: '',
				description: 'Filter by visibility',
				displayOptions: {
					show: { resource: ['blueprint'], operation: ['list'] },
				},
				routing: {
					send: {
						type: 'query',
						property: 'visibility',
						value: '={{$value || undefined}}',
					},
				},
			},

			// ════════════════════════════════════════
			//         HIERARCHY operations
			// ════════════════════════════════════════
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['hierarchy'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a hierarchy',
						routing: {
							request: {
								method: 'POST',
								url: '/api/v1/hierarchies',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a hierarchy',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/api/v1/hierarchies/{{$parameter["hierarchyId"]}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a hierarchy',
						routing: {
							request: {
								method: 'GET',
								url: '=/api/v1/hierarchies/{{$parameter["hierarchyId"]}}',
							},
						},
					},
					{
						name: 'List',
						value: 'list',
						action: 'List hierarchies',
						routing: {
							request: {
								method: 'GET',
								url: '/api/v1/hierarchies',
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update a hierarchy',
						routing: {
							request: {
								method: 'PATCH',
								url: '=/api/v1/hierarchies/{{$parameter["hierarchyId"]}}',
							},
						},
					},
				],
				default: 'list',
			},

			// ── Hierarchy fields ──

			// hierarchyId — used by get, update, delete
			{
				displayName: 'Hierarchy ID',
				name: 'hierarchyId',
				type: 'string',
				required: true,
				default: '',
				description: 'ID of the hierarchy',
				displayOptions: {
					show: {
						resource: ['hierarchy'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},

			// create — required fields
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				description: 'Name of the hierarchy',
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'name' },
				},
			},
			{
				displayName: 'Repository Root',
				name: 'repositoryRoot',
				type: 'string',
				required: true,
				default: '',
				placeholder: '/path/to/repo',
				description: 'Root path of the repository',
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'repository_root' },
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the hierarchy',
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['create'] },
				},
				routing: {
					send: { type: 'body', property: 'description' },
				},
			},

			// update — body fields
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['update'] },
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						routing: {
							send: { type: 'body', property: 'name' },
						},
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						routing: {
							send: { type: 'body', property: 'description' },
						},
					},
				],
			},

			// list — query params
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 20,
				description: 'Max number of results to return',
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['list'] },
				},
				routing: {
					send: { type: 'query', property: 'limit' },
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Number of results to skip',
				displayOptions: {
					show: { resource: ['hierarchy'], operation: ['list'] },
				},
				routing: {
					send: { type: 'query', property: 'offset' },
				},
			},

			// ════════════════════════════════════════
			//         USER operations
			// ════════════════════════════════════════
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{
						name: 'Get Current',
						value: 'getCurrent',
						action: 'Get current user',
						routing: {
							request: {
								method: 'GET',
								url: '/api/v1/user',
							},
						},
					},
				],
				default: 'getCurrent',
			},
		],
	};
}
