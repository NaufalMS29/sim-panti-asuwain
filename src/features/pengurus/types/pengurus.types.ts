export interface PengurusItem {
  id_pengurus: number;
  id_user: number;
  nama_pengurus: string;
  jabatan: string;
  no_telepon: string;
  alamat: string;
  username: string;
}

export interface PengurusActionResponse {
  success: boolean;
  message: string;
  generatedCredentials?: {
    username: string;
    defaultPassword: string;
  };
}
