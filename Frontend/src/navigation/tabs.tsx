export type TabParamList = {
  Home: undefined;
  Fitting: { selectedItem?: string } | undefined;
  Camera: undefined;
  Shop: undefined;
  Profile: undefined;
};

export const TABS = [
  {
    name: "Home",
    label: "Home",
    iconName: "home",
    iconLibrary: "Feather",
  },
  {
    name: "Fitting",
    label: "Fitting",
    iconName: "hanger",
    iconLibrary: "MaterialCommunityIcons",
  },
  {
    name: "Camera",
    label: "Camera",
    iconName: "camera",
    iconLibrary: "Feather",
  },
  {
    name: "Shop",
    label: "Shop",
    iconName: "shopping-bag",
    iconLibrary: "Feather",
  },
  {
    name: "Profile",
    label: "Profile",
    iconName: "user",
    iconLibrary: "Feather",
  },
] as const;
