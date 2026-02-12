<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    class="rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden object-cover shrink-0"
    :class="[{ 'bg-gray-200': !effectiveSrc && !name }, href ? 'hover:opacity-90 transition-opacity' : '']"
    :style="{
      width: size + 'px',
      height: size + 'px',
      backgroundColor: (!effectiveSrc || hasError) && name ? bgColor : undefined,
    }"
  >
    <img
      v-if="effectiveSrc && !hasError"
      :src="effectiveSrc"
      alt="Avatar"
      class="w-full h-full object-cover"
      @error="hasError = true"
    />
    <span
      v-if="!effectiveSrc || hasError"
      class="font-bold"
      :style="{
        fontSize: size * 0.4 + 'px',
        color: name ? textColor : '#6b7280',
      }"
    >
      {{ initials }}
    </span>
  </component>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { getCachedAvatarUrlForName } from "@/utils/avatar";

  const props = defineProps<{
    src?: string;
    name?: string;
    size?: number;
    /** Si se indica, el avatar es un enlace (p. ej. perfil LinkedIn). */
    href?: string;
  }>();

  const effectiveSrc = computed(
    () => props.src || (props.name ? getCachedAvatarUrlForName(props.name, props.size || 40) : undefined),
  );

  const hasError = ref(false);
  const size = computed(() => props.size || 40);

  const initials = computed(() => {
    return props.name
      ? props.name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "??";
  });

  const colorScheme = computed(() => {
    if (!props.name) return { bg: "#e5e7eb", text: "#6b7280" };

    let hash = 0;
    for (let i = 0; i < props.name.length; i++) {
      hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    return {
      bg: `hsl(${h}, 70%, 85%)`,
      text: `hsl(${h}, 70%, 25%)`,
    };
  });

  const bgColor = computed(() => colorScheme.value.bg);
  const textColor = computed(() => colorScheme.value.text);

  watch([() => props.src, () => props.name], () => {
    hasError.value = false;
  });
</script>
