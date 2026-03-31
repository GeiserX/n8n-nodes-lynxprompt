import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LynxPromptApi implements ICredentialType {
	name = 'lynxPromptApi';
	displayName = 'LynxPrompt API';
	documentationUrl = 'https://lynxprompt.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: 'https://lynxprompt.com',
			placeholder: 'https://lynxprompt.com',
			description: 'Base URL of your LynxPrompt instance',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'lp_...',
			description: 'API token from your LynxPrompt account settings',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/api/v1/user',
			method: 'GET',
		},
	};
}
