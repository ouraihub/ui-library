<script lang="ts">
  import AiChat from './AiChat.svelte';

  let { endpoint, systemPrompt, model, height = '400px', class: className = '' }: {
    endpoint: string;
    systemPrompt?: string;
    model?: string;
    height?: string;
    class?: string;
  } = $props();
</script>

<div class="oui-embed {className}" style="height: {height}">
  <AiChat {endpoint} {systemPrompt} {model} placeholder="试试问个问题..." />
</div>
