export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  created_at: string;
};

export type GarageProject = {
  id: string;
  user_id: string;
  nombre: string;
  specs: string | null;
  color: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgressEntry = {
  id: string;
  garage_project_id: string;
  user_id: string;
  tipo: string;
  texto: string;
  photo_url: string;
  points_awarded: number;
  created_at: string;
};

export type GarageComment = {
  id: string;
  garage_owner_id: string;
  author_id: string;
  text: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; display_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      garage_projects: {
        Row: GarageProject;
        Insert: Partial<GarageProject> & { user_id: string; nombre: string };
        Update: Partial<GarageProject>;
        Relationships: [];
      };
      progress_entries: {
        Row: ProgressEntry;
        Insert: Partial<ProgressEntry> & {
          garage_project_id: string;
          user_id: string;
          tipo: string;
          texto: string;
          photo_url: string;
        };
        Update: Partial<ProgressEntry>;
        Relationships: [];
      };
      garage_comments: {
        Row: GarageComment;
        Insert: Partial<GarageComment> & {
          garage_owner_id: string;
          author_id: string;
          text: string;
        };
        Update: Partial<GarageComment>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
