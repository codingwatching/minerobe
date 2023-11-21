import { get } from "svelte/store";
import { currentUser } from "../data/cache";
import { GetUser, login, logout } from "../data/firebase";

export const loginUser = async function () {
  let user = await login();
  //currentUser.set(user);
  loadUserToCache();
};
export const logoutUser = async function () {
  await logout();
  //currentUser.set(null);
  loadUserToCache();
};
export const loadUserToCache = async function () {
  currentUser.set(GetUser());
};