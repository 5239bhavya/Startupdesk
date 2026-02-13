// Dashboard table type extensions for Supabase
// These types extend the auto-generated Supabase types with our new dashboard tables

declare module '@/integrations/supabase/client' {
    interface Database {
        public: {
            Tables: {
                dashboard_config: {
                    Row: {
                        id: string;
                        user_id: string;
                        active_widgets: string[];
                        layout_config: any;
                        created_at: string;
                        updated_at: string;
                    };
                    Insert: {
                        id?: string;
                        user_id: string;
                        active_widgets?: string[];
                        layout_config?: any;
                        created_at?: string;
                        updated_at?: string;
                    };
                    Update: {
                        id?: string;
                        user_id?: string;
                        active_widgets?: string[];
                        layout_config?: any;
                        created_at?: string;
                        updated_at?: string;
                    };
                };
                sales_tracking: {
                    Row: {
                        id: string;
                        user_id: string;
                        date: string;
                        amount: number;
                        product_service: string;
                        category: string;
                        customer_name: string;
                        created_at: string;
                    };
                    Insert: {
                        id?: string;
                        user_id: string;
                        date: string;
                        amount: number;
                        product_service: string;
                        category?: string;
                        customer_name?: string;
                        created_at?: string;
                    };
                    Update: {
                        id?: string;
                        user_id?: string;
                        date?: string;
                        amount?: number;
                        product_service?: string;
                        category?: string;
                        customer_name?: string;
                        created_at?: string;
                    };
                };
                cash_flow: {
                    Row: {
                        id: string;
                        user_id: string;
                        date: string;
                        type: 'income' | 'expense';
                        amount: number;
                        category: string;
                        description: string;
                        created_at: string;
                    };
                    Insert: {
                        id?: string;
                        user_id: string;
                        date: string;
                        type: 'income' | 'expense';
                        amount: number;
                        category: string;
                        description?: string;
                        created_at?: string;
                    };
                    Update: {
                        id?: string;
                        user_id?: string;
                        date?: string;
                        type?: 'income' | 'expense';
                        amount?: number;
                        category?: string;
                        description?: string;
                        created_at?: string;
                    };
                };
                advertising_campaigns: {
                    Row: {
                        id: string;
                        user_id: string;
                        platform: string;
                        campaign_name: string;
                        budget: number;
                        spent: number;
                        impressions: number;
                        clicks: number;
                        conversions: number;
                        start_date: string;
                        end_date: string | null;
                        status: string;
                        created_at: string;
                        updated_at: string;
                    };
                    Insert: {
                        id?: string;
                        user_id: string;
                        platform: string;
                        campaign_name: string;
                        budget: number;
                        spent?: number;
                        impressions?: number;
                        clicks?: number;
                        conversions?: number;
                        start_date: string;
                        end_date?: string | null;
                        status?: string;
                        created_at?: string;
                        updated_at?: string;
                    };
                    Update: {
                        id?: string;
                        user_id?: string;
                        platform?: string;
                        campaign_name?: string;
                        budget?: number;
                        spent?: number;
                        impressions?: number;
                        clicks?: number;
                        conversions?: number;
                        start_date?: string;
                        end_date?: string | null;
                        status?: string;
                        created_at?: string;
                        updated_at?: string;
                    };
                };
                business_milestones: {
                    Row: {
                        id: string;
                        user_id: string;
                        phase: string;
                        milestone_name: string;
                        description: string;
                        completed: boolean;
                        completed_date: string | null;
                        order_index: number;
                        created_at: string;
                        updated_at: string;
                    };
                    Insert: {
                        id?: string;
                        user_id: string;
                        phase: string;
                        milestone_name: string;
                        description?: string;
                        completed?: boolean;
                        completed_date?: string | null;
                        order_index: number;
                        created_at?: string;
                        updated_at?: string;
                    };
                    Update: {
                        id?: string;
                        user_id?: string;
                        phase?: string;
                        milestone_name?: string;
                        description?: string;
                        completed?: boolean;
                        completed_date?: string | null;
                        order_index?: number;
                        created_at?: string;
                        updated_at?: string;
                    };
                };
            };
        };
    }
}

export { };
