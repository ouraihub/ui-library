<script lang="ts">
  let { onSend, disabled = false, placeholder = '输入消息...', class: className = '' }: {
    onSend: (text: string) => void;
    disabled?: boolean;
    placeholder?: string;
    class?: string;
  } = $props();

  let text = $state('');

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    text = '';
    onSend(t);
  }
</script>

<div class="oui-input-area {className}">
  <textarea
    bind:value={text}
    onkeydown={handleKeydown}
    {placeholder}
    {disabled}
    rows="1"
  ></textarea>
  <button onclick={submit} {disabled}>发送</button>
</div>
