export interface Conversation {
  id: string;
  user_id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CreateConversationRequest {
  userId: string;
  title?: string;
}

export interface UpdateConversationRequest {
  id: string;
  userId: string;
  title?: string;
  is_active?: boolean;
}

export interface ListConversationsRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface DeleteConversationRequest {
  id: string;
  userId: string;
}

export interface GetActiveConversationRequest {
  userId: string;
}
