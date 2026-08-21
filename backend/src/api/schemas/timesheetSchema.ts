export const getTimesheetSchema = {
  querystring: {
    type: 'object',
    required: ['weekStart'],
    properties: {
      weekStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    },
  },
};

export const saveTimesheetSchema = {
  body: {
    type: 'object',
    required: ['weekStart', 'rows'],
    properties: {
      weekStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      rows: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'client', 'project', 'task', 'hours', 'billable'],
          properties: {
            id: { type: 'number' },
            client: { type: 'string' },
            project: { type: 'string' },
            task: { type: 'string' },
            hours: {
              type: 'array',
              minItems: 7,
              maxItems: 7,
              items: { type: 'number', minimum: 0, maximum: 24 },
            },
            billable: { type: 'boolean' },
          },
        },
      },
    },
  },
};

export const approveTimesheetSchema = {
  body: {
    type: 'object',
    required: ['weekStart', 'action'],
    properties: {
      weekStart: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      action: { type: 'string', enum: ['approve', 'reject'] },
    },
  },
};
