<script lang="ts">
  import AiMessage from './AiMessage.svelte';
  import AiInput from './AiInput.svelte';
  import { streamChat } from './lib/stream';
  import type { ChatMessage } from './lib/types';

  let { endpoint, systemPrompt, model, placeholder, maxHistory = 20, class: className = '' }: {
    endpoint: string;
    systemPrompt?: string;
    model?: string;
    placeholder?: string;
    maxHistory?: number;
    class?: string;
  } = $props();

  let messages = $state<ChatMessage[]>([]);
  let streaming = $state(false);
  let error = $state('');
  let messagesEl: HTMLDivElement;

  function scrollBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send(text: string) {
    error = '';
    messages.push({ role: 'user', content: text });
    messages.push({ role: 'assistant', content: '' });
    streaming = true;
    scrollBottom();

    const history: ChatMessage[] = [];
    if (systemPrompt) history.push({ role: 'system', content: systemPrompt });
    history.push(...messages.filter(m => m.role !== 'system').slice(-maxHistory));

    try {
      for await (const chunk of streamChat(endpoint, { messages: history, model })) {
        messages[messages.length - 1].content += chunk;
        scrollBottom();
      }
    } catch (e) {
      messages.pop();
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      streaming = false;
    }
  }
</script>

<div class="oui-chat {className}">
  <div class="oui-messages" bind:this={messagesEl}>
    {#each messages as msg}
      <AiMessage role={msg.role === 'system' ? 'assistant' : msg.role} content={msg.content} />
    {/each}
    {#if error}
      <div class="oui-error">{error}</div>
    {/if}
  </div>
  <AiInput onSend={send} disabled={streaming} {placeholder} />
</div>
