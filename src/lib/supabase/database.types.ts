export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          settings: Json;
          xp: number;
          streak_count: number;
          streak_freezes: number;
          last_study_date: string | null;
          daily_goal_xp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          settings?: Json;
          xp?: number;
          streak_count?: number;
          streak_freezes?: number;
          last_study_date?: string | null;
          daily_goal_xp?: number;
        };
        Update: {
          display_name?: string;
          settings?: Json;
          daily_goal_xp?: number;
        };
        Relationships: [];
      };
      study_events: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          item_type: string | null;
          correct_count: number;
          total_count: number;
          xp: number;
          study_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          item_type?: string | null;
          correct_count?: number;
          total_count?: number;
          xp?: number;
          study_date?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      srs_cards: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_id: string;
          ease: number;
          interval_days: number;
          repetitions: number;
          lapses: number;
          due_at: string;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: string;
          item_id: string;
          ease?: number;
          interval_days?: number;
          repetitions?: number;
          lapses?: number;
          due_at?: string;
          last_reviewed_at?: string | null;
        };
        Update: {
          ease?: number;
          interval_days?: number;
          repetitions?: number;
          lapses?: number;
          due_at?: string;
          last_reviewed_at?: string | null;
        };
        Relationships: [];
      };
      kanji: {
        Row: {
          id: string;
          level: string;
          char: string;
          meaning_vi: string;
          on_reading: string[];
          kun_reading: string[];
          stroke_count: number;
          examples: Json;
          source: string;
          verified: boolean;
          order_index: number;
        };
        Insert: {
          id: string;
          level?: string;
          char: string;
          meaning_vi: string;
          on_reading?: string[];
          kun_reading?: string[];
          stroke_count: number;
          examples?: Json;
          source: string;
          verified?: boolean;
          order_index?: number;
        };
        Update: {
          level?: string;
          char?: string;
          meaning_vi?: string;
          on_reading?: string[];
          kun_reading?: string[];
          stroke_count?: number;
          examples?: Json;
          source?: string;
          verified?: boolean;
          order_index?: number;
        };
        Relationships: [];
      };
      listening_lessons: {
        Row: {
          id: string;
          unit_id: string;
          level: string;
          title: string;
          topic: string;
          theory: Json;
          dialogue: Json;
          source: string;
          verified: boolean;
          order_index: number;
        };
        Insert: {
          id: string;
          unit_id: string;
          level?: string;
          title: string;
          topic: string;
          theory: Json;
          dialogue: Json;
          source: string;
          verified?: boolean;
          order_index?: number;
        };
        Update: {
          unit_id?: string;
          level?: string;
          title?: string;
          topic?: string;
          theory?: Json;
          dialogue?: Json;
          source?: string;
          verified?: boolean;
          order_index?: number;
        };
        Relationships: [];
      };
      vocab: {
        Row: {
          id: string;
          unit_id: string;
          level: string;
          kana: string;
          kanji: string | null;
          romaji: string;
          meaning_vi: string;
          pos: string | null;
          example_jp: string | null;
          example_reading: string | null;
          example_vi: string | null;
          audio_text: string;
          source: string;
          verified: boolean;
          order_index: number;
        };
        Insert: {
          id: string;
          unit_id: string;
          level?: string;
          kana: string;
          kanji?: string | null;
          romaji: string;
          meaning_vi: string;
          pos?: string | null;
          example_jp?: string | null;
          example_reading?: string | null;
          example_vi?: string | null;
          audio_text: string;
          source: string;
          verified?: boolean;
          order_index?: number;
        };
        Update: {
          unit_id?: string;
          level?: string;
          kana?: string;
          kanji?: string | null;
          romaji?: string;
          meaning_vi?: string;
          pos?: string | null;
          example_jp?: string | null;
          example_reading?: string | null;
          example_vi?: string | null;
          audio_text?: string;
          source?: string;
          verified?: boolean;
          order_index?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_study_event: {
        Args: {
          p_kind: string;
          p_item_type: string | null;
          p_correct: number;
          p_total: number;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
