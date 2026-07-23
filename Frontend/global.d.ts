declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
  }
}

declare module "*.png" {
  const value: any;
  export default value;
}
declare module "*.jpg" {
  const value: any;
  export default value;
}
declare module "*.jpeg" {
  const value: any;
  export default value;
}
