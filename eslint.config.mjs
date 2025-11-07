import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist', 'node_modules', '.eslintignore'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,  // Desabilita regras que conflitam com Prettier
  // Sobrescrever regras do TypeScript ESLint que vêm do recommended
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      // NÃO usar prettier/prettier - Prettier será executado separadamente
      // Isso evita conflitos de formatação JSX

      // DESABILITADO: Força imports de tipos consistentes (import type vs import)
      // Causa problemas em runtime quando converte imports de valores para import type
      '@typescript-eslint/consistent-type-imports': 'off',

      // Alerta sobre uso de console (útil para produção, mas permitindo alguns casos)
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ⚠️  REMOVIDO: array-bracket-newline e array-element-newline
      // Essas regras conflitam com as configurações do Prettier
      // Deixe o Prettier controlar a formatação de arrays

      // === REGRAS DE TYPESCRIPT ADICIONAIS ===

      // Detecta variáveis não utilizadas, evitando código morto
      // (ignora variáveis prefixadas com _ que são intencionais)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Alerta sobre uso de 'any', incentivando tipagem mais precisa (iniciando suave)
      '@typescript-eslint/no-explicit-any': 'off',

      // Prefere 'const' sobre 'let' quando a variável não é reatribuída
      'prefer-const': 'error',

      // === BOAS PRÁTICAS GERAIS ===

      // Elimina uso de 'var' (problemático por causa do hoisting)
      'no-var': 'error',

      // Prefere arrow functions em callbacks para consistência
      'prefer-arrow-callback': 'error',

      // Usa sintaxe curta em objetos (ex: {a: a} vira {a})
      'object-shorthand': 'error',

      // Evita imports duplicados, mantendo o código limpo (iniciando suave)
      'no-duplicate-imports': 'warn',

      // === ORDENAÇÃO DE IMPORTS ===

      // Força ordenação consistente de imports
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Módulos built-in do Node.js
            'external', // Bibliotecas externas
            'internal', // Módulos internos do projeto
            'parent', // Imports de diretórios pais
            'sibling', // Imports do mesmo diretório
            'index', // Imports do index do diretório
            'type', // Imports de tipos (import type)
            'object', // Imports de objetos
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: 'src/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['type'],
        },
      ],

      // Evita imports desnecessários de módulos padrão
      'import/no-unresolved': 'off', // Desabilitado pois pode causar problemas com TypeScript paths

      // Prefere imports absolutos sobre relativos
      'import/no-relative-parent-imports': 'warn',

      // Garante que imports sejam resolvidos corretamente
      'import/no-deprecated': 'off',

      // === SEGURANÇA ===

      // Evita eval() que é inseguro e pode executar código malicioso
      'no-eval': 'error',

      // Evita formas indiretas de eval (setTimeout('code', 100))
      'no-implied-eval': 'error',

      // Evita new Function() que também é inseguro
      'no-new-func': 'error',

      // === REGRAS ESPECÍFICAS PARA NODE.JS/NESTJS ===

      // Alerta sobre process.exit() que pode terminar o servidor inesperadamente
      'no-process-exit': 'warn',

      // Força tratamento de erros em callbacks assíncronos
      'handle-callback-err': 'error',

      // === CONTROLE DE QUALIDADE E COMPLEXIDADE ===

      // Limita complexidade ciclomática (número de caminhos independentes)
      // Ajuda a manter funções simples e testáveis (iniciando suave)
      // 'complexity': ['warn', 15],

      // Limita tamanho das funções para melhor manutenção (iniciando suave)
      // 'max-lines-per-function': ['warn', 80],

      // === ESTILO E CONSISTÊNCIA ===

      // PROIBIDO: Uso de ponto e vírgula (;)
      // Consistente com Prettier (semi: false)
      semi: ['error', 'never'],

      // Prefere template literals sobre concatenação de strings
      'prefer-template': 'error',

      // Evita concatenação desnecessária de strings
      'no-useless-concat': 'error',

      // Remove returns desnecessários no final das funções
      'no-useless-return': 'error',
    },
  },
]
