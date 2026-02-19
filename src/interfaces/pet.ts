export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed?: string;
  species?: string;
  birthDate?: string;
  weight?: number;
  needsMuzzle: boolean;
  allowsOtherPets: boolean;
  needsSedation: boolean;
  notes?: string;
  medicalNotes?: ClientNote[]; // Or MedicalNote interface if different
  photos?: ClientPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientPhoto {
    id: string;
    userId?: string;
    petId?: string;
    url: string;
    description?: string;
    createdAt: string;
}

export interface ClientNote {
    id: string;
    userId?: string;
    petId?: string;
    content: string;
    type: 'GENERAL' | 'FORMULA' | 'ALLERGY' | 'TREATMENT' | 'VETERINARY_HISTORY';
    createdAt: string;
    updatedAt: string;
}
