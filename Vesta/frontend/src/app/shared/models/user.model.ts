export interface User {
  uid?: string;
  email: string;
  displayName: string;
  role: number;
  availableBuildingIds?: string;
}
