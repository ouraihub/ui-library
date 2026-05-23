<script lang="ts">
  let { role, content, class: className = '' }: {
    role: 'user' | 'assistant';
    content: string;
    class?: string;
  } = $props();
</script>

<div class="oui-msg oui-msg--{role} {className}">
  <div class="oui-bubble">{content}</div>
</div>
