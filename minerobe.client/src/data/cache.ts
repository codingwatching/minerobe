import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
  readonly,
  derived,
} from "svelte/store";
import { APP_STATE } from "$data/consts";
import planksTextureRaw from "$src/texture/base_skin.png?url";
import * as THREE from "three";
import type { MinerobeUser } from "$src/model/user";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";

const isMobileViewWritable: Writable<boolean> = writable(false);
export const isMobileView: Readable<boolean> = readonly(isMobileViewWritable);

const isMobileNavigationWritable: Writable<boolean> = writable(false);
export const isMobileNavigation: Readable<boolean> =
  readonly(isMobileNavigationWritable);

export const planksTexture: Readable<string> = readable(planksTextureRaw);
export const defaultRenderer: Writable<string> = writable(null);

export const appState: Writable<string> = writable(APP_STATE.LOADING);
export const currentUser: Writable<MinerobeUser> = writable(null);
export const snapshotTemporaryNode = writable(null);
export const baseTexture: Readable<string> = readable(get(planksTexture));
export const isUserGuest: Readable<boolean> = derived(
  currentUser,
  ($user) => $user?.id == null
);
export let serverWsConnection:Writable<any> = writable(null);

let userSubscription;
export const preSetup = function () {
  const matcher = window.matchMedia("(max-width: 768px)");
  isMobileViewWritable.set(matcher.matches);
  matcher.addEventListener("change", (e) => {
    isMobileViewWritable.set(e.matches);
  });

  const matchernav = window.matchMedia("(max-width: 568px)");
  isMobileNavigationWritable.set(matchernav.matches);
  matchernav.addEventListener("change", (e) => {
     isMobileNavigationWritable.set(e.matches);
  });
};
export const setup = function () {
  defaultRenderer.update((renderer: any) => {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    return renderer;
  });
  if (userSubscription) userSubscription();
  userSubscription = currentUser.subscribe(async (user) => {
    appState.set(user != null ? APP_STATE.READY : APP_STATE.GUEST_READY);
  });
  serverWsConnection.set( new HubConnectionBuilder().withUrl("/api/ws?userId="+get(currentUser).id,HttpTransportType.ServerSentEvents).build());

  get(serverWsConnection).start().then(() => {
    console.log("Connection started!");
  }).catch((err) => {
    console.error(err);
  } );

};
export const currentToasts: Writable<any[]> = writable([]);
export const showToast = function (
  message: string,
  icon = null,
  type: string = "success",
  action: any = () => {},
  closeable: boolean = true,
  duration: number = 3000
) {
  let toast = {
    message: message,
    icon: icon,
    duration: duration,
    action: action,
    closeable: closeable,
    type: type,
  };
  currentToasts.update((toasts) => {
    toasts.push(toast);
    return toasts;
  });
  setTimeout(() => {
    currentToasts.update((toasts) => {
      toasts.shift();
      return toasts;
    });
  }, duration);
};
export const hideToast = function (toast: any) {
  currentToasts.update((toasts) => {
    toasts.splice(toasts.indexOf(toast), 1);
    return toasts;
  });
};
