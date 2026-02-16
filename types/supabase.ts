
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            bloqueios_calendario: {
                Row: {
                    created_at: string | null
                    data: string
                    motivo: string | null
                }
                Insert: {
                    created_at?: string | null
                    data: string
                    motivo?: string | null
                }
                Update: {
                    created_at?: string | null
                    data?: string
                    motivo?: string | null
                }
                Relationships: []
            }
            configuracoes: {
                Row: {
                    chave: string
                    created_at: string | null
                    valor: Json | null
                }
                Insert: {
                    chave: string
                    created_at?: string | null
                    valor?: Json | null
                }
                Update: {
                    chave?: string
                    created_at?: string | null
                    valor?: Json | null
                }
                Relationships: []
            }
            dispensas: {
                Row: {
                    created_at: string | null
                    data: string
                    equipe: string | null
                    id: string
                    obs: string | null
                    policial_matricula: string | null
                    tipo: string | null
                }
                Insert: {
                    created_at?: string | null
                    data: string
                    equipe?: string | null
                    id?: string
                    obs?: string | null
                    policial_matricula?: string | null
                    tipo?: string | null
                }
                Update: {
                    created_at?: string | null
                    data?: string
                    equipe?: string | null
                    id?: string
                    obs?: string | null
                    policial_matricula?: string | null
                    tipo?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "dispensas_policial_matricula_fkey"
                        columns: ["policial_matricula"]
                        isOneToOne: false
                        referencedRelation: "policiais"
                        referencedColumns: ["matricula"]
                    }
                ]
            }
            fila_cpc: {
                Row: {
                    created_at: string | null
                    expira_em: string | null
                    id: string
                    matricula: string | null
                    posicao: number | null
                    status: string | null
                }
                Insert: {
                    created_at?: string | null
                    expira_em?: string | null
                    id?: string
                    matricula?: string | null
                    posicao?: number | null
                    status?: string | null
                }
                Update: {
                    created_at?: string | null
                    expira_em?: string | null
                    id?: string
                    matricula?: string | null
                    posicao?: number | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "fila_cpc_matricula_fkey"
                        columns: ["matricula"]
                        isOneToOne: false
                        referencedRelation: "policiais"
                        referencedColumns: ["matricula"]
                    }
                ]
            }
            naturezas: {
                Row: {
                    ativo: boolean | null
                    created_at: string | null
                    descricao: string | null
                    id: number
                    natureza: string
                    nga: string | null
                    pontos: number | null
                }
                Insert: {
                    ativo?: boolean | null
                    created_at?: string | null
                    descricao?: string | null
                    id?: number
                    natureza: string
                    nga?: string | null
                    pontos?: number | null
                }
                Update: {
                    ativo?: boolean | null
                    created_at?: string | null
                    descricao?: string | null
                    id?: number
                    natureza?: string
                    nga?: string | null
                    pontos?: number | null
                }
                Relationships: []
            }
            policiais: {
                Row: {
                    aniversario: string | null
                    created_at: string | null
                    email: string | null
                    equipe: string | null
                    id: number
                    matricula: string
                    nome: string
                    telefone: string | null
                }
                Insert: {
                    aniversario?: string | null
                    created_at?: string | null
                    email?: string | null
                    equipe?: string | null
                    id?: number
                    matricula: string
                    nome: string
                    telefone?: string | null
                }
                Update: {
                    aniversario?: string | null
                    created_at?: string | null
                    email?: string | null
                    equipe?: string | null
                    id?: number
                    matricula?: string
                    nome?: string
                    telefone?: string | null
                }
                Relationships: []
            }
            registros_rai: {
                Row: {
                    created_at: string | null
                    data_ocorrencia: string | null
                    data_registro: string | null
                    id: string
                    natureza: string | null
                    obs: string | null
                    policial_matricula: string | null
                    pontos: number | null
                    rai_number: string
                    status: string | null
                }
                Insert: {
                    created_at?: string | null
                    data_ocorrencia?: string | null
                    data_registro?: string | null
                    id?: string
                    natureza?: string | null
                    obs?: string | null
                    policial_matricula?: string | null
                    pontos?: number | null
                    rai_number: string
                    status?: string | null
                }
                Update: {
                    created_at?: string | null
                    data_ocorrencia?: string | null
                    data_registro?: string | null
                    id?: string
                    natureza?: string | null
                    obs?: string | null
                    policial_matricula?: string | null
                    pontos?: number | null
                    rai_number?: string
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "registros_rai_policial_matricula_fkey"
                        columns: ["policial_matricula"]
                        isOneToOne: false
                        referencedRelation: "policiais"
                        referencedColumns: ["matricula"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
