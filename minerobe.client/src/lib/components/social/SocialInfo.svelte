<script lang="ts">
  //services
  import { normalizeNumber } from "$src/helpers/data/dataHelper";
  //model
  import type { PackageSocialData } from "$data/models/package";
  //icons
  import HeartSmallIcon from "$icons/small/heart.svg?raw";
  import DownloadSmallIcon from "$icons/small/download.svg?raw";

  export let data: PackageSocialData;
  export let dense = false;
  export let style = "";
  export let showLikes = true;
  export let showDownloads = true;

  let normalizedLikes: string = "";
  let normalizedDownloads: string = "";

  $: {
    if (data) {
      if (data.likes != null) {
        normalizedLikes = normalizeNumber(data.likes);
      }
      if (data.downloads != null) {
        normalizedDownloads = normalizeNumber(data.downloads);
      }
    }
  }
</script>

<div class="social-info" class:dense {style}>
  {#if data?.likes > 0 && showLikes}
    <div class=" mc-font-simple data">
      {@html HeartSmallIcon}
      <div class="info-text">
        {normalizedLikes}
      </div>
    </div>
  {/if}
  {#if data?.downloads > 0 && showDownloads}
    <div class=" mc-font-simple data">
      {@html DownloadSmallIcon}
      <div class="info-text">
        {normalizedDownloads}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .social-info {
    display: flex;
    gap: 12px;
    &.dense {
      height: 22px;
    }
    & > .data {
      display: flex;
      gap: 3px;
      min-width: 35px;
    }
  }
  .info-text {
    margin-top: 2px;
    display: inline-table;
    font-size: var(--size-font-subtitle);
  }
</style>
