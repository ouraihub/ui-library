import { describe, it, expect } from 'vitest';
import { SkillLoader } from '../src/skill-loader.js';

const SAMPLE_SKILL = `---
name: gzh-design
description: 微信公众号文章排版引擎
---

# 公众号文章排版 Skill

把一篇 Markdown 文章转换为 HTML。

## 工作流

1. 选主题
2. 读组件库
3. 装配 HTML
`;

const MULTILINE_DESC_SKILL = `---
name: test-skill
description: |
  这是一个多行描述
  用于测试多行解析
---

# Body content here
`;

describe('SkillLoader', () => {
  it('parses frontmatter correctly', () => {
    const loader = new SkillLoader();
    loader.add('gzh', SAMPLE_SKILL);
    expect(loader.has('gzh')).toBe(true);
    expect(loader.ids()).toEqual(['gzh']);
  });

  it('generates system prompt with skill content', () => {
    const loader = new SkillLoader();
    loader.add('gzh', SAMPLE_SKILL);
    const prompt = loader.toSystemPrompt();
    expect(prompt).toContain('=== SKILL: gzh-design ===');
    expect(prompt).toContain('公众号文章排版 Skill');
    expect(prompt).toContain('选主题');
  });

  it('supports preamble and postamble', () => {
    const loader = new SkillLoader();
    loader.add('gzh', SAMPLE_SKILL);
    const prompt = loader.toSystemPrompt({
      preamble: '你是一个排版助手。',
      postamble: '请用JSON格式输出。',
    });
    expect(prompt.startsWith('你是一个排版助手。')).toBe(true);
    expect(prompt.endsWith('请用JSON格式输出。')).toBe(true);
  });

  it('supports multiple skills', () => {
    const loader = new SkillLoader();
    loader.add('skill1', SAMPLE_SKILL);
    loader.add('skill2', MULTILINE_DESC_SKILL);
    const prompt = loader.toSystemPrompt();
    expect(prompt).toContain('=== SKILL: gzh-design ===');
    expect(prompt).toContain('=== SKILL: test-skill ===');
  });

  it('buildPrompt creates complete LLMPrompt', () => {
    const loader = new SkillLoader();
    loader.add('gzh', SAMPLE_SKILL);
    const prompt = loader.buildPrompt('帮我排版这篇文章');
    expect(prompt.system).toContain('gzh-design');
    expect(prompt.user).toBe('帮我排版这篇文章');
  });

  it('truncates when maxChars specified', () => {
    const loader = new SkillLoader();
    loader.add('gzh', SAMPLE_SKILL);
    const prompt = loader.toSystemPrompt({ maxChars: 50 });
    expect(prompt.length).toBeLessThan(100);
    expect(prompt).toContain('[... truncated');
  });

  it('remove works', () => {
    const loader = new SkillLoader();
    loader.add('a', SAMPLE_SKILL).add('b', MULTILINE_DESC_SKILL);
    expect(loader.ids().length).toBe(2);
    loader.remove('a');
    expect(loader.ids()).toEqual(['b']);
  });

  it('clear removes all', () => {
    const loader = new SkillLoader();
    loader.add('a', SAMPLE_SKILL).add('b', MULTILINE_DESC_SKILL);
    loader.clear();
    expect(loader.ids()).toEqual([]);
  });

  it('handles content without frontmatter', () => {
    const loader = new SkillLoader();
    loader.add('plain', '# Just a heading\n\nSome content.');
    const prompt = loader.toSystemPrompt();
    expect(prompt).toContain('=== SKILL: plain ===');
    expect(prompt).toContain('Just a heading');
  });
});
