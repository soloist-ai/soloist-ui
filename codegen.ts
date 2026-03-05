import type { CodegenConfig } from '@graphql-codegen/cli';

const useRemoteSchema = !!process.env.GRAPHQL_TOKEN;

const schema = useRemoteSchema
  ? {
      [`${process.env.VITE_API_BASE_URL || 'https://soloist-gateway.ru.tuna.am'}/graphql`]: {
        headers: {
          Authorization: `Bearer ${process.env.GRAPHQL_TOKEN}`,
          'API-Version': '1',
        },
      },
    }
  : 'src/graphql/schema/*.graphqls';

const config: CodegenConfig = {
  schema,
  documents: ['src/graphql/operations/**/*.graphql'],
  generates: {
    'src/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        rawRequest: false,
        inlineFragmentTypes: 'combine',
        scalars: {
          UUID: 'string',
          Long: 'number',
          BigDecimal: 'string',
          DateTime: 'string',
          Date: 'string',
        },
      },
    },
  },
};

export default config;
