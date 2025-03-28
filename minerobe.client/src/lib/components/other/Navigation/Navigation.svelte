<script lang="ts">
  import Search from "$lib/components/base/Search/Search.svelte";
  import NavigationItem from "../NavigationItem/NavigationItem.svelte";

  import HomeIcon from "$src/icons/home.svg?raw";
  import SearchIcon from "$src/icons/search.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import AvatarIcon from "$src/icons/avatar.svg?raw";
  import { CURRENT_USER, IS_MOBILE_VIEW } from "$src/data/static";
  import { loginUser } from "$src/api/auth";

  const profileAction = async () => {
    if (!$CURRENT_USER) await loginUser();
  };
</script>

<div class="navigation" class:mobile={$IS_MOBILE_VIEW}>
  <div class="items">
    <a id="nav-title" href={"/"}>
      <img src="/texture/logo-min.webp" alt="Logo" />
    </a>
    <div id="nav-search">
      <Search
        placeholder="Search outfits, collections"
        style="width:100%;max-width:400px;"
      />
    </div>
    <div id="nav-actions">
      {#if $IS_MOBILE_VIEW}
        <NavigationItem
          label="Home"
          onlyIcon
          icon={HomeIcon}
          viewId=""
          href="/"
        />
        <NavigationItem
          label="Search"
          onlyIcon
          icon={SearchIcon}
          viewId="explore"
          href="/explore"
        />
      {/if}
      <NavigationItem
        label="Wardrobe"
        onlyIcon
        icon={SubscriptionIcon}
        viewId="wardrobe"
        href="/wardrobe"
      />
      <NavigationItem
        label={$CURRENT_USER?.name || "Sign in"}
        viewId="profile"
        onlyIcon={$IS_MOBILE_VIEW}
        href={$CURRENT_USER ? "/profile" : null}
        icon={$CURRENT_USER?.avatar ? null : AvatarIcon}
        iconImage={$CURRENT_USER?.avatar}
        on:click={profileAction}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .navigation {
    height: 54px;
    min-width: 100%;
    display: flex;
    position: fixed;
    z-index: 20;
    backdrop-filter: blur(60px) saturate(150%);
    background-color: rgba(226, 226, 226, 0.8);
    justify-content: center;
    .items {
      max-width: 1316px;
      padding: 8px;
      box-sizing: border-box;
      flex: 1;
      display: grid;
      grid-template-columns: auto 1fr auto;
      #nav-title {
        display: table;
        padding: 8px 0px 2px;
        box-sizing: border-box;
        img {
          height: 24px;
        }
      }
      #nav-search {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #nav-actions {
        display: flex;
        gap: 8px;
        max-height: 100%;
      }
    }

    &.mobile {
      bottom: 0px;
      backdrop-filter: none;
      background-color: rgba(226, 226, 226);
      #nav-title,
      #nav-search {
        display: none;
      }
      .items {
        padding: 4px;
        grid-template-columns: 1fr;
      }
    }
  }
</style>
