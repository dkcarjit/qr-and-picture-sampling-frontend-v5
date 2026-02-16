export interface QrItem {
  id: string;
  picture: string | null;
  style_number: string;
}

export interface ApiItem {
  id: string;
  picture: string | null;
  style_number: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ImageItem {
  id: string;
  src: string;
  styleName: string;
  createdAt: string,
  updatedAT: string,
  createdBy: string | null,
  updatedBy: string | null,
}
