/**
 * @ouraihub/llm — Skill Loader.
 *
 * Loads skill files (SKILL.md format) and assembles them into structured
 * system prompts. Skills provide domain-specific knowledge, workflows,
 * and behavioral constraints for LLM completions.
 *
 * Usage:
 *   const loader = new SkillLoader();
 *   loader.add('gzh-design', skillMarkdownContent);
 *   const systemPrompt = loader.toSystemPrompt();
 *   await llm.complete({ system: systemPrompt, user: '...' }, schema);
 */

import type { LLMPrompt } from './interfaces.js';

/** A loaded skill entry */
export interface SkillEntry {
  /** Unique identifier (e.g. 'gzh-design') */
  readonly id: string;
  /** Skill name from frontmatter */
  readonly name: string;
  /** Skill description from frontmatter */
  readonly description: string;
  /** Full body content (markdown) */
  readonly body: string;
}

/** Options for system prompt assembly */
export interface SkillPromptOptions {
  /** Max total characters for all skills combined (default: no limit) */
  readonly maxChars?: number;
  /** Prefix before skill content (role/persona instruction) */
  readonly preamble?: string;
  /** Suffix after skill content (output format instructions) */
  readonly postamble?: string;
}

/**
 * SkillLoader — manages loading and composing skills into LLM prompts.
 *
 * Design:
 * - Skills are added as raw SKILL.md content (frontmatter + body)
 * - Frontmatter is parsed for metadata (name, description)
 * - Body becomes the instruction block in the system prompt
 * - Multiple skills compose into sections with clear boundaries
 */
export class SkillLoader {
  private skills: Map<string, SkillEntry> = new Map();

  /** Add a skill from raw SKILL.md content */
  add(id: string, rawContent: string): this {
    const { name, description, body } = parseFrontmatter(rawContent);
    this.skills.set(id, { id, name: name || id, description: description || '', body });
    return this;
  }

  /** Add a skill from pre-parsed entry */
  addEntry(entry: SkillEntry): this {
    this.skills.set(entry.id, entry);
    return this;
  }

  /** Remove a skill by id */
  remove(id: string): this {
    this.skills.delete(id);
    return this;
  }

  /** Check if a skill is loaded */
  has(id: string): boolean {
    return this.skills.has(id);
  }

  /** Get loaded skill ids */
  ids(): string[] {
    return Array.from(this.skills.keys());
  }

  /** Clear all loaded skills */
  clear(): this {
    this.skills.clear();
    return this;
  }

  /**
   * Assemble all loaded skills into a system prompt string.
   *
   * Format:
   * ```
   * {preamble}
   *
   * === SKILL: {name} ===
   * {body}
   *
   * === SKILL: {name2} ===
   * {body2}
   *
   * {postamble}
   * ```
   */
  toSystemPrompt(options?: SkillPromptOptions): string {
    const parts: string[] = [];

    if (options?.preamble) {
      parts.push(options.preamble);
    }

    for (const skill of this.skills.values()) {
      const section = `\n=== SKILL: ${skill.name} ===\n${skill.body}`;
      parts.push(section);
    }

    if (options?.postamble) {
      parts.push(`\n${options.postamble}`);
    }

    let result = parts.join('\n');

    // Truncate if maxChars specified
    if (options?.maxChars && result.length > options.maxChars) {
      result = result.slice(0, options.maxChars) + '\n\n[... truncated due to length limit]';
    }

    return result;
  }

  /**
   * Build a complete LLMPrompt with skills as system context.
   *
   * Convenience method that combines skill system prompt with user message.
   */
  buildPrompt(userMessage: string, options?: SkillPromptOptions): LLMPrompt {
    return {
      system: this.toSystemPrompt(options),
      user: userMessage,
    };
  }
}

// ─── Frontmatter Parser ──────────────────────────────────────────────────────

interface Frontmatter {
  name: string;
  description: string;
  body: string;
}

/**
 * Parse YAML frontmatter from SKILL.md content.
 * Extracts `name` and `description` fields, returns body without frontmatter.
 */
function parseFrontmatter(raw: string): Frontmatter {
  const trimmed = raw.trim();

  if (!trimmed.startsWith('---')) {
    return { name: '', description: '', body: trimmed };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return { name: '', description: '', body: trimmed };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const body = trimmed.slice(endIndex + 3).trim();

  let name = '';
  let description = '';

  for (const line of yamlBlock.split('\n')) {
    const nameMatch = line.match(/^name:\s*(.+)/);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    const descMatch = line.match(/^description:\s*(.+)/);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim().replace(/^['"]|['"]$/g, '');
      continue;
    }

    // Multi-line description (| or >)
    if (line.match(/^description:\s*[|>]/)) {
      // Collect subsequent indented lines
      const descLines: string[] = [];
      const allLines = yamlBlock.split('\n');
      const startIdx = allLines.indexOf(line);
      for (let i = startIdx + 1; i < allLines.length; i++) {
        const currentLine = allLines[i];
        if (currentLine && (currentLine.startsWith('  ') || currentLine.startsWith('\t'))) {
          descLines.push(currentLine.trim());
        } else {
          break;
        }
      }
      description = descLines.join(' ');
    }
  }

  return { name, description, body };
}
