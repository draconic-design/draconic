import { RuleConfigSeverity, UserConfig } from '@commitlint/types';

const configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
    'scope-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    'subject-case': [RuleConfigSeverity.Error, 'always', 'sentence-case'],
    'body-max-line-length': [RuleConfigSeverity.Disabled, 'always', 500],
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        'build',
        'ci',
        'chore',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'test',
        'style'
      ]
    ]
  }
};

export default configuration;
