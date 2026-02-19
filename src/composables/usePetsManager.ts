import { ref, reactive } from "vue";
import type { Pet } from "@/interfaces/pet";

export function usePetsManager() {
  const pets = ref<Pet[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Modal State
  const isPetModalOpen = ref(false);
  const isEditingPet = ref(false);
  const activePet = ref<Pet | null>(null);

  const form = reactive({
    name: "",
    species: "dog",
    breed: "",
    birthDate: "",
    weight: 0,
    needsMuzzle: false,
    allowsOtherPets: true,
    needsSedation: false,
    notes: "",
  });

  async function fetchPets(clientId: string) {
    if (!clientId) return;
    isLoading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/client/${clientId}`);
      if (!res.ok) throw new Error("Failed to fetch pets");
      pets.value = await res.json();
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  function openCreatePetModal() {
    isEditingPet.value = false;
    activePet.value = null;
    resetForm();
    isPetModalOpen.value = true;
  }

  function editPet(pet: Pet) {
    isEditingPet.value = true;
    activePet.value = pet;
    Object.assign(form, {
      name: pet.name,
      species: pet.species || "dog",
      breed: pet.breed || "",
      birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : "",
      weight: pet.weight || 0,
      needsMuzzle: pet.needsMuzzle,
      allowsOtherPets: pet.allowsOtherPets,
      needsSedation: pet.needsSedation,
      notes: pet.notes || "",
    });
    isPetModalOpen.value = true;
  }

  function closePetModal() {
    isPetModalOpen.value = false;
    resetForm();
  }

  function resetForm() {
    Object.assign(form, {
      name: "",
      species: "dog",
      breed: "",
      birthDate: "",
      weight: 0,
      needsMuzzle: false,
      allowsOtherPets: true,
      needsSedation: false,
      notes: "",
    });
  }

  async function savePet(clientId: string) {
     if (!clientId) return;
     
     const payload = { ...form, ownerId: clientId };
     
     try {
         let res;
         if (isEditingPet.value && activePet.value) {
             // Update
             res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${activePet.value.id}`, {
                 method: "PUT",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(payload),
             });
         } else {
             // Create
             res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(payload),
             });
         }
         
         if (!res.ok) throw new Error("Failed to save pet");
         
         await fetchPets(clientId);
         closePetModal();
     } catch (e) {
         error.value = (e as Error).message;
         alert("Error saving pet: " + error.value);
     }
  }

  async function deletePet(id: string, clientId: string) {
      if(!confirm("Are you sure?")) return;
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${id}`, { method: "DELETE" });
          if(!res.ok) throw new Error("Failed");
          await fetchPets(clientId);
      } catch(e) {
          alert("Error deleting pet");
      }
  }

  return {
    pets,
    isLoading,
    isPetModalOpen,
    isEditingPet,
    petForm: form,
    fetchPets,
    openCreatePetModal,
    addPet: openCreatePetModal, // alias
    editPet,
    closePetModal,
    savePet,
    deletePet
  };
}
