export interface ArgsId {
  id: string;
}

export interface ChangeArgs<T> {
  id: string;
  dto: Omit<T, 'id'>;
}

export interface CreateArgs<T> {
  dto: Omit<T, 'id'>;
}