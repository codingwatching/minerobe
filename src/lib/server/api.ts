import { getAuth } from "firebase-admin/auth";
import { app } from "./services/firebaseServer";
const IsReadAllowed=async function (path: string) {
const allowedFolders = ["public", "users"];
return allowedFolders.includes(path);
}
const IsWriteAllowed=async function (path: string) {
const allowedFolders = ["users"];
return allowedFolders.includes(path);
}

const IsAuthorized = async function (token: string) {
  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return false;
  }
};

export const FetchDocument = async function (path: string, token: string) {
  const isAuthorized = await IsAuthorized(token);
  if (isAuthorized) {
    const isReadAllowed = await IsReadAllowed(path);
    if (isReadAllowed) {
      // fetch the document
    } else {
      // throw error
    }
  }
}
