// Central re-export of all evan-kit types for ARES 2025
// This allows importing types from '@/types' instead of 'evan-kit/types' or '@evan/types'

// Re-export all evan-kit types
export * from '@evan/types';

// ARES-specific type extensions can be added here
// For example:
// export interface AresEvent extends EvanEvent {
//   readonly ares_specific_field?: string;
// }
