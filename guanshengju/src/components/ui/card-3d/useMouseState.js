import { readonly, ref } from "vue";

export function useMouseState() {
  const isMouseEntered = ref(false);

  function setMouseEntered(value) {
    isMouseEntered.value = value;
  }

  return {
    isMouseEntered: readonly(isMouseEntered),
    setMouseEntered,
  };
}
