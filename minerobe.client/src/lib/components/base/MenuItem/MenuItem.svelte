<script lang="ts">
  export let label: string;
  export let icon: string = null;
  export let href: string = null;
  export let disabled: boolean = false;
  export let badgelabel: string = null;
  export let selected: boolean = false;
  export let opened = true;
  export let top = false;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a
  class="menu-item"
  class:disabled
  {href}
  class:selected
  class:opened
  on:click
  class:top
  title={label}
>
  {#if icon}
    <div class="icon b-icon-medium">
      {@html icon}
    </div>
  {/if}
  {#if opened || top}
    <span class="menu-item-label">{label}</span>
    {#if badgelabel}
      <div class="badge">{badgelabel}</div>
    {/if}
  {/if}
</a>

<style lang="scss">
  .menu-item {
    user-select: none;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    box-sizing: border-box;
    font-size: var(--size-font-base);
    font-family: minecraft-simple;
    box-sizing: border-box;
    padding: 7px 8px 7px 8px;
    color: var(--color-theme-font);
    gap: 8px;
    min-height: 40px;
    &.opened {
      padding: 7px 16px 7px 8px;
    }
    &.top {
      flex: 1;
      text-align: center;
      display: block;
      height: 58px;
      padding: 7px 8px;
    }
    &:hover {
      background: var(--color-theme-D2);
    }
    &:active {
      background: var(--color-theme-font);
      color: var(--color-accent-font);
    }
    span {
      margin: 5px 0px;
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .badge {
      margin: 5px 8px 5px 0px;
    }
    &.selected {
      background: var(--color-accent);
      color: var(--color-accent-font);
      line-height: var(--size-font-base);
      font-family: minecraft;
      span {
        margin: 4px 0px 6px;
      }
      &:hover {
        background: var(--color-accent-D1);
      }
      &:active {
        background: var(--color-theme-font);
      }
    }
  }
</style>
