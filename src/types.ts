export interface Resource<T = number> {
  id: string;
  label: string;
  updateHandler: () => T | Promise<T>;
  min?: number;
  max?: number;
  color?: string;
}

export interface ResourceGroup {
  id: string;
  label: string;
  resources: Resource<any>[];
}
