<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import CloseIcon from "$icons/close.svg?raw";

  export let message: string;
  export let type: "success" | "error" | "warning" | "info" = "info";
  export let mobile = false;
  export let show: boolean = false;
  export let icon: string = "";
  export let closeable: boolean = true;

  const dispatch = createEventDispatcher();

  function fadeInScale(node, { duration }) {
    return {
      duration,
      easing: cubicOut,
      css: (t) => `opacity: ${t}; transform: scale(${0.9 + t * 0.1})`,
    };
  }
  const onClose = () => {
    dispatch("close");
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="toast"
  class:success={type === "success"}
  class:error={type === "error"}
  class:warning={type === "warning"}
  class:info={type === "info"}
  class:hidden={!show}
  on:click
  class:mobile
  in:fadeInScale={{ duration: 300 }}
  out:fadeInScale={{ duration: 300 }}
>
  <div class="content">
    <div class="data">
      {#if icon}
        <span class="icon icon-small">
          {@html icon}
        </span>
      {/if}
      <span class="message mc-font-simple">
        {message}
      </span>
    </div>
    {#if closeable}
      <Button
        type="quaternary"
        whiteText
        on:click={onClose}
        icon={CloseIcon}
        onlyIcon
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @use "Toast.scss";
</style>
