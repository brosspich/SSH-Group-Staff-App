// Global module declarations

declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(config?: any);
    invalidateQueries(filters?: any): Promise<void>;
  }
  export const QueryClientProvider: React.FC<{ client: QueryClient; children: React.ReactNode }>;
  export function useQueryClient(): QueryClient;
  export function useQuery<T = any>(options: any): { data?: T; isLoading: boolean; error: any; refetch: () => Promise<any> };
  export function useMutation<TData = any, TVariables = any>(options: any): { mutate: (variables: TVariables) => void; mutateAsync: (variables: TVariables) => Promise<TData>; isPending: boolean };
}
