import { OutfitFilter } from "./filter";
import type { OutfitPackage, PackageSocialData } from "./package";

export class MinerobeUserProfile {
  user: MinerobeUser;
  settings: MinerobeUserSettings;
  social: PackageSocialData;
}
export class MinerobeUser {
  id: string;
  name: string;
  avatar: string;
  wardrobeId: string;
  constructor(id: string, name: string, avatar: string,wardrobeId: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.wardrobeId = wardrobeId;
  }
}
export class MinerobeUserSimple {
  id: string;
  name: string;
}
//settings
export class MinerobeUserSettings {
  id: string;
  ownerId: string;
  currentTexture: CurrentTexture;
  currentCapeId: string;
  currentTexturePackageId: string;
  baseTexture: OutfitPackage;
  integrations: string[];
  theme: string;
}
export class CurrentTexture {
  texture: string;
  model: string;
  isFlat: boolean;
}
export class MinerobeUserSettingsSimple {
  id: string;
  ownerId: string;
  currentTextureConfig: any;
  currentTexturePackageId: string;
  currentCapeId: string;
  baseTexture: OutfitPackage;
  integrations: string[];
}
export class CurrentTextureConfig {
  texture: string;
  model: string;
  isFlat: boolean;
  capeId: string;
  constructor(
    texture: string,
    model: string,
    isFlat: boolean,
    capeId: string = null
  ) {
    this.texture = texture;
    this.model = model;
    this.isFlat = isFlat;
    this.capeId = capeId;
  }
}
export class UserPreferences {
  isWardobeMenuOpen: boolean;
  wadrobeFilter: OutfitFilter = new OutfitFilter();
}
