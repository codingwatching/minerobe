<script lang="ts">
  //services
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";
  //models
  import { Cape } from "$data/models/integration/minecraft";
  //icons
  import CloseBoxIcon from "$icons/close-box.svg?raw";

  export let item: Cape = new Cape();
  export let crop: boolean = true;
  export let selected: boolean = false;
  export let readonly = false;
  export let autoSize = false;

  const normalizeCape = async function (cape: Cape) {
    if (!crop) return cape.texture;
    return await GetImageArea(cape.texture, 1, 0, 10, 10);
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-missing-attribute -->
<a
  class="cape-list-item"
  class:selected
  class:autoSize
  title={item.name}
  on:click
  class:readonly
  draggable="false"
>
  {#if item.id}
    {#await normalizeCape(item) then texture}
      <img src={texture} alt={item.name} />
    {/await}
  {:else}
    <div>
      {@html CloseBoxIcon}
    </div>
  {/if}
</a>

<style lang="scss">
  @use "CapeListItem.scss";
</style>
