<script lang="ts">
  //models
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  //components
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import OutfitPackageCollectionList from "../outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";

  export let open = false;
  export let label = "Collections";
  export let items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
  export let loading = true;
  export let pageSizes: number[] = [10, 20, 50, 100];
</script>

<Dialog bind:open {label}>
  <div id="collection-dialog">
    <PagedList
      on:optionsChanged
      {items}
      {loading}
      {pageSizes}
      let:items={pagedItems}
      let:pageSize={pagedPageSize}
      let:loading={pagedLoading}
    >
      <OutfitPackageCollectionList
        selectable
        items={pagedItems}
        pageSize={pagedPageSize}
        loading={pagedLoading}
        on:select
        on:unselect
      />
    </PagedList>
  </div>
</Dialog>

<style lang="scss">
  #collection-dialog {
    min-width: 50vw;
    max-width: 600px;
  }
</style>
